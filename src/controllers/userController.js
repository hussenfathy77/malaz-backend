const userService = require('../services/userService');

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    await userService.changePassword(req.user.id, old_password, new_password);
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getProfile,
  changePassword,
  deleteAccount
};
