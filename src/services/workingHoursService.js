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
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        is_online: data.is_online,
      },
    });
  } else {
    return await prisma.workingHours.create({
      data: {
        doctor_id: doctor.id,
        day_of_week: data.day_of_week,
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        is_online: data.is_online,
      },
    });
  }
};

module.exports = {
  createOrUpdateWorkingHours,
};
