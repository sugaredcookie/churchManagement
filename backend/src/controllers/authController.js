const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateSecurePassword = require('../utils/generatePassword');
const emailService = require('../services/emailService');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      churchName: user.churchName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      consentFormSubmitted: user.consentFormSubmitted,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Generate secure password
  const plainPassword = generateSecurePassword();
  console.log(plainPassword);

  // Create user
  const user = await User.create({
    ...req.body,
    password: plainPassword,
    role: 'church',
  });

  // Send email with password
  try {
    await emailService.sendWelcomeEmail(user.email, user.churchName, plainPassword);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Still return success but log error
  }

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been disabled. Please contact support.', 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});