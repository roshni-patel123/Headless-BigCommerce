const checkoutService = require('../services/checkoutService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getSessionId, getCustomerId } = require('../utils/session');

const getCheckout = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.getCheckout({ sessionId: getSessionId(req) });
  success(res, checkout);
});

const startCheckout = asyncHandler(async (req, res) => {
  const result = await checkoutService.startCheckout({
    sessionId: getSessionId(req),
    customerId: getCustomerId(req),
    email: req.user?.email || req.body.email,
    bcCustomerId: req.user?.bcCustomerId,
  });
  success(res, result);
});

const hostedCheckout = asyncHandler(async (req, res) => {
  const result = await checkoutService.createHostedCheckout({ sessionId: getSessionId(req) });
  success(res, result);
});

const setContact = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.setContact({
    sessionId: getSessionId(req),
    email: req.body.email || req.user?.email,
    customerMessage: req.body.customerMessage,
    customerId: getCustomerId(req),
    bcCustomerId: req.user?.bcCustomerId,
  });
  success(res, checkout);
});

const setBilling = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.setBillingAddress({
    sessionId: getSessionId(req),
    address: req.body,
  });
  success(res, checkout);
});

const setShipping = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.setShippingAddress({
    sessionId: getSessionId(req),
    address: req.body,
    lineItemIds: req.body.lineItemIds,
  });
  success(res, checkout);
});

const selectShipping = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.selectShippingMethod({
    sessionId: getSessionId(req),
    shippingOptionId: req.body.shippingOptionId,
    consignmentId: req.body.consignmentId,
  });
  success(res, checkout);
});

const applyCoupon = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.applyCoupon({
    sessionId: getSessionId(req),
    couponCode: req.body.couponCode,
  });
  success(res, checkout);
});

const removeCoupon = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.removeCoupon({
    sessionId: getSessionId(req),
    couponCode: req.params.code,
  });
  success(res, checkout);
});

const applyGiftCert = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.applyGiftCertificate({
    sessionId: getSessionId(req),
    giftCertificateCode: req.body.giftCertificateCode,
  });
  success(res, checkout);
});

const paymentMethods = asyncHandler(async (req, res) => {
  const methods = await checkoutService.getPaymentMethods({ sessionId: getSessionId(req) });
  success(res, methods);
});

const placeOrder = asyncHandler(async (req, res) => {
  const { resolveShopperIp, resolveOrderSource } = require('../utils/requestMeta');
  const result = await checkoutService.placeOrder({
    sessionId: getSessionId(req),
    payment: req.body.payment || {},
    email: req.body.email || req.body.payment?.email || req.user?.email,
    address: req.body.address || req.body.payment?.address,
    shippingOptionId: req.body.shippingOptionId || req.body.payment?.shippingOptionId,
    clientIp: await resolveShopperIp(req),
    orderSource: resolveOrderSource(req.headers['user-agent']),
    customerId: getCustomerId(req),
    bcCustomerId: req.user?.bcCustomerId,
  });
  success(res, result);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await checkoutService.getOrder({
    orderId: req.params.orderId,
    email: req.query.email,
  });
  success(res, order);
});

const getOrdersByEmail = asyncHandler(async (req, res) => {
  const orders = await checkoutService.getOrdersByEmail(req.query.email);
  success(res, orders);
});

module.exports = {
  getCheckout,
  startCheckout,
  hostedCheckout,
  setContact,
  setBilling,
  setShipping,
  selectShipping,
  applyCoupon,
  removeCoupon,
  applyGiftCert,
  paymentMethods,
  placeOrder,
  getOrder,
  getOrdersByEmail,
};
