const wishlistService = require('../services/wishlistService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getSessionId, getCustomerId } = require('../utils/session');

const getWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.getWishlist({
    customerId: getCustomerId(req),
    sessionId: getSessionId(req),
  });
  success(res, items);
});

const addItem = asyncHandler(async (req, res) => {
  const items = await wishlistService.addItem({
    customerId: getCustomerId(req),
    sessionId: getSessionId(req),
    productId: req.body.productId,
  });
  success(res, items);
});

const removeItem = asyncHandler(async (req, res) => {
  const items = await wishlistService.removeItem({
    customerId: getCustomerId(req),
    sessionId: getSessionId(req),
    productId: req.params.productId,
  });
  success(res, items);
});

module.exports = {
  getWishlist,
  addItem,
  removeItem,
};
