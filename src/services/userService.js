const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

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

module.exports = {
  updateProfile,
  getProfile,
  updateProfilePic,
};
