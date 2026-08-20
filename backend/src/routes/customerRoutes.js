const express = require('express');
const customerController = require('../controllers/customerController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { register, login, updateProfile, addAddress, addressIdParam } = require('../validations/customerValidation');

const router = express.Router();

router.post('/register', authLimiter, register, validate, customerController.register);
router.post('/login', authLimiter, login, validate, customerController.login);
router.get('/profile', requireAuth, customerController.getProfile);
router.patch('/profile', requireAuth, updateProfile, validate, customerController.updateProfile);
router.get('/addresses', requireAuth, customerController.getAddresses);
router.post('/addresses', requireAuth, addAddress, validate, customerController.addAddress);
router.put('/addresses/:id', requireAuth, addressIdParam, addAddress, validate, customerController.updateAddress);
router.delete('/addresses/:id', requireAuth, addressIdParam, validate, customerController.deleteAddress);
router.get('/orders', requireAuth, customerController.getOrders);

module.exports = router;
