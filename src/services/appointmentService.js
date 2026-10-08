const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const bookAppointment = async (userId, data) => {
  // Find Patient ID
  const patient = await prisma.patient.findUnique({
    where: { user_id: userId },
  });

  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }

  const appointmentDate = new Date(data.schedule_date);
  // Calculate end time (assuming 1 hour session for simplicity)
  const appointmentEndDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);

  // Critical Section: Prevent Double Booking using Serializable Transaction
  const appointment = await prisma.$transaction(
    async (tx) => {
      // 1. Check for overlapping appointments for the doctor
      const overlapping = await tx.appointment.findFirst({
        where: {
          doctor_id: data.doctor_id,
          status: {
            in: ['Pending', 'Confirmed'], // Active appointments
          },
          schedule_date: {
            gte: new Date(appointmentDate.getTime() - 60 * 60 * 1000 + 1), // 1 hour buffer before
            lt: appointmentEndDate, // buffer after
          },
        },
      });

      if (overlapping) {
        throw new AppError('The doctor is already booked for this time slot.', 409);
      }

      // 2. Check doctor's working hours for the selected day
      const dayOfWeek = appointmentDate.getDay() === 0 ? 7 : appointmentDate.getDay(); // 1 (Mon) - 7 (Sun)
      const workingHours = await tx.workingHours.findFirst({
        where: {
          doctor_id: data.doctor_id,
          day_of_week: dayOfWeek,
        },
      });

      if (!workingHours) {
        throw new AppError('The doctor does not work on this day.', 400);
      }

      // Compare times (ignoring dates for working hours config)
      const apptTime = appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
      const whStartTime = workingHours.start_time.getHours() * 60 + workingHours.start_time.getMinutes();
      const whEndTime = workingHours.end_time.getHours() * 60 + workingHours.end_time.getMinutes();

      if (apptTime < whStartTime || apptTime >= whEndTime) {
        throw new AppError('The selected time is outside the doctor\'s working hours.', 400);
      }

      // 3. Create the appointment
      const newAppt = await tx.appointment.create({
        data: {
          patient_id: patient.id,
          doctor_id: data.doctor_id,
          schedule_date: appointmentDate,
          status: 'Pending',
          type: data.type,
        },
      });

      return newAppt;
    },
    {
      isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions in double booking
    }
  );

  return appointment;
};

const updateAppointmentStatus = async (userId, userRole, appointmentId, data) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: true,
    }
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  // Authorization check
  if (userRole === 'Patient' && appointment.patient.user_id !== userId) {
    throw new AppError('You do not have permission to update this appointment', 403);
  }
  if (userRole === 'Doctor' && appointment.doctor.user_id !== userId) {
    throw new AppError('You do not have permission to update this appointment', 403);
  }

  // State machine rules
  if (userRole === 'Patient') {
    if (data.status !== 'Cancelled') {
      throw new AppError('Patients can only cancel appointments', 400);
    }
  }

  const updateData = { status: data.status };
  if (data.meeting_link && userRole === 'Doctor') {
    updateData.meeting_link = data.meeting_link;
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
  });

  return updatedAppointment;
};

const getUserAppointments = async (userId, userRole) => {
  let whereClause = {};

  if (userRole === 'Patient') {
    const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
    whereClause.patient_id = patient.id;
  } else if (userRole === 'Doctor') {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
    whereClause.doctor_id = doctor.id;
  } else {
    throw new AppError('Only Patients and Doctors can view appointments', 403);
  }

  return await prisma.appointment.findMany({
    where: whereClause,
    include: {
      patient: {
        include: { user: { select: { full_name: true, email: true } } }
      },
      doctor: {
        include: { user: { select: { full_name: true, email: true } } }
      }
    },
    orderBy: {
      schedule_date: 'asc'
    }
  });
};

module.exports = {
  bookAppointment,
  updateAppointmentStatus,
  getUserAppointments,
};
