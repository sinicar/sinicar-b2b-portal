export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  colorClass: string; // Tailwind class for gradient
  buttonText: string;
  imageUrl?: string;
  link?: string;
  isActive: boolean;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  status: 'Healthy' | 'Failing' | 'Inactive';
}

export interface ApiConfig {
  baseUrl: string;
  authToken: string;
  enableLiveSync: boolean;
  endpoints: {
    products: string;
    orders: string;
    customers: string;
  };
  webhookSecret?: string;
  // Advanced Integration Features
  environment: 'SANDBOX' | 'PRODUCTION';
  syncInterval: 'REALTIME' | '15MIN' | 'HOURLY' | 'DAILY';
  syncEntities: {
    products: boolean;
    inventory: boolean;
    prices: boolean;
    customers: boolean;
    orders: boolean;
  };
  webhooks: { url: string; events: string[]; active: boolean }[];
  fieldMapping: string; // JSON String for mapping
  debugMode: boolean;
  rateLimit: string; // Requests per minute
  // New Data Sharing Settings
  sharedData?: string[]; // Which data types to share via API
  syncDirection?: 'PULL' | 'PUSH' | 'BIDIRECTIONAL'; // Direction of sync
  timeout?: string; // Connection timeout in seconds
  retryOnFail?: boolean; // Retry failed requests
}

// Status Labels Configuration - Centralized status display names
export interface StatusLabelItem {
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  sortOrder?: number;
}

export interface StatusLabelsConfig {
  orderStatus: Record<string, StatusLabelItem>;
  orderInternalStatus: Record<string, StatusLabelItem>;
  accountRequestStatus: Record<string, StatusLabelItem>;
  quoteRequestStatus: Record<string, StatusLabelItem>;
  quoteItemStatus: Record<string, StatusLabelItem>;
  missingStatus: Record<string, StatusLabelItem>;
  importRequestStatus: Record<string, StatusLabelItem>;
  customerStatus: Record<string, StatusLabelItem>;
  staffStatus: Record<string, StatusLabelItem>;
}

export interface ProductImagesSettings {
  enabled: boolean;                     // Show product images in search and details
  supplierUploadEnabled: boolean;       // Allow suppliers to upload images
  maxSizeMb: number;                    // Max file size in MB (default: 5)
  allowedTypes: string[];               // Allowed MIME types
  defaultPlaceholderUrl?: string;       // Custom placeholder image URL
}

// نصوص صفحات الدخول والتسجيل القابلة للتعديل
export interface AuthPageTexts {
  // صفحة تسجيل الدخول
  loginTitle?: string;
  loginSubtitle?: string;
  loginClientIdLabel?: string;
  loginClientIdPlaceholder?: string;
  loginPasswordLabel?: string;
  loginPasswordPlaceholder?: string;
  loginButtonText?: string;
  loginForgotPasswordText?: string;
  loginNoAccountText?: string;
  loginRegisterLinkText?: string;
  
  // صفحة طلب فتح حساب
  registerTitle?: string;
  registerSubtitle?: string;
  registerBusinessNameLabel?: string;
  registerBusinessNamePlaceholder?: string;
  registerOwnerNameLabel?: string;
  registerOwnerNamePlaceholder?: string;
  registerPhoneLabel?: string;
  registerPhonePlaceholder?: string;
  registerEmailLabel?: string;
  registerEmailPlaceholder?: string;
  registerCityLabel?: string;
  registerCityPlaceholder?: string;
  registerBusinessTypeLabel?: string;
  registerNotesLabel?: string;
  registerNotesPlaceholder?: string;
  registerButtonText?: string;
  registerHaveAccountText?: string;
  registerLoginLinkText?: string;
}

// إعدادات الشاشة المنبثقة للكميات
export interface QuantityModalSettings {
  mode: 'draggable' | 'hideSearch'; // وضع السحب أو إخفاء نتائج البحث
  defaultPosition?: { x: number; y: number }; // الموقع الافتراضي للنافذة
}

// إعدادات النقاط المضافة تلقائياً عند تغيير حالة الطلب
export interface OrderStatusPointsConfig {
  enabled: boolean;                              // تفعيل/إيقاف الإضافة التلقائية
  pointsPerStatus: Record<string, number>;       // النقاط لكل حالة (مثل: DELIVERED: 5)
}

