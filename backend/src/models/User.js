const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'church', 'member'],
    default: 'member'
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  aadhaarVerification: {
    status: {
      type: String,
      enum: ['NOT_VERIFIED', 'DIGILOCKER_INITIATED', 'DIGILOCKER_PENDING',
            'VERIFIED', 'FAILED', 'CONSENT_DENIED'],
      default: 'NOT_VERIFIED'
    },
    verificationId: { type: String, default: null },
    verifiedName: { type: String, default: null },
    maskedAadhaar: { type: String, default: null }, // e.g. XXXXXXXX1234
    verifiedAt: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null },
    consentDeniedAt: { type: Date, default: null },
    failureReason: { type: String, default: null }
  },
  // Church-specific fields
  churchName: {
    type: String,
    trim: true
  },
  churchAddress: {
    type: String,
    trim: true
  },
  churchPhone: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is a member
userSchema.methods.isMember = function() {
  return this.role === 'member' && this.churchId !== null;
};

// Method to check if user belongs to a church
userSchema.methods.belongsToChurch = function(churchId) {
  if (this.role === 'admin') return true;
  if (this.role === 'church') return this._id.toString() === churchId.toString();
  if (this.role === 'member') return this.churchId && this.churchId.toString() === churchId.toString();
  return false;
};

module.exports = mongoose.model('User', userSchema);