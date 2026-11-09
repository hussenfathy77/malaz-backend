require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const AppError = require('./utils/AppError');
const errorMiddleware = require('./middlewares/errorMiddleware');
const { initSocket } = require('./socket');

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

const app = express();

// Create HTTP server for Express and Socket.io
const httpServer = http.createServer(app);
initSocket(httpServer);

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

const authLimiter = rateLimit({
    max: 20,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
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

// Catch-all for 404
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = { app, httpServer };
