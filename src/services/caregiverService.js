const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const inviteCaregiver = async (patientUserId, data) => {
  const patient = await prisma.patient.findUnique({
    where: { user_id: patientUserId }
  });

  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }

  const { email, consent_scope } = data;

  const caregiverUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!caregiverUser || caregiverUser.role !== 'CAREGIVER') {
    throw new AppError('Invalid caregiver email or user is not a caregiver', 400);
  }

  const existingRelation = await prisma.caregiverPatient.findUnique({
    where: {
      caregiver_id_patient_id: {
        caregiver_id: caregiverUser.id,
        patient_id: patient.id
      }
    }
  });

  if (existingRelation) {
    throw new AppError('Invitation already sent or active', 400);
  }

  const relation = await prisma.caregiverPatient.create({
    data: {
      caregiver_id: caregiverUser.id,
      patient_id: patient.id,
      consent_scope: consent_scope || 'GENERAL',
      status: 'PENDING'
    }
  });

  return relation;
};

const updateCaregiverStatus = async (caregiverUserId, relationId, status) => {
  const relation = await prisma.caregiverPatient.findUnique({
    where: { id: relationId }
  });

  if (!relation) {
    throw new AppError('Relation not found', 404);
  }

  if (relation.caregiver_id !== caregiverUserId) {
    throw new AppError('Not authorized to update this relation', 403);
  }

  if (!['ACTIVE', 'REVOKED'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updated = await prisma.caregiverPatient.update({
    where: { id: relationId },
    data: {
      status,
      granted_at: status === 'ACTIVE' ? new Date() : relation.granted_at,
      revoked_at: status === 'REVOKED' ? new Date() : relation.revoked_at
    }
  });

  return updated;
};

const getCaregiverSummary = async (caregiverUserId, patientId) => {
  const relation = await prisma.caregiverPatient.findUnique({
    where: {
      caregiver_id_patient_id: {
        caregiver_id: caregiverUserId,
        patient_id: patientId
      }
    }
  });

  if (!relation || relation.status !== 'ACTIVE') {
    throw new AppError('Not authorized to view this patient summary or invitation not accepted', 403);
  }

  const [moods, appointments] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { patient_id: patientId },
      orderBy: { logged_at: 'desc' },
      take: 7,
    }),
    prisma.appointment.findMany({
      where: { patient_id: patientId },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        doctor: { include: { user: { select: { full_name: true } } } }
      }
    })
  ]);

  return {
    patient_id: patientId,
    consent_scope: relation.consent_scope,
    mood_summary: moods,
    recent_appointments: appointments,
  };
};

module.exports = {
  inviteCaregiver,
  updateCaregiverStatus,
  getCaregiverSummary,
};
