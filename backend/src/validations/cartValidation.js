const { body, param } = require('express-validator');

const addItem = [
  body('productId').isInt({ min: 1 }).withMessage('Product is required'),
  body('quantity').optional().isInt({ min: 1, max: 20 }),
  body('variantId').optional().isInt({ min: 1 }),
  body('optionSelections').optional().isArray(),
  body('sessionId').optional().isString().trim().isLength({ max: 80 }),
];

const updateItem = [
  param('itemId').isString().trim().notEmpty(),
  body('quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),
];

const removeItem = [param('itemId').isString().trim().notEmpty()];

const coupon = [
  body('couponCode').isString().trim().isLength({ min: 1, max: 64 }).withMessage('Coupon code is required'),
];

const removeCoupon = [
  param('code').optional().isString().trim().isLength({ min: 1, max: 64 }),
  body('couponCode').optional().isString().trim().isLength({ min: 1, max: 64 }),
];

module.exports = {
  addItem,
  updateItem,
  removeItem,
  coupon,
  removeCoupon,
};
