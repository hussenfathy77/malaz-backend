const express = require('express');
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { getDoctorsQuerySchema, updateDoctorSchema } = require('../validators/doctorValidator');

const router = express.Router();

// Publicly available (or maybe requires auth to view doctors?)
// Assuming patients or anyone authenticated can view doctors.
router.get(
    '/',
    authMiddleware,
    validate(getDoctorsQuerySchema, 'query'), // تم تمرير 'query' هنا لفحص الـ Query Parameters بنجاح
    doctorController.getDoctors
);

router.get(
    '/:id',
    authMiddleware,
    doctorController.getDoctor
);

// Only doctors can update their own profile
router.patch(
    '/profile',
    authMiddleware,
    roleMiddleware('Doctor'),
    validate(updateDoctorSchema),
    doctorController.updateProfile
);

module.exports = router;