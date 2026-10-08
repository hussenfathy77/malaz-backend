const express = require('express');
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { joinCircleSchema } = require('../validators/communityValidator');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('Patient'));

router.get('/', communityController.getCircles);
router.post('/:id/join', validate(joinCircleSchema), communityController.joinCircle);

module.exports = router;
