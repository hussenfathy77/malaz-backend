require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const AppError = require('./utils/AppError');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const workingHoursRoutes = require('./routes/workingHoursRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const clinicalNoteRoutes = require('./routes/clinicalNoteRoutes');
const toolkitRoutes = require('./routes/toolkitRoutes');
const communityRoutes = require('./routes/communityRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');

const app = express();

// Global Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser
app.use(xss()); // Data sanitization against XSS
app.use('/public', express.static(path.join(__dirname, '../public'))); // Serve static files

const authLimiter = rateLimit({
    max: 20, // limit each IP to 20 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Request logging
}

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/doctors`, doctorRoutes);
app.use(`${API_PREFIX}/working-hours`, workingHoursRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentRoutes);
app.use(`${API_PREFIX}/clinical-notes`, clinicalNoteRoutes);
app.use(`${API_PREFIX}/toolkit`, toolkitRoutes);
app.use(`${API_PREFIX}/circles`, communityRoutes);
app.use(`${API_PREFIX}/caregivers`, caregiverRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/uploads`, uploadRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

// Unhandled Routes (Catch-all for 404)
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;