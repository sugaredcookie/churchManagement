const { body } = require('express-validator');

const consentValidator = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim(),

  body('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('ageGroup')
    .notEmpty()
    .withMessage('Age group is required'),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required'),

  body('basedIn')
    .notEmpty()
    .withMessage('Location is required'),

  body('representativeName')
    .notEmpty()
    .withMessage('Representative name is required')
    .trim(),

  body('designation')
    .notEmpty()
    .withMessage('Designation is required')
    .trim(),

  body('contactNumber')
    .notEmpty()
    .withMessage('Contact number is required'),

  body('agreementAccepted1')
    .equals('true')
    .withMessage('Agreement 1 must be accepted'),

  body('agreementAccepted2')
    .equals('true')
    .withMessage('Agreement 2 must be accepted'),

  body('agreementAccepted3')
    .equals('true')
    .withMessage('Agreement 3 must be accepted'),

  body('agreementAccepted4')
    .equals('true')
    .withMessage('Agreement 4 must be accepted'),

  body('agreementAccepted5')
    .equals('true')
    .withMessage('Agreement 5 must be accepted'),

  body('agreementAccepted6')
    .equals('true')
    .withMessage('Agreement 6 must be accepted'),

  body('aadhaarConsent')
    .equals('true')
    .withMessage('Aadhaar consent must be accepted'),

  body('signatureName')
    .notEmpty()
    .withMessage('Signature name is required')
    .trim(),
];

module.exports = { consentValidator };