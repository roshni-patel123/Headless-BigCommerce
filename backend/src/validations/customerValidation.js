const { body, param } = require('express-validator');

const register = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 60 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 60 }),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 }),
  body('address').optional({ nullable: true }).isObject(),
  body('address.address1').optional({ values: 'falsy' }).isString().trim().isLength({ max: 120 }),
  body('address.address2').optional({ values: 'falsy' }).isString().trim().isLength({ max: 120 }),
  body('address.city').optional({ values: 'falsy' }).isString().trim().isLength({ max: 80 }),
  body('address.stateOrProvince').optional({ values: 'falsy' }).isString().trim().isLength({ max: 80 }),
  body('address.postalCode').optional({ values: 'falsy' }).isString().trim().isLength({ max: 20 }),
  body('address.countryCode').optional({ values: 'falsy' }).isString().trim().isLength({ min: 2, max: 2 }),
  body('address.phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 }),
];

const login = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfile = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 60 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 60 }),
  body('email').optional().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
];

const addAddress = [
  body('firstName').optional({ values: 'falsy' }).isString().trim().isLength({ max: 60 }),
  body('lastName').optional({ values: 'falsy' }).isString().trim().isLength({ max: 60 }),
  body('address1').trim().notEmpty().withMessage('Street address is required').isLength({ max: 120 }),
  body('address2').optional({ values: 'falsy' }).isString().trim().isLength({ max: 120 }),
  body('city').trim().notEmpty().withMessage('City is required').isLength({ max: 80 }),
  body('stateOrProvince').optional({ values: 'falsy' }).isString().trim().isLength({ max: 80 }),
  body('postalCode').optional({ values: 'falsy' }).isString().trim().isLength({ max: 20 }),
  body('countryCode').trim().notEmpty().withMessage('Country is required').isLength({ min: 2, max: 2 }),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 }),
];

const addressIdParam = [param('id').isInt({ min: 1 }).withMessage('Invalid address id')];

module.exports = {
  register,
  login,
  updateProfile,
  addAddress,
  addressIdParam,
};
