const { param } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).withMessage('Invalid brand id')];

module.exports = {
  idParam,
};
