/**
 * AI Knowledge Base - قاعدة المعرفة للذكاء الاصطناعي
 * 
 * هذا الملف يحتوي على وصف شامل لكل ملف ووظيفة في المشروع
 * يستخدمه مركز أوامر AI لفهم الموقع بالكامل
 */

export interface FileKnowledge {
  path: string;
  description: string;
  descriptionAr: string;
  type: 'component' | 'service' | 'utility' | 'style' | 'config' | 'type' | 'api';
  dependencies?: string[];
  exports?: string[];
  canModify: boolean;
  modificationRisk: 'low' | 'medium' | 'high';
}

export interface SystemModule {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  files: string[];
  mainEntry: string;
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    name: 'Authentication',
    nameAr: 'نظام المصادقة',
    description: 'Handles user login, logout, session management, and password reset',
    descriptionAr: 'يتحكم في تسجيل الدخول والخروج وإدارة الجلسات وإعادة تعيين كلمة المرور',
    files: ['src/App.tsx', 'src/components/Register.tsx', 'backend/src/modules/auth/'],
    mainEntry: 'src/App.tsx'
  },
  {
    name: 'Customer Dashboard',
    nameAr: 'لوحة تحكم العميل',
    description: 'Main customer portal with product search, cart, orders, and organization management',
    descriptionAr: 'بوابة العميل الرئيسية للبحث والسلة والطلبات وإدارة الفريق',
    files: ['src/components/Dashboard.tsx', 'src/components/ProductSearchPage.tsx', 'src/components/OrdersPage.tsx'],
    mainEntry: 'src/components/Dashboard.tsx'
  },
  {
    name: 'Admin Dashboard',
    nameAr: 'لوحة تحكم المدير',
    description: 'Administrative control panel with customer management, orders, products, and settings',
    descriptionAr: 'لوحة تحكم المدير لإدارة العملاء والطلبات والمنتجات والإعدادات',
    files: ['src/components/AdminDashboard.tsx', 'src/components/AdminCustomersPage.tsx', 'src/components/AdminOrdersManager.tsx'],
    mainEntry: 'src/components/AdminDashboard.tsx'
  },
  {
    name: 'Supplier Portal',
    nameAr: 'بوابة الموردين',
    description: 'Portal for suppliers to manage products, quotes, and catalog',
    descriptionAr: 'بوابة للموردين لإدارة المنتجات وعروض الأسعار والكتالوج',
    files: ['src/components/SupplierPortal.tsx', 'src/components/SupplierInstallmentPage.tsx'],
    mainEntry: 'src/components/SupplierPortal.tsx'
  },
  {
    name: 'Trader Tools',
    nameAr: 'أدوات التاجر',
    description: 'Advanced tools including VIN extractor, price comparison, and PDF to Excel converter',
    descriptionAr: 'أدوات متقدمة تشمل استخراج VIN ومقارنة الأسعار وتحويل PDF إلى Excel',
    files: ['src/components/TraderToolsHub.tsx', 'src/components/VinExtractorTool.tsx', 'src/components/PriceComparisonTool.tsx', 'src/components/PdfToExcelTool.tsx'],
    mainEntry: 'src/components/TraderToolsHub.tsx'
  },
  {
    name: 'Installment System',
    nameAr: 'نظام التقسيط',
    description: 'Wholesale installment purchase system with credit profiles and payment schedules',
    descriptionAr: 'نظام شراء بالجملة بالتقسيط مع ملفات ائتمان وجداول سداد',
    files: ['src/components/AdminInstallmentsPage.tsx', 'src/components/CustomerInstallmentPage.tsx', 'src/components/SupplierInstallmentPage.tsx'],
    mainEntry: 'src/components/AdminInstallmentsPage.tsx'
  },
  {
    name: 'Marketing & Ads',
    nameAr: 'التسويق والإعلانات',
    description: 'Marketing campaigns, ads management, and promotional content',
    descriptionAr: 'حملات تسويقية وإدارة إعلانات ومحتوى ترويجي',
    files: ['src/components/AdminMarketingCenter.tsx', 'src/components/AdminAdvertisingPage.tsx', 'src/components/MarketingDisplay.tsx'],
    mainEntry: 'src/components/AdminMarketingCenter.tsx'
  },
  {
    name: 'AI System',
    nameAr: 'نظام الذكاء الاصطناعي',
    description: 'AI assistant, command center, and AI training settings',
    descriptionAr: 'مساعد AI ومركز الأوامر وإعدادات تدريب AI',
    files: ['src/components/AIAssistant.tsx', 'src/components/AdminAICommandCenter.tsx', 'src/components/AdminAISettings.tsx', 'src/components/AdminAITrainingPage.tsx'],
    mainEntry: 'src/components/AdminAICommandCenter.tsx'
  },
  {
    name: 'Messaging',
    nameAr: 'نظام الرسائل',
    description: 'Messaging center with WhatsApp, email, and notification templates',
    descriptionAr: 'مركز الرسائل مع واتساب والبريد الإلكتروني وقوالب الإشعارات',
    files: ['src/components/AdminMessagingCenter.tsx', 'backend/src/modules/messaging/'],
    mainEntry: 'src/components/AdminMessagingCenter.tsx'
  },
  {
    name: 'Permissions',
    nameAr: 'نظام الصلاحيات',
    description: 'Unified permission center with role-based access control and permission management',
    descriptionAr: 'مركز الصلاحيات الموحد للتحكم في الوصول بناءً على الأدوار وإدارة الصلاحيات',
    files: ['src/components/UnifiedPermissionCenter.tsx', 'src/services/PermissionContext.tsx', 'src/stores/useAuthStore.ts'],
    mainEntry: 'src/components/UnifiedPermissionCenter.tsx'
  }
];

