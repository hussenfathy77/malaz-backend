const prisma = require('./src/config/db');

async function main() {
  const doctors = await prisma.doctor.findMany({
    include: { user: { select: { full_name: true } } }
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const weekendDays = ['Friday', 'Saturday'];

  for (const doctor of doctors) {
    console.log(`Adding working hours for: ${doctor.user.full_name}`);

    // Sun-Thu: 09:00-17:00
    for (const day of days) {
      await prisma.workingHours.upsert({
        where: {
          // No unique constraint on day+doctor_id so use findFirst + create
          id: (await prisma.workingHours.findFirst({ where: { doctor_id: doctor.id, day_of_week: day } }))?.id ?? 'new'
        },
        update: { start_time: '09:00', end_time: '17:00' },
        create: {
          doctor_id: doctor.id,
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
        }
      }).catch(async () => {
        // If upsert fails (id='new'), just create
        const existing = await prisma.workingHours.findFirst({ where: { doctor_id: doctor.id, day_of_week: day } });
        if (!existing) {
          await prisma.workingHours.create({
            data: { doctor_id: doctor.id, day_of_week: day, start_time: '09:00', end_time: '17:00' }
          });
        }
      });
    }
    console.log(`  ✓ Sun-Thu: 09:00-17:00`);
  }

  // Verify
  const all = await prisma.workingHours.findMany({ include: { doctor: { include: { user: { select: { full_name: true } } } } } });
  console.log(`\nTotal working hours records: ${all.length}`);
  all.forEach(wh => console.log(`  ${wh.doctor.user.full_name} | ${wh.day_of_week}: ${wh.start_time}-${wh.end_time}`));

  await prisma.$disconnect();
}

main().catch(console.error);
