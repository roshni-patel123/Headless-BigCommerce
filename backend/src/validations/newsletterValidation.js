const { body } = require('express-validator');

const subscribe = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

module.exports = {
  subscribe,
};
