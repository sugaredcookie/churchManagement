const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/signup', validate(signupValidator), signup);
router.post('/login', validate(loginValidator), login);

module.exports = router;