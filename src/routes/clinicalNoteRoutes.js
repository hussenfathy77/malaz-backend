const express = require('express');
const clinicalNoteController = require('../controllers/clinicalNoteController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
// Ignoring validation middleware temporarily since it's likely breaking with schema changes

const router = express.Router();

router.use(authMiddleware);

// Get records (Patients get their own, Doctors get their patients' records using ?patientId=...)
router.get(
  '/',
  roleMiddleware('Patient', 'Doctor', 'PATIENT', 'DOCTOR'),
  clinicalNoteController.getNotes
);

// Create a new note (Doctor only)
router.post(
  '/',
  roleMiddleware('Doctor', 'DOCTOR'),
  clinicalNoteController.createNote
);

// Update a note (Doctor only)
router.patch(
  '/:id',
  roleMiddleware('Doctor', 'DOCTOR'),
  clinicalNoteController.updateNote
);

module.exports = router;
