const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addItem, removeItem } = require('../validations/wishlistValidation');

const router = express.Router();

router.use(optionalAuth);
router.get('/', wishlistController.getWishlist);
router.post('/', addItem, validate, wishlistController.addItem);
router.delete('/:productId', removeItem, validate, wishlistController.removeItem);

module.exports = router;
