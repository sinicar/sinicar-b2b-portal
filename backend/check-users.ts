import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      clientId: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      password: true
    },
    take: 15
  });
  
  console.log('\n=== Users in Database ===\n');
  users.forEach(u => {
    console.log(`clientId: ${u.clientId}, email: ${u.email}, role: ${u.role}, status: ${u.status}, isActive: ${u.isActive}, hasPassword: ${!!u.password}`);
  });
  
  // Check specifically for admin
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@sinicar.com' }
  });
  console.log('\n=== Admin Check ===');
  console.log('admin@sinicar.com exists:', !!admin);
  if (admin) {
    console.log('Admin clientId:', admin.clientId);
    console.log('Admin hasPassword:', !!admin.password);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
