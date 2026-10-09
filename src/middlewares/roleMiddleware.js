const AppError = require('../utils/AppError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());
    
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = restrictTo;
