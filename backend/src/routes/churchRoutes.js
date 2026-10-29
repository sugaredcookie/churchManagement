const express = require('express');
const router = express.Router();
const churchController = require('../controllers/churchController');
const { protect, restrictTo, belongsToChurch } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Church profile routes
router.get('/profile', restrictTo('church', 'admin'), churchController.getChurchProfile);
router.patch('/profile', restrictTo('church'), churchController.updateChurchProfile);

// Member management routes
router.get('/members', restrictTo('church', 'admin'), churchController.getChurchMembers);
router.post('/members', restrictTo('church'), churchController.addMember);
router.get('/members/:id', restrictTo('church'), churchController.getMember);
router.patch('/members/:id', restrictTo('church'), churchController.updateMember);
router.delete('/members/:id', restrictTo('church'), churchController.deleteMember);

module.exports = router;