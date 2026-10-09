const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file.', 400));
    }
    const fileUrl = `/public/uploads/${req.file.filename}`;
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profile_pic: fileUrl }
    });

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
    
    const doctor = await prisma.doctor.findUnique({ where: { user_id: req.user.id } });
    if (!doctor) {
      return next(new AppError('Doctor profile not found', 404));
    }

    const fileUrl = `/public/uploads/${req.file.filename}`;
    
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { certificate_url: fileUrl }
    });

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
