const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const getAllVerifiedDoctors = async(query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const where = {
        is_verified: true, // Only show verified doctors
    };

    if (query.specialization) {
        where.specialization = {
            contains: query.specialization,
            mode: 'insensitive', // case-insensitive search
        };
    }

    if (query.min_price || query.max_price) {
        where.session_price = {};
        if (query.min_price) where.session_price.gte = parseFloat(query.min_price);
        if (query.max_price) where.session_price.lte = parseFloat(query.max_price);
    } else if (query.session_price) {
        where.session_price = parseFloat(query.session_price);
    }

    const [doctors, total] = await Promise.all([
        prisma.doctor.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                    }
                },
                working_hours: true,
            },
            orderBy: {
                avg_rating: 'desc',
            }
        }),
        prisma.doctor.count({ where })
    ]);

    return {
        doctors,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    };
};

const getDoctorById = async(doctorId) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
            user: {
                select: {
                    full_name: true,
                    email: true,
                }
            },
            working_hours: true,
        }
    });

    if (!doctor) {
        throw new AppError('Doctor not found', 404);
    }

    return doctor;
};

const updateDoctorProfile = async(userId, data) => {
    // Find doctor record using the logged-in user's ID
    const doctor = await prisma.doctor.findUnique({
        where: { user_id: userId },
        include: { user: true }
    });

    if (!doctor) {
        throw new AppError('Doctor profile not found', 404);
    }

    // Update in a transaction if we are updating both User and Doctor fields
    const updatedDoctor = await prisma.$transaction(async(tx) => {
        // If full_name is provided, update the User model
        if (data.full_name) {
            await tx.user.update({
                where: { id: userId },
                data: { full_name: data.full_name }
            });
        }

        // Update the Doctor model fields if any
        const doctorData = {};
        if (data.specialization) doctorData.specialization = data.specialization;
        if (data.session_price) doctorData.session_price = data.session_price;

        let result = doctor;
        if (Object.keys(doctorData).length > 0) {
            result = await tx.doctor.update({
                where: { id: doctor.id },
                data: doctorData,
                include: {
                    user: {
                        select: { full_name: true, email: true }
                    }
                }
            });
        } else {
            // Re-fetch to get updated user full_name if doctorData was empty
            result = await tx.doctor.findUnique({
                where: { id: doctor.id },
                include: {
                    user: { select: { full_name: true, email: true } }
                }
            });
        }

        return result;
    });

    return updatedDoctor;
};

const updateCertificate = async (userId, fileUrl) => {
  const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }

  await prisma.doctor.update({
    where: { id: doctor.id },
    data: { certificate_url: fileUrl }
  });
};

module.exports = {
    getAllVerifiedDoctors,
    getDoctorById,
    updateDoctorProfile,
    updateCertificate,
};