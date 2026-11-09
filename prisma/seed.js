/**
 * Malaz Platform — Comprehensive Seed File
 * Accounts (all passwords: Password123!):
 *   ADMIN:    admin@malaz.com
 *   DOCTOR 1: ahmed.doctor@malaz.com    (verified, has location)
 *   DOCTOR 2: sara.doctor@malaz.com     (verified, has location)
 *   DOCTOR 3: pending.doctor@malaz.com  (NOT verified — awaiting admin approval)
 *   PATIENT 1: omar.patient@malaz.com
 *   PATIENT 2: layla.patient@malaz.com
 *   CAREGIVER: caregiver@malaz.com
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Malaz seed...');

    // ── 1. Clean up (order matters for FK constraints) ─────────────────────
    console.log('🗑  Cleaning existing data...');
    await prisma.safeCircleMessage.deleteMany();
    await prisma.safeCircleMember.deleteMany();
    await prisma.safeCircle.deleteMany();
    await prisma.clinicalNote.deleteMany();
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.workingHours.deleteMany();
    await prisma.moodEntry.deleteMany();
    await prisma.journal.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.caregiverPatient.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();

    // ── 2. Hash password ────────────────────────────────────────────────────
    const hash = await bcrypt.hash('Password123!', 10);

    // ── 3. ADMIN ────────────────────────────────────────────────────────────
    console.log('👤 Creating Admin...');
    const adminUser = await prisma.user.create({
        data: {
            full_name: 'System Admin',
            email: 'admin@malaz.com',
            password: hash,
            role: 'ADMIN',
            account_status: 'ACTIVE',
        }
    });

    // ── 4. DOCTOR 1 (Verified — Anxiety & Depression, has location) ─────────
    console.log('👨‍⚕️ Creating Doctor 1 (Verified)...');
    const doc1User = await prisma.user.create({
        data: {
            full_name: 'Dr. Ahmed Ali',
            email: 'ahmed.doctor@malaz.com',
            password: hash,
            role: 'DOCTOR',
            account_status: 'ACTIVE',
        }
    });

    const doc1 = await prisma.doctor.create({
        data: {
            user_id: doc1User.id,
            specialization: 'Anxiety & Depression',
            bio: 'Specialist in cognitive behavioral therapy with over 10 years of experience helping patients manage anxiety and depression.',
            session_price: 300,
            is_verified: true,
            avg_rating: 4.8,
            latitude: 30.0444,
            longitude: 31.2357,
            address: 'Nasr City, Cairo, Egypt',
        }
    });

    const doc1Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    for (const day of doc1Days) {
        await prisma.workingHours.create({
            data: {
                doctor_id: doc1.id,
                day_of_week: day,
                start_time: '09:00 AM',
                end_time: '05:00 PM',
            }
        });
    }

    // ── 5. DOCTOR 2 (Verified — CBT Specialist, has location) ───────────────
    console.log('👩‍⚕️ Creating Doctor 2 (Verified)...');
    const doc2User = await prisma.user.create({
        data: {
            full_name: 'Dr. Sara Mahmoud',
            email: 'sara.doctor@malaz.com',
            password: hash,
            role: 'DOCTOR',
            account_status: 'ACTIVE',
        }
    });

    const doc2 = await prisma.doctor.create({
        data: {
            user_id: doc2User.id,
            specialization: 'Cognitive Behavioral Therapy',
            bio: 'Dedicated to empowering individuals through evidence-based CBT methods. Fluent in Arabic and English.',
            session_price: 400,
            is_verified: true,
            avg_rating: 4.9,
            latitude: 30.0626,
            longitude: 31.2497,
            address: 'Heliopolis, Cairo, Egypt',
        }
    });

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

    // ── 6. DOCTOR 3 (NOT Verified — pending admin approval) ─────────────────
    console.log('⏳ Creating Doctor 3 (Pending Verification)...');
    const doc3User = await prisma.user.create({
        data: {
            full_name: 'Dr. Khaled Nasser',
            email: 'pending.doctor@malaz.com',
            password: hash,
            role: 'DOCTOR',
            account_status: 'ACTIVE',
        }
    });

    await prisma.doctor.create({
        data: {
            user_id: doc3User.id,
            specialization: 'Trauma & PTSD',
            bio: 'Recently joined Malaz and awaiting verification. Specializes in trauma-informed care.',
            session_price: 350,
            is_verified: false,  // Awaiting admin approval
            avg_rating: 0,
            certificate_url: null, // No certificate uploaded yet — admin sees this
        }
    });

    // ── 7. PATIENT 1 (Omar) ─────────────────────────────────────────────────
    console.log('🧑 Creating Patient 1...');
    const patient1User = await prisma.user.create({
        data: {
            full_name: 'Omar Mohamed',
            email: 'omar.patient@malaz.com',
            password: hash,
            role: 'PATIENT',
            account_status: 'ACTIVE',
        }
    });

    const patient1 = await prisma.patient.create({
        data: {
            user_id: patient1User.id,
            date_of_birth: new Date('1998-05-15'),
            gender: 'Male',
            emergency_contact: '+201012345678',
            latitude: 30.0500,
            longitude: 31.2300,
            address: 'Maadi, Cairo, Egypt',
        }
    });

    // ── 8. PATIENT 2 (Layla) ────────────────────────────────────────────────
    console.log('👩 Creating Patient 2...');
    const patient2User = await prisma.user.create({
        data: {
            full_name: 'Layla Hassan',
            email: 'layla.patient@malaz.com',
            password: hash,
            role: 'PATIENT',
            account_status: 'ACTIVE',
        }
    });

    const patient2 = await prisma.patient.create({
        data: {
            user_id: patient2User.id,
            date_of_birth: new Date('2001-11-22'),
            gender: 'Female',
            emergency_contact: '+201098765432',
            latitude: 30.0580,
            longitude: 31.2200,
            address: 'Dokki, Giza, Egypt',
        }
    });

    // ── 9. CAREGIVER ────────────────────────────────────────────────────────
    console.log('💚 Creating Caregiver...');
    await prisma.user.create({
        data: {
            full_name: 'Mona Ibrahim',
            email: 'caregiver@malaz.com',
            password: hash,
            role: 'CAREGIVER',
            account_status: 'ACTIVE',
        }
    });

    // ── 10. APPOINTMENTS (Completed + upcoming) ─────────────────────────────
    console.log('📅 Creating Appointments...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Completed appointment (Patient1 + Doctor1)
    const apt1 = await prisma.appointment.create({
        data: {
            patient_id: patient1.id,
            doctor_id: doc1.id,
            date: yesterday,
            start_time: '10:00 AM',
            end_time: '11:00 AM',
            status: 'COMPLETED',
            appointment_type: 'ONLINE',
            meeting_link: 'https://meet.malaz.app/demo-room-1',
        }
    });

    // Confirmed upcoming appointment (Patient1 + Doctor1)
    await prisma.appointment.create({
        data: {
            patient_id: patient1.id,
            doctor_id: doc1.id,
            date: nextWeek,
            start_time: '11:00 AM',
            end_time: '12:00 PM',
            status: 'CONFIRMED',
            appointment_type: 'ONLINE',
            meeting_link: 'https://meet.malaz.app/demo-room-2',
        }
    });

    // Offline appointment (Patient2 + Doctor2)
    await prisma.appointment.create({
        data: {
            patient_id: patient2.id,
            doctor_id: doc2.id,
            date: nextWeek,
            start_time: '02:00 PM',
            end_time: '03:00 PM',
            status: 'CONFIRMED',
            appointment_type: 'OFFLINE',
        }
    });

    // ── 11. CLINICAL NOTES (from completed appointment) ─────────────────────
    console.log('📋 Creating Clinical Notes...');
    await prisma.clinicalNote.create({
        data: {
            appointment_id: apt1.id,
            doctor_id: doc1.id,
            patient_id: patient1.id,
            diagnosis: 'Generalized Anxiety Disorder (GAD)',
            treatment_plan: 'Weekly CBT sessions, mindfulness exercises, and journaling.',
            notes: 'Patient shows good progress. Reports improved sleep patterns and reduced panic episodes.',
        }
    });

    // ── 12. MOOD ENTRIES (Patient1) ─────────────────────────────────────────
    console.log('😊 Creating Mood Entries...');
    const moodHistory = [
        { score: 5, note: 'Feeling anxious about work presentation', daysAgo: 6 },
        { score: 6, note: 'Better today, went for a walk', daysAgo: 5 },
        { score: 4, note: 'Did not sleep well', daysAgo: 4 },
        { score: 7, note: 'Session with Dr. Ahmed was very helpful', daysAgo: 3 },
        { score: 8, note: 'Practiced mindfulness, feeling calmer', daysAgo: 2 },
        { score: 7, note: 'Good day overall', daysAgo: 1 },
        { score: 8, note: 'Feeling positive about the week ahead', daysAgo: 0 },
    ];

    for (const mood of moodHistory) {
        const loggedAt = new Date();
        loggedAt.setDate(loggedAt.getDate() - mood.daysAgo);
        await prisma.moodEntry.create({
            data: {
                patient_id: patient1.id,
                mood_score: mood.score,
                note: mood.note,
                logged_at: loggedAt,
            }
        });
    }

    // ── 13. JOURNALS (Patient1) ─────────────────────────────────────────────
    console.log('📔 Creating Journal Entries...');
    await prisma.journal.create({
        data: {
            patient_id: patient1.id,
            content: 'Today I practiced the breathing exercise Dr. Ahmed taught me. When I felt the anxiety coming on, I stopped and took 10 deep breaths. It actually helped.',
            ai_feedback: 'Great job practicing mindfulness techniques! Consistent practice builds resilience.',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }
    });

    await prisma.journal.create({
        data: {
            patient_id: patient1.id,
            content: 'Had a tough day at work. The presentation did not go as well as I hoped. Trying to remind myself that one bad day does not define me.',
            ai_feedback: 'It is healthy to acknowledge difficult moments. Remember to practice self-compassion.',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        }
    });

    await prisma.journal.create({
        data: {
            patient_id: patient2.id,
            content: 'Started my therapy journey today. Feeling hopeful and a little nervous about opening up to Dr. Sara.',
            ai_feedback: 'Taking the first step is the hardest and most important one. You are doing great!',
            created_at: new Date(),
        }
    });

    // ── 14. SAFE CIRCLES ────────────────────────────────────────────────────
    console.log('🔵 Creating Safe Circles...');

    // Circle 1 (created by Admin, Doctor1 as admin-member)
    const circle1 = await prisma.safeCircle.create({
        data: {
            name: 'Anxiety & Panic Support',
            description: 'A safe, supervised space for individuals managing anxiety and panic disorders. Moderated by Dr. Ahmed Ali.',
            created_by_user_id: doc1User.id,
            members: {
                create: [
                    {
                        user_id: doc1User.id,
                        role: 'ADMIN',
                        status: 'APPROVED',
                    },
                    {
                        user_id: patient1User.id,
                        role: 'MEMBER',
                        status: 'APPROVED',
                    },
                    {
                        user_id: patient2User.id,
                        role: 'MEMBER',
                        status: 'APPROVED',
                    }
                ]
            }
        }
    });

    // Circle 2 (created by Doctor2)
    const circle2 = await prisma.safeCircle.create({
        data: {
            name: 'Depression Recovery',
            description: 'Support circle for individuals in recovery from depression. Weekly group discussions facilitated by Dr. Sara Mahmoud.',
            created_by_user_id: doc2User.id,
            members: {
                create: [
                    {
                        user_id: doc2User.id,
                        role: 'ADMIN',
                        status: 'APPROVED',
                    },
                    {
                        user_id: patient1User.id,
                        role: 'MEMBER',
                        status: 'APPROVED',
                    }
                ]
            }
        }
    });

    // Circle 3 (open, by Admin)
    await prisma.safeCircle.create({
        data: {
            name: 'Stress & Burnout Management',
            description: 'Community discussions on work-life balance, burnout prevention, and stress relief strategies.',
            created_by_user_id: adminUser.id,
            members: {
                create: [
                    {
                        user_id: adminUser.id,
                        role: 'ADMIN',
                        status: 'APPROVED',
                    }
                ]
            }
        }
    });

    // ── 15. CIRCLE MESSAGES (Demo chat history) ─────────────────────────────
    console.log('💬 Creating Circle Messages...');
    const msgs1 = [
        { sender_id: doc1User.id, content: 'Welcome everyone to the Anxiety & Panic Support circle. Feel free to share your experiences and support each other.' },
        { sender_id: patient1User.id, content: 'Thank you Dr. Ahmed! I have been dealing with panic attacks at work and it is really reassuring to have this space.' },
        { sender_id: patient2User.id, content: 'I completely understand, Omar. I experienced the same thing last month. The breathing exercises really helped me.' },
        { sender_id: doc1User.id, content: 'Great point, Layla. Would anyone like to share which coping technique has worked best for them this week?' },
        { sender_id: patient1User.id, content: 'The 4-7-8 breathing technique you recommended, Doctor. It really helps during stressful meetings.' },
    ];

    for (let i = 0; i < msgs1.length; i++) {
        const createdAt = new Date(Date.now() - (msgs1.length - i) * 10 * 60 * 1000); // spaced 10 mins apart
        await prisma.safeCircleMessage.create({
            data: {
                circle_id: circle1.id,
                sender_id: msgs1[i].sender_id,
                content: msgs1[i].content,
                created_at: createdAt,
            }
        });
    }

    const msgs2 = [
        { sender_id: doc2User.id, content: 'Hello everyone! This is a safe space to talk about your depression recovery journey. No judgment here.' },
        { sender_id: patient1User.id, content: 'I wanted to share that I went 3 days without a low mood episode this week. Small win but it means a lot!' },
        { sender_id: doc2User.id, content: 'That is a wonderful achievement, Omar! Celebrating small wins is a key part of recovery. Well done!' },
    ];

    for (let i = 0; i < msgs2.length; i++) {
        const createdAt = new Date(Date.now() - (msgs2.length - i) * 15 * 60 * 1000);
        await prisma.safeCircleMessage.create({
            data: {
                circle_id: circle2.id,
                sender_id: msgs2[i].sender_id,
                content: msgs2[i].content,
                created_at: createdAt,
            }
        });
    }

    // ── 16. NOTIFICATIONS ───────────────────────────────────────────────────
    console.log('🔔 Creating Notifications...');
    await prisma.notification.create({
        data: {
            user_id: patient1User.id,
            content: 'Your appointment with Dr. Ahmed Ali is confirmed for next week.',
            is_read: false,
        }
    });

    await prisma.notification.create({
        data: {
            user_id: doc1User.id,
            content: 'You have a new appointment request from Omar Mohamed.',
            is_read: false,
        }
    });

    await prisma.notification.create({
        data: {
            user_id: adminUser.id,
            content: 'Dr. Khaled Nasser has registered and is awaiting verification.',
            is_read: false,
        }
    });

    // ── 17. REVIEW ──────────────────────────────────────────────────────────
    console.log('⭐ Creating Review...');
    await prisma.review.create({
        data: {
            appointment_id: apt1.id,
            patient_id: patient1.id,
            doctor_id: doc1.id,
            rating: 5,
            comment: 'Dr. Ahmed is incredibly patient and understanding. The session was very helpful and I left feeling much more at ease.',
        }
    });

    // ── Done ────────────────────────────────────────────────────────────────
    console.log('\n✅ Seed completed successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📧 Test Accounts (password: Password123!)');
    console.log('───────────────────────────────────────────────');
    console.log('ADMIN:    admin@malaz.com');
    console.log('DOCTOR 1: ahmed.doctor@malaz.com   (verified ✅)');
    console.log('DOCTOR 2: sara.doctor@malaz.com    (verified ✅)');
    console.log('DOCTOR 3: pending.doctor@malaz.com (pending ⏳)');
    console.log('PATIENT1: omar.patient@malaz.com');
    console.log('PATIENT2: layla.patient@malaz.com');
    console.log('CAREGIVER:caregiver@malaz.com');
    console.log('═══════════════════════════════════════════════');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
