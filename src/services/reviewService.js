const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const createReview = async (userId, doctorId, data) => {
  const patient = await prisma.patient.findUnique({
    where: { user_id: userId }
  });

  if (!patient) {
    throw new AppError('Only patients can leave reviews', 403);
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      patient_id: patient.id,
      doctor_id: doctorId
    }
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this doctor', 400);
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      patient_id: patient.id,
      doctor_id: doctorId,
      status: 'COMPLETED',
      review: { is: null }
    }
  });

  if (!appointment) {
    throw new AppError('You must have a completed, unreviewed appointment with this doctor to leave a review', 400);
  }

  const review = await prisma.review.create({
    data: {
      appointment_id: appointment.id,
      patient_id: patient.id,
      doctor_id: doctorId,
      rating: data.rating,
      comment: data.comment
    },
    include: {
      patient: {
        include: { user: { select: { full_name: true, profile_pic: true } } }
      }
    }
  });

  const doctorReviews = await prisma.review.aggregate({
    where: { doctor_id: doctorId },
    _avg: { rating: true }
  });

  await prisma.doctor.update({
    where: { id: doctorId },
    data: { avg_rating: doctorReviews._avg.rating || 0.0 }
  });

  return review;
};

const getDoctorReviews = async (doctorId) => {
  return await prisma.review.findMany({
    where: { doctor_id: doctorId },
    include: {
      patient: {
        include: { user: { select: { full_name: true, profile_pic: true } } }
      }
    },
    orderBy: { created_at: 'desc' }
  });
};

module.exports = {
  createReview,
  getDoctorReviews
};
