const { v3 } = require('../../config/bigcommerce');
const { mapCheckout } = require('../../helpers/checkoutMapper');
const paymentRepository = require('./paymentRepository');

class CheckoutRepository {
  async get(checkoutId) {
    const response = await v3.get(`/checkouts/${checkoutId}`, {
      params: {
        include:
          'cart.line_items.physical_items.options,consignments.available_shipping_options,promotions',
      },
    });
    return mapCheckout(response.data.data);
  }

  async updateCustomerMessage(checkoutId, customerMessage) {
    const response = await v3.put(`/checkouts/${checkoutId}`, {
      customer_message: customerMessage,
    });
    return mapCheckout(response.data.data);
  }

  async addBillingAddress(checkoutId, address) {
    const response = await v3.post(`/checkouts/${checkoutId}/billing-address`, address);
    return mapCheckout(response.data.data);
  }

  async updateBillingAddress(checkoutId, addressId, address) {
    const response = await v3.put(
      `/checkouts/${checkoutId}/billing-address/${addressId}`,
      address
    );
    return mapCheckout(response.data.data);
  }

  async addConsignment(checkoutId, consignments) {
    const response = await v3.post(`/checkouts/${checkoutId}/consignments`, consignments, {
      params: { include: 'consignments.available_shipping_options' },
    });
    return mapCheckout(response.data.data);
  }

  async updateConsignment(checkoutId, consignmentId, payload) {
    const response = await v3.put(
      `/checkouts/${checkoutId}/consignments/${consignmentId}`,
      payload,
      { params: { include: 'consignments.available_shipping_options' } }
    );
    return mapCheckout(response.data.data);
  }

  async applyCoupon(checkoutId, couponCode) {
    const response = await v3.post(`/checkouts/${checkoutId}/coupons`, {
      coupon_code: couponCode,
    });
    return mapCheckout(response.data.data);
  }

  async removeCoupon(checkoutId, couponCode) {
    const encoded = encodeURIComponent(couponCode);
    const response = await v3.delete(`/checkouts/${checkoutId}/coupons/${encoded}`);
    return mapCheckout(response.data.data);
  }

  async applyGiftCertificate(checkoutId, giftCertificateCode) {
    const response = await v3.post(`/checkouts/${checkoutId}/gift-certificates`, {
      gift_certificate_code: giftCertificateCode,
    });
    return mapCheckout(response.data.data);
  }

  async createOrder(checkoutId) {
    const response = await v3.post(`/checkouts/${checkoutId}/orders`);
    return response.data.data;
  }

  async getOrder(orderId) {
    const { v2 } = require('../../config/bigcommerce');
    const response = await v2.get(`/orders/${orderId}`);
    return response.data;
  }

  async getPaymentMethods(checkoutId) {
    return paymentRepository.getCheckoutPaymentMethods(checkoutId);
  }
}

module.exports = new CheckoutRepository();
