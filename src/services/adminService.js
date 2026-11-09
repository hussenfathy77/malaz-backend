const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// ── GET /admin/users ──────────────────────────────────────────────────────────
const getUsers = async ({ search = '', role, status, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email:     { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role)   where.role           = role.toUpperCase();
  if (status) where.account_status = status.toUpperCase();

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, full_name: true, role: true,
        account_status: true, created_at: true, profile_pic: true,
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, full_name: true, role: true,
      account_status: true, created_at: true, profile_pic: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

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
  getUsers,
  getUserById,
  getUnverifiedDoctors,
  verifyDoctor,
  updateUserStatus,
  updateSafeCircle,
  deleteSafeCircle
};