// Guest Mode Visibility Settings - Controls what guests can see/access
export interface GuestModeSettings {
  // What sections are visible (but blurred) on home page
  showBusinessTypes?: boolean;      // قسم "من نخدم" (أنواع الأعمال)
  showMainServices?: boolean;       // قسم الخدمات الرئيسية
  showHowItWorks?: boolean;         // قسم "كيف تعمل المنظومة"
  showWhySiniCar?: boolean;         // قسم "لماذا صيني كار"
  showCart?: boolean;               // عربة التسوق الجانبية
  showMarketingCards?: boolean;     // بطاقات التسويق الجانبية
  
  // Blur settings
  blurIntensity?: 'light' | 'medium' | 'heavy';  // شدة التشويش
  showBlurOverlay?: boolean;        // إظهار overlay فوق المحتوى المشوش
  
  // Pages accessible to guests (empty = none except HOME)
  allowedPages?: string[];          // الصفحات المسموح الوصول إليها
  
  // Search settings
  allowSearch?: boolean;            // السماح بالبحث (نتائج مشوشة)
  showSearchResults?: boolean;      // إظهار نتائج البحث (مشوشة)
}

// Feature Card for "Why Sini Car" section
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: 'box' | 'chart' | 'anchor' | 'headphones' | 'truck' | 'shield' | 'globe' | 'star' | 'clock' | 'award';
  iconColor: string; // Tailwind color class like 'text-cyan-400'
}

export interface ExcelColumnMapping {
  internalField: string;            // اسم الحقل الداخلي (partNumber, name, etc.)
  excelHeader: string;              // اسم العمود في ملف الإكسل
  isEnabled: boolean;               // هل هذا الحقل مفعل للاستيراد؟
  isRequired: boolean;              // هل هو حقل إجباري؟
  defaultValue?: string | number;   // قيمة افتراضية إذا كان العمود فارغًا
}

export interface ExcelColumnPreset {
  id: string;
  name: string;                     // اسم الإعداد (مثل "Onyx Export", "Supplier A")
  isDefault: boolean;               // هل هو الإعداد الافتراضي؟
  mappings: ExcelColumnMapping[];   // قائمة تعيينات الأعمدة
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  siteName: string;
  description?: string;
  supportPhone: string;
  supportWhatsapp?: string;
  supportEmail: string;
  announcementBarColor: string;
  fontFamily: string; // 'Almarai', 'Cairo', 'Tajawal'
  apiConfig: ApiConfig;
  // New Fields
  maintenanceMode: boolean;
  primaryColor: string;
  logoUrl: string;
  // Text Manager
  uiTexts?: Record<string, string>;
  // News Ticker Settings
  tickerEnabled?: boolean;
  tickerText?: string;
  tickerSpeed?: number;
  tickerBgColor?: string;
  tickerTextColor?: string;
  // Status Labels Configuration
  statusLabels?: StatusLabelsConfig;
  
  // --- Product Visibility & Search Settings ---
  minVisibleQty?: number;           // أقل كمية لظهور المنتج للعملاء (default: 1)
  stockThreshold?: number;          // عتبة المخزون لتحديد "نفذت الكمية" (default: 0)
  
  // --- Why Sini Car Section ---
  whySiniCarTitle?: string;         // عنوان القسم
  whySiniCarFeatures?: FeatureCard[]; // بطاقات المميزات
  
  // --- Guest Mode Settings ---
  guestModeEnabled?: boolean;       // تفعيل/إيقاف الدخول كضيف
  
  // --- Guest Visibility Controls ---
  guestSettings?: GuestModeSettings;
  
  // --- إعدادات نقاط البحث التلقائية حسب حالة الطلب ---
  orderStatusPointsConfig?: OrderStatusPointsConfig;
  
  // --- نصوص صفحات الدخول والتسجيل ---
  authPageTexts?: AuthPageTexts;
  
  // --- إعدادات الشاشة المنبثقة للكميات ---
  quantityModalSettings?: QuantityModalSettings;
  
  // --- Product Images Settings (Command 19) ---
  productImagesSettings?: ProductImagesSettings;
}
