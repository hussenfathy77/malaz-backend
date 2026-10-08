const express = require('express');
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('Caregiver'));

router.get('/summary', communityController.getCaregiverSummary);

module.exports = router;
