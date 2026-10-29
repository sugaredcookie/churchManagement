const User = require('../models/User');
const AppError = require('../utils/AppError');
const emailService = require('../services/emailService');

/**
 * Get church profile
 */
exports.getChurchProfile = async (req, res, next) => {
  try {
    const church = req.user;

    // If it's a church user, return their own data
    if (church.role === 'church') {
      return res.status(200).json({
        success: true,
        data: {
          id: church._id,
          name: church.name,
          email: church.email,
          churchName: church.churchName,
          churchAddress: church.churchAddress,
          churchPhone: church.churchPhone,
          createdAt: church.createdAt
        }
      });
    }

    // If admin is requesting specific church
    const churchId = req.params.id || req.query.id;
    if (churchId) {
      const churchData = await User.findById(churchId).select('-password');
      if (!churchData || churchData.role !== 'church') {
        return next(new AppError('Church not found', 404));
      }
      return res.status(200).json({
        success: true,
        data: churchData
      });
    }

    return next(new AppError('Church ID is required', 400));
  } catch (error) {
    next(error);
  }
};

/**
 * Update church profile
 */
exports.updateChurchProfile = async (req, res, next) => {
  try {
    const church = req.user;
    const updates = req.body;

    // Only allow certain fields to be updated
    const allowedUpdates = ['churchName', 'churchAddress', 'churchPhone'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedChurch = await User.findByIdAndUpdate(
      church._id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Church profile updated successfully',
      data: updatedChurch
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get church members
 */
exports.getChurchMembers = async (req, res, next) => {
  try {
    const church = req.user;

    // Get church ID from request params or use authenticated user
    const churchId = req.params.churchId || church._id;

    // If admin, they can specify church ID
    if (church.role === 'admin' && req.params.churchId) {
      const churchExists = await User.findById(req.params.churchId);
      if (!churchExists || churchExists.role !== 'church') {
        return next(new AppError('Church not found', 404));
      }
    }

    // If church user, they can only access their own members
    if (church.role === 'church' && churchId.toString() !== church._id.toString()) {
      return next(new AppError('You can only access your own church members', 403));
    }

    // Get members
    const members = await User.find({
      role: 'member',
      churchId: churchId
    }).select('-password');

    // Get counts
    const total = members.length;
    const verified = members.filter(m => m.aadhaarVerification.status === 'VERIFIED').length;
    const pending = members.filter(m => m.aadhaarVerification.status === 'PENDING').length;
    const notVerified = members.filter(m => m.aadhaarVerification.status === 'NOT_VERIFIED').length;
    const failed = members.filter(m => m.aadhaarVerification.status === 'FAILED').length;

    res.status(200).json({
      success: true,
      data: members,
      stats: {
        total,
        verified,
        pending,
        notVerified,
        failed
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add member to church
 */
exports.addMember = async (req, res, next) => {
  try {
    const church = req.user;
    const { name, email } = req.body;

    // Validate inputs
    if (!name || !email) {
      return next(new AppError('Name and email are required', 400));
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }

    // Generate secure temporary password
    const tempPassword = generateTemporaryPassword();

    // Create member
    const member = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role: 'member',
      churchId: church._id,
      mustChangePassword: true,
      aadhaarVerification: {
        status: 'NOT_VERIFIED'
      }
    });

    // Don't expose password in response
    const memberResponse = member.toObject();
    delete memberResponse.password;

    // Send welcome email
    try {
      await emailService.sendMemberWelcomeEmail({
        name,
        email: email.toLowerCase(),
        tempPassword,
        churchName: church.churchName || church.name,
        loginUrl: `${process.env.CLIENT_URL}/login`
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request, but log the error
    }

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: memberResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get member details
 */
exports.getMember = async (req, res, next) => {
  try {
    const church = req.user;
    const memberId = req.params.id;

    const member = await User.findOne({
      _id: memberId,
      role: 'member',
      churchId: church._id
    }).select('-password');

    if (!member) {
      return next(new AppError('Member not found', 404));
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member
 */
exports.updateMember = async (req, res, next) => {
  try {
    const church = req.user;
    const memberId = req.params.id;
    const updates = req.body;

    // Find member belonging to this church
    const member = await User.findOne({
      _id: memberId,
      role: 'member',
      churchId: church._id
    });

    if (!member) {
      return next(new AppError('Member not found', 404));
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['name', 'email', 'isActive'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedMember = await User.findByIdAndUpdate(
      memberId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete member
 */
exports.deleteMember = async (req, res, next) => {
  try {
    const church = req.user;
    const memberId = req.params.id;

    const member = await User.findOne({
      _id: memberId,
      role: 'member',
      churchId: church._id
    });

    if (!member) {
      return next(new AppError('Member not found', 404));
    }

    await User.findByIdAndDelete(memberId);

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate temporary password
 */
function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}