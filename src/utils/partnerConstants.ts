/**
 * Partner Registration Constants
 * ثوابت نظام تسجيل الشركاء
 */

// ماركات السيارات الصينية المتوفرة
export const CAR_BRANDS = [
    { id: 'chery', label: 'شيري Chery', labelEn: 'Chery' },
    { id: 'geely', label: 'جيلي Geely', labelEn: 'Geely' },
    { id: 'haval', label: 'هافال Haval', labelEn: 'Haval' },
    { id: 'mg', label: 'ام جي MG', labelEn: 'MG' },
    { id: 'jac', label: 'جاك JAC', labelEn: 'JAC' },
    { id: 'baic', label: 'بايك BAIC', labelEn: 'BAIC' },
    { id: 'changan', label: 'شانجان Changan', labelEn: 'Changan' },
    { id: 'greatwall', label: 'جريت وول Great Wall', labelEn: 'Great Wall' },
    { id: 'dongfeng', label: 'دونغفينغ Dongfeng', labelEn: 'Dongfeng' },
    { id: 'faw', label: 'فاو FAW', labelEn: 'FAW' },
    { id: 'saic', label: 'سايك SAIC', labelEn: 'SAIC' },
    { id: 'byd', label: 'بي واي دي BYD', labelEn: 'BYD' },
    { id: 'hongqi', label: 'هونشي Hongqi', labelEn: 'Hongqi' },
    { id: 'gac', label: 'جي ايه سي GAC', labelEn: 'GAC' },
    { id: 'wuling', label: 'وولينغ Wuling', labelEn: 'Wuling' },
    { id: 'foton', label: 'فوتون Foton', labelEn: 'Foton' },
    { id: 'zotye', label: 'زوتي Zotye', labelEn: 'Zotye' },
    { id: 'lifan', label: 'ليفان Lifan', labelEn: 'Lifan' },
    { id: 'dfsk', label: 'دي إف إس كيه DFSK', labelEn: 'DFSK' },
    { id: 'jetour', label: 'جيتور Jetour', labelEn: 'Jetour' },
    { id: 'exeed', label: 'إكسيد Exeed', labelEn: 'Exeed' },
    { id: 'tank', label: 'تانك Tank', labelEn: 'Tank' },
    { id: 'ora', label: 'أورا Ora', labelEn: 'Ora' },
    { id: 'other', label: 'أخرى', labelEn: 'Other' },
];

// المدن السعودية
export const SAUDI_CITIES = [
    { id: 'riyadh', label: 'الرياض', region: 'المنطقة الوسطى' },
    { id: 'jeddah', label: 'جدة', region: 'المنطقة الغربية' },
    { id: 'mecca', label: 'مكة المكرمة', region: 'المنطقة الغربية' },
    { id: 'medina', label: 'المدينة المنورة', region: 'المنطقة الغربية' },
    { id: 'dammam', label: 'الدمام', region: 'المنطقة الشرقية' },
    { id: 'khobar', label: 'الخبر', region: 'المنطقة الشرقية' },
    { id: 'dhahran', label: 'الظهران', region: 'المنطقة الشرقية' },
    { id: 'qatif', label: 'القطيف', region: 'المنطقة الشرقية' },
    { id: 'ahsa', label: 'الأحساء', region: 'المنطقة الشرقية' },
    { id: 'jubail', label: 'الجبيل', region: 'المنطقة الشرقية' },
    { id: 'taif', label: 'الطائف', region: 'المنطقة الغربية' },
    { id: 'tabuk', label: 'تبوك', region: 'المنطقة الشمالية' },
    { id: 'abha', label: 'أبها', region: 'المنطقة الجنوبية' },
    { id: 'khamis', label: 'خميس مشيط', region: 'المنطقة الجنوبية' },
    { id: 'yanbu', label: 'ينبع', region: 'المنطقة الغربية' },
    { id: 'hail', label: 'حائل', region: 'المنطقة الشمالية' },
    { id: 'najran', label: 'نجران', region: 'المنطقة الجنوبية' },
    { id: 'jazan', label: 'جازان', region: 'المنطقة الجنوبية' },
    { id: 'baha', label: 'الباحة', region: 'المنطقة الجنوبية' },
    { id: 'buraidah', label: 'بريدة', region: 'القصيم' },
    { id: 'unaizah', label: 'عنيزة', region: 'القصيم' },
    { id: 'arar', label: 'عرعر', region: 'الحدود الشمالية' },
    { id: 'sakaka', label: 'سكاكا', region: 'الجوف' },
    { id: 'qunfudah', label: 'القنفذة', region: 'المنطقة الغربية' },
    { id: 'hofuf', label: 'الهفوف', region: 'المنطقة الشرقية' },
];

