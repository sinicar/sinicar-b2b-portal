/**
 * ثوابت وأنواع نظام المنتجات الشامل
 * Product System Constants and Types
 */

// ==================== مصادر المنتجات ====================

export type ProductSource = 'OUR_PRODUCTS' | 'LOCAL_SUPPLIER' | 'INTERNATIONAL_SUPPLIER';

export const PRODUCT_SOURCES: Record<ProductSource, { ar: string; en: string; icon: string }> = {
    OUR_PRODUCTS: { ar: 'منتجاتنا', en: 'Our Products', icon: '🏢' },
    LOCAL_SUPPLIER: { ar: 'مورد محلي', en: 'Local Supplier', icon: '🇸🇦' },
    INTERNATIONAL_SUPPLIER: { ar: 'مورد دولي', en: 'International Supplier', icon: '🌍' }
};

// ==================== رموز الجودة ====================

export interface QualityCode {
    id: string;
    code: string;          // الرمز المختصر (A, C, G)
    nameAr: string;        // الاسم بالعربي
    nameEn: string;        // الاسم بالإنجليزي
    color: string;         // لون العرض
    priority: number;      // ترتيب الأولوية in search results
    isActive: boolean;
    createdAt: string;
}

// رموز الجودة الافتراضية
export const DEFAULT_QUALITY_CODES: QualityCode[] = [
    { id: 'q1', code: 'A', nameAr: 'أصلي', nameEn: 'OEM', color: '#22c55e', priority: 1, isActive: true, createdAt: new Date().toISOString() },
    { id: 'q2', code: 'C', nameAr: 'تجاري', nameEn: 'Aftermarket', color: '#3b82f6', priority: 2, isActive: true, createdAt: new Date().toISOString() },
    { id: 'q3', code: 'G', nameAr: 'وكالة', nameEn: 'Genuine', color: '#a855f7', priority: 3, isActive: true, createdAt: new Date().toISOString() }
];

// ==================== العملات ====================

export interface Currency {
    code: string;
    nameAr: string;
    nameEn: string;
    symbol: string;
    exchangeRate: number;  // سعر الصرف مقابل الريال السعودي
}

