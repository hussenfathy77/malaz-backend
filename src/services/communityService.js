const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const getSafeCircles = async (userId) => {
    const circles = await prisma.safeCircle.findMany({
        include: {
            _count: { select: { members: true } }
        }
    });

    // Attach current user's membership status
    const memberRecords = await prisma.safeCircleMember.findMany({
        where: { user_id: userId }
    });
    const memberMap = {};
    for (const m of memberRecords) memberMap[m.circle_id] = m;

    return circles.map(c => ({
        ...c,
        my_membership: memberMap[c.id] || null
    }));
};

const joinSafeCircle = async (userId, circleId) => {
    const circle = await prisma.safeCircle.findUnique({ where: { id: circleId } });
    if (!circle) throw new AppError('Safe circle not found', 404);

    const existingMember = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: userId, circle_id: circleId } }
    });
    if (existingMember) throw new AppError('You already have a pending or active membership for this circle', 400);

    // Join as PENDING — requires admin/creator approval
    return await prisma.safeCircleMember.create({
        data: {
            circle_id: circleId,
            user_id: userId,
            role: 'MEMBER',
            status: 'PENDING'
        }
    });
};

const getMessages = async (userId, circleId, page = 1, limit = 50) => {
    const member = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: userId, circle_id: circleId } }
    });

    if (!member) throw new AppError('You must be a member of this circle to view messages', 403);
    if (member.status !== 'APPROVED' && member.role !== 'ADMIN') {
        throw new AppError('Your membership is pending approval', 403);
    }

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
        prisma.safeCircleMessage.findMany({
            where: { circle_id: circleId },
            include: { sender: { select: { id: true, full_name: true, profile_pic: true } } },
            orderBy: { created_at: 'asc' },
            skip,
            take: limit
        }),
        prisma.safeCircleMessage.count({ where: { circle_id: circleId } })
    ]);

    return { messages, meta: { totalItems: total, currentPage: page, totalPages: Math.ceil(total / limit) } };
};

const sendMessage = async (userId, circleId, content) => {
    const member = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: userId, circle_id: circleId } }
    });

    if (!member) throw new AppError('You must be a member of this circle to send messages', 403);
    if (member.status !== 'APPROVED' && member.role !== 'ADMIN') {
        throw new AppError('Your membership is pending approval', 403);
    }

    return await prisma.safeCircleMessage.create({
        data: { circle_id: circleId, sender_id: userId, content },
        include: { sender: { select: { id: true, full_name: true, profile_pic: true } } }
    });
};

const createSafeCircle = async (userId, data) => {
    const circle = await prisma.safeCircle.create({
        data: {
            name: data.name,
            description: data.description,
            created_by_user_id: userId,
            members: {
                create: {
                    user_id: userId,
                    role: 'ADMIN',
                    status: 'APPROVED'
                }
            }
        },
        include: { members: true, _count: { select: { members: true } } }
    });
    return circle;
};

const addPatientToCircle = async (doctorIdUser, circleId, patientId) => {
    const doctorMember = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: doctorIdUser, circle_id: circleId } }
    });
    if (!doctorMember || doctorMember.role !== 'ADMIN') {
        throw new AppError('You must be an admin of this circle to add patients', 403);
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
    if (!patient) throw new AppError('Patient not found', 404);

    const existingMember = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: patient.user.id, circle_id: circleId } }
    });
    if (existingMember) throw new AppError('Patient is already a member of this circle', 400);

    return await prisma.safeCircleMember.create({
        data: { circle_id: circleId, user_id: patient.user.id, role: 'MEMBER', status: 'APPROVED' }
    });
};

const leaveSafeCircle = async (userId, circleId) => {
    const member = await prisma.safeCircleMember.findUnique({
        where: { user_id_circle_id: { user_id: userId, circle_id: circleId } }
    });
    if (!member) throw new AppError('You are not a member of this circle', 400);
    await prisma.safeCircleMember.delete({ where: { id: member.id } });
};

const getJoinRequests = async (userId, circleId) => {
    const circle = await prisma.safeCircle.findUnique({ where: { id: circleId } });
    if (!circle) throw new AppError('Circle not found', 404);

    const isAdmin = await prisma.safeCircleMember.findFirst({
        where: { user_id: userId, circle_id: circleId, role: 'ADMIN' }
    });
    const isCreator = circle.created_by_user_id === userId;

    if (!isAdmin && !isCreator) throw new AppError('Only circle admins can view join requests', 403);

    return await prisma.safeCircleMember.findMany({
        where: { circle_id: circleId, status: 'PENDING' },
        include: { user: { select: { id: true, full_name: true, profile_pic: true, email: true } } }
    });
};

const approveMember = async (userId, circleId, memberId) => {
    const circle = await prisma.safeCircle.findUnique({ where: { id: circleId } });
    if (!circle) throw new AppError('Circle not found', 404);

    const isAdmin = await prisma.safeCircleMember.findFirst({
        where: { user_id: userId, circle_id: circleId, role: 'ADMIN' }
    });
    const isCreator = circle.created_by_user_id === userId;
    if (!isAdmin && !isCreator) throw new AppError('Only circle admins can approve members', 403);

    const memberRecord = await prisma.safeCircleMember.findUnique({ where: { id: memberId } });
    if (!memberRecord || memberRecord.circle_id !== circleId) throw new AppError('Member request not found', 404);

    return await prisma.safeCircleMember.update({
        where: { id: memberId },
        data: { status: 'APPROVED' },
        include: { user: { select: { id: true, full_name: true } } }
    });
};

const rejectMember = async (userId, circleId, memberId) => {
    const circle = await prisma.safeCircle.findUnique({ where: { id: circleId } });
    if (!circle) throw new AppError('Circle not found', 404);

    const isAdmin = await prisma.safeCircleMember.findFirst({
        where: { user_id: userId, circle_id: circleId, role: 'ADMIN' }
    });
    const isCreator = circle.created_by_user_id === userId;
    if (!isAdmin && !isCreator) throw new AppError('Only circle admins can reject members', 403);

    const memberRecord = await prisma.safeCircleMember.findUnique({ where: { id: memberId } });
    if (!memberRecord || memberRecord.circle_id !== circleId) throw new AppError('Member request not found', 404);

    await prisma.safeCircleMember.delete({ where: { id: memberId } });
    return { message: 'Member request rejected' };
};

module.exports = {
    getSafeCircles,
    joinSafeCircle,
    getMessages,
    sendMessage,
    createSafeCircle,
    addPatientToCircle,
    leaveSafeCircle,
    getJoinRequests,
    approveMember,
    rejectMember
};
