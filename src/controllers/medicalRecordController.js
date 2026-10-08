const medicalRecordService = require('../services/medicalRecordService');

const createRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.createMedicalRecord(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.updateMedicalRecord(req.user.id, req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { patientId } = req.query; // Used by doctor to specify which patient's records to get
    const records = await medicalRecordService.getPatientMedicalRecords(req.user.id, req.user.role, patientId);

    res.status(200).json({
      status: 'success',
      results: records.length,
      data: {
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  updateRecord,
  getRecords,
};
