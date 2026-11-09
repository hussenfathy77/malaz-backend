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
        if (data.bio !== undefined) doctorData.bio = data.bio;
        if (data.latitude !== undefined) doctorData.latitude = data.latitude;
        if (data.longitude !== undefined) doctorData.longitude = data.longitude;
        if (data.address !== undefined) doctorData.address = data.address;
        if (data.bio !== undefined) doctorData.bio = data.bio;
        if (data.latitude !== undefined) doctorData.latitude = data.latitude;
        if (data.longitude !== undefined) doctorData.longitude = data.longitude;
        if (data.address !== undefined) doctorData.address = data.address;

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

// ── Doctor: list unique patients from appointments ────────────────────────────
const getMyPatients = async (doctorUserId) => {
  const doctor = await prisma.doctor.findUnique({ where: { user_id: doctorUserId } });
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  const appointments = await prisma.appointment.findMany({
    where: { doctor_id: doctor.id },
    include: {
      patient: {
        include: { user: { select: { id: true, full_name: true, email: true, profile_pic: true } } }
      }
    },
    orderBy: { date: 'desc' },
  });

  // Deduplicate by patient id
  const seen = new Set();
  const patients = [];
  for (const appt of appointments) {
    if (!seen.has(appt.patient_id)) {
      seen.add(appt.patient_id);
      patients.push({ ...appt.patient, last_appointment: appt.date });
    }
  }
  return patients;
};

// ── Doctor: get single patient detail ─────────────────────────────────────────
const getPatientById = async (doctorUserId, patientId) => {
  const doctor = await prisma.doctor.findUnique({ where: { user_id: doctorUserId } });
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  // Verify doctor has had an appointment with this patient
  const appt = await prisma.appointment.findFirst({
    where: { doctor_id: doctor.id, patient_id: patientId },
  });
  if (!appt) throw new AppError('Patient not found or not associated with this doctor', 404);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: { select: { id: true, full_name: true, email: true, profile_pic: true } } },
  });
  if (!patient) throw new AppError('Patient not found', 404);
  return patient;
};

// ── Doctor availability: GET /doctors/:doctorId/availability?date=YYYY-MM-DD ──
const getDoctorAvailability = async (doctorId, dateStr) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { working_hours: true },
  });
  if (!doctor) throw new AppError('Doctor not found', 404);

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new AppError('Invalid date format. Use YYYY-MM-DD.', 400);

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayName = dayNames[date.getDay()];

  const wh = doctor.working_hours.find(
    (h) => h.day_of_week.toLowerCase() === dayName.toLowerCase()
  );
  if (!wh) return { slots: [] }; // Doctor doesn't work this day

  // Parse working hours into minutes
  const parseTime = (t) => {
    const m = t.match(/(\d+):(\d+)/);
    return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
  };
  const start = parseTime(wh.start_time);
  const end   = parseTime(wh.end_time);

  // Get booked appointment start times for that date
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay   = new Date(dateStr + 'T23:59:59.999Z');

  const booked = await prisma.appointment.findMany({
    where: {
      doctor_id: doctorId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    select: { start_time: true },
  });
  const bookedTimes = new Set(booked.map((a) => a.start_time));

  // Generate 1-hour slots
  const slots = [];
  for (let t = start; t + 60 <= end; t += 60) {
    const hh = String(Math.floor(t / 60)).padStart(2, '0');
    const mm = String(t % 60).padStart(2, '0');
    const slot = `${hh}:${mm}`;
    if (!bookedTimes.has(slot)) slots.push(slot);
  }

  return { slots };
};

const getPatientJournals = async (doctorUserId, patientId) => {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: doctorUserId } });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    // Verify doctor has appointment with this patient
    const appt = await prisma.appointment.findFirst({
        where: { doctor_id: doctor.id, patient_id: patientId }
    });
    if (!appt) throw new AppError('Patient not associated with this doctor', 403);

    return await prisma.journal.findMany({
        where: { patient_id: patientId },
        orderBy: { created_at: 'desc' }
    });
};

const getNearbyDoctors = async (lat, lng, radiusKm = 50) => {
    if (isNaN(lat) || isNaN(lng)) throw new AppError('Valid latitude and longitude are required', 400);

    const doctors = await prisma.doctor.findMany({
        where: { is_verified: true, latitude: { not: null }, longitude: { not: null } },
        include: {
            user: { select: { full_name: true, email: true, profile_pic: true } },
            working_hours: true,
        }
    });

    const toRad = (deg) => (deg * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    return doctors
        .map(d => ({ ...d, distance_km: haversine(lat, lng, d.latitude, d.longitude) }))
        .filter(d => d.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km);
};

module.exports = {
    getAllVerifiedDoctors,
    getDoctorById,
    updateDoctorProfile,
    updateCertificate,
    getMyPatients,
    getPatientById,
    getDoctorAvailability,
    getPatientJournals,
    getNearbyDoctors,
};