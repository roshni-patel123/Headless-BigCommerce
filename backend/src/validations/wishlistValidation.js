const { body, param } = require('express-validator');

const addItem = [body('productId').isInt({ min: 1 }).withMessage('Product is required')];

const removeItem = [param('productId').isInt({ min: 1 }).withMessage('Invalid product id')];

module.exports = {
  addItem,
  removeItem,
};
