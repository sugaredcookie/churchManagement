const express = require('express');
const {
  getAllChurches,
  getChurchById,
  toggleChurchStatus,
  deleteChurch,
  createAdmin,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createAdminValidator } = require('../validators/adminValidator');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin')); // All admin routes require admin role

router.get('/churches', getAllChurches);
router.get('/churches/:id', getChurchById);
router.patch('/churches/:id/status', toggleChurchStatus);
router.delete('/churches/:id', deleteChurch);
router.post('/create-admin', validate(createAdminValidator), createAdmin);

module.exports = router;