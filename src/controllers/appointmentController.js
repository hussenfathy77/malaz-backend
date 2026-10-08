const appointmentService = require('../services/appointmentService');

const bookAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.bookAppointment(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        appointment,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await appointmentService.updateAppointmentStatus(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: {
        appointment,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getUserAppointments(req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  updateAppointmentStatus,
  getUserAppointments,
};
