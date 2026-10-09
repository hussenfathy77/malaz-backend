const AppError = require('../utils/AppError');
const userService = require('../services/userService');
const doctorService = require('../services/doctorService');

const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file.', 400));
    }
    const fileUrl = `/public/uploads/${req.file.filename}`;
    
    await userService.updateProfilePic(req.user.id, fileUrl);

    res.status(200).json({
      status: 'success',
      data: { profile_pic: fileUrl }
    });
  } catch (error) {
    next(error);
  }
};

const uploadCertificate = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a PDF or image file.', 400));
    }
    if (req.user.role.toUpperCase() !== 'DOCTOR') {
      return next(new AppError('Only doctors can upload certificates.', 403));
    }
    
    const fileUrl = `/public/uploads/${req.file.filename}`;
    
    await doctorService.updateCertificate(req.user.id, fileUrl);

    res.status(200).json({
      status: 'success',
      data: { certificate_url: fileUrl }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadProfilePic,
  uploadCertificate
};
