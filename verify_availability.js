const prisma = require('./src/config/db');
async function main() {
  const doctor = await prisma.doctor.findFirst({ include: { user: { select: { full_name: true } } } });
  
  // Get today + next few days
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = dayNames[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    
    const wh = await prisma.workingHours.findFirst({ where: { doctor_id: doctor.id, day_of_week: dayName } });
    console.log(`${dateStr} (${dayName}): ${wh ? `${wh.start_time}-${wh.end_time} → available` : 'no working hours'}`);
  }
  
  await prisma.$disconnect();
}
main().catch(console.error);
