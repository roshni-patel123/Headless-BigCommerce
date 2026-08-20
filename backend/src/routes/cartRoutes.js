const express = require('express');
const cartController = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  addItem,
  updateItem,
  removeItem,
  coupon,
  removeCoupon,
} = require('../validations/cartValidation');

const router = express.Router();

router.use(optionalAuth);
router.get('/', cartController.getCart);
router.post('/items', addItem, validate, cartController.addItem);
router.patch('/items/:itemId', updateItem, validate, cartController.updateItem);
router.delete('/items/:itemId', removeItem, validate, cartController.removeItem);
router.post('/coupons', coupon, validate, cartController.applyCoupon);
router.delete('/coupons/:code', removeCoupon, validate, cartController.removeCoupon);

module.exports = router;
