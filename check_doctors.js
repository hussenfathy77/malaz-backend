const prisma = require('./src/config/db');
async function main() {
  const all = await prisma.doctor.findMany({
    include: { user: { select: { full_name: true, email: true } } }
  });
  console.log('All doctors in DB:');
  all.forEach(d => console.log(`  - ${d.user.full_name} | verified: ${d.is_verified} | spec: ${d.specialization}`));
  
  const verified = all.filter(d => d.is_verified);
  console.log(`\nVerified: ${verified.length} / Total: ${all.length}`);
  
  // Also check admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { email: true, full_name: true } });
  console.log('\nAdmin user:', admin);
  
  await prisma.$disconnect();
}
main().catch(console.error);
