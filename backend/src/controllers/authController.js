const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateSecurePassword = require('../utils/generatePassword');
const emailService = require('../services/emailService');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const userResponse = user.toObject ? user.toObject() : { ...user };
  delete userResponse.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userResponse,
    user: {
      id: user._id,
      name: user.name || user.churchName,
      churchName: user.churchName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log('📝 Signup request received:', req.body);
  
  const { 
    churchName, 
    email, 
    phoneNumber, 
    pastorName, 
    address, 
    city, 
    state 
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email?.toLowerCase() || req.body.email?.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Generate secure password
  const plainPassword = generateSecurePassword();
  console.log('🔑 Generated password for:', email);

  // Prepare user data
  const userData = {
    name: churchName || req.body.name,
    email: (email || req.body.email).toLowerCase(),
    password: plainPassword,
    role: 'church',
    churchName: churchName || req.body.churchName,
    churchPhone: phoneNumber || req.body.phoneNumber,
    churchAddress: address || req.body.address || '',
    pastorName: pastorName || req.body.pastorName || '',
    city: city || req.body.city || '',
    state: state || req.body.state || '',
    isActive: true,
    mustChangePassword: true,
    aadhaarVerification: {
      status: 'NOT_VERIFIED'
    }
  };

  console.log('👤 Creating user with data:', { ...userData, password: '[HIDDEN]' });

  // Create user
  const user = await User.create(userData);
  console.log('✅ User created successfully:', user._id);

  // Send email with password
  try {
    await emailService.sendWelcomeEmail(
      user.email, 
      user.churchName || user.name, 
      plainPassword
    );
    console.log('📧 Welcome email sent successfully');
  } catch (error) {
    console.error('⚠️ Failed to send welcome email:', error.message);
    // Still return success but log error
  }

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  console.log('🔑 Login attempt for:', email);

  // Check if user exists
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
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

  console.log('✅ Login successful for:', email);

  createSendToken(user, 200, res);
});