const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  // Fields that can be updated
  const allowedFields = ['churchName', 'phoneNumber', 'pastorName', 'address', 'city', 'state'];
  const filteredBody = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user,
  });
});