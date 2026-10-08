const express = require('express');
const medicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createMedicalRecordSchema, updateMedicalRecordSchema } = require('../validators/medicalRecordValidator');

const router = express.Router();

router.use(authMiddleware);

// Get records (Patients get their own, Doctors get their patients' records using ?patientId=...)
router.get(
  '/',
  roleMiddleware('Patient', 'Doctor'),
  medicalRecordController.getRecords
);

// Create a new record (Doctor only)
router.post(
  '/',
  roleMiddleware('Doctor'),
  validate(createMedicalRecordSchema),
  medicalRecordController.createRecord
);

// Update a record (Doctor only)
router.patch(
  '/:id',
  roleMiddleware('Doctor'),
  validate(updateMedicalRecordSchema),
  medicalRecordController.updateRecord
);

module.exports = router;
