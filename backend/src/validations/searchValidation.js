const { query } = require('express-validator');

const searchQuery = [
  query('q').trim().notEmpty().withMessage('Search term is required').isLength({ max: 120 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 250 }),
  query('sort').optional().isString().isLength({ max: 40 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('categoryId').optional().isInt({ min: 1 }),
  query('brandId').optional().isInt({ min: 1 }),
  query('inStock').optional().isIn(['1', 'true', 'yes']),
];

module.exports = {
  searchQuery,
};
