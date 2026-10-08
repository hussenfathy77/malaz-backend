const doctorService = require('../services/doctorService');

const getDoctors = async (req, res, next) => {
  try {
    const result = await doctorService.getAllVerifiedDoctors(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    const updatedDoctor = await doctorService.updateDoctorProfile(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        doctor: updatedDoctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  updateProfile,
};
