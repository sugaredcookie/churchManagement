const express = require('express');
const { getProfile, updateProfile } = require('../controllers/churchController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;