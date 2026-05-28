const { body } = require('express-validator');

const createAdminValidator = [
  body('churchName').notEmpty().withMessage('Church name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('pastorName').notEmpty().withMessage('Pastor name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
];

module.exports = { createAdminValidator };