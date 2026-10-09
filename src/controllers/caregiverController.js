const caregiverService = require('../services/caregiverService');

const inviteCaregiver = async (req, res, next) => {
  try {
    const result = await caregiverService.inviteCaregiver(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { relation: result }
    });
  } catch (error) {
    next(error);
  }
};

const updateCaregiverStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await caregiverService.updateCaregiverStatus(req.user.id, id, status);
    res.status(200).json({
      status: 'success',
      data: { relation: result }
    });
  } catch (error) {
    next(error);
  }
};

const getCaregiverSummary = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const summary = await caregiverService.getCaregiverSummary(req.user.id, patientId);
    res.status(200).json({
      status: 'success',
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  inviteCaregiver,
  updateCaregiverStatus,
  getCaregiverSummary,
};
