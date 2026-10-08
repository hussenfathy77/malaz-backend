const communityService = require('../services/communityService');

const getCircles = async (req, res, next) => {
  try {
    const circles = await communityService.getSafeCircles();
    res.status(200).json({
      status: 'success',
      results: circles.length,
      data: { circles }
    });
  } catch (error) {
    next(error);
  }
};

const joinCircle = async (req, res, next) => {
  try {
    const member = await communityService.joinSafeCircle(req.user.id, req.params.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

const getCaregiverSummary = async (req, res, next) => {
  try {
    const summary = await communityService.getCaregiverSummary(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCircles,
  joinCircle,
  getCaregiverSummary,
};
