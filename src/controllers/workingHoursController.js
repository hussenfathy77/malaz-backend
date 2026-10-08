const workingHoursService = require('../services/workingHoursService');

const setWorkingHours = async (req, res, next) => {
  try {
    const workingHours = await workingHoursService.createOrUpdateWorkingHours(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        workingHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setWorkingHours,
};
