const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, refreshSchema } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.patch('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);

module.exports = router;
