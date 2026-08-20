const env = require('../config/env');
const cartRepository = require('../repositories/bigcommerce/cartRepository');
const checkoutRepository = require('../repositories/bigcommerce/checkoutRepository');
const { mapCheckout } = require('../helpers/checkoutMapper');
const { getCartId, setCartId, clearCartId } = require('../utils/cartSession');

const emptyCart = () => ({
  id: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  discountAmount: 0,
  cartAmount: 0,
  shipping: 0,
  taxTotal: 0,
  total: 0,
  coupons: [],
  discounts: [],
  currency: 'USD',
});

class CartService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  ensureConfigured() {
    if (!this.hasStore) {
      const error = new Error('BigCommerce is not configured. Cart requires live store credentials.');
      error.statusCode = 503;
      throw error;
    }
  }

  toLineItem({ productId, variantId, quantity, optionSelections }) {
    const line = {
      quantity: Number(quantity) || 1,
      product_id: Number(productId),
    };
    if (variantId) line.variant_id = Number(variantId);
    if (Array.isArray(optionSelections) && optionSelections.length) {
      line.option_selections = optionSelections.map((sel) => ({
        option_id: Number(sel.optionId),
        option_value: sel.optionValueId != null ? Number(sel.optionValueId) : sel.optionValue,
      }));
    }
    return line;
  }

  async getCart({ sessionId }) {
    if (!this.hasStore || !sessionId) return emptyCart();

    const cartId = getCartId(sessionId);
    if (!cartId) return emptyCart();

    try {
      return await cartRepository.get(cartId);
    } catch (error) {
      if (error.statusCode === 404) {
        clearCartId(sessionId);
        return emptyCart();
      }
      throw error;
    }
  }

  async getOrCreateCartId(sessionId, firstLineItems = []) {
    this.ensureConfigured();
    if (!sessionId) {
      const error = new Error('Session id is required');
      error.statusCode = 400;
      throw error;
    }

    let cartId = getCartId(sessionId);
    if (cartId) {
      try {
        await cartRepository.get(cartId);
        return cartId;
      } catch {
        clearCartId(sessionId);
        cartId = null;
      }
    }

    const cart = await cartRepository.create(firstLineItems);
    setCartId(sessionId, cart.id);
    return cart.id;
  }

  async addItem({
    sessionId,
    productId,
    variantId,
    quantity = 1,
    optionSelections,
  }) {
    this.ensureConfigured();
    const line = this.toLineItem({ productId, variantId, quantity, optionSelections });
    const existingId = getCartId(sessionId);

    if (!existingId) {
      const cart = await cartRepository.create([line]);
      setCartId(sessionId, cart.id);
      return cart;
    }

    try {
      return await cartRepository.addLineItems(existingId, [line]);
    } catch (error) {
      if (error.statusCode === 404) {
        clearCartId(sessionId);
        const cart = await cartRepository.create([line]);
        setCartId(sessionId, cart.id);
        return cart;
      }
      throw error;
    }
  }

  async updateQuantity({ sessionId, itemId, quantity }) {
    this.ensureConfigured();
    const cartId = getCartId(sessionId);
    if (!cartId) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const cart = await cartRepository.get(cartId);
    const item = (cart.items || []).find((row) => String(row.id) === String(itemId));
    if (!item) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    return cartRepository.updateLineItem(cartId, itemId, {
      quantity,
      productId: item.productId,
      variantId: item.variantId,
    });
  }

  async removeItem({ sessionId, itemId }) {
    this.ensureConfigured();
    const cartId = getCartId(sessionId);
    if (!cartId) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }
    const cart = await cartRepository.removeLineItem(cartId, itemId);
    if (!cart.items?.length) {
      // Keep cart id; empty cart is valid in BC
    }
    return cart;
  }

  async applyCoupon({ sessionId, couponCode }) {
    this.ensureConfigured();
    const cartId = getCartId(sessionId);
    if (!cartId) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }
    const checkout = await cartRepository.applyCoupon(cartId, couponCode);
    const mapped = mapCheckout(checkout).cart;
    if (mapped?.id) return mapped;
    return cartRepository.get(cartId);
  }

  async removeCoupon({ sessionId, couponCode }) {
    this.ensureConfigured();
    const cartId = getCartId(sessionId);
    if (!cartId) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }
    const checkout = await cartRepository.removeCoupon(cartId, couponCode);
    const mapped = mapCheckout(checkout).cart;
    if (mapped?.id) return mapped;
    return cartRepository.get(cartId);
  }

  async getCheckoutPreview({ sessionId }) {
    this.ensureConfigured();
    const cartId = getCartId(sessionId);
    if (!cartId) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }
    return checkoutRepository.get(cartId);
  }
}

module.exports = new CartService();
