const express = require('express');
const doctorController = require('../controllers/doctorController');
const reviewRoutes = require('./reviewRoutes');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { getDoctorsQuerySchema, updateDoctorSchema } = require('../validators/doctorValidator');

const router = express.Router();

router.use('/:doctorId/reviews', reviewRoutes);

// Nearby doctors for offline booking (before /:id to avoid route conflict)
router.get(
    '/nearby',
    authMiddleware,
    doctorController.getNearbyDoctors
);

// Publicly available list
router.get(
    '/',
    authMiddleware,
    validate(getDoctorsQuerySchema, 'query'),
    doctorController.getDoctors
);

// Only doctors can update their own profile
router.patch(
    '/profile',
    authMiddleware,
    roleMiddleware('DOCTOR'),
    validate(updateDoctorSchema),
    doctorController.updateProfile
);

// Doctor: list all unique patients
router.get(
    '/my-patients',
    authMiddleware,
    roleMiddleware('DOCTOR'),
    doctorController.getMyPatients
);

// Doctor: get patient's journals
router.get(
    '/patients/:patientId/journals',
    authMiddleware,
    roleMiddleware('DOCTOR'),
    doctorController.getPatientJournals
);

// Doctor: get single patient detail
router.get(
    '/patients/:patientId',
    authMiddleware,
    roleMiddleware('DOCTOR'),
    doctorController.getPatientById
);

// Availability
router.get(
    '/:id/availability',
    authMiddleware,
    doctorController.getAvailability
);

router.get(
    '/:id',
    authMiddleware,
    doctorController.getDoctor
);

module.exports = router;
