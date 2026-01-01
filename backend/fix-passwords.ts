import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = await bcrypt.hash('Admin123', 10);
  
  // Update admin password
  const result = await prisma.user.updateMany({
    where: { email: 'admin@sinicar.com' },
    data: { password: newPassword }
  });
  
  console.log('Updated admin password:', result);
  
  // Also update demo users
  for (let i = 1; i <= 6; i++) {
    const pw = await bcrypt.hash(String(i), 10);
    const r = await prisma.user.updateMany({
      where: { clientId: `user-${i}` },
      data: { password: pw }
    });
    console.log(`Updated user-${i} password:`, r);
  }
  
  console.log('\nDone! Passwords updated.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
