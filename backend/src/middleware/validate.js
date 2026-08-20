const { validationResult } = require('express-validator');
const { BAD_REQUEST } = require('../constants/httpStatus');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(BAD_REQUEST).json({
    success: false,
    message: 'Please check the form and try again',
    errors: errors.array().map((item) => ({
      field: item.path,
      message: item.msg,
    })),
  });
}

module.exports = validate;
