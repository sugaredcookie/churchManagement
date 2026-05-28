const { body } = require('express-validator');

const consentValidator = [
  body('representativeName').notEmpty().withMessage('Representative name is required').trim(),
  body('designation').notEmpty().withMessage('Designation is required').trim(),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('agreementAccepted').isBoolean().withMessage('Agreement acceptance must be true').custom(value => value === true).withMessage('You must accept the agreement'),
  body('signatureName').notEmpty().withMessage('Signature name is required').trim(),
];

module.exports = { consentValidator };