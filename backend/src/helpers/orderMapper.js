function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

const STATUS_LABELS = {
  0: 'Incomplete',
  1: 'Pending',
  7: 'Awaiting Payment',
  11: 'Awaiting Fulfillment',
};

function mapOrderSummary(order = {}) {
  const statusId = order.status_id;
  return {
    id: order.id,
    status: order.status || statusId,
    statusId,
    statusLabel:
      order.custom_status ||
      order.status ||
      STATUS_LABELS[statusId] ||
      'Pending',
    paymentStatus: order.payment_status || '',
    total: money(order.total_inc_tax ?? order.total_ex_tax),
    subtotal: money(order.subtotal_inc_tax ?? order.subtotal_ex_tax),
    shipping: money(order.shipping_cost_inc_tax ?? order.shipping_cost_ex_tax),
    tax: money(order.total_tax),
    dateCreated: order.date_created,
    email: order.billing_address?.email || order.customer_email || '',
    customerName: [
      order.billing_address?.first_name,
      order.billing_address?.last_name,
    ]
      .filter(Boolean)
      .join(' '),
    itemsTotal: Number(order.items_total || 0),
  };
}

function mapOrderProduct(item = {}) {
  return {
    id: item.id,
    productId: item.product_id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    price: money(item.price_inc_tax ?? item.price_ex_tax),
    lineTotal: money(item.total_inc_tax ?? item.total_ex_tax),
  };
}

function mapOrderDetail(order = {}, products = []) {
  const summary = mapOrderSummary(order);
  return {
    ...summary,
    billingAddress: order.billing_address
      ? {
          firstName: order.billing_address.first_name,
          lastName: order.billing_address.last_name,
          address1: order.billing_address.street_1,
          address2: order.billing_address.street_2,
          city: order.billing_address.city,
          state: order.billing_address.state,
          postalCode: order.billing_address.zip,
          country: order.billing_address.country,
          phone: order.billing_address.phone,
        }
      : null,
    shippingAddress: order.shipping_addresses?.[0]
      ? {
          firstName: order.shipping_addresses[0].first_name,
          lastName: order.shipping_addresses[0].last_name,
          address1: order.shipping_addresses[0].street_1,
          city: order.shipping_addresses[0].city,
          state: order.shipping_addresses[0].state,
          postalCode: order.shipping_addresses[0].zip,
          country: order.shipping_addresses[0].country,
        }
      : null,
    items: (Array.isArray(products) ? products : []).map(mapOrderProduct),
  };
}

module.exports = {
  mapOrderSummary,
  mapOrderDetail,
  mapOrderProduct,
};
