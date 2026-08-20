const { v3 } = require('../../config/bigcommerce');
const env = require('../../config/env');
const { mapCart } = require('../../helpers/cartMapper');

class CartRepository {
  channelId() {
    return env.bigcommerce.channelId ? Number(env.bigcommerce.channelId) : undefined;
  }

  async create(lineItems = [], { customerId } = {}) {
    const payload = {
      line_items: lineItems,
      channel_id: this.channelId(),
    };
    if (customerId) payload.customer_id = Number(customerId);

    const response = await v3.post('/carts', payload);
    return mapCart(response.data.data);
  }

  async get(cartId) {
    const response = await v3.get(`/carts/${cartId}`, {
      params: {
        include: 'line_items.physical_items.options,line_items.digital_items.options,redirect_urls',
      },
    });
    return mapCart(response.data.data);
  }

  async updateCustomerId(cartId, customerId) {
    const response = await v3.put(`/carts/${cartId}`, {
      customer_id: Number(customerId) || 0,
    });
    return mapCart(response.data.data);
  }

  async addLineItems(cartId, lineItems) {
    const response = await v3.post(`/carts/${cartId}/items`, {
      line_items: lineItems,
    });
    return mapCart(response.data.data);
  }

  async updateLineItem(cartId, itemId, { quantity, productId, variantId }) {
    const lineItem = {
      quantity: Number(quantity),
      product_id: Number(productId),
    };
    if (variantId) lineItem.variant_id = Number(variantId);

    const response = await v3.put(`/carts/${cartId}/items/${itemId}`, {
      line_item: lineItem,
    });
    return mapCart(response.data.data);
  }

  async removeLineItem(cartId, itemId) {
    const response = await v3.delete(`/carts/${cartId}/items/${itemId}`);
    if (!response.data?.data) {
      return { id: cartId, items: [], itemCount: 0, subtotal: 0, total: 0, coupons: [], discounts: [] };
    }
    return mapCart(response.data.data);
  }

  async applyCoupon(cartId, couponCode) {
    // Coupons are applied on checkout; some stores support cart-level via checkout creation.
    // Prefer checkout discount endpoints; this helper creates/updates via checkouts API coupon.
    const checkout = await v3.post(`/checkouts/${cartId}/coupons`, {
      coupon_code: couponCode,
    });
    return checkout.data.data;
  }

  async removeCoupon(cartId, couponCode) {
    const encoded = encodeURIComponent(couponCode);
    const checkout = await v3.delete(`/checkouts/${cartId}/coupons/${encoded}`);
    return checkout.data.data;
  }

  async createRedirectUrls(cartId) {
    const response = await v3.post(`/carts/${cartId}/redirect_urls`);
    return response.data.data || {};
  }
}

module.exports = new CartRepository();
