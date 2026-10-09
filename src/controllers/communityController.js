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


const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { messages, meta } = await communityService.getMessages(req.user.id, req.params.id, page, limit);
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: { messages },
      meta
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await communityService.sendMessage(req.user.id, req.params.id, req.body.content);
    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

const createCircle = async (req, res, next) => {
  try {
    const circle = await communityService.createSafeCircle(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { circle }
    });
  } catch (error) {
    next(error);
  }
};

const addPatientToCircle = async (req, res, next) => {
  try {
    const member = await communityService.addPatientToCircle(req.user.id, req.params.id, req.body.patient_id);
    res.status(201).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCircles,
  joinCircle,
  getMessages,
  sendMessage,
  createCircle,
  addPatientToCircle,
  leaveCircle
};
