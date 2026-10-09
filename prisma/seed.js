const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed process...');

    // 1. Clean up existing data (Order matters to prevent FK constraint errors)
    console.log('Cleaning up existing data...');
    await prisma.clinicalNote.deleteMany();
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.workingHours.deleteMany();
    await prisma.moodEntry.deleteMany();
    await prisma.journal.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.safeCircleMessage.deleteMany();
    await prisma.safeCircleMember.deleteMany();
    await prisma.safeCircle.deleteMany();
    await prisma.caregiverPatient.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();

    // 2. Hash default password
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123', salt);

    // 3. Create Admin User
    console.log('Creating Admin user...');
    await prisma.user.create({
        data: {
            full_name: 'System Admin',
            email: 'admin@malaz.com',
            password: defaultPassword,
            role: 'ADMIN', // Enum requires uppercase
        }
    });

    // 4. Create Doctor 1
    console.log('Creating Doctor 1...');
    const doc1User = await prisma.user.create({
        data: {
            full_name: 'Dr. Ahmed Ali',
            email: 'ahmed.doctor@malaz.com',
            password: defaultPassword,
            role: 'DOCTOR',
        }
    });

    const doc1 = await prisma.doctor.create({
        data: {
            user_id: doc1User.id,
            specialization: 'Anxiety & Depression',
            session_price: 300,
            is_verified: true,
            avg_rating: 4.8,
        }
    });

    // Add working hours (Monday to Thursday)
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    for (const day of weekDays) {
        await prisma.workingHours.create({
            data: {
                doctor_id: doc1.id,
                day_of_week: day,
                start_time: '09:00 AM', // String as per schema
                end_time: '05:00 PM',
            }
        });
    }

    // 5. Create Doctor 2
    console.log('Creating Doctor 2...');
    const doc2User = await prisma.user.create({
        data: {
            full_name: 'Dr. Sara Mahmoud',
            email: 'sara.doctor@malaz.com',
            password: defaultPassword,
            role: 'DOCTOR',
        }
    });

    const doc2 = await prisma.doctor.create({
        data: {
            user_id: doc2User.id,
            specialization: 'Cognitive Behavioral Therapy',
            session_price: 400,
            is_verified: true,
            avg_rating: 4.9,
        }
    });

    // Add working hours (Sunday to Wednesday)
    const doc2Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday'];
    for (const day of doc2Days) {
        await prisma.workingHours.create({
            data: {
                doctor_id: doc2.id,
                day_of_week: day,
                start_time: '10:00 AM',
                end_time: '04:00 PM',
            }
        });
    }

    // 6. Create Patient
    console.log('Creating Patient...');
    const patientUser = await prisma.user.create({
        data: {
            full_name: 'Omar Mohamed',
            email: 'omar.patient@malaz.com',
            password: defaultPassword,
            role: 'PATIENT',
        }
    });

    await prisma.patient.create({
        data: {
            user_id: patientUser.id,
            date_of_birth: new Date('2000-05-15T00:00:00.000Z'),
            emergency_contact: '+201012345678', // Updated from 'phone'
        }
    });

    // 7. Create Safe Circles
    console.log('Creating Safe Circles...');
    const categories = [
        'Anxiety & Panic Support',
        'Depression Recovery',
        'Stress & Burnout Management'
    ];

    for (const category of categories) {
        await prisma.safeCircle.create({
            data: {
                name: category, // Updated from 'category_name'
                description: 'A safe space to discuss and support each other.',
            }
        });
    }

    console.log('Seeding completed successfully! 🌱');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });