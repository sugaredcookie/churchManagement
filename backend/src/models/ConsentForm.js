const mongoose = require('mongoose');

const consentFormSchema = new mongoose.Schema(
  {
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    churchName: {
      type: String,
      required: true,
    },
    // Personal Details
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    ageGroup: {
      type: String,
      required: [true, 'Age group is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
    },
    basedIn: {
      type: String,
      required: [true, 'Location is required'],
    },
    // Church Representative Details
    representativeName: {
      type: String,
      required: [true, 'Representative name is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    // Agreements
    agreementAccepted1: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreementAccepted2: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreementAccepted3: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreementAccepted4: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreementAccepted5: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreementAccepted6: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Aadhaar eSign
    aadhaarConsent: {
      type: Boolean,
      required: true,
      default: false,
    },
    signatureName: {
      type: String,
      required: [true, 'Signature name is required'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConsentForm', consentFormSchema);