export const CURRENCIES: Currency[] = [
    { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', exchangeRate: 1 },
    { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', exchangeRate: 3.75 },
    { code: 'EUR', nameAr: 'يورو', nameEn: 'Euro', symbol: '€', exchangeRate: 4.10 },
    { code: 'GBP', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', symbol: '£', exchangeRate: 4.70 },
    { code: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 1.02 },
    { code: 'CNY', nameAr: 'يوان صيني', nameEn: 'Chinese Yuan', symbol: '¥', exchangeRate: 0.52 },
    { code: 'JPY', nameAr: 'ين ياباني', nameEn: 'Japanese Yen', symbol: '¥', exchangeRate: 0.025 },
    { code: 'KRW', nameAr: 'وون كوري', nameEn: 'Korean Won', symbol: '₩', exchangeRate: 0.0028 },
    { code: 'TRY', nameAr: 'ليرة تركية', nameEn: 'Turkish Lira', symbol: '₺', exchangeRate: 0.11 },
    { code: 'INR', nameAr: 'روبية هندية', nameEn: 'Indian Rupee', symbol: '₹', exchangeRate: 0.045 }
];

// ==================== المنتج ====================

export interface ProductItem {
    id: string;
    partNumber: string;            // رقم القطعة
    partName: string;              // اسم القطعة (عربي أو مترجم)
    originalName?: string;         // الاسم الأصلي (للموردين الدوليين)
    qualityCode: string;           // رمز الجودة
    quantity: number;              // الكمية المتوفرة
    price: number;                 // السعر بالريال
    originalPrice?: number;        // السعر الأصلي (للموردين الدوليين)
    currency?: string;             // العملة الأصلية
    source: ProductSource;         // مصدر المنتج
    supplierId?: string;           // معرف المورد
    supplierName?: string;         // اسم المورد
    isQualityMatched: boolean;     // هل رمز الجودة متطابق؟
    rawQualityCode?: string;       // رمز الجودة الأصلي (إذا كان خاطئ)
    lastUpdated: string;           // آخر تحديث
    createdAt: string;
    isOutOfStock: boolean;         // نفذت الكمية
    uploadBatchId?: string;        // معرف دفعة الرفع
}

// ==================== دفعة الرفع ====================

export interface UploadBatch {
    id: string;
    source: ProductSource;
    supplierId?: string;
    supplierName?: string;
    currency?: string;
    fileName: string;
    totalItems: number;
    matchedItems: number;
    unmatchedItems: number;
    uploadedBy: string;
    uploadedAt: string;
}

// ==================== إحصائيات المنتجات ====================

export interface ProductStats {
    totalProducts: number;
    ourProducts: number;
    localSupplierProducts: number;
    internationalSupplierProducts: number;
    inStock: number;
    outOfStock: number;
    unmatchedQuality: number;
    byQuality: Record<string, number>;
}

// ==================== هيكل ملف Excel ====================

export interface ExcelProductRow {
    partNumber: string;
    partName: string;
    qualityCode: string;
    quantity: number;
    price?: number;
}

// الأعمدة المتوقعة في ملف Excel
export const EXCEL_COLUMN_MAPPING = {
    partNumber: ['رقم القطعة', 'Part Number', 'PartNo', 'Part#', 'رقم', 'Number'],
    partName: ['اسم القطعة', 'Part Name', 'Name', 'Description', 'اسم', 'الوصف'],
    qualityCode: ['رمز الجودة', 'Quality', 'Quality Code', 'الجودة', 'Grade', 'Type'],
    quantity: ['الكمية', 'Quantity', 'Qty', 'Stock', 'المخزون', 'كمية'],
    price: ['السعر', 'Price', 'Unit Price', 'سعر', 'Rate']
};

// ==================== خدمة الترجمة (placeholder) ====================

export interface TranslationCache {
    original: string;
    translated: string;
    confidence: number;
    createdAt: string;
}

// قاموس ترجمات شائعة لقطع السيارات
export const COMMON_TRANSLATIONS: Record<string, string> = {
    'oil filter': 'فلتر زيت',
    'air filter': 'فلتر هواء',
    'brake pad': 'بطانة فرامل',
    'brake disc': 'قرص فرامل',
    'spark plug': 'بوجي',
    'water pump': 'طرمبة مياه',
    'fuel pump': 'طرمبة بنزين',
    'alternator': 'دينمو',
    'starter': 'مارش',
    'battery': 'بطارية',
    'radiator': 'رديتر',
    'thermostat': 'ثرموستات',
    'timing belt': 'سير التايمن',
    'fan belt': 'سير مروحة',
    'clutch': 'دبرياج',
    'gearbox': 'قير',
    'shock absorber': 'مساعد',
    'suspension': 'نظام التعليق',
    'steering': 'دركسون',
    'cv joint': 'كوبلن',
    'wheel bearing': 'رولمان بلي',
    'tie rod': 'تاي رود',
    'ball joint': 'مفصل كروي',
    'control arm': 'ذراع السفلي',
    'engine mount': 'مخدة مكينة',
    'exhaust': 'شكمان',
    'muffler': 'علبة شكمان',
    'headlight': 'شمعة قدام',
    'tail light': 'شمعة خلف',
    'mirror': 'مرايا',
    'bumper': 'صدام',
    'fender': 'رفرف',
    'hood': 'كبوت',
    'door': 'باب',
    'window': 'زجاج',
    'wiper': 'مساحة',
    'sensor': 'حساس',
    'oxygen sensor': 'حساس أكسجين',
    'abs sensor': 'حساس ABS',
    'camshaft sensor': 'حساس كامة',
    'crankshaft sensor': 'حساس كرنك'
};

// ==================== حالات الرفع ====================

export type UploadStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export const UPLOAD_STATUS_LABELS: Record<UploadStatus, { ar: string; en: string; color: string }> = {
    PENDING: { ar: 'قيد الانتظار', en: 'Pending', color: '#f59e0b' },
    PROCESSING: { ar: 'جاري المعالجة', en: 'Processing', color: '#3b82f6' },
    COMPLETED: { ar: 'مكتمل', en: 'Completed', color: '#22c55e' },
    FAILED: { ar: 'فشل', en: 'Failed', color: '#ef4444' }
};

// ==================== دوال مساعدة ====================

/**
 * تحويل السعر للريال السعودي
 */
export const convertToSAR = (amount: number, currencyCode: string): number => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) return amount;
    return Math.round(amount * currency.exchangeRate * 100) / 100;
};

/**
 * البحث عن ترجمة شائعة
 */
export const findCommonTranslation = (text: string): string | null => {
    const lowerText = text.toLowerCase().trim();

    // بحث مباشر
    if (COMMON_TRANSLATIONS[lowerText]) {
        return COMMON_TRANSLATIONS[lowerText];
    }

    // بحث جزئي
    for (const [en, ar] of Object.entries(COMMON_TRANSLATIONS)) {
        if (lowerText.includes(en)) {
            return lowerText.replace(en, ar);
        }
    }

    return null;
};

/**
 * التحقق من رمز الجودة
 */
export const isValidQualityCode = (code: string, qualityCodes: QualityCode[]): boolean => {
    return qualityCodes.some(qc => qc.code.toUpperCase() === code.toUpperCase() && qc.isActive);
};

/**
 * تنسيق السعر
 */
export const formatPrice = (amount: number, currency: string = 'SAR'): string => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return `${amount.toLocaleString('ar-SA')} ${curr?.symbol || currency}`;
};

/**
 * إنشاء معرف فريد
 */
export const generateProductId = (): string => {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateBatchId = (): string => {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
