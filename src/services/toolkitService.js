const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// Simple risk flagging logic based on keywords
const checkRiskFlag = (content) => {
    const riskyKeywords = ['suicide', 'kill myself', 'give up', 'hopeless', 'end it all', 'worthless'];
    const lowerContent = content.toLowerCase();
    return riskyKeywords.some(keyword => lowerContent.includes(keyword));
};

const getPatientByUserId = async(userId) => {
    const patient = await prisma.patient.findUnique({
        where: { user_id: userId }
    });
    if (!patient) {
        throw new AppError('Patient profile not found', 404);
    }
    return patient;
};

const addMood = async(userId, data) => {
    const patient = await getPatientByUserId(userId);

    if (data.note && checkRiskFlag(data.note)) {
        await prisma.notification.create({
            data: {
                user_id: userId,
                content: 'Risk detected in your recent mood entry. Please consider reaching out for help.',
            }
        });
    }

    return await prisma.moodEntry.create({
        data: {
            patient_id: patient.id,
            mood_score: data.mood_score,
            note: data.note,
        }
    });
};

const getMoodTrends = async(userId) => {
    const patient = await getPatientByUserId(userId);

    return await prisma.moodEntry.findMany({
        where: { patient_id: patient.id },
        orderBy: { logged_at: 'desc' },
        take: 30 // Get last 30 days trends
    });
};

const addJournalEntry = async(userId, data) => {
    const patient = await getPatientByUserId(userId);

    if (data.content && checkRiskFlag(data.content)) {
        await prisma.notification.create({
            data: {
                user_id: userId,
                content: 'Risk detected in your recent journal entry. Please consider reaching out for help.',
            }
        });
    }

    return await prisma.journal.create({
        data: {
            patient_id: patient.id,
            content: data.content,
        }
    });
};

const getJournalHistory = async(userId) => {
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