export const FILES_KNOWLEDGE: FileKnowledge[] = [
  // === MAIN ENTRY POINTS ===
  {
    path: 'src/App.tsx',
    description: 'Main application entry point with routing, authentication, and provider setup',
    descriptionAr: 'نقطة دخول التطبيق الرئيسية مع التوجيه والمصادقة وإعداد الموفرين',
    type: 'component',
    dependencies: ['Dashboard', 'AdminDashboard', 'SupplierPortal', 'Register'],
    exports: ['AppContent', 'App'],
    canModify: true,
    modificationRisk: 'high'
  },
  {
    path: 'src/types.ts',
    description: 'TypeScript type definitions for all entities (User, Product, Order, etc.)',
    descriptionAr: 'تعريفات TypeScript لجميع الكيانات (المستخدم، المنتج، الطلب، إلخ)',
    type: 'type',
    exports: ['User', 'Product', 'Order', 'BusinessProfile', 'Notification'],
    canModify: true,
    modificationRisk: 'high'
  },
  {
    path: 'src/index.css',
    description: 'Global styles and Tailwind CSS customizations',
    descriptionAr: 'الأنماط العامة وتخصيصات Tailwind CSS',
    type: 'style',
    canModify: true,
    modificationRisk: 'low'
  },

  // === COMPONENTS ===
  {
    path: 'src/components/Dashboard.tsx',
    description: 'Main customer dashboard with sidebar navigation, product search, cart, and orders',
    descriptionAr: 'لوحة تحكم العميل الرئيسية مع التنقل الجانبي والبحث والسلة والطلبات',
    type: 'component',
    dependencies: ['Api', 'OrganizationContext', 'CustomerPortalSettingsContext'],
    canModify: true,
    modificationRisk: 'medium'
  },
  {
    path: 'src/components/AdminDashboard.tsx',
    description: 'Admin control panel with statistics, customer management, and settings',
    descriptionAr: 'لوحة تحكم المدير مع الإحصائيات وإدارة العملاء والإعدادات',
    type: 'component',
    dependencies: ['Api', 'PermissionContext', 'AdminBadgesContext'],
    canModify: true,
    modificationRisk: 'medium'
  },
  {
    path: 'src/components/SupplierPortal.tsx',
    description: 'Supplier portal for managing products, catalogs, and quote requests',
    descriptionAr: 'بوابة الموردين لإدارة المنتجات والكتالوج وطلبات الأسعار',
    type: 'component',
    canModify: true,
    modificationRisk: 'medium'
  },
  {
    path: 'src/components/Register.tsx',
    description: 'User registration form for new account applications',
    descriptionAr: 'نموذج تسجيل المستخدم لطلبات الحسابات الجديدة',
    type: 'component',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/components/AIAssistant.tsx',
    description: 'Floating AI chat assistant widget for user help',
    descriptionAr: 'مساعد الدردشة AI العائم لمساعدة المستخدم',
    type: 'component',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/components/AdminAICommandCenter.tsx',
    description: 'AI Command Center for executing admin commands via natural language',
    descriptionAr: 'مركز أوامر AI لتنفيذ أوامر المدير باللغة الطبيعية',
    type: 'component',
    canModify: true,
    modificationRisk: 'medium'
  },
  {
    path: 'src/components/ProductSearchPage.tsx',
    description: 'Product search interface with filters and results display',
    descriptionAr: 'واجهة البحث عن المنتجات مع الفلاتر وعرض النتائج',
    type: 'component',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/components/OrdersPage.tsx',
    description: 'Customer orders list and order details view',
    descriptionAr: 'قائمة طلبات العميل وعرض تفاصيل الطلب',
    type: 'component',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/components/TraderToolsHub.tsx',
    description: 'Hub for advanced trader tools (VIN, Price Comparison, PDF conversion)',
    descriptionAr: 'مركز أدوات التاجر المتقدمة (VIN، مقارنة الأسعار، تحويل PDF)',
    type: 'component',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/components/TeamManagementPage.tsx',
    description: 'Team and organization management with invitations and roles',
    descriptionAr: 'إدارة الفريق والمنظمة مع الدعوات والأدوار',
    type: 'component',
    canModify: true,
    modificationRisk: 'low'
  },

  // === SERVICES ===
  {
    path: 'src/services/Api.ts',
    description: 'Mock backend API with localStorage persistence (6486 lines)',
    descriptionAr: 'واجهة API وهمية مع حفظ البيانات في localStorage',
    type: 'service',
    exports: ['Api'],
    canModify: true,
    modificationRisk: 'high'
  },
  {
    path: 'src/services/LanguageContext.tsx',
    description: 'Language management context for i18n support (4 languages)',
    descriptionAr: 'سياق إدارة اللغة لدعم الترجمة (4 لغات)',
    type: 'service',
    exports: ['LanguageProvider', 'useLanguage'],
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/services/ToastContext.tsx',
    description: 'Toast notification system context',
    descriptionAr: 'سياق نظام إشعارات Toast',
    type: 'service',
    exports: ['ToastProvider', 'useToast'],
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/services/OrganizationContext.tsx',
    description: 'Organization and team state management',
    descriptionAr: 'إدارة حالة المنظمة والفريق',
    type: 'service',
    exports: ['OrganizationProvider', 'useOrganization'],
    canModify: true,
    modificationRisk: 'medium'
  },
  {
    path: 'src/services/PermissionContext.tsx',
    description: 'Admin permission and role-based access control',
    descriptionAr: 'صلاحيات المدير والتحكم في الوصول بناءً على الأدوار',
    type: 'service',
    exports: ['PermissionProvider', 'usePermission'],
    canModify: true,
    modificationRisk: 'medium'
  },
  {
    path: 'src/services/pricingEngine.ts',
    description: 'Pricing calculation engine with levels and matrices',
    descriptionAr: 'محرك حساب الأسعار مع المستويات والمصفوفات',
    type: 'service',
    canModify: true,
    modificationRisk: 'high'
  },
  {
    path: 'src/services/i18n.ts',
    description: 'Internationalization setup with react-i18next',
    descriptionAr: 'إعداد الترجمة مع react-i18next',
    type: 'service',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/services/aiService.ts',
    description: 'AI service for OpenAI API integration',
    descriptionAr: 'خدمة AI للتكامل مع OpenAI API',
    type: 'service',
    canModify: true,
    modificationRisk: 'low'
  },

  // === LOCALES ===
  {
    path: 'src/locales/ar.json',
    description: 'Arabic translation file',
    descriptionAr: 'ملف الترجمة العربية',
    type: 'config',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/locales/en.json',
    description: 'English translation file',
    descriptionAr: 'ملف الترجمة الإنجليزية',
    type: 'config',
    canModify: true,
    modificationRisk: 'low'
  },

  // === UTILITIES ===
  {
    path: 'src/utils/arabicSearch.ts',
    description: 'Arabic text normalization and search utilities',
    descriptionAr: 'أدوات تطبيع النص العربي والبحث',
    type: 'utility',
    canModify: true,
    modificationRisk: 'low'
  },
  {
    path: 'src/utils/dateUtils.ts',
    description: 'Date formatting and manipulation utilities',
    descriptionAr: 'أدوات تنسيق وتعديل التاريخ',
    type: 'utility',
    canModify: true,
    modificationRisk: 'low'
  },

  // === BACKEND ===
  {
    path: 'backend/src/server.ts',
    description: 'Express server entry point',
    descriptionAr: 'نقطة دخول خادم Express',
    type: 'api',
    canModify: true,
    modificationRisk: 'high'
  },
  {
    path: 'backend/prisma/schema.prisma',
    description: 'Database schema definition with Prisma ORM',
    descriptionAr: 'تعريف مخطط قاعدة البيانات مع Prisma ORM',
    type: 'config',
    canModify: true,
    modificationRisk: 'high'
  }
];

