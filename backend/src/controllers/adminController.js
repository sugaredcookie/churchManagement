const User = require('../models/User');
const ConsentForm = require('../models/ConsentForm');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateSecurePassword = require('../utils/generatePassword');
const emailService = require('../services/emailService');

exports.getAllChurches = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { role: 'church' };
  
  // Filter by status if provided
  if (req.query.status === 'active') query.isActive = true;
  if (req.query.status === 'inactive') query.isActive = false;

  const churches = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: churches,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.getChurchById = catchAsync(async (req, res, next) => {
  const church = await User.findOne({ _id: req.params.id, role: 'church' }).select('-password');
  
  if (!church) {
    return next(new AppError('Church not found', 404));
  }

  const consentForm = await ConsentForm.findOne({ church: church._id });

  res.status(200).json({
    success: true,
    data: {
      church,
      consentForm: consentForm || null,
    },
  });
});

exports.toggleChurchStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be a boolean value', 400));
  }

  const church = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'church' },
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!church) {
    return next(new AppError('Church not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `Church ${isActive ? 'enabled' : 'disabled'} successfully`,
    data: church,
  });
});

exports.deleteChurch = catchAsync(async (req, res, next) => {
  const church = await User.findOneAndDelete({ _id: req.params.id, role: 'church' });
  
  if (!church) {
    return next(new AppError('Church not found', 404));
  }

  // Also delete associated consent form
  await ConsentForm.findOneAndDelete({ church: church._id });

  res.status(200).json({
    success: true,
    message: 'Church deleted successfully',
  });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  const { churchName, email, phoneNumber, pastorName, address, city, state } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Generate secure password
  const plainPassword = generateSecurePassword();

  // Create admin user
  const admin = await User.create({
    churchName,
    email,
    phoneNumber,
    pastorName,
    address,
    city,
    state,
    password: plainPassword,
    role: 'admin',
    isActive: true,
  });

  // Send email with password
  try {
    await emailService.sendWelcomeEmail(admin.email, admin.churchName, plainPassword);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  admin.password = undefined;

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: admin,
  });
});