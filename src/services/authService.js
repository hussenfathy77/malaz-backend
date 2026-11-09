const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// ── helpers ───────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });

/**
 * #9 FIX: Store a SHA-256 hash of the refresh token, return the raw token to client.
 * On lookup, hash the incoming token and compare with stored hash.
 */
const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const generateRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(40).toString('hex');
  const hashed = hashToken(raw);
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: hashed },
  });
  return raw; // return only raw to client - hash stays in DB
};

// ── registerUser ──────────────────────────────────────────────────────────────
const registerUser = async (data) => {
  const { full_name, email, password, role, ...profileData } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { full_name, email, password: password_hash, role },
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
          // Certificate is uploaded after registration and stored here
          certificate_url: profileData.certificate_url || null,
          // Doctor remains unverified until admin approves certificate
          is_verified: false,
        },
      });
    }
    return user;
  });

  const fullUser = await prisma.user.findUnique({
    where: { id: result.id },
    include: {
      doctor_profile: true,
      patient_profile: true,
    },
  });

  const {
    password: _,
    refreshToken: __,
    resetPasswordToken: ___,
    resetPasswordExpires: ____,
    ...userWithoutPassword
  } = fullUser || result;

  const token = signToken(result.id);
  const refreshToken = await generateRefreshToken(result.id);

  return { user: userWithoutPassword, token, refreshToken };
};

// ── loginUser ─────────────────────────────────────────────────────────────────
const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      doctor_profile: true,
      patient_profile: true,
    },
  });
  if (!user) throw new AppError('Invalid email or password', 401);
  if (user.account_status === 'SUSPENDED') {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const token = signToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  const {
    password: _,
    refreshToken: __,
    resetPasswordToken: ___,
    resetPasswordExpires: ____,
    ...userWithoutPassword
  } = user;

  return { user: userWithoutPassword, token, refreshToken };
};

// ── forgotPassword ────────────────────────────────────────────────────────────
/**
 * #10 FIX: Only returns true/false — reset token goes via email in production.
 * The raw token is returned ONLY in dev/test if NODE_ENV !== 'production'.
 */
const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond success to prevent email enumeration attack
  if (!user) return { sent: true };

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.user.update({
    where: { email },
    data: { resetPasswordToken: hashedToken, resetPasswordExpires: expires },
  });

  // In production: send via email (e.g. nodemailer / SendGrid)
  // TODO: await sendResetEmail(user.email, resetToken);

  // Return raw token ONLY in development so frontend can test reset flow
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    sent: true,
    ...(isProduction ? {} : { devResetToken: resetToken }),
  };
};

// ── resetPassword ─────────────────────────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gte: new Date() },
    },
  });

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null, // Invalidate all sessions on password reset
    },
  });
};

// ── refreshAccessToken ─────────────────────────────────────────────────────────
const refreshAccessToken = async (rawToken) => {
  const hashed = hashToken(rawToken);
  const user = await prisma.user.findFirst({ where: { refreshToken: hashed } });
  if (!user) throw new AppError('Invalid refresh token', 401);

  const newToken = signToken(user.id);
  // Rotation: generate new refresh token and invalidate old one
  const newRefresh = await generateRefreshToken(user.id);
  return { token: newToken, refreshToken: newRefresh };
};

// ── logoutUser ────────────────────────────────────────────────────────────────
const logoutUser = async (rawToken) => {
  if (!rawToken) return;
  const hashed = hashToken(rawToken);
  await prisma.user.updateMany({
    where: { refreshToken: hashed },
    data: { refreshToken: null },
  });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
};
