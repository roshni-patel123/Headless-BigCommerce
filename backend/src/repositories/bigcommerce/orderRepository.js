const { v2 } = require('../../config/bigcommerce');
const { mapOrderSummary, mapOrderDetail } = require('../../helpers/orderMapper');

class OrderRepository {
  async getById(orderId) {
    const [orderRes, productsRes] = await Promise.all([
      v2.get(`/orders/${orderId}`),
      v2.get(`/orders/${orderId}/products`),
    ]);
    const products = Array.isArray(productsRes.data) ? productsRes.data : [];
    return mapOrderDetail(orderRes.data, products);
  }

  async getByEmail(email, { limit = 50 } = {}) {
    if (!email) return [];
    const response = await v2.get('/orders', {
      params: {
        email,
        limit,
        sort: 'date_created:desc',
      },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map(mapOrderSummary);
  }

  async getByCustomerId(customerId, { limit = 50 } = {}) {
    if (!customerId) return [];
    const response = await v2.get('/orders', {
      params: {
        customer_id: customerId,
        limit,
        sort: 'date_created:desc',
      },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map(mapOrderSummary);
  }

  async markAwaitingPayment(orderId, { paymentMethod } = {}) {
    const payload = { status_id: 7 };
    if (paymentMethod) payload.payment_method = paymentMethod;
    const response = await v2.put(`/orders/${orderId}`, payload);
    return mapOrderSummary(response.data);
  }

  /**
   * Checkout API orders show as "(Checkout API)" with 127.0.0.1.
   * Align them with storefront orders: Desktop/mobile source + shopper IP.
   */
  async applyStorefrontMetadata(orderId, { ipAddress, orderSource = 'www', customerId } = {}) {
    const payload = {
      order_source: orderSource || 'www',
    };

    if (customerId) {
      payload.customer_id = Number(customerId);
    }

    const ip = String(ipAddress || '').trim();
    if (ip.includes(':')) {
      payload.ip_address_v6 = ip.slice(0, 39);
    } else if (ip) {
      payload.ip_address = ip.slice(0, 30);
    }

    const response = await v2.put(`/orders/${orderId}`, payload);
    return mapOrderSummary(response.data);
  }
}

module.exports = new OrderRepository();
