const express = require('express');
const productController = require('../controllers/productController');
const validate = require('../middleware/validate');
const { listQuery, idParam } = require('../validations/productValidation');

const router = express.Router();

router.get('/', listQuery, validate, productController.getAll);
router.get('/search', listQuery, validate, productController.search);
router.get('/featured', productController.getFeatured);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-sellers', productController.getBestSellers);
router.get('/:id/related', idParam, validate, productController.getRelated);
router.get('/:id/reviews', idParam, validate, productController.getReviews);
router.get('/:id', idParam, validate, productController.getById);

module.exports = router;
