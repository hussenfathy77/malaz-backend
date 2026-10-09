const reviewService = require('../services/reviewService');

const createReview = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const review = await reviewService.createReview(req.user.id, doctorId, req.body);
    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorReviews = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const reviews = await reviewService.getDoctorReviews(doctorId);
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getDoctorReviews
};
