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

  const appointmentDate = new Date(data.date);
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
            in: ['PENDING', 'CONFIRMED'],
          },
          date: {
            gte: new Date(appointmentDate.getTime() - 60 * 60 * 1000 + 1), // 1 hour buffer before
            lt: appointmentEndDate, // buffer after
          },
        },
      });

      if (overlapping) {
        throw new AppError('The doctor is already booked for this time slot.', 409);
      }

      // 2. Check doctor's working hours for the selected day
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[appointmentDate.getDay()];
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
      const parseTime = (timeStr) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!match) return 0;
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const modifier = match[3];
        if (modifier) {
           if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
           if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        return hours * 60 + minutes;
      };

      const whStartTime = parseTime(workingHours.start_time);
      const whEndTime = parseTime(workingHours.end_time);

      if (apptTime < whStartTime || apptTime >= whEndTime) {
        throw new AppError('The selected time is outside the doctor\'s working hours.', 400);
      }

      // 3. Create the appointment
      const newAppt = await tx.appointment.create({
        data: {
          patient_id: patient.id,
          doctor_id: data.doctor_id,
          date: appointmentDate,
          start_time: data.start_time,
          end_time: data.end_time,
          status: 'PENDING',
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

  // Authorization check (case-insensitive)
  const normalizedRole = userRole.toUpperCase();
  if (normalizedRole === 'PATIENT' && appointment.patient.user_id !== userId) {
    throw new AppError('You do not have permission to update this appointment', 403);
  }
  if (normalizedRole === 'DOCTOR' && appointment.doctor.user_id !== userId) {
    throw new AppError('You do not have permission to update this appointment', 403);
  }

  // State machine rules
  if (normalizedRole === 'PATIENT') {
    if (data.status !== 'CANCELLED') {
      throw new AppError('Patients can only cancel appointments', 400);
    }
  }

  const updateData = { status: data.status };
  if (data.meeting_link && normalizedRole === 'DOCTOR') {
    updateData.meeting_link = data.meeting_link;
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
  });

  return updatedAppointment;
};

const getUserAppointments = async (userId, userRole, page = 1, limit = 10) => {
  let whereClause = {};

  const normalizedRole = userRole.toUpperCase();
  if (normalizedRole === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
    if (!patient) throw new AppError('Patient profile not found', 404);
    whereClause.patient_id = patient.id;
  } else if (normalizedRole === 'DOCTOR') {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    whereClause.doctor_id = doctor.id;
  } else {
    throw new AppError('Only Patients and Doctors can view appointments', 403);
  }

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
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
        date: 'asc'
      },
      skip,
      take: limit
    }),
    prisma.appointment.count({ where: whereClause })
  ]);

  return {
    appointments,
    meta: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const payAppointment = async (userId, appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true }
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointment.patient.user_id !== userId) {
    throw new AppError('You are not authorized to pay for this appointment', 403);
  }

  // Schema might use 'PENDING' based on Prisma enum formatting
  const currentStatus = appointment.status.toUpperCase();
  if (currentStatus !== 'PENDING') {
    throw new AppError('Only pending appointments can be paid for', 400);
  }

  // Simulate a 2-second delay for the payment gateway
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Note: Depending on Prisma schema, the enum might be 'CONFIRMED' or 'Confirmed'
  // I will use 'CONFIRMED' as defined in schema.prisma: `enum AppointmentStatus { PENDING CONFIRMED ... }`
  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CONFIRMED' }
  });

  return updatedAppointment;
};

module.exports = {
  bookAppointment,
  updateAppointmentStatus,
  getUserAppointments,
  payAppointment,
};
