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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { appointments, meta } = await appointmentService.getUserAppointments(req.user.id, req.user.role, page, limit);

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments,
      },
      meta
    });
  } catch (error) {
    next(error);
  }
};

const payAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.payAppointment(req.user.id, id);

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

module.exports = {
  bookAppointment,
  updateAppointmentStatus,
  getUserAppointments,
  payAppointment,
};
