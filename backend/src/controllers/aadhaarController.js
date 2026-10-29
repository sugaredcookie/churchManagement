const crypto = require('crypto');
const User = require('../models/User');
const aadhaarService = require('../services/aadhaarService');
const AppError = require('../utils/AppError');

/**
 * Generate a unique verification ID (max 50 chars for Cashfree).
 */
const generateVerificationId = () => {
  return `CHURCH_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * POST /api/aadhaar/initiate
 */
exports.initiateVerification = async (req, res, next) => {
  try {
    const user = req.user;
    const { mobileNumber } = req.body;

    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return next(new AppError('Please provide a valid 10-digit mobile number', 400));
    }

    if (user.aadhaarVerification?.status === 'VERIFIED') {
      return next(new AppError('Identity already verified', 400));
    }

    if (
      user.aadhaarVerification?.status === 'DIGILOCKER_PENDING' ||
      user.aadhaarVerification?.status === 'DIGILOCKER_INITIATED'
    ) {
      return next(new AppError('Verification already in progress', 400));
    }

    const verificationId = generateVerificationId();

    const urlResult = await aadhaarService.createConsentUrl(verificationId);

    if (!urlResult.success) {
      return next(new AppError(urlResult.message || 'Failed to initiate verification', 400));
    }

    await User.findByIdAndUpdate(user._id, {
      'aadhaarVerification.status': 'DIGILOCKER_PENDING',
      'aadhaarVerification.verificationId': verificationId,
      'aadhaarVerification.lastAttemptAt': new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Verification initiated. Redirect to DigiLocker to complete.',
      consentUrl: urlResult.url,
      verificationId
    });
  } catch (error) {
    console.error('Aadhaar initiation error:', error.message);
    next(new AppError('Failed to initiate verification', 500));
  }
};

/**
 * GET /api/aadhaar/status
 */
exports.getVerificationStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const v = user.aadhaarVerification || {};

    res.status(200).json({
      success: true,
      data: {
        status: v.status || 'NOT_VERIFIED',
        verifiedAt: v.verifiedAt || null,
        verifiedName: v.verifiedName || null,
        maskedAadhaar: v.maskedAadhaar || null,
        failureReason: v.failureReason || null
      }
    });
  } catch (error) {
    next(new AppError('Failed to get status', 500));
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const timestamp = req.headers['x-webhook-timestamp'];
    const signature = req.headers['x-webhook-signature'];

    if (!timestamp || !signature) {
      return res.status(401).json({ error: 'Missing signature headers' });
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return res.status(500).json({ error: 'Raw body not available' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_CLIENT_SECRET)
      .update(timestamp + rawBody)
      .digest('base64');

    if (expectedSignature !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type; // <-- TOP-LEVEL FIELD
    const verificationId = payload.data?.verification_id;

    if (!verificationId) {
      return res.status(400).json({ error: 'Missing verification_id' });
    }

    const user = await User.findOne({
      'aadhaarVerification.verificationId': verificationId
    });

    if (!user) {
      return res.status(200).json({ received: true });
    }

    // Idempotency: already verified
    if (user.aadhaarVerification.status === 'VERIFIED') {
      return res.status(200).json({ received: true });
    }

    const update = { 'aadhaarVerification.lastAttemptAt': new Date() };

    // Check event_type, not data.status
    if (eventType === 'DIGILOCKER_VERIFICATION_SUCCESS') {
      // Fetch document to get name and masked Aadhaar
      const docResult = await aadhaarService.getDocument(verificationId);

      if (docResult.success) {
        const doc = docResult.data;
        update['aadhaarVerification.status'] = 'VERIFIED';
        update['aadhaarVerification.verifiedAt'] = new Date();
        update['aadhaarVerification.verifiedName'] = doc.name || null;
        update['aadhaarVerification.maskedAadhaar'] = doc.aadhaar_number || null;
      } else {
        update['aadhaarVerification.status'] = 'FAILED';
        update['aadhaarVerification.failureReason'] = 'Document retrieval failed';
      }
    } else if (eventType === 'DIGILOCKER_VERIFICATION_CONSENT_DENIED') {
      update['aadhaarVerification.status'] = 'CONSENT_DENIED';
      update['aadhaarVerification.consentDeniedAt'] = new Date();
    } else if (eventType === 'DIGILOCKER_VERIFICATION_LINK_EXPIRED') {
      update['aadhaarVerification.status'] = 'FAILED';
      update['aadhaarVerification.failureReason'] = 'Consent link expired';
    } else if (eventType === 'DIGILOCKER_VERIFICATION_FAILURE') {
      update['aadhaarVerification.status'] = 'FAILED';
      update['aadhaarVerification.failureReason'] = 'Verification failed due to system error';
    }

    await User.findByIdAndUpdate(user._id, update);
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(200).json({ received: true });
  }
};