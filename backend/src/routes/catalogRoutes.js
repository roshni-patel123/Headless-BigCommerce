const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/status', catalogController.getStatus);

module.exports = router;
