const express = require('express');
const compareController = require('../controllers/compareController');
const validate = require('../middleware/validate');
const { compareQuery } = require('../validations/compareValidation');

const router = express.Router();

router.get('/', compareQuery, validate, compareController.compare);

module.exports = router;
