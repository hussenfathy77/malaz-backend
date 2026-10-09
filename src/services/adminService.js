const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const getUnverifiedDoctors = async () => {
  return await prisma.doctor.findMany({
    where: { is_verified: false },
    include: {
      user: {
        select: {
          full_name: true,
          email: true,
          profile_pic: true
        }
      }
    }
  });
};

const verifyDoctor = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId }
  });

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  if (doctor.is_verified) {
    throw new AppError('Doctor is already verified', 400);
  }

  const updatedDoctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: { is_verified: true }
  });

  return updatedDoctor;
};

const updateUserStatus = async (userId, status) => {
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    throw new AppError('Invalid account status', 400);
  }
  return await prisma.user.update({
    where: { id: userId },
    data: { account_status: status }
  });
};

const updateSafeCircle = async (circleId, data) => {
  const circle = await prisma.safeCircle.findUnique({ where: { id: circleId } });
  if (!circle) throw new AppError('Safe circle not found', 404);

  return await prisma.safeCircle.update({
    where: { id: circleId },
    data: {
      name: data.name !== undefined ? data.name : circle.name,
      description: data.description !== undefined ? data.description : circle.description
    }
  });
};

const deleteSafeCircle = async (circleId) => {
  const circle = await prisma.safeCircle.findUnique({ where: { id: circleId } });
  if (!circle) throw new AppError('Safe circle not found', 404);

  await prisma.safeCircle.delete({ where: { id: circleId } });
};

module.exports = {
  getUnverifiedDoctors,
  verifyDoctor,
  updateUserStatus,
  updateSafeCircle,
  deleteSafeCircle
};
