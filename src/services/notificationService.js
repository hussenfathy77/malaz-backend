const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const getNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: [
        { is_read: 'asc' },
        { created_at: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.notification.count({ where: { user_id: userId } })
  ]);

  return {
    notifications,
    meta: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification || notification.user_id !== userId) {
    throw new AppError('Notification not found', 404);
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true }
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
