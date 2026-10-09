const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { updateProfileSchema, changePasswordSchema } = require('../validators/userValidator');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);

router.patch(
  '/profile',
  validate(updateProfileSchema),
  userController.updateProfile
);

router.patch(
  '/change-password',
  validate(changePasswordSchema),
  userController.changePassword
);

router.delete(
  '/account',
  userController.deleteAccount
);

module.exports = router;
