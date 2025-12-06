import { PrismaClient, SupplierType } from '@prisma/client';

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
    { code: 'MARKETER', name: 'Marketer', nameAr: 'مسوق', description: 'Affiliate marketer', isSystem: true, sortOrder: 7 },
    { code: 'ADVERTISER', name: 'Advertiser', nameAr: 'معلن', description: 'Advertising account', isSystem: true, sortOrder: 8 }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role
    });
  }

  console.log('✅ Roles created');

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
    { code: 'MANAGE_MESSAGE_TEMPLATES', name: 'Manage Message Templates', nameAr: 'إدارة قوالب الرسائل', module: 'messages', category: 'TOOLS', sortOrder: 7 },
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
    { key: 'feature.ai_translation', name: 'AI Translation', nameAr: 'الترجمة الذكية', isEnabled: true },
    { key: 'feature.supplier_marketplace', name: 'Supplier Marketplace', nameAr: 'سوق الموردين', isEnabled: true },
    { key: 'feature.installments', name: 'Installment System', nameAr: 'نظام التقسيط', isEnabled: true },
    { key: 'feature.trader_tools', name: 'Trader Tools', nameAr: 'أدوات التاجر', isEnabled: true },
    { key: 'feature.product_images', name: 'Product Images', nameAr: 'صور المنتجات', isEnabled: true },
    { key: 'feature.price_comparison', name: 'Price Comparison', nameAr: 'مقارنة الأسعار', isEnabled: true }
  ];

  for (const ff of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: ff.key },
      update: {},
      create: { ...ff, enabledFor: [] }
    });
  }

  console.log('✅ Feature flags created');

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
