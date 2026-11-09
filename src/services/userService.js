const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const updateProfile = async (userId, data) => {
  const updateData = { ...data };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      full_name: true,
      profile_pic: true,
      role: true,
      preferred_language: true,
      account_status: true,
    }
  });

  return updatedUser;
};

const updateProfilePic = async (userId, fileUrl) => {
  await prisma.user.update({
    where: { id: userId },
    data: { profile_pic: fileUrl }
  });
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      profile_pic: true,
      role: true,
      preferred_language: true,
      account_status: true,
    }
  });

  return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError('Incorrect old password', 401);

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

const deleteAccount = async (userId) => {
  await prisma.user.delete({ where: { id: userId } });
};

const updateLocation = async (userId, role, { latitude, longitude, address }) => {
  const data = {};
  if (latitude !== undefined) data.latitude = parseFloat(latitude);
  if (longitude !== undefined) data.longitude = parseFloat(longitude);
  if (address !== undefined) data.address = address;

  if (Object.keys(data).length === 0) throw new AppError('No location data provided', 400);

  const normalizedRole = role.toUpperCase();

  if (normalizedRole === 'DOCTOR') {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    return await prisma.doctor.update({ where: { id: doctor.id }, data });
  } else if (normalizedRole === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
    if (!patient) throw new AppError('Patient profile not found', 404);
    return await prisma.patient.update({ where: { id: patient.id }, data });
  } else {
    throw new AppError('Location update is only available for doctors and patients', 403);
  }
};

module.exports = {
  updateProfile,
  getProfile,
  updateProfilePic,
  changePassword,
  deleteAccount,
  updateLocation,
};
