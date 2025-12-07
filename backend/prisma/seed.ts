import { PrismaClient, SupplierType, MessageChannel, MessageEvent } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const sarCurrency = await prisma.currency.upsert({
    where: { code: 'SAR' },
    update: {},
    create: {
      code: 'SAR',
      name: 'Saudi Riyal',
      nameAr: 'ريال سعودي',
      nameEn: 'Saudi Riyal',
      symbol: 'ر.س',
      isBase: true,
      isActive: true,
      sortOrder: 0
    }
  });

  const usdCurrency = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: {
      code: 'USD',
      name: 'US Dollar',
      nameAr: 'دولار أمريكي',
      nameEn: 'US Dollar',
      symbol: '$',
      isBase: false,
      isActive: true,
      sortOrder: 1
    }
  });

  const cnyCurrency = await prisma.currency.upsert({
    where: { code: 'CNY' },
    update: {},
    create: {
      code: 'CNY',
      name: 'Chinese Yuan',
      nameAr: 'يوان صيني',
      nameEn: 'Chinese Yuan',
      symbol: '¥',
      isBase: false,
      isActive: true,
      sortOrder: 2
    }
  });

  const eurCurrency = await prisma.currency.upsert({
    where: { code: 'EUR' },
    update: {},
    create: {
      code: 'EUR',
      name: 'Euro',
      nameAr: 'يورو',
      nameEn: 'Euro',
      symbol: '€',
      isBase: false,
      isActive: true,
      sortOrder: 3
    }
  });

  console.log('✅ Currencies created');

  await prisma.exchangeRate.create({
    data: {
      currencyId: usdCurrency.id,
      rateToBase: 3.75,
      syncPercent: 100
    }
  });

  await prisma.exchangeRate.create({
    data: {
      currencyId: cnyCurrency.id,
      rateToBase: 0.52,
      syncPercent: 100
    }
  });

  await prisma.exchangeRate.create({
    data: {
      currencyId: eurCurrency.id,
      rateToBase: 4.10,
      syncPercent: 100
    }
  });

  console.log('✅ Exchange rates created');

  const qualityCodes = [
    { code: 'OEM', label: 'Original OEM', labelAr: 'أصلي وكالة', labelEn: 'Original OEM', defaultMarginAdjust: 5, sortOrder: 0 },
    { code: 'BRAND', label: 'Brand Quality', labelAr: 'ماركات عالمية', labelEn: 'Brand Quality', defaultMarginAdjust: 2, sortOrder: 1 },
    { code: 'AFTERMARKET', label: 'Aftermarket', labelAr: 'بديل', labelEn: 'Aftermarket', defaultMarginAdjust: 0, sortOrder: 2 },
    { code: 'ECONOMY', label: 'Economy', labelAr: 'اقتصادي', labelEn: 'Economy', defaultMarginAdjust: -2, sortOrder: 3 },
    { code: 'USED', label: 'Used/Refurbished', labelAr: 'مستعمل', labelEn: 'Used/Refurbished', defaultMarginAdjust: -5, sortOrder: 4 }
  ];

  for (const qc of qualityCodes) {
    await prisma.qualityCode.upsert({
      where: { code: qc.code },
      update: {},
      create: qc
    });
  }

  console.log('✅ Quality codes created');

  const brandCodes = [
    { code: 'BOSCH', name: 'Bosch', nameAr: 'بوش', country: 'Germany', sortOrder: 0 },
    { code: 'DENSO', name: 'Denso', nameAr: 'دينسو', country: 'Japan', sortOrder: 1 },
    { code: 'VALEO', name: 'Valeo', nameAr: 'فاليو', country: 'France', sortOrder: 2 },
    { code: 'ACDelco', name: 'ACDelco', nameAr: 'إيه سي ديلكو', country: 'USA', sortOrder: 3 },
    { code: 'NGK', name: 'NGK', nameAr: 'إن جي كيه', country: 'Japan', sortOrder: 4 }
  ];

  for (const bc of brandCodes) {
    await prisma.brandCode.upsert({
      where: { code: bc.code },
      update: {},
      create: bc
    });
  }

  console.log('✅ Brand codes created');

  const shippingMethods = [
    { code: 'AIR', name: 'Air Freight', nameAr: 'شحن جوي', baseRate: 100, perKgRate: 15, minCharge: 150, deliveryDays: 5, sortOrder: 0 },
    { code: 'SEA', name: 'Sea Freight', nameAr: 'شحن بحري', baseRate: 50, perKgRate: 3, minCharge: 200, deliveryDays: 30, sortOrder: 1 },
    { code: 'LAND', name: 'Land Transport', nameAr: 'شحن بري', baseRate: 75, perKgRate: 8, minCharge: 100, deliveryDays: 10, sortOrder: 2 },
    { code: 'EXPRESS', name: 'Express Courier', nameAr: 'شحن سريع', baseRate: 200, perKgRate: 25, minCharge: 250, deliveryDays: 3, sortOrder: 3 }
  ];

  for (const sm of shippingMethods) {
    await prisma.shippingMethod.upsert({
      where: { code: sm.code },
      update: {},
      create: sm
    });
  }

  console.log('✅ Shipping methods created');

  const shippingZones = [
    { code: 'GCC', name: 'GCC Countries', nameAr: 'دول الخليج', countries: ['Saudi Arabia', 'UAE', 'Kuwait', 'Bahrain', 'Oman', 'Qatar'], extraRatePerKg: 0, sortOrder: 0 },
    { code: 'MENA', name: 'Middle East & North Africa', nameAr: 'الشرق الأوسط وشمال أفريقيا', countries: ['Egypt', 'Jordan', 'Lebanon', 'Morocco'], extraRatePerKg: 5, sortOrder: 1 },
    { code: 'ASIA', name: 'Asia', nameAr: 'آسيا', countries: ['China', 'Japan', 'South Korea', 'India', 'Thailand'], extraRatePerKg: 8, sortOrder: 2 },
    { code: 'EUROPE', name: 'Europe', nameAr: 'أوروبا', countries: ['Germany', 'France', 'UK', 'Italy', 'Spain'], extraRatePerKg: 10, sortOrder: 3 }
  ];

  for (const sz of shippingZones) {
    await prisma.shippingZone.upsert({
      where: { code: sz.code },
      update: {},
      create: sz
    });
  }

  console.log('✅ Shipping zones created');

  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Admin', nameAr: 'مدير عام', description: 'Full system access', isSystem: true, sortOrder: 0 },
    { code: 'ADMIN', name: 'Admin', nameAr: 'مدير', description: 'Administrative access', isSystem: true, sortOrder: 1 },
    { code: 'STAFF', name: 'Staff', nameAr: 'موظف', description: 'SINI CAR staff member', isSystem: true, sortOrder: 2 },
    { code: 'CUSTOMER', name: 'Customer', nameAr: 'عميل', description: 'B2B customer account', isSystem: true, sortOrder: 3 },
    { code: 'CUSTOMER_EMPLOYEE', name: 'Customer Employee', nameAr: 'موظف عميل', description: 'Employee of a customer', isSystem: true, sortOrder: 4 },
    { code: 'SUPPLIER', name: 'Supplier', nameAr: 'مورد', description: 'Supplier account', isSystem: true, sortOrder: 5 },
    { code: 'SUPPLIER_EMPLOYEE', name: 'Supplier Employee', nameAr: 'موظف مورد', description: 'Employee of a supplier', isSystem: true, sortOrder: 6 },
    { code: 'SUPPLIER_OWNER', name: 'Supplier Owner', nameAr: 'مالك مورد', description: 'Owner of supplier company', isSystem: true, sortOrder: 7 },
    { code: 'SUPPLIER_MANAGER', name: 'Supplier Manager', nameAr: 'مدير مورد', description: 'Manager in supplier company', isSystem: true, sortOrder: 8 },
    { code: 'SUPPLIER_STAFF', name: 'Supplier Staff', nameAr: 'موظف مورد', description: 'Staff member in supplier company', isSystem: true, sortOrder: 9 },
    { code: 'MARKETER', name: 'Marketer', nameAr: 'مسوق', description: 'Affiliate marketer', isSystem: true, sortOrder: 10 },
    { code: 'ADVERTISER', name: 'Advertiser', nameAr: 'معلن', description: 'Advertising account', isSystem: true, sortOrder: 11 }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role
    });
  }

  console.log('✅ Roles created');

  // Create demo users with simple numbered credentials
  const demoUsers = [
    { num: 1, name: 'مدير عام', role: 'SUPER_ADMIN' },
    { num: 2, name: 'مدير', role: 'ADMIN' },
    { num: 3, name: 'موظف', role: 'STAFF' },
    { num: 4, name: 'عميل', role: 'CUSTOMER' },
    { num: 5, name: 'مورد', role: 'SUPPLIER' },
    { num: 6, name: 'مسوق', role: 'MARKETER' },
  ];

  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(String(user.num), 10);
    await prisma.user.upsert({
      where: { clientId: `user-${user.num}` },
      update: {},
      create: {
        clientId: `user-${user.num}`,
        name: user.name,
        email: `${user.num}@sinicar.com`,
        phone: `05000000${user.num}`,
        whatsapp: `05000000${user.num}`,
        password: hashedPassword,
        role: user.role,
        status: 'ACTIVE',
        isActive: true,
        isCustomer: user.role === 'CUSTOMER',
        isSupplier: user.role === 'SUPPLIER',
        completionPercent: 100,
      },
    });
  }

  console.log('✅ Demo users created (1-6)');

  // Create SupplierProfile and SupplierUser for user-5 (supplier demo user)
  const supplierUser = await prisma.user.findFirst({
    where: { clientId: 'user-5' }
  });

  if (supplierUser) {
    const supplierProfileId = 'supplier-profile-1';
    await prisma.supplierProfile.upsert({
      where: { id: supplierProfileId },
      update: {},
      create: {
        id: supplierProfileId,
        customerId: supplierUser.id,
        companyName: 'شركة الأمل للتوريد',
        contactName: 'مورد',
        contactEmail: supplierUser.email || '5@sinicar.com',
        contactPhone: supplierUser.phone || '050000005',
        country: 'SA',
        city: 'الرياض',
        vatNumber: '300000000000001',
        crNumber: '1010000001',
        preferredCurrency: 'SAR',
        supplierType: SupplierType.LOCAL,
        status: 'ACTIVE',
        rating: 4.5,
      }
    });

    // Create SupplierUser record (owner)
    const supplierUserId = `supplier-user-${supplierUser.id}`;
    await prisma.supplierUser.upsert({
      where: { id: supplierUserId },
      update: {},
      create: {
        id: supplierUserId,
        supplierId: supplierProfileId,
        userId: supplierUser.id,
        roleCode: 'SUPPLIER_OWNER',
        isOwner: true,
        isActive: true,
        jobTitle: 'المدير العام',
      }
    });

    console.log('✅ SupplierProfile and SupplierUser created for user-5');
  }

  const permissions = [
    { code: 'VIEW_ADMIN_DASHBOARD', name: 'View Admin Dashboard', nameAr: 'عرض لوحة التحكم', module: 'admin', category: 'ADMIN', sortOrder: 0 },
    { code: 'MANAGE_USERS', name: 'Manage Users', nameAr: 'إدارة المستخدمين', module: 'admin', category: 'ADMIN', sortOrder: 1 },
    { code: 'MANAGE_PERMISSIONS', name: 'Manage Permissions', nameAr: 'إدارة الصلاحيات', module: 'admin', category: 'ADMIN', sortOrder: 2 },
    { code: 'MANAGE_SETTINGS', name: 'Manage Settings', nameAr: 'إدارة الإعدادات', module: 'settings', category: 'ADMIN', sortOrder: 3 },
    { code: 'VIEW_CUSTOMERS', name: 'View Customers', nameAr: 'عرض العملاء', module: 'customers', category: 'ADMIN', sortOrder: 4 },
    { code: 'MANAGE_CUSTOMERS', name: 'Manage Customers', nameAr: 'إدارة العملاء', module: 'customers', category: 'ADMIN', sortOrder: 5 },
    { code: 'VIEW_SUPPLIERS', name: 'View Suppliers', nameAr: 'عرض الموردين', module: 'suppliers', category: 'ADMIN', sortOrder: 6 },
    { code: 'MANAGE_SUPPLIERS', name: 'Manage Suppliers', nameAr: 'إدارة الموردين', module: 'suppliers', category: 'ADMIN', sortOrder: 7 },
    { code: 'MANAGE_INTERNATIONAL_SUPPLIERS', name: 'Manage International Suppliers', nameAr: 'إدارة الموردين الدوليين', module: 'suppliers', category: 'ADMIN', sortOrder: 8 },
    { code: 'VIEW_CUSTOMER_PORTAL', name: 'View Customer Portal', nameAr: 'عرض بوابة العملاء', module: 'customer_portal', category: 'CUSTOMER_PORTAL', sortOrder: 0 },
    { code: 'VIEW_TRADER_TOOLS', name: 'View Trader Tools', nameAr: 'عرض أدوات التاجر', module: 'tools', category: 'CUSTOMER_PORTAL', sortOrder: 1 },
    { code: 'USE_TRADER_TOOLS', name: 'Use Trader Tools', nameAr: 'استخدام أدوات التاجر', module: 'tools', category: 'CUSTOMER_PORTAL', sortOrder: 2 },
    { code: 'VIEW_INTERNATIONAL_PURCHASES', name: 'View International Purchases', nameAr: 'عرض المشتريات الدولية', module: 'international', category: 'CUSTOMER_PORTAL', sortOrder: 3 },
    { code: 'MANAGE_INTERNATIONAL_PURCHASES', name: 'Manage International Purchases', nameAr: 'إدارة المشتريات الدولية', module: 'international', category: 'CUSTOMER_PORTAL', sortOrder: 4 },
    { code: 'USE_AI_ASSISTANT', name: 'Use AI Assistant', nameAr: 'استخدام المساعد الذكي', module: 'ai', category: 'CUSTOMER_PORTAL', sortOrder: 5 },
    { code: 'VIEW_PAGE_TRADER_TOOLS', name: 'View Trader Tools Page', nameAr: 'عرض صفحة أدوات التاجر', module: 'pages', category: 'PAGES', sortOrder: 0 },
    { code: 'VIEW_PAGE_CUSTOMER_SERVICES', name: 'View Customer Services Page', nameAr: 'عرض صفحة خدمات العملاء', module: 'pages', category: 'PAGES', sortOrder: 1 },
    { code: 'VIEW_PAGE_INTERNATIONAL_PURCHASES', name: 'View International Purchases Page', nameAr: 'عرض صفحة المشتريات الدولية', module: 'pages', category: 'PAGES', sortOrder: 2 },
    { code: 'VIEW_SUPPLIER_PORTAL', name: 'View Supplier Portal', nameAr: 'عرض بوابة الموردين', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 0 },
    { code: 'VIEW_SUPPLIER_DASHBOARD', name: 'View Supplier Dashboard', nameAr: 'عرض لوحة تحكم المورد', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 1 },
    { code: 'MANAGE_SUPPLIER_PRODUCTS', name: 'Manage Supplier Products', nameAr: 'إدارة منتجات المورد', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 2 },
    { code: 'VIEW_SUPPLIER_REQUESTS', name: 'View Supplier Requests', nameAr: 'عرض طلبات المورد', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 3 },
    { code: 'RESPOND_TO_REQUESTS', name: 'Respond to Requests', nameAr: 'الرد على الطلبات', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 4 },
    { code: 'MANAGE_SUPPLIER_EMPLOYEES', name: 'Manage Supplier Employees', nameAr: 'إدارة موظفي المورد', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 5 },
    { code: 'VIEW_SUPPLIER_REPORTS', name: 'View Supplier Reports', nameAr: 'عرض تقارير المورد', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 6 },
    { code: 'EXPORT_SUPPLIER_REPORTS', name: 'Export Supplier Reports', nameAr: 'تصدير تقارير المورد', module: 'supplier_portal', category: 'SUPPLIER_PORTAL', sortOrder: 7 },
    { code: 'VIEW_REPORTS', name: 'View Reports', nameAr: 'عرض التقارير', module: 'reports', category: 'REPORTS', sortOrder: 0 },
    { code: 'EXPORT_REPORTS', name: 'Export Reports', nameAr: 'تصدير التقارير', module: 'reports', category: 'REPORTS', sortOrder: 1 },
    { code: 'VIEW_FEEDBACK_CENTER', name: 'View Feedback Center', nameAr: 'عرض مركز التغذية الراجعة', module: 'feedback', category: 'TOOLS', sortOrder: 0 },
    { code: 'MANAGE_FEEDBACK', name: 'Manage Feedback', nameAr: 'إدارة التغذية الراجعة', module: 'feedback', category: 'TOOLS', sortOrder: 1 },
    { code: 'VIEW_SEO_TOOLS', name: 'View SEO Tools', nameAr: 'عرض أدوات السيو', module: 'seo', category: 'TOOLS', sortOrder: 2 },
    { code: 'MANAGE_SEO_SETTINGS', name: 'Manage SEO Settings', nameAr: 'إدارة إعدادات السيو', module: 'seo', category: 'TOOLS', sortOrder: 3 },
    { code: 'VIEW_HELP_TEXT', name: 'View Help Text', nameAr: 'عرض نصوص المساعدة', module: 'help', category: 'TOOLS', sortOrder: 4 },
    { code: 'MANAGE_HELP_TEXT', name: 'Manage Help Text', nameAr: 'إدارة نصوص المساعدة', module: 'help', category: 'TOOLS', sortOrder: 5 },
    { code: 'CONFIGURE_AI_BEHAVIOR', name: 'Configure AI Behavior', nameAr: 'ضبط سلوك الذكاء الاصطناعي', module: 'ai', category: 'TOOLS', sortOrder: 6 },
    { code: 'VIEW_MESSAGE_TEMPLATES', name: 'View Message Templates', nameAr: 'عرض قوالب الرسائل', module: 'messages', category: 'TOOLS', sortOrder: 7 },
    { code: 'MANAGE_MESSAGE_TEMPLATES', name: 'Manage Message Templates', nameAr: 'إدارة قوالب الرسائل', module: 'messages', category: 'TOOLS', sortOrder: 8 },
    { code: 'SEND_TEST_MESSAGES', name: 'Send Test Messages', nameAr: 'إرسال رسائل تجريبية', module: 'messages', category: 'TOOLS', sortOrder: 9 },
    { code: 'VIEW_MESSAGE_LOGS', name: 'View Message Logs', nameAr: 'عرض سجل الرسائل', module: 'messages', category: 'TOOLS', sortOrder: 10 },
    { code: 'VIEW_TRADER_TOOLS_ADMIN', name: 'View Trader Tools Admin', nameAr: 'عرض إدارة أدوات التاجر', module: 'admin', category: 'ADMIN', sortOrder: 10 },
    { code: 'TOGGLE_DARK_MODE_FOR_ACCOUNT', name: 'Toggle Dark Mode', nameAr: 'تبديل الوضع الداكن', module: 'account', category: 'ACCOUNT', sortOrder: 0 },
    { code: 'products.view', name: 'View Products', nameAr: 'عرض المنتجات', module: 'products', category: 'PRODUCTS', sortOrder: 0 },
    { code: 'products.create', name: 'Create Products', nameAr: 'إضافة منتجات', module: 'products', category: 'PRODUCTS', sortOrder: 1 },
    { code: 'products.edit', name: 'Edit Products', nameAr: 'تعديل المنتجات', module: 'products', category: 'PRODUCTS', sortOrder: 2 },
    { code: 'products.delete', name: 'Delete Products', nameAr: 'حذف المنتجات', module: 'products', category: 'PRODUCTS', sortOrder: 3 },
    { code: 'orders.view', name: 'View Orders', nameAr: 'عرض الطلبات', module: 'orders', category: 'ORDERS', sortOrder: 0 },
    { code: 'orders.create', name: 'Create Orders', nameAr: 'إنشاء طلبات', module: 'orders', category: 'ORDERS', sortOrder: 1 },
    { code: 'orders.manage', name: 'Manage Orders', nameAr: 'إدارة الطلبات', module: 'orders', category: 'ORDERS', sortOrder: 2 },
    { code: 'suppliers.view', name: 'View Suppliers List', nameAr: 'عرض قائمة الموردين', module: 'suppliers', category: 'SUPPLIERS', sortOrder: 0 },
    { code: 'suppliers.manage', name: 'Manage Suppliers List', nameAr: 'إدارة قائمة الموردين', module: 'suppliers', category: 'SUPPLIERS', sortOrder: 1 },
    { code: 'customers.view', name: 'View Customers List', nameAr: 'عرض قائمة العملاء', module: 'customers', category: 'CUSTOMERS', sortOrder: 0 },
    { code: 'customers.manage', name: 'Manage Customers List', nameAr: 'إدارة قائمة العملاء', module: 'customers', category: 'CUSTOMERS', sortOrder: 1 },
    { code: 'settings.view', name: 'View Settings', nameAr: 'عرض الإعدادات', module: 'settings', category: 'SETTINGS', sortOrder: 0 },
    { code: 'settings.manage', name: 'Manage Settings', nameAr: 'إدارة الإعدادات', module: 'settings', category: 'SETTINGS', sortOrder: 1 },
    { code: 'reports.view', name: 'View Reports List', nameAr: 'عرض التقارير', module: 'reports', category: 'REPORTS', sortOrder: 2 },
    { code: 'REPORTS_ACCESS', name: 'Access Reports Center', nameAr: 'الوصول لمركز التقارير', module: 'reports', category: 'REPORTS', sortOrder: 3 },
    { code: 'REPORTS_RUN', name: 'Run Reports', nameAr: 'تشغيل التقارير', module: 'reports', category: 'REPORTS', sortOrder: 4 },
    { code: 'REPORTS_EXPORT', name: 'Export Reports', nameAr: 'تصدير التقارير', module: 'reports', category: 'REPORTS', sortOrder: 5 },
    { code: 'REPORTS_AI_ACCESS', name: 'AI Report Analysis', nameAr: 'تحليل التقارير بالذكاء الاصطناعي', module: 'reports', category: 'REPORTS', sortOrder: 6 },
    { code: 'tools.access', name: 'Access Tools', nameAr: 'الوصول للأدوات', module: 'tools', category: 'TOOLS', sortOrder: 8 }
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { category: perm.category },
      create: perm
    });
  }

  console.log('✅ Permissions created');

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
  const managePermsPerm = await prisma.permission.findUnique({ where: { code: 'MANAGE_PERMISSIONS' } });
  
  if (adminRole && managePermsPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: managePermsPerm.id }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: managePermsPerm.id,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      }
    });
    console.log('✅ ADMIN role assigned MANAGE_PERMISSIONS');
  }

  const staffRole = await prisma.role.findUnique({ where: { code: 'STAFF' } });
  const viewDashPerm = await prisma.permission.findUnique({ where: { code: 'VIEW_ADMIN_DASHBOARD' } });
  
  if (staffRole && viewDashPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: staffRole.id, permissionId: viewDashPerm.id }
      },
      update: {},
      create: {
        roleId: staffRole.id,
        permissionId: viewDashPerm.id,
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false
      }
    });
    console.log('✅ STAFF role assigned VIEW_ADMIN_DASHBOARD');
  }

  const permissionGroups = [
    { code: 'DEFAULT_ADMIN', name: 'Default Admin', nameAr: 'صلاحيات المدير الافتراضية', description: 'Full administrative access', isSystemDefault: true, sortOrder: 0 },
    { code: 'SUPPORT_STAFF', name: 'Support Staff', nameAr: 'صلاحيات موظفي الدعم', description: 'Customer support permissions', isSystemDefault: true, sortOrder: 1 },
    { code: 'BASIC_CUSTOMER', name: 'Basic Customer', nameAr: 'عميل أساسي', description: 'Basic customer portal access', isSystemDefault: true, sortOrder: 2 },
    { code: 'VIP_CUSTOMER', name: 'VIP Customer', nameAr: 'عميل VIP', description: 'Full customer features including trader tools', isSystemDefault: true, sortOrder: 3 },
    { code: 'POWER_SUPPLIER', name: 'Power Supplier', nameAr: 'مورد متميز', description: 'Full supplier portal access', isSystemDefault: true, sortOrder: 4 },
    { code: 'BASIC_SUPPLIER', name: 'Basic Supplier', nameAr: 'مورد أساسي', description: 'Limited supplier access', isSystemDefault: true, sortOrder: 5 }
  ];

  for (const group of permissionGroups) {
    await prisma.permissionGroup.upsert({
      where: { code: group.code },
      update: {},
      create: group
    });
  }

  console.log('✅ Permission groups created');

  const modules = [
    { moduleKey: 'products', moduleName: 'Products', moduleNameAr: 'المنتجات', sortOrder: 0 },
    { moduleKey: 'orders', moduleName: 'Orders', moduleNameAr: 'الطلبات', sortOrder: 1 },
    { moduleKey: 'quotes', moduleName: 'Quote Requests', moduleNameAr: 'طلبات التسعير', sortOrder: 2 },
    { moduleKey: 'suppliers', moduleName: 'Suppliers', moduleNameAr: 'الموردين', sortOrder: 3 },
    { moduleKey: 'customers', moduleName: 'Customers', moduleNameAr: 'العملاء', sortOrder: 4 },
    { moduleKey: 'installments', moduleName: 'Installments', moduleNameAr: 'التقسيط', sortOrder: 5 },
    { moduleKey: 'tools', moduleName: 'Trader Tools', moduleNameAr: 'أدوات التاجر', sortOrder: 6 },
    { moduleKey: 'ads', moduleName: 'Advertising', moduleNameAr: 'الإعلانات', sortOrder: 7 },
    { moduleKey: 'marketing', moduleName: 'Marketing', moduleNameAr: 'التسويق', sortOrder: 8 },
    { moduleKey: 'settings', moduleName: 'Settings', moduleNameAr: 'الإعدادات', sortOrder: 9 },
    { moduleKey: 'reports', moduleName: 'Reports', moduleNameAr: 'التقارير', sortOrder: 10 }
  ];

  for (const mod of modules) {
    await prisma.moduleAccess.upsert({
      where: { moduleKey: mod.moduleKey },
      update: {},
      create: mod
    });
  }

  console.log('✅ Modules created');

  const settings = [
    { key: 'pricing.defaultMargin', value: '15', valueType: 'NUMBER', category: 'PRICING', label: 'Default Profit Margin', labelAr: 'هامش الربح الافتراضي' },
    { key: 'pricing.showPriceWithVat', value: 'true', valueType: 'BOOLEAN', category: 'PRICING', label: 'Show Prices with VAT', labelAr: 'عرض الأسعار مع الضريبة' },
    { key: 'pricing.vatRate', value: '15', valueType: 'NUMBER', category: 'PRICING', label: 'VAT Rate (%)', labelAr: 'نسبة الضريبة (%)' },
    { key: 'currency.base', value: 'SAR', valueType: 'STRING', category: 'CURRENCY', label: 'Base Currency', labelAr: 'العملة الأساسية' },
    { key: 'currency.displayFormat', value: 'symbol', valueType: 'STRING', category: 'CURRENCY', label: 'Currency Display Format', labelAr: 'شكل عرض العملة' },
    { key: 'supplier.requireApproval', value: 'true', valueType: 'BOOLEAN', category: 'SUPPLIERS', label: 'Require Supplier Approval', labelAr: 'موافقة مطلوبة للموردين' },
    { key: 'supplier.defaultMargin', value: '15', valueType: 'NUMBER', category: 'SUPPLIERS', label: 'Default Supplier Margin', labelAr: 'هامش المورد الافتراضي' },
    { key: 'order.requireApproval', value: 'false', valueType: 'BOOLEAN', category: 'ORDERS', label: 'Require Order Approval', labelAr: 'موافقة مطلوبة للطلبات' },
    { key: 'order.minOrderValue', value: '100', valueType: 'NUMBER', category: 'ORDERS', label: 'Minimum Order Value', labelAr: 'الحد الأدنى للطلب' },
    { key: 'search.dailyLimit', value: '100', valueType: 'NUMBER', category: 'SEARCH', label: 'Daily Search Limit', labelAr: 'حد البحث اليومي' },
    { key: 'search.priceRevealCost', value: '1', valueType: 'NUMBER', category: 'SEARCH', label: 'Price Reveal Cost', labelAr: 'تكلفة كشف السعر' },
    { key: 'system.language', value: 'ar', valueType: 'STRING', category: 'SYSTEM', label: 'Default Language', labelAr: 'اللغة الافتراضية' },
    { key: 'system.timezone', value: 'Asia/Riyadh', valueType: 'STRING', category: 'SYSTEM', label: 'Timezone', labelAr: 'المنطقة الزمنية' },
    { key: 'ai.translationEnabled', value: 'true', valueType: 'BOOLEAN', category: 'AI', label: 'Enable AI Translation', labelAr: 'تفعيل الترجمة الذكية' },
    { key: 'ai.autoValidation', value: 'true', valueType: 'BOOLEAN', category: 'AI', label: 'Enable AI Validation', labelAr: 'تفعيل التحقق الذكي' }
  ];

  for (const setting of settings) {
    await prisma.globalSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('✅ Global settings created');

  const supplierGroups = [
    { name: 'Premium Suppliers', nameAr: 'موردين ممتازين', defaultMarginPercent: 10, sortOrder: 0 },
    { name: 'Standard Suppliers', nameAr: 'موردين عاديين', defaultMarginPercent: 15, sortOrder: 1 },
    { name: 'Economy Suppliers', nameAr: 'موردين اقتصاديين', defaultMarginPercent: 20, sortOrder: 2 }
  ];

  for (const sg of supplierGroups) {
    const existing = await prisma.supplierGroup.findFirst({ where: { name: sg.name } });
    if (!existing) {
      await prisma.supplierGroup.create({ data: sg });
    }
  }

  console.log('✅ Supplier groups created');

  const featureFlags = [
    { key: 'TRADER_TOOLS', name: 'Trader Tools', nameAr: 'أدوات التاجر', description: 'Access to trader tools and utilities', isEnabled: true },
    { key: 'PRICE_COMPARISON', name: 'Price Comparison', nameAr: 'مقارنة الأسعار', description: 'Compare prices across suppliers', isEnabled: true },
    { key: 'VIN_HELPER', name: 'VIN Helper', nameAr: 'مساعد رقم الهيكل', description: 'VIN decoding and vehicle lookup', isEnabled: true },
    { key: 'INTL_SUPPLIERS', name: 'International Suppliers', nameAr: 'الموردين الدوليين', description: 'Access to international supplier network', isEnabled: true },
    { key: 'AI_ASSISTANT', name: 'AI Assistant', nameAr: 'المساعد الذكي', description: 'AI-powered chat assistant', isEnabled: true },
    { key: 'SUPPLIER_MARKETPLACE', name: 'Supplier Marketplace', nameAr: 'سوق الموردين', description: 'Browse and connect with suppliers', isEnabled: true },
    { key: 'INSTALLMENTS', name: 'Installment System', nameAr: 'نظام التقسيط', description: 'Payment installment options', isEnabled: true },
    { key: 'BULK_ORDERS', name: 'Bulk Orders', nameAr: 'الطلبات الجماعية', description: 'Place orders for multiple items at once', isEnabled: true }
  ];

  for (const ff of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: ff.key },
      update: {},
      create: { ...ff, enabledFor: [] }
    });
  }

  console.log('✅ Feature flags created');

  const messageTemplates = [
    {
      event: MessageEvent.QUOTE_CREATED,
      channel: MessageChannel.WHATSAPP,
      language: 'ar',
      name: 'إشعار إنشاء عرض سعر',
      subject: null,
      body: 'مرحباً {{customerName}}،\n\nتم إنشاء طلب عرض سعر جديد برقم {{quoteNumber}}.\nعدد القطع: {{itemCount}}\n\nسيتم مراجعة طلبك والرد عليك قريباً.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.QUOTE_CREATED,
      channel: MessageChannel.WHATSAPP,
      language: 'en',
      name: 'Quote Created Notification',
      subject: null,
      body: 'Hello {{customerName}},\n\nYour quote request #{{quoteNumber}} has been created.\nNumber of items: {{itemCount}}\n\nWe will review your request and respond shortly.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.QUOTE_CREATED,
      channel: MessageChannel.EMAIL,
      language: 'ar',
      name: 'بريد إنشاء عرض سعر',
      subject: 'تم إنشاء طلب عرض سعر جديد #{{quoteNumber}}',
      body: '<h2>مرحباً {{customerName}}،</h2>\n<p>تم إنشاء طلب عرض سعر جديد برقم <strong>{{quoteNumber}}</strong>.</p>\n<p>عدد القطع المطلوبة: {{itemCount}}</p>\n<p>سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.</p>\n<p><a href="{{link}}">اضغط هنا لمتابعة طلبك</a></p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.QUOTE_CREATED,
      channel: MessageChannel.EMAIL,
      language: 'en',
      name: 'Quote Created Email',
      subject: 'New Quote Request Created #{{quoteNumber}}',
      body: '<h2>Hello {{customerName}},</h2>\n<p>Your quote request <strong>#{{quoteNumber}}</strong> has been created.</p>\n<p>Number of items requested: {{itemCount}}</p>\n<p>We will review your request and respond as soon as possible.</p>\n<p><a href="{{link}}">Click here to track your request</a></p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.QUOTE_APPROVED,
      channel: MessageChannel.WHATSAPP,
      language: 'ar',
      name: 'إشعار الموافقة على عرض السعر',
      subject: null,
      body: 'مرحباً {{customerName}}،\n\nتمت الموافقة على طلب عرض السعر رقم {{quoteNumber}}.\nالإجمالي: {{totalAmount}} {{currency}}\n\nيمكنك الآن إتمام الطلب.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.QUOTE_APPROVED,
      channel: MessageChannel.WHATSAPP,
      language: 'en',
      name: 'Quote Approved Notification',
      subject: null,
      body: 'Hello {{customerName}},\n\nYour quote request #{{quoteNumber}} has been approved.\nTotal: {{totalAmount}} {{currency}}\n\nYou can now proceed with your order.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.ORDER_CREATED,
      channel: MessageChannel.WHATSAPP,
      language: 'ar',
      name: 'إشعار إنشاء طلب',
      subject: null,
      body: 'مرحباً {{customerName}}،\n\nتم إنشاء طلبك بنجاح برقم {{orderNumber}}.\nالإجمالي: {{totalAmount}} {{currency}}\n\nشكراً لثقتكم بنا.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.ORDER_CREATED,
      channel: MessageChannel.WHATSAPP,
      language: 'en',
      name: 'Order Created Notification',
      subject: null,
      body: 'Hello {{customerName}},\n\nYour order #{{orderNumber}} has been created successfully.\nTotal: {{totalAmount}} {{currency}}\n\nThank you for your trust.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.ORDER_SHIPPED,
      channel: MessageChannel.WHATSAPP,
      language: 'ar',
      name: 'إشعار شحن الطلب',
      subject: null,
      body: 'مرحباً {{customerName}}،\n\nتم شحن طلبك رقم {{orderNumber}}.\nرقم التتبع: {{trackingNumber}}\nشركة الشحن: {{shippingCompany}}\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.ORDER_SHIPPED,
      channel: MessageChannel.WHATSAPP,
      language: 'en',
      name: 'Order Shipped Notification',
      subject: null,
      body: 'Hello {{customerName}},\n\nYour order #{{orderNumber}} has been shipped.\nTracking Number: {{trackingNumber}}\nShipping Company: {{shippingCompany}}\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.PASSWORD_RESET,
      channel: MessageChannel.EMAIL,
      language: 'ar',
      name: 'بريد إعادة تعيين كلمة المرور',
      subject: 'إعادة تعيين كلمة المرور - SINI CAR',
      body: '<h2>مرحباً {{customerName}}،</h2>\n<p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.</p>\n<p>رمز التحقق: <strong>{{resetCode}}</strong></p>\n<p>أو اضغط على الرابط التالي:</p>\n<p><a href="{{link}}">إعادة تعيين كلمة المرور</a></p>\n<p>صالح لمدة {{expiryMinutes}} دقيقة.</p>\n<p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد.</p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.PASSWORD_RESET,
      channel: MessageChannel.EMAIL,
      language: 'en',
      name: 'Password Reset Email',
      subject: 'Password Reset - SINI CAR',
      body: '<h2>Hello {{customerName}},</h2>\n<p>You have requested to reset your password.</p>\n<p>Verification code: <strong>{{resetCode}}</strong></p>\n<p>Or click the following link:</p>\n<p><a href="{{link}}">Reset Password</a></p>\n<p>Valid for {{expiryMinutes}} minutes.</p>\n<p>If you did not request this, please ignore this email.</p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.ACCOUNT_ACTIVATED,
      channel: MessageChannel.WHATSAPP,
      language: 'ar',
      name: 'إشعار تفعيل الحساب',
      subject: null,
      body: 'مرحباً {{customerName}}،\n\nتم تفعيل حسابك بنجاح في SINI CAR.\n\nيمكنك الآن تسجيل الدخول والبدء في استخدام المنصة.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.ACCOUNT_ACTIVATED,
      channel: MessageChannel.WHATSAPP,
      language: 'en',
      name: 'Account Activated Notification',
      subject: null,
      body: 'Hello {{customerName}},\n\nYour SINI CAR account has been activated successfully.\n\nYou can now log in and start using the platform.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.WELCOME_MESSAGE,
      channel: MessageChannel.EMAIL,
      language: 'ar',
      name: 'بريد الترحيب',
      subject: 'مرحباً بك في SINI CAR',
      body: '<h2>مرحباً {{customerName}}،</h2>\n<p>شكراً لانضمامك إلى منصة SINI CAR لقطع غيار السيارات B2B.</p>\n<p>نحن سعداء بانضمامك إلينا!</p>\n<h3>ما يمكنك فعله الآن:</h3>\n<ul>\n<li>تصفح كتالوج المنتجات</li>\n<li>طلب عروض أسعار</li>\n<li>التواصل مع الموردين</li>\n</ul>\n<p><a href="{{link}}">ابدأ الآن</a></p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.WELCOME_MESSAGE,
      channel: MessageChannel.EMAIL,
      language: 'en',
      name: 'Welcome Email',
      subject: 'Welcome to SINI CAR',
      body: '<h2>Hello {{customerName}},</h2>\n<p>Thank you for joining SINI CAR B2B auto parts platform.</p>\n<p>We are happy to have you with us!</p>\n<h3>What you can do now:</h3>\n<ul>\n<li>Browse product catalog</li>\n<li>Request quotes</li>\n<li>Connect with suppliers</li>\n</ul>\n<p><a href="{{link}}">Get Started</a></p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.PAYMENT_REMINDER,
      channel: MessageChannel.WHATSAPP,
      language: 'ar',
      name: 'تذكير بالدفع',
      subject: null,
      body: 'مرحباً {{customerName}}،\n\nهذا تذكير بأن الدفعة رقم {{paymentNumber}} بقيمة {{amount}} {{currency}} مستحقة في {{dueDate}}.\n\nيرجى إتمام الدفع لتجنب أي تأخير.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.PAYMENT_REMINDER,
      channel: MessageChannel.WHATSAPP,
      language: 'en',
      name: 'Payment Reminder',
      subject: null,
      body: 'Hello {{customerName}},\n\nThis is a reminder that payment #{{paymentNumber}} of {{amount}} {{currency}} is due on {{dueDate}}.\n\nPlease complete the payment to avoid any delays.\n\nSINI CAR',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.SUPPLIER_APPLICATION_APPROVED,
      channel: MessageChannel.EMAIL,
      language: 'ar',
      name: 'بريد قبول طلب المورد',
      subject: 'تمت الموافقة على طلبك كمورد - SINI CAR',
      body: '<h2>مرحباً {{supplierName}}،</h2>\n<p>يسعدنا إبلاغك بأنه تمت الموافقة على طلبك للانضمام كمورد في منصة SINI CAR.</p>\n<p>يمكنك الآن تسجيل الدخول والبدء في عرض منتجاتك.</p>\n<p><a href="{{link}}">الدخول إلى لوحة التحكم</a></p>',
      isDefault: true,
      isActive: true
    },
    {
      event: MessageEvent.SUPPLIER_APPLICATION_APPROVED,
      channel: MessageChannel.EMAIL,
      language: 'en',
      name: 'Supplier Application Approved Email',
      subject: 'Your Supplier Application Approved - SINI CAR',
      body: '<h2>Hello {{supplierName}},</h2>\n<p>We are pleased to inform you that your application to join as a supplier on SINI CAR has been approved.</p>\n<p>You can now log in and start listing your products.</p>\n<p><a href="{{link}}">Go to Dashboard</a></p>',
      isDefault: true,
      isActive: true
    }
  ];

  for (const template of messageTemplates) {
    const existing = await prisma.messageTemplate.findFirst({
      where: { event: template.event, channel: template.channel, language: template.language }
    });
    if (!existing) {
      await prisma.messageTemplate.create({ data: template });
    }
  }

  console.log('✅ Message templates created');

  const templateVariables = [
    { event: MessageEvent.QUOTE_CREATED, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.QUOTE_CREATED, code: 'quoteNumber', name: 'Quote Number', nameAr: 'رقم عرض السعر', sampleValue: 'QT-2024-001', isRequired: true, sortOrder: 1 },
    { event: MessageEvent.QUOTE_CREATED, code: 'itemCount', name: 'Item Count', nameAr: 'عدد القطع', sampleValue: '5', isRequired: false, sortOrder: 2 },
    { event: MessageEvent.QUOTE_CREATED, code: 'link', name: 'Quote Link', nameAr: 'رابط عرض السعر', sampleValue: 'https://sinicar.com/quotes/123', isRequired: false, sortOrder: 3 },
    { event: MessageEvent.QUOTE_APPROVED, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.QUOTE_APPROVED, code: 'quoteNumber', name: 'Quote Number', nameAr: 'رقم عرض السعر', sampleValue: 'QT-2024-001', isRequired: true, sortOrder: 1 },
    { event: MessageEvent.QUOTE_APPROVED, code: 'totalAmount', name: 'Total Amount', nameAr: 'المبلغ الإجمالي', sampleValue: '5000', isRequired: true, sortOrder: 2 },
    { event: MessageEvent.QUOTE_APPROVED, code: 'currency', name: 'Currency', nameAr: 'العملة', sampleValue: 'SAR', isRequired: false, sortOrder: 3 },
    { event: MessageEvent.ORDER_CREATED, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.ORDER_CREATED, code: 'orderNumber', name: 'Order Number', nameAr: 'رقم الطلب', sampleValue: 'ORD-2024-001', isRequired: true, sortOrder: 1 },
    { event: MessageEvent.ORDER_CREATED, code: 'totalAmount', name: 'Total Amount', nameAr: 'المبلغ الإجمالي', sampleValue: '5000', isRequired: true, sortOrder: 2 },
    { event: MessageEvent.ORDER_CREATED, code: 'currency', name: 'Currency', nameAr: 'العملة', sampleValue: 'SAR', isRequired: false, sortOrder: 3 },
    { event: MessageEvent.ORDER_SHIPPED, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.ORDER_SHIPPED, code: 'orderNumber', name: 'Order Number', nameAr: 'رقم الطلب', sampleValue: 'ORD-2024-001', isRequired: true, sortOrder: 1 },
    { event: MessageEvent.ORDER_SHIPPED, code: 'trackingNumber', name: 'Tracking Number', nameAr: 'رقم التتبع', sampleValue: 'TRK123456', isRequired: false, sortOrder: 2 },
    { event: MessageEvent.ORDER_SHIPPED, code: 'shippingCompany', name: 'Shipping Company', nameAr: 'شركة الشحن', sampleValue: 'أرامكس', isRequired: false, sortOrder: 3 },
    { event: MessageEvent.PASSWORD_RESET, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.PASSWORD_RESET, code: 'resetCode', name: 'Reset Code', nameAr: 'رمز إعادة التعيين', sampleValue: '123456', isRequired: true, sortOrder: 1 },
    { event: MessageEvent.PASSWORD_RESET, code: 'link', name: 'Reset Link', nameAr: 'رابط إعادة التعيين', sampleValue: 'https://sinicar.com/reset/abc123', isRequired: false, sortOrder: 2 },
    { event: MessageEvent.PASSWORD_RESET, code: 'expiryMinutes', name: 'Expiry Minutes', nameAr: 'صلاحية بالدقائق', sampleValue: '30', isRequired: false, sortOrder: 3 },
    { event: MessageEvent.WELCOME_MESSAGE, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.WELCOME_MESSAGE, code: 'link', name: 'Platform Link', nameAr: 'رابط المنصة', sampleValue: 'https://sinicar.com', isRequired: false, sortOrder: 1 },
    { event: MessageEvent.PAYMENT_REMINDER, code: 'customerName', name: 'Customer Name', nameAr: 'اسم العميل', sampleValue: 'أحمد محمد', isRequired: true, sortOrder: 0 },
    { event: MessageEvent.PAYMENT_REMINDER, code: 'paymentNumber', name: 'Payment Number', nameAr: 'رقم الدفعة', sampleValue: '3', isRequired: true, sortOrder: 1 },
    { event: MessageEvent.PAYMENT_REMINDER, code: 'amount', name: 'Amount', nameAr: 'المبلغ', sampleValue: '1000', isRequired: true, sortOrder: 2 },
    { event: MessageEvent.PAYMENT_REMINDER, code: 'currency', name: 'Currency', nameAr: 'العملة', sampleValue: 'SAR', isRequired: false, sortOrder: 3 },
    { event: MessageEvent.PAYMENT_REMINDER, code: 'dueDate', name: 'Due Date', nameAr: 'تاريخ الاستحقاق', sampleValue: '2024-01-15', isRequired: true, sortOrder: 4 }
  ];

  for (const variable of templateVariables) {
    const existing = await prisma.messageTemplateVariable.findFirst({
      where: { event: variable.event, code: variable.code }
    });
    if (!existing) {
      await prisma.messageTemplateVariable.create({ data: variable });
    }
  }

  console.log('✅ Template variables created');

  await prisma.messageSettings.upsert({
    where: { key: 'global' },
    update: {},
    create: {
      key: 'global',
      defaultLanguage: 'ar',
      enableWhatsApp: true,
      enableEmail: true,
      enableNotifications: true
    }
  });

  console.log('✅ Message settings created');

  // ============ Report Definitions ============
  const reportDefinitions = [
    {
      code: 'SALES_SUMMARY',
      name: 'Sales Summary Report',
      nameAr: 'تقرير ملخص المبيعات',
      nameEn: 'Sales Summary Report',
      description: 'Overview of sales performance with totals and trends',
      descriptionAr: 'نظرة عامة على أداء المبيعات مع الإجماليات والاتجاهات',
      descriptionEn: 'Overview of sales performance with totals and trends',
      category: 'SALES',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
      isActive: true,
      sortOrder: 0
    },
    {
      code: 'QUOTES_STATUS',
      name: 'Quotes Status Report',
      nameAr: 'تقرير حالة طلبات التسعير',
      nameEn: 'Quotes Status Report',
      description: 'Status breakdown of all quote requests',
      descriptionAr: 'تفصيل حالات جميع طلبات التسعير',
      descriptionEn: 'Status breakdown of all quote requests',
      category: 'QUOTES',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
      isActive: true,
      sortOrder: 1
    },
    {
      code: 'QUOTES_OVERVIEW',
      name: 'Quotes Overview Report',
      nameAr: 'تقرير نظرة عامة على طلبات التسعير',
      nameEn: 'Quotes Overview Report',
      description: 'Counts and totals of quotes by status, customer and date range',
      descriptionAr: 'إحصائيات ومجاميع طلبات التسعير حسب الحالة والعميل والفترة الزمنية',
      descriptionEn: 'Counts and totals of quotes by status, customer and date range',
      category: 'QUOTES',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'SALES_MANAGER', 'SALES_STAFF'],
      isActive: true,
      sortOrder: 1
    },
    {
      code: 'SUPPLIER_PERFORMANCE',
      name: 'Supplier Performance Report',
      nameAr: 'تقرير أداء الموردين',
      nameEn: 'Supplier Performance Report',
      description: 'Performance metrics for all suppliers',
      descriptionAr: 'مقاييس أداء جميع الموردين',
      descriptionEn: 'Performance metrics for all suppliers',
      category: 'SUPPLIERS',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      isActive: true,
      sortOrder: 2
    },
    {
      code: 'STOCK_LEVELS',
      name: 'Stock Levels Report',
      nameAr: 'تقرير مستويات المخزون',
      nameEn: 'Stock Levels Report',
      description: 'Current stock levels and low stock alerts',
      descriptionAr: 'مستويات المخزون الحالية وتنبيهات انخفاض المخزون',
      descriptionEn: 'Current stock levels and low stock alerts',
      category: 'INVENTORY',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
      isActive: true,
      sortOrder: 3
    },
    {
      code: 'CUSTOMER_ACTIVITY',
      name: 'Customer Activity Report',
      nameAr: 'تقرير نشاط العملاء',
      nameEn: 'Customer Activity Report',
      description: 'Customer engagement and activity metrics',
      descriptionAr: 'مقاييس تفاعل ونشاط العملاء',
      descriptionEn: 'Customer engagement and activity metrics',
      category: 'CUSTOMERS',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      isActive: true,
      sortOrder: 4
    },
    {
      code: 'REVENUE_BREAKDOWN',
      name: 'Revenue Breakdown Report',
      nameAr: 'تقرير تفصيل الإيرادات',
      nameEn: 'Revenue Breakdown Report',
      description: 'Detailed revenue analysis by category and time period',
      descriptionAr: 'تحليل تفصيلي للإيرادات حسب الفئة والفترة الزمنية',
      descriptionEn: 'Detailed revenue analysis by category and time period',
      category: 'FINANCE',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      isActive: true,
      sortOrder: 5
    },
    {
      code: 'ORDER_FULFILLMENT',
      name: 'Order Fulfillment Report',
      nameAr: 'تقرير تنفيذ الطلبات',
      nameEn: 'Order Fulfillment Report',
      description: 'Order processing and fulfillment metrics',
      descriptionAr: 'مقاييس معالجة وتنفيذ الطلبات',
      descriptionEn: 'Order processing and fulfillment metrics',
      category: 'ORDERS',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
      isActive: true,
      sortOrder: 6
    },
    {
      code: 'USER_AUDIT_LOG',
      name: 'User Audit Log Report',
      nameAr: 'تقرير سجل تدقيق المستخدمين',
      nameEn: 'User Audit Log Report',
      description: 'Audit trail of user actions and system events',
      descriptionAr: 'سجل تتبع إجراءات المستخدمين وأحداث النظام',
      descriptionEn: 'Audit trail of user actions and system events',
      category: 'AUDIT',
      allowedRoles: ['SUPER_ADMIN'],
      isActive: true,
      sortOrder: 7
    }
  ];

  for (const report of reportDefinitions) {
    await prisma.reportDefinition.upsert({
      where: { code: report.code },
      update: {
        name: report.name,
        nameAr: report.nameAr,
        nameEn: report.nameEn,
        description: report.description,
        descriptionAr: report.descriptionAr,
        descriptionEn: report.descriptionEn,
        category: report.category,
        allowedRoles: report.allowedRoles,
        isActive: report.isActive,
        sortOrder: report.sortOrder
      },
      create: report
    });
  }

  console.log('✅ Report definitions created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
