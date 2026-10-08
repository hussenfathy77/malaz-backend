const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// Simple risk flagging logic based on keywords
const checkRiskFlag = (content) => {
  const riskyKeywords = ['suicide', 'kill myself', 'give up', 'hopeless', 'end it all', 'worthless'];
  const lowerContent = content.toLowerCase();
  return riskyKeywords.some(keyword => lowerContent.includes(keyword));
};

const getPatientByUserId = async (userId) => {
  const patient = await prisma.patient.findUnique({
    where: { user_id: userId }
  });
  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }
  return patient;
};

const addMood = async (userId, data) => {
  const patient = await getPatientByUserId(userId);

  return await prisma.moodTracker.create({
    data: {
      patient_id: patient.id,
      mood_emoji: data.mood_emoji,
    }
  });
};

const getMoodTrends = async (userId) => {
  const patient = await getPatientByUserId(userId);

  return await prisma.moodTracker.findMany({
    where: { patient_id: patient.id },
    orderBy: { logged_at: 'desc' },
    take: 30 // Get last 30 days trends
  });
};

const addJournalEntry = async (userId, data) => {
  const patient = await getPatientByUserId(userId);
  const isRisk = checkRiskFlag(data.content);

  return await prisma.journal.create({
    data: {
      patient_id: patient.id,
      content: data.content,
      risk_flag: isRisk,
    }
  });
};

const getJournalHistory = async (userId) => {
  const patient = await getPatientByUserId(userId);

  return await prisma.journal.findMany({
    where: { patient_id: patient.id },
    orderBy: { created_at: 'desc' },
  });
};

module.exports = {
  addMood,
  getMoodTrends,
  addJournalEntry,
  getJournalHistory,
};
