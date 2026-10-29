const express = require('express');
const router = express.Router();
const aadhaarController = require('../controllers/aadhaarController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public webhook — no auth, signature verified inside controller
router.post('/webhook', aadhaarController.handleWebhook);

// Authenticated routes
router.use(protect);
router.use(restrictTo('member'));

router.post('/initiate', aadhaarController.initiateVerification);
router.get('/status', aadhaarController.getVerificationStatus);

module.exports = router;