const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const prisma = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token does no longer exist.', 401)
      );
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token or authorization failed.', 401));
  }
};

module.exports = authMiddleware;
