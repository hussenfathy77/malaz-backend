const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Clean up existing data to prevent duplicate unique key crashes
  // Note: We use deleteMany instead of truncate for portability.
  // We must delete dependent tables first.
  console.log('Cleaning up existing data...');
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.review.deleteMany();
  await prisma.moodTracker.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.circleMember.deleteMany();
  await prisma.safeCircle.deleteMany();
  await prisma.caregiver.deleteMany();
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
      password_hash: defaultPassword,
      role: 'Admin',
    }
  });

  // 4. Create Doctor 1
  console.log('Creating Doctor 1...');
  const doc1User = await prisma.user.create({
    data: {
      full_name: 'Dr. Ahmed Ali',
      email: 'ahmed.doctor@malaz.com',
      password_hash: defaultPassword,
      role: 'Doctor',
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

  // Add working hours (Monday-Thursday, 09:00 - 17:00)
  for (let day = 1; day <= 4; day++) {
    await prisma.workingHours.create({
      data: {
        doctor_id: doc1.id,
        day_of_week: day,
        start_time: new Date('1970-01-01T09:00:00.000Z'),
        end_time: new Date('1970-01-01T17:00:00.000Z'),
        is_online: true,
      }
    });
  }

  // 5. Create Doctor 2
  console.log('Creating Doctor 2...');
  const doc2User = await prisma.user.create({
    data: {
      full_name: 'Dr. Sara Mahmoud',
      email: 'sara.doctor@malaz.com',
      password_hash: defaultPassword,
      role: 'Doctor',
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

  // Add working hours (Sunday-Wednesday, 10:00 - 16:00)
  for (let day = 7; day <= 7; day++) { // Sunday
    await prisma.workingHours.create({
      data: {
        doctor_id: doc2.id,
        day_of_week: day,
        start_time: new Date('1970-01-01T10:00:00.000Z'),
        end_time: new Date('1970-01-01T16:00:00.000Z'),
        is_online: true,
      }
    });
  }
  for (let day = 1; day <= 3; day++) { // Mon-Wed
    await prisma.workingHours.create({
      data: {
        doctor_id: doc2.id,
        day_of_week: day,
        start_time: new Date('1970-01-01T10:00:00.000Z'),
        end_time: new Date('1970-01-01T16:00:00.000Z'),
        is_online: true,
      }
    });
  }

  // 6. Create Patient
  console.log('Creating Patient...');
  const patientUser = await prisma.user.create({
    data: {
      full_name: 'Omar Mohamed',
      email: 'omar.patient@malaz.com',
      password_hash: defaultPassword,
      role: 'Patient',
    }
  });

  await prisma.patient.create({
    data: {
      user_id: patientUser.id,
      date_of_birth: new Date('2000-05-15T00:00:00.000Z'),
      phone: '+201012345678',
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
        category_name: category,
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
  .finally(async () => {
    await prisma.$disconnect();
  });
