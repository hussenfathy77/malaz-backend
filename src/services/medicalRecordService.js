const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const createMedicalRecord = async(doctorId, data) => {
    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({
        where: { user_id: doctorId },
    });

    if (!doctor) {
        throw new AppError('Doctor profile not found', 404);
    }

    // Ensure patient exists and check if they have a prior/current relationship
    // Usually, a doctor should only write a record for a patient they've seen.
    // We can enforce that they must have a completed or confirmed appointment together.
    const pastAppointment = await prisma.appointment.findFirst({
        where: {
            doctor_id: doctor.id,
            patient_id: data.patient_id,
            status: { in: ['Confirmed', 'Completed']
            }
        }
    });

    if (!pastAppointment) {
        throw new AppError('You can only create medical records for patients you have an appointment with.', 403);
    }

    // Use a transaction to create MedicalRecord and optionally a Prescription
    return await prisma.$transaction(async(tx) => {
        const medicalRecord = await tx.medicalRecord.create({
            data: {
                patient_id: data.patient_id,
                doctor_id: doctor.id,
                doctor_notes: data.doctor_notes,
            },
        });

        if (data.prescription_pdf_url) {
            await tx.prescription.create({
                data: {
                    medical_record_id: medicalRecord.id,
                    pdf_url: data.prescription_pdf_url,
                },
            });
        }

        return await tx.medicalRecord.findUnique({
            where: { id: medicalRecord.id },
            include: {
                prescription: true,
            },
        });
    });
};

const updateMedicalRecord = async(doctorId, recordId, data) => {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: doctorId } });

    const record = await prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: { prescription: true }
    });

    if (!record) throw new AppError('Medical record not found', 404);
    if (record.doctor_id !== doctor.id) throw new AppError('You do not have permission to edit this record', 403);

    return await prisma.$transaction(async(tx) => {
        let updateData = {};
        if (data.doctor_notes) updateData.doctor_notes = data.doctor_notes;

        const updatedRecord = await tx.medicalRecord.update({
            where: { id: recordId },
            data: updateData,
        });

        if (data.prescription_pdf_url) {
            if (record.prescription) {
                await tx.prescription.update({
                    where: { id: record.prescription.id },
                    data: { pdf_url: data.prescription_pdf_url },
                });
            } else {
                await tx.prescription.create({
                    data: {
                        medical_record_id: record.id,
                        pdf_url: data.prescription_pdf_url,
                    },
                });
            }
        }

        return await tx.medicalRecord.findUnique({
            where: { id: recordId },
            include: { prescription: true },
        });
    });
};

const getPatientMedicalRecords = async(userId, userRole, patientId) => {
    let finalPatientId = patientId;

    if (userRole === 'Patient') {
        const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
        // Patients can only view their own records
        if (!patientId || patient.id === patientId) {
            finalPatientId = patient.id;
        } else {
            throw new AppError('You are not authorized to view these records', 403);
        }
    } else if (userRole === 'Doctor') {
        if (!patientId) {
            throw new AppError('Patient ID is required to fetch records', 400);
        }
        const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });

        // Validate that the doctor has access to this patient (they have appointments)
        const hasAccess = await prisma.appointment.findFirst({
            where: {
                doctor_id: doctor.id,
                patient_id: patientId,
            }
        });

        if (!hasAccess) {
            throw new AppError('You are not authorized to view this patient\'s records', 403);
        }
    }

    const records = await prisma.medicalRecord.findMany({
        where: { patient_id: finalPatientId },
        include: {
            prescription: true,
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

    return records;
};

module.exports = {
    createMedicalRecord,
    updateMedicalRecord,
    getPatientMedicalRecords,
};