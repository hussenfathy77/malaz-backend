const express = require('express');
const toolkitController = require('../controllers/toolkitController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { addMoodSchema, addJournalSchema } = require('../validators/toolkitValidator');

const router = express.Router();

router.use(authMiddleware);
// The entire toolkit is accessible only to Patients
router.use(roleMiddleware('Patient'));

// Mood Tracking Routes
router.post('/moods', validate(addMoodSchema), toolkitController.addMood);
router.get('/moods', toolkitController.getMoods);

// Journaling Routes
router.post('/journals', validate(addJournalSchema), toolkitController.addJournal);
router.get('/journals', toolkitController.getJournals);

module.exports = router;
