const AppError = require('../utils/AppError');

const validate = (schema, property = 'body') => (req, res, next) => {
    try {
        req[property] = schema.parse(req[property]);
        next();
    } catch (error) {
        if (error.name === 'ZodError') {
            const message = (error.errors || []).map((e) => e.message).join(', ');
            return next(new AppError(message, 400));
        }
        next(error);
    }
};

module.exports = validate;