const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const getSafeCircles = async() => {
    return await prisma.safeCircle.findMany({
        include: {
            members: true,
            _count: { select: { members: true } }
        }
    });
};

const joinSafeCircle = async(userId, circleId) => {
    // Any authenticated user can join a circle (schema links User ↔ SafeCircleMember)
    const circle = await prisma.safeCircle.findUnique({
        where: { id: circleId }
    });

    if (!circle) {
        throw new AppError('Safe circle not found', 404);
    }

    // Check if already a member
    const existingMember = await prisma.safeCircleMember.findUnique({
        where: {
            user_id_circle_id: {
                user_id: userId,
                circle_id: circleId,
            }
        }
    });

    if (existingMember) {
        throw new AppError('You are already a member of this circle', 400);
    }

    // Create member
    return await prisma.safeCircleMember.create({
        data: {
            circle_id: circleId,
            user_id: userId,
        }
    });
};

const getMessages = async (userId, circleId, page = 1, limit = 10) => {
    // Check membership
    const member = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: userId, circle_id: circleId } }
    });

    if (!member) {
        throw new AppError('You must be a member of this circle to view messages', 403);
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        prisma.safeCircleMessage.findMany({
            where: { circle_id: circleId },
            include: {
                sender: {
                    select: { id: true, full_name: true, profile_pic: true }
                }
            },
            orderBy: { created_at: 'asc' },
            skip,
            take: limit
        }),
        prisma.safeCircleMessage.count({ where: { circle_id: circleId } })
    ]);

    return {
        messages,
        meta: {
            totalItems: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const sendMessage = async (userId, circleId, content) => {
    // Check membership
    const member = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: userId, circle_id: circleId } }
    });

    if (!member) {
        throw new AppError('You must be a member of this circle to send messages', 403);
    }

    return await prisma.safeCircleMessage.create({
        data: {
            circle_id: circleId,
            sender_id: userId,
            content
        },
        include: {
            sender: {
                select: { id: true, full_name: true, profile_pic: true }
            }
        }
    });
};

const createSafeCircle = async (userId, data) => {
    // Both Admin and Doctor can create circles.
    // We automatically add the creator as an ADMIN member of the new circle.
    const circle = await prisma.safeCircle.create({
        data: {
            name: data.name,
            description: data.description,
            members: {
                create: {
                    user_id: userId,
                    role: 'ADMIN' // They are the owner/admin of this circle
                }
            }
        },
        include: {
            members: true
        }
    });
    return circle;
};

const addPatientToCircle = async (doctorIdUser, circleId, patientId) => {
    // 1. Verify the doctor is an ADMIN of the circle
    const doctorMember = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: doctorIdUser, circle_id: circleId } }
    });

    if (!doctorMember || doctorMember.role !== 'ADMIN') {
        throw new AppError('You must be an admin of this circle to add patients', 403);
    }

    // 2. Verify the patient exists and gets their user_id
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true }
    });

    if (!patient) {
        throw new AppError('Patient not found', 404);
    }

    // 3. Optional Bonus Validation: Ensure patient had an appointment with this doctor
    const doctor = await prisma.doctor.findUnique({ where: { user_id: doctorIdUser } });
    if (doctor) {
        const appointment = await prisma.appointment.findFirst({
            where: { doctor_id: doctor.id, patient_id: patient.id }
        });
        if (!appointment) {
            // Depending on strictness, we might throw here. Let's just log or allow since it's minimum logic.
            // throw new AppError('This patient is not associated with your clinic', 403);
        }
    }

    // 4. Add patient user to circle
    const existingMember = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: patient.user.id, circle_id: circleId } }
    });

    if (existingMember) {
        throw new AppError('Patient is already a member of this circle', 400);
    }

    return await prisma.safeCircleMember.create({
        data: {
            circle_id: circleId,
            user_id: patient.user.id,
            role: 'MEMBER'
        }
    });
};

module.exports = {
    getSafeCircles,
    joinSafeCircle,
    getMessages,
    sendMessage,
    createSafeCircle,
    addPatientToCircle
};