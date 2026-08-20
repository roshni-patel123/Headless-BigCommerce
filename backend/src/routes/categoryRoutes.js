const express = require('express');
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const { idParam } = require('../validations/categoryValidation');

const router = express.Router();

router.get('/', categoryController.getAll);
router.get('/tree', categoryController.getTree);
router.get('/:id/products', idParam, validate, categoryController.getProducts);
router.get('/:id', idParam, validate, categoryController.getById);

module.exports = router;
