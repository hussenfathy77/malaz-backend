const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Prisma errors here if needed
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered. Please use another value.';
    err = new AppError(message, 400);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
