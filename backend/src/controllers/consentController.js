const ConsentForm = require('../models/ConsentForm');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createOrUpdateConsent = catchAsync(async (req, res, next) => {
  const {
    fullName,
    mobileNumber,
    email,
    ageGroup,
    gender,
    basedIn,

    representativeName,
    designation,
    contactNumber,

    agreementAccepted1,
    agreementAccepted2,
    agreementAccepted3,
    agreementAccepted4,
    agreementAccepted5,
    agreementAccepted6,

    aadhaarConsent,
    signatureName
  } = req.body;

  // Validate agreements
  if (
    !agreementAccepted1 ||
    !agreementAccepted2 ||
    !agreementAccepted3 ||
    !agreementAccepted4 ||
    !agreementAccepted5 ||
    !agreementAccepted6
  ) {
    return next(
      new AppError('All agreement checkboxes must be accepted', 400)
    );
  }

  if (!aadhaarConsent) {
    return next(
      new AppError('Aadhaar consent must be accepted', 400)
    );
  }

  const consentData = {
    church: req.user.id,
    churchName: req.user.churchName,

    fullName,
    mobileNumber,
    email,
    ageGroup,
    gender,
    basedIn,

    representativeName,
    designation,
    contactNumber,

    agreementAccepted1,
    agreementAccepted2,
    agreementAccepted3,
    agreementAccepted4,
    agreementAccepted5,
    agreementAccepted6,

    aadhaarConsent,
    signatureName,

    submittedAt: new Date(),
  };

  let consentForm = await ConsentForm.findOne({
    church: req.user.id,
  });

  if (consentForm) {
    consentForm = await ConsentForm.findOneAndUpdate(
      { church: req.user.id },
      consentData,
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    consentForm = await ConsentForm.create(consentData);

    await User.findByIdAndUpdate(req.user.id, {
      consentFormSubmitted: true,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Consent form submitted successfully',
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