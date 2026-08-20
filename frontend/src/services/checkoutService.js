import client from '../api/client';

export const startCheckout = () => client.post('/checkout/start');

export const getCheckout = () => client.get('/checkout');

export const setContact = (payload) => client.post('/checkout/contact', payload);

export const setBilling = (payload) => client.post('/checkout/billing', payload);

export const setShipping = (payload) => client.post('/checkout/shipping', payload);

export const selectShippingOption = (payload) =>
  client.post('/checkout/shipping-option', payload);

export const applyCheckoutCoupon = (couponCode) =>
  client.post('/checkout/coupons', { couponCode });

export const removeCheckoutCoupon = (code) =>
  client.delete(`/checkout/coupons/${encodeURIComponent(code)}`);

export const applyGiftCertificate = (giftCertificateCode) =>
  client.post('/checkout/gift-certificates', { giftCertificateCode });

export const getPaymentMethods = () => client.get('/checkout/payment-methods');

export const placeOrder = (payment = {}, extras = {}) =>
  client.post('/checkout/order', {
    payment,
    email: extras.email,
    address: extras.address,
    shippingOptionId: extras.shippingOptionId,
  });

export const getOrder = (orderId, email) =>
  client.get(`/checkout/orders/${orderId}`, { params: email ? { email } : {} });

export const getOrdersByEmail = (email) =>
  client.get('/checkout/orders', { params: { email } });

export const startHostedCheckout = () => client.post('/checkout/hosted');
