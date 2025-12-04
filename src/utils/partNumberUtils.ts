
/**
 * تحويل الأرقام العربية (المشرقية) إلى أرقام إنجليزية
 */
function convertArabicToEnglishNumerals(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/**
 * تنظيف رقم القطعة:
 * - تحويل الأحرف إلى Capital
 * - تحويل الأرقام العربية لإنجليزية
 * - إزالة أي رمز ليس حرفاً أو رقماً
 */
export function normalizePartNumberRaw(value: string): string {
  if (!value) return "";
  let clean = convertArabicToEnglishNumerals(value);
  clean = clean.toUpperCase();
  // إبقاء الحروف الإنجليزية A-Z والأرقام 0-9 فقط
  clean = clean.replace(/[^A-Z0-9]/g, "");
  return clean;
}

/**
 * استخراج الجوهر الرقمي فقط (للبحث بالأرقام فقط)
 * مثال: "ANSR10000" -> "10000"
 */
export function extractNumericCore(value: string): string {
  const clean = normalizePartNumberRaw(value);
  // استبدال أي شيء ليس رقماً بـ ""
  return clean.replace(/[^0-9]/g, "");
}

/**
 * بناء فهرس رقم القطعة للمنتج
 */
export function buildPartIndex(partNumber: string): { clean: string; numericCore: string } {
  return {
    clean: normalizePartNumberRaw(partNumber),
    numericCore: extractNumericCore(partNumber)
  };
}
