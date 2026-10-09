const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const registerUser = async (data) => {
  const { full_name, email, password, role, ...profileData } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Use interactive transaction to create base user + specific profile
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        full_name,
        email,
        password: password_hash,
        role,
      },
    });

    if (role === 'PATIENT') {
      await tx.patient.create({
        data: {
          user_id: user.id,
          date_of_birth: profileData.date_of_birth ? new Date(profileData.date_of_birth) : null,
          gender: profileData.gender,
          emergency_contact: profileData.emergency_contact,
        },
      });
    } else if (role === 'DOCTOR') {
      await tx.doctor.create({
        data: {
          user_id: user.id,
          specialization: profileData.specialization,
          session_price: profileData.session_price,
        },
      });
    }
    // CAREGIVER: no separate profile table, just the User record

    return user;
  });

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = result;

  const token = signToken(result.id);

  return { user: userWithoutPassword, token };
};

const loginUser = async (email, password) => {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user.id);
  const refreshTokenStr = crypto.randomBytes(40).toString('hex');
  
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshTokenStr }
  });

  const { password: _, refreshToken: __, resetPasswordToken: ___, resetPasswordExpires: ____, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token, refreshToken: refreshTokenStr };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('There is no user with that email address.', 404);

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires
    }
  });

  return resetToken;
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gte: new Date() }
    }
  });

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });
};

const refreshAccessToken = async (token) => {
  const user = await prisma.user.findFirst({ where: { refreshToken: token } });
  if (!user) throw new AppError('Invalid refresh token', 401);

  const newToken = signToken(user.id);
  return { token: newToken };
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken
};
