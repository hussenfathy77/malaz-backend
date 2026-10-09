const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const createOrUpdateWorkingHours = async (userId, data) => {
  // Find the doctor
  const doctor = await prisma.doctor.findUnique({
    where: { user_id: userId },
  });

  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }

  // Create or Update working hour for that specific day
  // Since a doctor might have only 1 config per day, let's check if it exists
  const existingWH = await prisma.workingHours.findFirst({
    where: {
      doctor_id: doctor.id,
      day_of_week: data.day_of_week,
    },
  });

  if (existingWH) {
    return await prisma.workingHours.update({
      where: { id: existingWH.id },
      data: {
        start_time: data.start_time,
        end_time: data.end_time,
      },
    });
  } else {
    return await prisma.workingHours.create({
      data: {
        doctor_id: doctor.id,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
      },
    });
  }
};

const deleteWorkingHours = async (userId, workingHoursId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { user_id: userId },
  });

  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }

  const existingWH = await prisma.workingHours.findUnique({
    where: { id: workingHoursId },
  });

  if (!existingWH) {
    throw new AppError('Working hours record not found', 404);
  }

  if (existingWH.doctor_id !== doctor.id) {
    throw new AppError('You are not authorized to delete this working hours record', 403);
  }

  await prisma.workingHours.delete({
    where: { id: workingHoursId },
  });
};

const getWorkingHours = async (userId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { user_id: userId },
  });

  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }

  return await prisma.workingHours.findMany({
    where: { doctor_id: doctor.id },
  });
};

module.exports = {
  createOrUpdateWorkingHours,
  deleteWorkingHours,
  getWorkingHours,
};
