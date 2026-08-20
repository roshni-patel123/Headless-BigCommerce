const express = require('express');
const searchController = require('../controllers/searchController');
const validate = require('../middleware/validate');
const { searchQuery } = require('../validations/searchValidation');

const router = express.Router();

router.get('/', searchQuery, validate, searchController.search);
router.get('/suggest', searchController.suggest);

module.exports = router;
