const cartService = require('../services/cartService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getSessionId } = require('../utils/session');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart({
    sessionId: getSessionId(req),
  });
  success(res, cart);
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem({
    sessionId: getSessionId(req),
    productId: req.body.productId,
    variantId: req.body.variantId,
    quantity: req.body.quantity || 1,
    optionSelections: req.body.optionSelections,
  });
  success(res, cart);
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateQuantity({
    sessionId: getSessionId(req),
    itemId: req.params.itemId,
    quantity: req.body.quantity,
  });
  success(res, cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem({
    sessionId: getSessionId(req),
    itemId: req.params.itemId,
  });
  success(res, cart);
});

const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.applyCoupon({
    sessionId: getSessionId(req),
    couponCode: req.body.couponCode,
  });
  success(res, cart);
});

const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCoupon({
    sessionId: getSessionId(req),
    couponCode: req.params.code || req.body.couponCode,
  });
  success(res, cart);
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  applyCoupon,
  removeCoupon,
};
