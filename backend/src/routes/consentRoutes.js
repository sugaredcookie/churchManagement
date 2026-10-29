const express = require('express');
const { createOrUpdateConsent, getConsent } = require('../controllers/consentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { consentValidator } = require('../validators/consentValidator');

const router = express.Router();

router.use(protect);
router.use(restrictTo('church')); // Only churches can access consent forms

router.post('/', validate(consentValidator), createOrUpdateConsent);
router.get('/', getConsent);
router.put('/', validate(consentValidator), createOrUpdateConsent);

module.exports = router;