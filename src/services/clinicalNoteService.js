const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const createClinicalNote = async(doctorId, data) => {
    const doctor = await prisma.doctor.findUnique({
        where: { user_id: doctorId },
    });

    if (!doctor) {
        throw new AppError('Doctor profile not found', 404);
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointment_id }
    });

    if (!appointment || appointment.doctor_id !== doctor.id || appointment.patient_id !== data.patient_id) {
        throw new AppError('Invalid appointment ID or mismatch between doctor and patient', 400);
    }

    return await prisma.clinicalNote.create({
        data: {
            appointment_id: data.appointment_id,
            doctor_id: doctor.id,
            patient_id: data.patient_id,
            diagnosis: data.diagnosis,
            treatment_plan: data.treatment_plan,
            notes: data.notes,
        },
    });
};

const updateClinicalNote = async(doctorId, noteId, data) => {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: doctorId } });

    const note = await prisma.clinicalNote.findUnique({
        where: { id: noteId },
    });

    if (!note) throw new AppError('Clinical note not found', 404);
    if (note.doctor_id !== doctor.id) throw new AppError('You do not have permission to edit this note', 403);

    return await prisma.clinicalNote.update({
        where: { id: noteId },
        data: {
            diagnosis: data.diagnosis,
            treatment_plan: data.treatment_plan,
            notes: data.notes,
        },
    });
};

const getPatientClinicalNotes = async(userId, userRole, patientId) => {
    let finalPatientId = patientId;

    if (userRole === 'Patient' || userRole === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
        if (!patientId || patient.id === patientId) {
            finalPatientId = patient.id;
        } else {
            throw new AppError('You are not authorized to view these notes', 403);
        }
    } else if (userRole === 'Doctor' || userRole === 'DOCTOR') {
        if (!patientId) {
            throw new AppError('Patient ID is required to fetch notes', 400);
        }
        const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });

        const hasAccess = await prisma.appointment.findFirst({
            where: {
                doctor_id: doctor.id,
                patient_id: patientId,
            }
        });

        if (!hasAccess) {
            throw new AppError('You are not authorized to view this patient\'s notes', 403);
        }
    }

    const notes = await prisma.clinicalNote.findMany({
        where: { patient_id: finalPatientId },
        include: {
            doctor: {
                include: {
                    user: { select: { full_name: true } }
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return notes;
};

module.exports = {
    createClinicalNote,
    updateClinicalNote,
    getPatientClinicalNotes,
};