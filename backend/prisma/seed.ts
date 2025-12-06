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
    { code: 'SUPER_ADMIN', name: 'Super Admin', nameAr: 'مدير عام', isSystem: true, sortOrder: 0 },
    { code: 'ADMIN', name: 'Admin', nameAr: 'مدير', isSystem: true, sortOrder: 1 },
    { code: 'CUSTOMER_OWNER', name: 'Customer Owner', nameAr: 'صاحب حساب', isSystem: true, sortOrder: 2 },
    { code: 'CUSTOMER_STAFF', name: 'Customer Staff', nameAr: 'موظف', isSystem: true, sortOrder: 3 },
    { code: 'SUPPLIER_LOCAL', name: 'Local Supplier', nameAr: 'مورد محلي', isSystem: true, sortOrder: 4 },
    { code: 'SUPPLIER_INTERNATIONAL', name: 'International Supplier', nameAr: 'مورد دولي', isSystem: true, sortOrder: 5 },
    { code: 'MARKETER', name: 'Marketer', nameAr: 'مسوق', isSystem: true, sortOrder: 6 }
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
    { code: 'products.view', name: 'View Products', nameAr: 'عرض المنتجات', module: 'products', sortOrder: 0 },
    { code: 'products.create', name: 'Create Products', nameAr: 'إضافة منتجات', module: 'products', sortOrder: 1 },
    { code: 'products.edit', name: 'Edit Products', nameAr: 'تعديل المنتجات', module: 'products', sortOrder: 2 },
    { code: 'products.delete', name: 'Delete Products', nameAr: 'حذف المنتجات', module: 'products', sortOrder: 3 },
    { code: 'orders.view', name: 'View Orders', nameAr: 'عرض الطلبات', module: 'orders', sortOrder: 0 },
    { code: 'orders.create', name: 'Create Orders', nameAr: 'إنشاء طلبات', module: 'orders', sortOrder: 1 },
    { code: 'orders.manage', name: 'Manage Orders', nameAr: 'إدارة الطلبات', module: 'orders', sortOrder: 2 },
    { code: 'suppliers.view', name: 'View Suppliers', nameAr: 'عرض الموردين', module: 'suppliers', sortOrder: 0 },
    { code: 'suppliers.manage', name: 'Manage Suppliers', nameAr: 'إدارة الموردين', module: 'suppliers', sortOrder: 1 },
    { code: 'customers.view', name: 'View Customers', nameAr: 'عرض العملاء', module: 'customers', sortOrder: 0 },
    { code: 'customers.manage', name: 'Manage Customers', nameAr: 'إدارة العملاء', module: 'customers', sortOrder: 1 },
    { code: 'settings.view', name: 'View Settings', nameAr: 'عرض الإعدادات', module: 'settings', sortOrder: 0 },
    { code: 'settings.manage', name: 'Manage Settings', nameAr: 'إدارة الإعدادات', module: 'settings', sortOrder: 1 },
    { code: 'reports.view', name: 'View Reports', nameAr: 'عرض التقارير', module: 'reports', sortOrder: 0 },
    { code: 'tools.access', name: 'Access Tools', nameAr: 'الوصول للأدوات', module: 'tools', sortOrder: 0 }
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm
    });
  }

  console.log('✅ Permissions created');

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
