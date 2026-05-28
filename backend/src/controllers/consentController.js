const ConsentForm = require('../models/ConsentForm');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createOrUpdateConsent = catchAsync(async (req, res, next) => {
  const { agreementAccepted, signatureName, representativeName, designation, contactNumber } = req.body;

  if (!agreementAccepted) {
    return next(new AppError('You must accept the agreement to submit the consent form', 400));
  }

  const consentData = {
    church: req.user.id,
    churchName: req.user.churchName,
    representativeName,
    designation,
    contactNumber,
    agreementAccepted,
    signatureName,
    submittedAt: new Date(),
  };

  let consentForm = await ConsentForm.findOne({ church: req.user.id });

  if (consentForm) {
    consentForm = await ConsentForm.findOneAndUpdate(
      { church: req.user.id },
      consentData,
      { new: true, runValidators: true }
    );
  } else {
    consentForm = await ConsentForm.create(consentData);
    // Update user to indicate consent form submitted
    await User.findByIdAndUpdate(req.user.id, { consentFormSubmitted: true });
  }

  res.status(200).json({
    success: true,
    data: consentForm,
  });
});

exports.getConsent = catchAsync(async (req, res, next) => {
  const consentForm = await ConsentForm.findOne({ church: req.user.id });

  if (!consentForm) {
    return next(new AppError('Consent form not found', 404));
  }

  res.status(200).json({
    success: true,
    data: consentForm,
  });
});