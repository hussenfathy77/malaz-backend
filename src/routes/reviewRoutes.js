const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createReviewSchema } = require('../validators/reviewValidator');

const router = express.Router({ mergeParams: true }); // Important for /doctors/:doctorId/reviews

router.get('/', authMiddleware, reviewController.getDoctorReviews);
router.post('/', authMiddleware, roleMiddleware('Patient', 'PATIENT'), validate(createReviewSchema), reviewController.createReview);

module.exports = router;