// طرق التسويق للمسوقين
export const MARKETING_CHANNELS = [
    { id: 'instagram', label: 'انستقرام', labelEn: 'Instagram', icon: 'instagram' },
    { id: 'twitter', label: 'تويتر (X)', labelEn: 'Twitter (X)', icon: 'twitter' },
    { id: 'tiktok', label: 'تيك توك', labelEn: 'TikTok', icon: 'video' },
    { id: 'snapchat', label: 'سناب شات', labelEn: 'Snapchat', icon: 'camera' },
    { id: 'whatsapp', label: 'واتساب', labelEn: 'WhatsApp', icon: 'message-circle' },
    { id: 'youtube', label: 'يوتيوب', labelEn: 'YouTube', icon: 'youtube' },
    { id: 'facebook', label: 'فيسبوك', labelEn: 'Facebook', icon: 'facebook' },
    { id: 'field', label: 'تسويق ميداني', labelEn: 'Field Marketing', icon: 'map-pin' },
    { id: 'referral', label: 'إحالة عملاء', labelEn: 'Customer Referral', icon: 'users' },
    { id: 'other', label: 'أخرى', labelEn: 'Other', icon: 'more-horizontal' },
];

// أنواع الإعلانات
export const AD_TYPES = [
    { id: 'banner', label: 'بانر إعلاني', labelEn: 'Banner Ad', description: 'يظهر في صفحات الموقع' },
    { id: 'popup', label: 'نافذة منبثقة', labelEn: 'Popup', description: 'يظهر عند دخول الموقع' },
    { id: 'notification', label: 'إشعار', labelEn: 'Notification', description: 'إشعار في جرس التنبيهات' },
];

// فترات الإعلان
export const AD_DURATIONS = [
    { days: 7, label: 'أسبوع واحد', labelEn: '1 Week' },
    { days: 14, label: 'أسبوعين', labelEn: '2 Weeks' },
    { days: 30, label: 'شهر واحد', labelEn: '1 Month' },
    { days: 60, label: 'شهرين', labelEn: '2 Months' },
    { days: 90, label: 'ثلاثة أشهر', labelEn: '3 Months' },
    { days: 180, label: 'ستة أشهر', labelEn: '6 Months' },
    { days: 365, label: 'سنة كاملة', labelEn: '1 Year' },
];

// الدول للموردين الدوليين
export const COUNTRIES = [
    { code: 'CN', label: 'الصين', labelEn: 'China' },
    { code: 'AE', label: 'الإمارات', labelEn: 'UAE' },
    { code: 'KW', label: 'الكويت', labelEn: 'Kuwait' },
    { code: 'QA', label: 'قطر', labelEn: 'Qatar' },
    { code: 'BH', label: 'البحرين', labelEn: 'Bahrain' },
    { code: 'OM', label: 'عمان', labelEn: 'Oman' },
    { code: 'TR', label: 'تركيا', labelEn: 'Turkey' },
    { code: 'IN', label: 'الهند', labelEn: 'India' },
    { code: 'TH', label: 'تايلاند', labelEn: 'Thailand' },
    { code: 'JP', label: 'اليابان', labelEn: 'Japan' },
    { code: 'KR', label: 'كوريا الجنوبية', labelEn: 'South Korea' },
    { code: 'MY', label: 'ماليزيا', labelEn: 'Malaysia' },
    { code: 'OTHER', label: 'أخرى', labelEn: 'Other' },
];

// أنواع الأعمال للموردين الدوليين
export const BUSINESS_TYPES = [
    { id: 'factory', label: 'مصنع', labelEn: 'Factory', icon: 'factory' },
    { id: 'supplier', label: 'سبلاير / موزع', labelEn: 'Supplier / Distributor', icon: 'truck' },
    { id: 'agent', label: 'وكيل', labelEn: 'Agent', icon: 'briefcase' },
];

// حالات طلب الشراكة
export const PARTNER_REQUEST_STATUSES = {
    NEW: { label: 'طلب جديد', labelEn: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    UNDER_REVIEW: { label: 'قيد المراجعة', labelEn: 'Under Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    APPROVED: { label: 'تمت الموافقة', labelEn: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' },
    REJECTED: { label: 'مرفوض', labelEn: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
    NEEDS_MODIFICATION: { label: 'يحتاج تعديل', labelEn: 'Needs Modification', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

// أنواع الشركاء
export const PARTNER_TYPES = {
    LOCAL_SUPPLIER: {
        label: 'مورد محلي',
        labelEn: 'Local Supplier',
        icon: 'building-2',
        color: 'bg-emerald-600',
        description: 'موردين من داخل المملكة العربية السعودية'
    },
    INTERNATIONAL_SUPPLIER: {
        label: 'مورد دولي',
        labelEn: 'International Supplier',
        icon: 'globe',
        color: 'bg-blue-600',
        description: 'موردين من خارج المملكة (الصين وغيرها)'
    },
    MARKETER: {
        label: 'مسوق',
        labelEn: 'Marketer',
        icon: 'megaphone',
        color: 'bg-purple-600',
        description: 'مسوقين بالعمولة عبر قنوات مختلفة'
    },
    ADVERTISER: {
        label: 'معلن',
        labelEn: 'Advertiser',
        icon: 'sparkles',
        color: 'bg-amber-600',
        description: 'معلنين يريدون عرض إعلاناتهم في المنصة'
    },
};
