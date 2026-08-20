const { query, param } = require('express-validator');

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 250 }),
  query('sort').optional().isString().trim().isLength({ max: 40 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('brandId').optional().isInt({ min: 1 }),
  query('categoryId').optional().isInt({ min: 1 }),
  query('q').optional().isString().trim().isLength({ max: 120 }),
];

const idParam = [param('id').isInt({ min: 1 }).withMessage('Invalid product id')];

module.exports = {
  listQuery,
  idParam,
};