export const USER_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    nameAr: 'مدير عام',
    permissions: ['all'],
    description: 'Full system access'
  },
  ADMIN: {
    name: 'Admin',
    nameAr: 'مدير',
    permissions: ['manage_users', 'manage_orders', 'manage_products', 'view_reports'],
    description: 'Administrative access without system settings'
  },
  STAFF: {
    name: 'Staff',
    nameAr: 'موظف',
    permissions: ['view_orders', 'process_orders'],
    description: 'Limited operational access'
  },
  CUSTOMER: {
    name: 'Customer',
    nameAr: 'عميل',
    permissions: ['view_products', 'create_orders', 'view_own_orders'],
    description: 'Customer portal access'
  },
  SUPPLIER: {
    name: 'Supplier',
    nameAr: 'مورد',
    permissions: ['manage_catalog', 'respond_quotes'],
    description: 'Supplier portal access'
  },
  MARKETER: {
    name: 'Marketer',
    nameAr: 'مسوق',
    permissions: ['view_referrals', 'view_commissions'],
    description: 'Affiliate marketing access'
  }
};

export const COMMAND_CAPABILITIES = {
  create_page: {
    name: 'Create Page',
    nameAr: 'إنشاء صفحة',
    description: 'Create new dynamic pages',
    examples: ['أنشئ صفحة للعروض الخاصة', 'Create a new promotions page']
  },
  add_user: {
    name: 'Add User',
    nameAr: 'إضافة مستخدم',
    description: 'Add new users to the system',
    examples: ['أضف مستخدم جديد اسمه أحمد', 'Add user named Ahmed with admin role']
  },
  edit_settings: {
    name: 'Edit Settings',
    nameAr: 'تعديل الإعدادات',
    description: 'Modify system settings',
    examples: ['غير لون الموقع إلى الأخضر', 'Change site color to green']
  },
  add_translation: {
    name: 'Add Translation',
    nameAr: 'إضافة ترجمة',
    description: 'Add or modify translations',
    examples: ['ترجم صفحة العملاء', 'Translate customers page']
  },
  scan_system: {
    name: 'Scan System',
    nameAr: 'فحص النظام',
    description: 'Scan for errors and issues',
    examples: ['افحص النظام', 'Scan for errors']
  },
  generate_report: {
    name: 'Generate Report',
    nameAr: 'إنشاء تقرير',
    description: 'Generate system reports',
    examples: ['أنشئ تقرير المبيعات', 'Generate sales report']
  }
};

