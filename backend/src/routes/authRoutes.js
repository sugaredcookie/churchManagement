// backend/src/routes/authRoutes.js
const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/signup', validate(signupValidator), signup);
router.post('/register', validate(signupValidator), signup); // Add this line for /register

router.post('/login', validate(loginValidator), login);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    routes: ['POST /signup', 'POST /register', 'POST /login']
  });
});

module.exports = router;