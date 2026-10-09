const bcrypt = require('bcryptjs');
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
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

module.exports = {
  registerUser,
  loginUser,
};
