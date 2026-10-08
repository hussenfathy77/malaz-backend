const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { bookAppointmentSchema, updateAppointmentStatusSchema } = require('../validators/appointmentValidator');

const router = express.Router();

router.use(authMiddleware);

// Get my appointments (Works for both Doctors and Patients)
router.get(
  '/',
  roleMiddleware('Patient', 'Doctor'),
  appointmentController.getUserAppointments
);

// Book an appointment (Patient only)
router.post(
  '/',
  roleMiddleware('Patient'),
  validate(bookAppointmentSchema),
  appointmentController.bookAppointment
);

// Update appointment status (Cancel, Complete, etc.)
router.patch(
  '/:id/status',
  roleMiddleware('Patient', 'Doctor'),
  validate(updateAppointmentStatusSchema),
  appointmentController.updateAppointmentStatus
);

module.exports = router;
