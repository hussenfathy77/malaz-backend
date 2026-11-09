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

const getMyPatients = async (req, res, next) => {
  try {
    const patients = await doctorService.getMyPatients(req.user.id);
    res.status(200).json({ status: 'success', data: { patients } });
  } catch (error) { next(error); }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await doctorService.getPatientById(req.user.id, req.params.patientId);
    res.status(200).json({ status: 'success', data: { patient } });
  } catch (error) { next(error); }
};

const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await doctorService.getDoctorAvailability(req.params.id, date);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

const getPatientJournals = async (req, res, next) => {
    try {
        const journals = await doctorService.getPatientJournals(req.user.id, req.params.patientId);
        res.status(200).json({ status: 'success', results: journals.length, data: { journals } });
    } catch (error) { next(error); }
};

const getNearbyDoctors = async (req, res, next) => {
    try {
        const { lat, lng, radius = 50 } = req.query;
        const doctors = await doctorService.getNearbyDoctors(parseFloat(lat), parseFloat(lng), parseFloat(radius));
        res.status(200).json({ status: 'success', results: doctors.length, data: { doctors } });
    } catch (error) { next(error); }
};

module.exports = {
  getDoctors,
  getDoctor,
  updateProfile,
  getMyPatients,
  getPatientById,
  getAvailability,
  getPatientJournals,
  getNearbyDoctors,
};
