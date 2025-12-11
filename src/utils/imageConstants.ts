/**
 * ثوابت وأنواع نظام صور المنتجات
 * Product Image Management Constants & Types
 */

// حالات الصورة
export const IMAGE_STATUSES = {
    PENDING: 'PENDING',           // معلقة للموافقة
    APPROVED: 'APPROVED',         // تم الموافقة
    REJECTED: 'REJECTED',         // مرفوضة
    AUTO_MATCHED: 'AUTO_MATCHED'  // تم الربط تلقائياً (للإدارة)
} as const;

export type ImageStatus = typeof IMAGE_STATUSES[keyof typeof IMAGE_STATUSES];

// أنواع الرافعين
export const UPLOADER_TYPES = {
    ADMIN: 'ADMIN',
    SUPPLIER_LOCAL: 'SUPPLIER_LOCAL',
    SUPPLIER_INTERNATIONAL: 'SUPPLIER_INTERNATIONAL',
    MARKETER: 'MARKETER'
} as const;

export type UploaderType = typeof UPLOADER_TYPES[keyof typeof UPLOADER_TYPES];

// مواقع العلامة المائية
export const WATERMARK_POSITIONS = {
    CENTER: 'CENTER',           // الوسط
    TOP_LEFT: 'TOP_LEFT',
    TOP_RIGHT: 'TOP_RIGHT',
    BOTTOM_LEFT: 'BOTTOM_LEFT',
    BOTTOM_RIGHT: 'BOTTOM_RIGHT',
    TILE: 'TILE'                // متكرر
} as const;

export type WatermarkPosition = typeof WATERMARK_POSITIONS[keyof typeof WATERMARK_POSITIONS];

// أحجام خط العلامة المائية
export const WATERMARK_FONT_SIZES = {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE'
} as const;

export type WatermarkFontSize = typeof WATERMARK_FONT_SIZES[keyof typeof WATERMARK_FONT_SIZES];

// أنواع العلامة المائية
export const WATERMARK_TYPES = {
    TEXT: 'TEXT',
    LOGO: 'LOGO',
    BOTH: 'BOTH'
} as const;

export type WatermarkType = typeof WATERMARK_TYPES[keyof typeof WATERMARK_TYPES];

// واجهة صورة المنتج
export interface ProductImage {
    id: string;
    partNumber: string;               // رقم القطعة (قد يكون فارغ للصور غير المربوطة)
    fileName: string;                 // اسم الملف الأصلي
    fileUrl: string;                  // رابط الصورة (base64 أو URL)
    thumbnailUrl?: string;            // صورة مصغرة
    originalSize: number;             // الحجم الأصلي بالبايت
    compressedSize: number;           // الحجم بعد الضغط
    width?: number;
    height?: number;
    status: ImageStatus;
    uploadedBy: string;               // معرف المستخدم
    uploaderType: UploaderType;
    uploaderName: string;
    isAutoMatched: boolean;           // هل تم الربط تلقائياً بناءً على اسم الملف
    isLinkedToProduct: boolean;       // هل مربوطة بمنتج موجود
    adminNotes?: string;              // ملاحظات الإدارة
    rejectionReason?: string;         // سبب الرفض
    createdAt: string;
    approvedAt?: string;
    approvedBy?: string;
}

// إعدادات العلامة المائية
export interface WatermarkSettings {
    enabled: boolean;
    type: WatermarkType;
    text: string;                     // نص العلامة المائية
    logoUrl?: string;                 // رابط الشعار
    position: WatermarkPosition;
    opacity: number;                  // 0.1 - 0.9
    fontSize: WatermarkFontSize;
    textColor: string;                // لون النص (hex)
    rotation: number;                 // درجة الدوران (0-360)
    margin: number;                   // الهامش بالبكسل
}

// إحصائيات الصور
export interface ImageStats {
    totalProducts: number;
    productsWithImages: number;
    productsWithoutImages: number;
    coveragePercent: number;
    pendingApproval: number;
    totalImages: number;
    imagesByUploader: {
        admin: number;
        supplierLocal: number;
        supplierInternational: number;
        marketer: number;
    };
    unmatchedImages: number;          // صور غير مربوطة بمنتجات
}

// صيغ الصور المقبولة
export const ACCEPTED_IMAGE_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff'
];

export const ACCEPTED_IMAGE_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'
];

// الحد الأقصى للحجم (5MB بعد الضغط)
export const MAX_COMPRESSED_SIZE_MB = 5;
export const MAX_COMPRESSED_SIZE_BYTES = MAX_COMPRESSED_SIZE_MB * 1024 * 1024;

// الحد الأقصى للصور في الرفع الدفعي
export const MAX_BULK_UPLOAD_COUNT = 100;

// الإعدادات الافتراضية للعلامة المائية
export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
    enabled: true,
    type: 'BOTH',
    text: 'SINI CAR',
    logoUrl: '',
    position: 'CENTER',
    opacity: 0.3,
    fontSize: 'MEDIUM',
    textColor: '#ffffff',
    rotation: -30,
    margin: 20
};

// ترجمات الحالات
export const IMAGE_STATUS_LABELS: Record<ImageStatus, { ar: string; en: string; color: string }> = {
    PENDING: { ar: 'معلقة للموافقة', en: 'Pending Approval', color: 'amber' },
    APPROVED: { ar: 'تم الموافقة', en: 'Approved', color: 'green' },
    REJECTED: { ar: 'مرفوضة', en: 'Rejected', color: 'red' },
    AUTO_MATCHED: { ar: 'ربط تلقائي', en: 'Auto Matched', color: 'blue' }
};

// ترجمات أنواع الرافعين
export const UPLOADER_TYPE_LABELS: Record<UploaderType, { ar: string; en: string }> = {
    ADMIN: { ar: 'الإدارة', en: 'Admin' },
    SUPPLIER_LOCAL: { ar: 'مورد محلي', en: 'Local Supplier' },
    SUPPLIER_INTERNATIONAL: { ar: 'مورد دولي', en: 'International Supplier' },
    MARKETER: { ar: 'مسوق', en: 'Marketer' }
};

// ترجمات مواقع العلامة المائية
export const WATERMARK_POSITION_LABELS: Record<WatermarkPosition, { ar: string; en: string }> = {
    CENTER: { ar: 'الوسط', en: 'Center' },
    TOP_LEFT: { ar: 'أعلى يسار', en: 'Top Left' },
    TOP_RIGHT: { ar: 'أعلى يمين', en: 'Top Right' },
    BOTTOM_LEFT: { ar: 'أسفل يسار', en: 'Bottom Left' },
    BOTTOM_RIGHT: { ar: 'أسفل يمين', en: 'Bottom Right' },
    TILE: { ar: 'متكرر', en: 'Tile' }
};

// ترجمات أحجام الخط
export const WATERMARK_FONT_SIZE_LABELS: Record<WatermarkFontSize, { ar: string; en: string; px: number }> = {
    SMALL: { ar: 'صغير', en: 'Small', px: 16 },
    MEDIUM: { ar: 'متوسط', en: 'Medium', px: 24 },
    LARGE: { ar: 'كبير', en: 'Large', px: 36 }
};
