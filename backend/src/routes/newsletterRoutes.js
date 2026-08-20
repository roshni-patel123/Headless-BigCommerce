const express = require('express');
const newsletterController = require('../controllers/newsletterController');
const validate = require('../middleware/validate');
const { subscribe } = require('../validations/newsletterValidation');

const router = express.Router();

router.post('/', subscribe, validate, newsletterController.subscribe);

module.exports = router;
