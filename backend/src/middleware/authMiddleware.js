const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Restrict to specific roles
 * @param {...string} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

/**
 * Check if user belongs to a church
 */
exports.belongsToChurch = async (req, res, next) => {
  try {
    const user = req.user;
    const churchId = req.params.churchId || req.body.churchId;

    if (!churchId) {
      return next(new AppError('Church ID is required', 400));
    }

    if (user.role === 'admin') {
      return next();
    }

    if (user.role === 'church' && user._id.toString() === churchId) {
      return next();
    }

    if (user.role === 'member' && user.churchId && user.churchId.toString() === churchId) {
      return next();
    }

    return next(new AppError('You do not have permission to access this church\'s data', 403));
  } catch (error) {
    next(error);
  }
};