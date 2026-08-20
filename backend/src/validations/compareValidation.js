const { query } = require('express-validator');

const compareQuery = [
  query('ids')
    .trim()
    .notEmpty()
    .withMessage('Product ids are required')
    .matches(/^\d+(,\d+){0,3}$/)
    .withMessage('Compare up to 4 product ids'),
];

module.exports = {
  compareQuery,
};
