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

module.exports = {
  updateProfile,
  getProfile,
  updateProfilePic,
  changePassword,
  deleteAccount
};
