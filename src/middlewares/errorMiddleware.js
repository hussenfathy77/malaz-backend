const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // 1. Terminal Logging: Log the exact error for server-side debugging
  console.error("🔴 ERROR CAUGHT:", err);

  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // 2. Error Message Extraction
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered. Please use another value.';
    error = new AppError(message, 400);
  }
  if (err.code === 'P2025') {
    const message = 'Record not found.';
    error = new AppError(message, 404);
  }
  if (err.code === 'P2003') {
    const message = 'Related record not found (Foreign key violation).';
    error = new AppError(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new AppError(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new AppError(message, 401);
  }

  // Handle Zod Validation errors
  if (err.name === 'ZodError' || err.issues) {
    const issues = err.issues || error.issues;
    if (issues && Array.isArray(issues)) {
      const message = issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      error = new AppError(message, 400);
    }
  }

  // Fallback for empty message
  if (!error.message || error.message.trim() === '') {
    error.message = typeof err === 'string' && err.trim() !== '' 
      ? err 
      : (err && err.message ? err.message : 'Something went wrong. Please try again later.');
  }

  // Ensure status is either 'fail' (for 4xx errors) or 'error' (for 5xx errors)
  if (error.status !== 'fail' && error.status !== 'error') {
    error.status = error.statusCode < 500 ? 'fail' : 'error';
  }

  // 3. Response Structure
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
