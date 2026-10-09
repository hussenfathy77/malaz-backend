const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { updateUserStatusSchema } = require('../validators/adminValidator');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/doctors/unverified', adminController.getUnverifiedDoctors);
router.patch('/doctors/:id/verify', adminController.verifyDoctor);
router.patch('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);
router.patch('/safe-circles/:id', adminController.updateSafeCircle);
router.delete('/safe-circles/:id', adminController.deleteSafeCircle);

module.exports = router;
