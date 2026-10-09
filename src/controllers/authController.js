const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user
      }
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
    const resetToken = await authService.forgotPassword(email);
    res.status(200).json({
      status: 'success',
      message: 'Token generated successfully. In production, this would be emailed.',
      resetToken // Returning token directly for mocking purposes
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
    const { token } = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({
      status: 'success',
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken
};