export const SYSTEM_HEALTH_CHECKS = [
  {
    id: 'api_connectivity',
    name: 'API Connectivity',
    nameAr: 'اتصال API',
    check: 'Verify backend API is responding'
  },
  {
    id: 'database_status',
    name: 'Database Status',
    nameAr: 'حالة قاعدة البيانات',
    check: 'Check database connection and integrity'
  },
  {
    id: 'localstorage_usage',
    name: 'LocalStorage Usage',
    nameAr: 'استخدام التخزين المحلي',
    check: 'Monitor localStorage capacity'
  },
  {
    id: 'translation_completeness',
    name: 'Translation Coverage',
    nameAr: 'تغطية الترجمة',
    check: 'Check for missing translations'
  },
  {
    id: 'component_errors',
    name: 'Component Errors',
    nameAr: 'أخطاء المكونات',
    check: 'Detect React component errors'
  },
  {
    id: 'security_audit',
    name: 'Security Audit',
    nameAr: 'تدقيق أمني',
    check: 'Check for security vulnerabilities'
  }
];

export function getKnowledgeForAI(language: 'ar' | 'en' = 'ar'): string {
  const isAr = language === 'ar';

  let knowledge = isAr
    ? '# قاعدة معرفة نظام SINI CAR\n\n'
    : '# SINI CAR System Knowledge Base\n\n';

  knowledge += isAr
    ? '## نظرة عامة\n'
    : '## Overview\n';
  knowledge += isAr
    ? 'هذا نظام B2B لبيع قطع غيار السيارات الصينية بالجملة.\n\n'
    : 'This is a B2B wholesale system for Chinese auto parts.\n\n';

  knowledge += isAr ? '## الوحدات الرئيسية\n' : '## Main Modules\n';
  SYSTEM_MODULES.forEach(module => {
    knowledge += `- **${isAr ? module.nameAr : module.name}**: ${isAr ? module.descriptionAr : module.description}\n`;
  });

  knowledge += isAr ? '\n## أنواع المستخدمين\n' : '\n## User Types\n';
  Object.entries(USER_ROLES).forEach(([key, role]) => {
    knowledge += `- **${isAr ? role.nameAr : role.name}**: ${role.description}\n`;
  });

  knowledge += isAr ? '\n## الأوامر المتاحة\n' : '\n## Available Commands\n';
  Object.entries(COMMAND_CAPABILITIES).forEach(([key, cmd]) => {
    knowledge += `- **${isAr ? cmd.nameAr : cmd.name}**: ${cmd.description}\n`;
    knowledge += `  ${isAr ? 'أمثلة' : 'Examples'}: ${cmd.examples.join(', ')}\n`;
  });

  return knowledge;
}

export function getFileInfo(filePath: string): FileKnowledge | undefined {
  return FILES_KNOWLEDGE.find(f => f.path === filePath);
}

export function searchKnowledge(query: string): FileKnowledge[] {
  const lowerQuery = query.toLowerCase();
  return FILES_KNOWLEDGE.filter(f =>
    f.path.toLowerCase().includes(lowerQuery) ||
    f.description.toLowerCase().includes(lowerQuery) ||
    f.descriptionAr.includes(query)
  );
}
