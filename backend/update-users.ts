import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating users...');
  
  const password = await bcrypt.hash('1', 10);
  
  // Update user-1 (Admin)
  await prisma.user.upsert({
    where: { clientId: 'user-1' },
    update: { password, role: 'SUPER_ADMIN', name: 'الأدمن الرئيسي', status: 'ACTIVE', isActive: true },
    create: {
      clientId: 'user-1',
      name: 'الأدمن الرئيسي',
      email: 'admin@sinicar.com',
      phone: '0500000001',
      password,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isActive: true,
      isCustomer: false,
      isSupplier: false,
      completionPercent: 100
    }
  });
  console.log('✅ user-1 (Admin) - password: 1');

  // Update user-2 (Customer)
  await prisma.user.upsert({
    where: { clientId: 'user-2' },
    update: { password, role: 'CUSTOMER', name: 'عميل', status: 'ACTIVE', isActive: true },
    create: {
      clientId: 'user-2',
      name: 'عميل',
      email: 'customer@sinicar.com',
      phone: '0500000002',
      password,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isActive: true,
      isCustomer: true,
      isSupplier: false,
      completionPercent: 100
    }
  });
  console.log('✅ user-2 (Customer) - password: 1');

  // Update user-5 (Supplier)
  await prisma.user.upsert({
    where: { clientId: 'user-5' },
    update: { password, role: 'SUPPLIER', name: 'مورد', status: 'ACTIVE', isActive: true },
    create: {
      clientId: 'user-5',
      name: 'مورد',
      email: 'supplier@sinicar.com',
      phone: '0500000005',
      password,
      role: 'SUPPLIER',
      status: 'ACTIVE',
      isActive: true,
      isCustomer: false,
      isSupplier: true,
      completionPercent: 100
    }
  });
  console.log('✅ user-5 (Supplier) - password: 1');

  console.log('\n🎉 Done! All users updated with password: 1');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
