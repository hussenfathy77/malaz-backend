const express = require('express');
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { joinCircleSchema, sendMessageSchema, createCircleSchema, addPatientSchema } = require('../validators/communityValidator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', communityController.getCircles);
router.post('/', roleMiddleware('ADMIN', 'DOCTOR'), validate(createCircleSchema), communityController.createCircle);

router.post('/:id/join', validate(joinCircleSchema), communityController.joinCircle);
router.post('/:id/add-patient', roleMiddleware('DOCTOR'), validate(addPatientSchema), communityController.addPatientToCircle);

router.get('/:id/messages', communityController.getMessages);
router.post('/:id/messages', validate(sendMessageSchema), communityController.sendMessage);

router.delete('/:id/leave', communityController.leaveCircle);

// Join request management (admin/creator only)
router.get('/:id/requests', communityController.getJoinRequests);
router.patch('/:id/members/:memberId/approve', communityController.approveMember);
router.patch('/:id/members/:memberId/reject', communityController.rejectMember);

module.exports = router;
