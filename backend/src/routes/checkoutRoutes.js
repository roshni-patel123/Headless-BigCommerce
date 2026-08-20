const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);
router.get('/', checkoutController.getCheckout);
router.post('/start', checkoutController.startCheckout);
router.post('/hosted', checkoutController.hostedCheckout);
router.post('/contact', checkoutController.setContact);
router.post('/billing', checkoutController.setBilling);
router.post('/shipping', checkoutController.setShipping);
router.post('/shipping-option', checkoutController.selectShipping);
router.post('/coupons', checkoutController.applyCoupon);
router.delete('/coupons/:code', checkoutController.removeCoupon);
router.post('/gift-certificates', checkoutController.applyGiftCert);
router.get('/payment-methods', checkoutController.paymentMethods);
router.get('/orders', checkoutController.getOrdersByEmail);
router.get('/orders/:orderId', checkoutController.getOrder);
router.post('/order', checkoutController.placeOrder);

module.exports = router;
