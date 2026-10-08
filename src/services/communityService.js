const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const getSafeCircles = async () => {
  return await prisma.safeCircle.findMany();
};

const joinSafeCircle = async (userId, circleId, data) => {
  const patient = await prisma.patient.findUnique({
    where: { user_id: userId }
  });

  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }

  // Check if circle exists
  const circle = await prisma.safeCircle.findUnique({
    where: { id: circleId }
  });

  if (!circle) {
    throw new AppError('Safe circle not found', 404);
  }

  // Check if already a member
  const existingMember = await prisma.circleMember.findFirst({
    where: {
      circle_id: circleId,
      patient_id: patient.id,
    }
  });

  if (existingMember) {
    throw new AppError('You are already a member of this circle', 400);
  }

  // Create member with pseudonym
  return await prisma.circleMember.create({
    data: {
      circle_id: circleId,
      patient_id: patient.id,
      pseudonym: data.pseudonym,
    }
  });
};

const getCaregiverSummary = async (userId) => {
  const caregiver = await prisma.caregiver.findUnique({
    where: { user_id: userId },
    include: {
      patient: {
        include: {
          user: { select: { full_name: true } }
        }
      }
    }
  });

  if (!caregiver) {
    throw new AppError('Caregiver profile not found', 404);
  }

  const patientId = caregiver.patient_id;

  // Fetch summary: recent mood trends, flagged journals, recent appointments
  const [moods, flaggedJournals, recentAppointments] = await Promise.all([
    prisma.moodTracker.findMany({
      where: { patient_id: patientId },
      orderBy: { logged_at: 'desc' },
      take: 7, // Last 7 moods
    }),
    prisma.journal.findMany({
      where: { 
        patient_id: patientId,
        risk_flag: true, // Only fetch flagged journals for privacy/safety alerting
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { patient_id: patientId },
      orderBy: { schedule_date: 'desc' },
      take: 5,
      include: {
        doctor: { include: { user: { select: { full_name: true } } } }
      }
    })
  ]);

  return {
    patient_name: caregiver.patient.user.full_name,
    relation: caregiver.relation_type,
    mood_summary: moods,
    risk_alerts: flaggedJournals,
    recent_appointments: recentAppointments,
  };
};

module.exports = {
  getSafeCircles,
  joinSafeCircle,
  getCaregiverSummary,
};
