const express = require('express');
const workingHoursController = require('../controllers/workingHoursController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createWorkingHoursSchema } = require('../validators/workingHoursValidator');

const router = express.Router();

router.use(authMiddleware);

// Only doctors can manage their working hours
router.post(
  '/',
  roleMiddleware('Doctor'),
  validate(createWorkingHoursSchema),
  workingHoursController.setWorkingHours
);

module.exports = router;
