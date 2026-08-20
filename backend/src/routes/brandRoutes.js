const express = require('express');
const brandController = require('../controllers/brandController');
const validate = require('../middleware/validate');
const { idParam } = require('../validations/brandValidation');

const router = express.Router();

router.get('/', brandController.getAll);
router.get('/:id/products', idParam, validate, brandController.getProducts);
router.get('/:id', idParam, validate, brandController.getById);

module.exports = router;
