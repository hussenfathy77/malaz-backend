const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { user, token, refreshToken } = await authService.registerUser(req.body);
    res.status(201).json({
      status: 'success',
      token,
      refreshToken,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token, refreshToken } = await authService.loginUser(email, password);

    res.status(200).json({
      status: 'success',
      token,
      refreshToken,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    // #10 FIX: Never expose resetToken in production
    // In dev, devResetToken is returned for testing the reset flow
    res.status(200).json({
      status: 'success',
      message: process.env.NODE_ENV === 'production'
        ? 'If this email is registered, a reset link has been sent.'
        : 'Dev mode: use devResetToken to test reset flow.',
      ...(result.devResetToken ? { devResetToken: result.devResetToken } : {}),
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful.'
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({
      status: 'success',
      token: tokens.token,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body?.refreshToken ?? null;
    await authService.logoutUser(refreshToken);
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
};
