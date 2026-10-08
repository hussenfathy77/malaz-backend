const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const AppError = require('./utils/AppError');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const workingHoursRoutes = require('./routes/workingHoursRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const toolkitRoutes = require('./routes/toolkitRoutes');
const communityRoutes = require('./routes/communityRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');

const app = express();

// Global Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Request logging
}

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/doctors`, doctorRoutes);
app.use(`${API_PREFIX}/working-hours`, workingHoursRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentRoutes);
app.use(`${API_PREFIX}/medical-records`, medicalRecordRoutes);
app.use(`${API_PREFIX}/toolkit`, toolkitRoutes);
app.use(`${API_PREFIX}/circles`, communityRoutes);
app.use(`${API_PREFIX}/caregivers`, caregiverRoutes);

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