const env = require('../config/env');
const cartService = require('./cartService');
const checkoutRepository = require('../repositories/bigcommerce/checkoutRepository');
const orderRepository = require('../repositories/bigcommerce/orderRepository');
const paymentRepository = require('../repositories/bigcommerce/paymentRepository');
const customerRepository = require('../repositories/customerRepository');
const bcCustomerRepository = require('../repositories/bigcommerce/customerRepository');
const { toBcAddress } = require('../helpers/checkoutMapper');
const { getCartId, clearCartId } = require('../utils/cartSession');
const cartRepository = require('../repositories/bigcommerce/cartRepository');

class CheckoutService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  ensureConfigured() {
    if (!this.hasStore) {
      const error = new Error('BigCommerce checkout is not configured');
      error.statusCode = 503;
      throw error;
    }
  }

  async resolveCheckoutId(sessionId) {
    const cartId = getCartId(sessionId);
    if (!cartId) {
      const error = new Error('No active cart. Add items before checkout.');
      error.statusCode = 400;
      throw error;
    }
    return cartId;
  }

  /**
   * Resolve the BigCommerce customer id for a logged-in account and/or email,
   * then attach it to the cart so the order is not created as a Guest.
   */
  async resolveBcCustomerId({ customerId, email, bcCustomerId } = {}) {
    if (bcCustomerId) return Number(bcCustomerId);

    if (customerId) {
      try {
        const local = await customerRepository.findById(customerId);
        if (local?.bcCustomerId) return Number(local.bcCustomerId);

        const lookupEmail = email || local?.email;
        if (lookupEmail) {
          const found = await bcCustomerRepository.getCustomersByEmail(lookupEmail);
          if (found[0]?.id) {
            const bcId = Number(found[0].id);
            if (local) {
              await customerRepository
                .update(customerId, {
                  firstName: local.firstName,
                  lastName: local.lastName,
                  phone: local.phone,
                  email: local.email,
                  bcCustomerId: bcId,
                })
                .catch(() => null);
            }
            return bcId;
          }
        }
      } catch (error) {
        console.warn('[checkout] resolve local BC customer failed:', error.message);
      }
    }

    if (email) {
      try {
        const found = await bcCustomerRepository.getCustomersByEmail(email);
        if (found[0]?.id) return Number(found[0].id);
      } catch (error) {
        console.warn('[checkout] resolve email BC customer failed:', error.message);
      }
    }

    return null;
  }

  async ensureCartCustomer(sessionId, { customerId, email, bcCustomerId } = {}) {
    const cartId = await this.resolveCheckoutId(sessionId);
    const resolvedId = await this.resolveBcCustomerId({ customerId, email, bcCustomerId });
    if (!resolvedId) return null;

    try {
      const cart = await cartRepository.get(cartId);
      if (Number(cart.customerId) === Number(resolvedId)) return resolvedId;

      // Changing customer_id clears shipping/promotions — only do it before shipping is chosen.
      const checkout = await checkoutRepository.get(cartId).catch(() => null);
      const hasShipping = Boolean(checkout?.consignments?.[0]?.selectedShippingOption);
      if (hasShipping && cart.customerId) {
        return resolvedId;
      }

      await cartRepository.updateCustomerId(cartId, resolvedId);
      return resolvedId;
    } catch (error) {
      console.warn('[checkout] could not attach customer to cart:', error.message);
      return resolvedId;
    }
  }

  async getCheckout({ sessionId }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    return checkoutRepository.get(checkoutId);
  }

  async startCheckout({ sessionId, customerId, email, bcCustomerId }) {
    this.ensureConfigured();
    const cart = await cartService.getCart({ sessionId });
    if (!cart.items?.length) {
      const error = new Error('Your bag is empty');
      error.statusCode = 400;
      throw error;
    }

    await this.ensureCartCustomer(sessionId, { customerId, email, bcCustomerId });
    const checkout = await this.getCheckout({ sessionId });
    return {
      mode: 'headless',
      checkoutId: checkout.id,
      cartId: cart.id,
      checkout,
      cart,
    };
  }

  /** Optional hosted fallback for stores that prefer BC checkout URL */
  async createHostedCheckout({ sessionId }) {
    this.ensureConfigured();
    const cart = await cartService.getCart({ sessionId });
    if (!cart.items?.length) {
      const error = new Error('Your bag is empty');
      error.statusCode = 400;
      throw error;
    }
    const urls = await cartRepository.createRedirectUrls(cart.id);
    return {
      mode: 'bigcommerce',
      checkoutUrl: urls.checkout_url || urls.embedded_checkout_url || '',
      cartId: cart.id,
      cart,
    };
  }

  async setContact({ sessionId, email, customerMessage, customerId, bcCustomerId }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);

    let matchedCustomerId = null;
    if (email || customerId || bcCustomerId) {
      matchedCustomerId = await this.ensureCartCustomer(sessionId, {
        customerId,
        email,
        bcCustomerId,
      });
    }

    let matchedCustomer = null;
    let addresses = [];
    if (matchedCustomerId) {
      matchedCustomer = await bcCustomerRepository.getCustomerById(matchedCustomerId).catch(() => null);
      addresses = await bcCustomerRepository.getAddresses(matchedCustomerId).catch(() => []);
    }

    let checkout = await checkoutRepository.get(checkoutId);

    if (customerMessage != null) {
      checkout = await checkoutRepository.updateCustomerMessage(checkoutId, customerMessage);
    }

    // Prefill billing from the store customer when this email already exists in BC.
    if (email) {
      const existing = checkout.billingAddress;
      const saved = addresses[0] || null;
      const address = toBcAddress({
        email,
        firstName:
          saved?.firstName || matchedCustomer?.firstName || existing?.firstName || 'Guest',
        lastName: saved?.lastName || matchedCustomer?.lastName || existing?.lastName || 'Customer',
        address1: saved?.address1 || existing?.address1 || 'TBD',
        address2: saved?.address2 || existing?.address2 || '',
        city: saved?.city || existing?.city || 'TBD',
        postalCode: saved?.postalCode || existing?.postalCode || '00000',
        countryCode: saved?.countryCode || existing?.countryCode || 'US',
        stateOrProvince: saved?.stateOrProvince || existing?.stateOrProvince || '',
        phone: saved?.phone || matchedCustomer?.phone || existing?.phone || '',
      });

      if (existing?.id) {
        checkout = await checkoutRepository.updateBillingAddress(checkoutId, existing.id, address);
      } else {
        checkout = await checkoutRepository.addBillingAddress(checkoutId, address);
      }
    }

    return {
      checkout,
      matchedCustomer,
      addresses,
      bcCustomerId: matchedCustomerId,
    };
  }

  async setBillingAddress({ sessionId, address }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    const checkout = await checkoutRepository.get(checkoutId);
    const shipping = checkout.consignments?.[0]?.shippingAddress || {};
    const existing = checkout.billingAddress || {};

    // Always keep a usable email — BC will not create an order without it.
    const merged = {
      email: address.email || existing.email || shipping.email || '',
      firstName: address.firstName || existing.firstName || shipping.firstName || 'Guest',
      lastName: address.lastName || existing.lastName || shipping.lastName || 'Customer',
      company: address.company || existing.company || shipping.company || '',
      address1: address.address1 || existing.address1 || shipping.address1 || 'TBD',
      address2: address.address2 || existing.address2 || shipping.address2 || '',
      city: address.city || existing.city || shipping.city || 'TBD',
      stateOrProvince: address.stateOrProvince || existing.stateOrProvince || shipping.stateOrProvince || '',
      stateOrProvinceCode:
        address.stateOrProvinceCode || existing.stateOrProvinceCode || shipping.stateOrProvinceCode || '',
      postalCode: address.postalCode || existing.postalCode || shipping.postalCode || '00000',
      countryCode: address.countryCode || existing.countryCode || shipping.countryCode || 'US',
      phone: address.phone || existing.phone || shipping.phone || '',
    };

    const payload = toBcAddress(merged);

    if (existing?.id) {
      return checkoutRepository.updateBillingAddress(checkoutId, existing.id, payload);
    }
    return checkoutRepository.addBillingAddress(checkoutId, payload);
  }

  async ensureBillingReady(checkoutId, { email, address } = {}) {
    let checkout = await checkoutRepository.get(checkoutId);
    const shipping = checkout.consignments?.[0]?.shippingAddress || {};
    const existing = checkout.billingAddress || {};
    const resolvedEmail = String(
      email || address?.email || existing.email || shipping.email || ''
    ).trim();

    if (!resolvedEmail) {
      const error = new Error('Contact email is required');
      error.statusCode = 400;
      throw error;
    }

    const needsBilling =
      !existing?.id ||
      !existing.email ||
      !existing.address1 ||
      existing.address1 === 'TBD';

    if (!needsBilling && existing.email === resolvedEmail) {
      return checkout;
    }

    const merged = {
      email: resolvedEmail,
      firstName: address?.firstName || existing.firstName || shipping.firstName || 'Guest',
      lastName: address?.lastName || existing.lastName || shipping.lastName || 'Customer',
      company: address?.company || existing.company || shipping.company || '',
      address1: address?.address1 || existing.address1 || shipping.address1 || 'TBD',
      address2: address?.address2 || existing.address2 || shipping.address2 || '',
      city: address?.city || existing.city || shipping.city || 'TBD',
      stateOrProvince:
        address?.stateOrProvince || existing.stateOrProvince || shipping.stateOrProvince || '',
      stateOrProvinceCode:
        address?.stateOrProvinceCode ||
        existing.stateOrProvinceCode ||
        shipping.stateOrProvinceCode ||
        '',
      postalCode: address?.postalCode || existing.postalCode || shipping.postalCode || '00000',
      countryCode: address?.countryCode || existing.countryCode || shipping.countryCode || 'US',
      phone: address?.phone || existing.phone || shipping.phone || '',
    };

    const payload = toBcAddress(merged);
    if (existing?.id) {
      checkout = await checkoutRepository.updateBillingAddress(checkoutId, existing.id, payload);
    } else {
      checkout = await checkoutRepository.addBillingAddress(checkoutId, payload);
    }
    return checkout;
  }

  async setShippingAddress({ sessionId, address, lineItemIds }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    const checkout = await checkoutRepository.get(checkoutId);
    const cart = checkout.cart || (await cartService.getCart({ sessionId }));
    const itemIds = lineItemIds?.length
      ? lineItemIds
      : (cart.items || []).map((item) => item.id);

    const shippingAddress = toBcAddress(address);
    const existing = checkout.consignments?.[0];

    if (existing?.id) {
      return checkoutRepository.updateConsignment(checkoutId, existing.id, {
        shipping_address: shippingAddress,
        line_items: itemIds.map((id) => ({ item_id: id, quantity: cart.items.find((i) => i.id === id)?.quantity || 1 })),
      });
    }

    return checkoutRepository.addConsignment(checkoutId, [
      {
        shipping_address: shippingAddress,
        line_items: itemIds.map((id) => {
          const item = cart.items.find((row) => row.id === id);
          return { item_id: id, quantity: item?.quantity || 1 };
        }),
      },
    ]);
  }

  async selectShippingMethod({ sessionId, shippingOptionId, consignmentId }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    const checkout = await checkoutRepository.get(checkoutId);
    const id = consignmentId || checkout.consignments?.[0]?.id;
    if (!id) {
      const error = new Error('Add a shipping address before selecting a method');
      error.statusCode = 400;
      throw error;
    }
    return checkoutRepository.updateConsignment(checkoutId, id, {
      shipping_option_id: shippingOptionId,
    });
  }

  async applyCoupon({ sessionId, couponCode }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    return checkoutRepository.applyCoupon(checkoutId, couponCode);
  }

  async removeCoupon({ sessionId, couponCode }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    return checkoutRepository.removeCoupon(checkoutId, couponCode);
  }

  async applyGiftCertificate({ sessionId, giftCertificateCode }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    return checkoutRepository.applyGiftCertificate(checkoutId, giftCertificateCode);
  }

  async getPaymentMethods({ sessionId }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    const checkout = await checkoutRepository.get(checkoutId).catch(() => null);
    const currencyCode = checkout?.cart?.currency || checkout?.currency || undefined;
    return paymentRepository.getCheckoutPaymentMethods(checkoutId, { currencyCode });
  }

  async placeOrder({
    sessionId,
    payment = {},
    email,
    address,
    shippingOptionId,
    clientIp,
    orderSource = 'www',
    customerId,
    bcCustomerId: tokenBcCustomerId,
  }) {
    this.ensureConfigured();
    const checkoutId = await this.resolveCheckoutId(sessionId);
    let checkout = await checkoutRepository.get(checkoutId);

    const contactEmail = email || payment.email || checkout.billingAddress?.email;
    const bcCustomerId = await this.ensureCartCustomer(sessionId, {
      customerId,
      email: contactEmail,
      bcCustomerId: tokenBcCustomerId,
    });
    // Reload checkout after possible customer attachment.
    checkout = await checkoutRepository.get(checkoutId);

    if (!checkout.consignments?.length) {
      const error = new Error('Add a shipping address before placing the order');
      error.statusCode = 400;
      throw error;
    }

    const consignment = checkout.consignments[0];
    if (!consignment.selectedShippingOption) {
      const options = consignment.availableShippingOptions || [];
      const optionId =
        shippingOptionId ||
        payment.shippingOptionId ||
        (options.length === 1 ? options[0].id : null);

      if (!optionId) {
        const error = new Error('Select a shipping method before placing the order');
        error.statusCode = 400;
        throw error;
      }

      checkout = await checkoutRepository.updateConsignment(checkoutId, consignment.id, {
        shipping_option_id: optionId,
      });
    }

    checkout = await this.ensureBillingReady(checkoutId, {
      email: email || payment.email || checkout.billingAddress?.email,
      address: address || payment.address,
    });

    if (!checkout.billingAddress?.email) {
      const error = new Error('Contact email is required');
      error.statusCode = 400;
      throw error;
    }

    if (!checkout.consignments?.[0]?.selectedShippingOption) {
      const error = new Error('Select a shipping method before placing the order');
      error.statusCode = 400;
      throw error;
    }

    const created = await checkoutRepository.createOrder(checkoutId);
    const orderId = created?.id || created?.data?.id || created;
    if (!orderId) {
      const error = new Error('Order could not be created');
      error.statusCode = 500;
      throw error;
    }

    // Match native storefront orders in BC admin (Desktop/mobile + shopper IP + customer).
    try {
      await orderRepository.applyStorefrontMetadata(orderId, {
        ipAddress: clientIp,
        orderSource,
        customerId: bcCustomerId,
      });
    } catch (error) {
      console.warn('[checkout] could not set order source/IP/customer:', error.message);
    }

    let paymentResult = null;
    try {
      paymentResult = await paymentRepository.finalizeOrderPayment(orderId, payment);
    } catch (error) {
      const wrapped = new Error(
        error.message || 'Payment could not be processed for this order'
      );
      wrapped.statusCode = error.statusCode || 402;
      wrapped.details = error.details;
      throw wrapped;
    }

    if (paymentResult?.status === 'awaiting_payment') {
      await orderRepository.markAwaitingPayment(orderId, {
        paymentMethod: paymentResult.paymentMethod,
      });
    }

    clearCartId(sessionId);

    let order = null;
    try {
      order = await orderRepository.getById(orderId);
    } catch {
      order = {
        id: orderId,
        status: paymentResult?.status === 'paid' ? 'Awaiting Fulfillment' : 'Awaiting Payment',
        email: checkout.billingAddress?.email,
      };
    }

    const isPaid = paymentResult?.status === 'paid';

    return {
      orderId: order?.id || orderId,
      status: order?.statusLabel || order?.status || (isPaid ? 'Awaiting Fulfillment' : 'Awaiting Payment'),
      paymentStatus: isPaid ? 'captured' : 'awaiting',
      email: order?.email || checkout.billingAddress?.email,
      total: order?.total,
      dateCreated: order?.dateCreated,
      items: order?.items || [],
      payment,
      checkoutId,
      order,
      paymentMode: paymentResult?.mode,
      message: isPaid
        ? 'Payment received. Your order is confirmed.'
        : 'Your order is confirmed and awaiting payment.',
    };
  }

  async getOrder({ orderId, email }) {
    this.ensureConfigured();
    const order = await orderRepository.getById(orderId);
    const orderEmail = (order.email || '').toLowerCase();
    if (email && orderEmail && orderEmail !== String(email).toLowerCase()) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    return order;
  }

  async getOrdersByEmail(email) {
    this.ensureConfigured();
    if (!email) return [];
    return orderRepository.getByEmail(email);
  }
}

module.exports = new CheckoutService();
