const express = require('express');
const caregiverController = require('../controllers/caregiverController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { inviteCaregiverSchema, updateCaregiverStatusSchema } = require('../validators/caregiverValidator');

const router = express.Router();

router.use(authMiddleware);

// Patient invites a caregiver
router.post('/invite', roleMiddleware('PATIENT'), validate(inviteCaregiverSchema), caregiverController.inviteCaregiver);

// Patient gets their caregivers
router.get('/my-caregivers', roleMiddleware('PATIENT'), caregiverController.getMyCaregivers);

// Caregiver updates their status (ACTIVE/REVOKED)
router.put('/:id/status', roleMiddleware('CAREGIVER'), validate(updateCaregiverStatusSchema), caregiverController.updateCaregiverStatus);

// Caregiver views patient summary
router.get('/patient/:patientId/summary', roleMiddleware('CAREGIVER'), caregiverController.getCaregiverSummary);

module.exports = router;
