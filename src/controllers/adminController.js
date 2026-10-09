const adminService = require('../services/adminService');

const getUnverifiedDoctors = async (req, res, next) => {
  try {
    const doctors = await adminService.getUnverifiedDoctors();
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: { doctors }
    });
  } catch (error) {
    next(error);
  }
};

const verifyDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await adminService.verifyDoctor(id);
    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await adminService.updateUserStatus(id, status);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const updateSafeCircle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const circle = await adminService.updateSafeCircle(id, req.body);
    res.status(200).json({
      status: 'success',
      data: { circle }
    });
  } catch (error) {
    next(error);
  }
};

const deleteSafeCircle = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteSafeCircle(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnverifiedDoctors,
  verifyDoctor,
  updateUserStatus,
  updateSafeCircle,
  deleteSafeCircle
};
