/**
 * دوال التنسيق الموحدة - SINI CAR B2B
 * 
 * استخدم هذه الدوال بدلاً من toLocaleString() المباشر
 * لضمان تنسيق موحد في جميع أنحاء التطبيق
 */

// ===== تنسيق العملة =====

/**
 * تنسيق المبلغ بالريال السعودي
 * @param amount - المبلغ (رقم)
 * @param showCurrency - عرض رمز العملة (افتراضي: true)
 * @returns المبلغ المنسق مع العملة
 * 
 * @example
 * formatCurrency(1500) // "1,500 ر.س"
 * formatCurrency(1500, false) // "1,500"
 */
export function formatCurrency(amount: number | undefined | null, showCurrency = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showCurrency ? '0 ر.س' : '0';
  }
  const formatted = amount.toLocaleString('ar-SA');
  return showCurrency ? `${formatted} ر.س` : formatted;
}

/**
 * تنسيق المبلغ بـ SAR (للتقارير الإنجليزية)
 */
export function formatCurrencySAR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 SAR';
  }
  return `${amount.toLocaleString('en-US')} SAR`;
}

// ===== تنسيق الأرقام =====

/**
 * تنسيق الأرقام بفواصل الآلاف
 * @param value - الرقم
 * @param locale - اللغة (افتراضي: ar-SA)
 * 
 * @example
 * formatNumber(1500) // "1,500"
 */
export function formatNumber(value: number | undefined | null, locale: 'ar-SA' | 'en-US' = 'ar-SA'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString(locale);
}

/**
 * تنسيق الأرقام العشرية
 * @param value - الرقم
 * @param decimals - عدد الخانات العشرية (افتراضي: 2)
 * 
 * @example
 * formatDecimal(3.14159, 2) // "3.14"
 */
export function formatDecimal(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toFixed(decimals);
}

/**
 * تنسيق النسبة المئوية
 * @param value - الرقم (0-100)
 * 
 * @example
 * formatPercent(85.5) // "85.5%"
 */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(1)}%`;
}

// ===== تنسيق التاريخ =====

/**
 * تنسيق التاريخ والوقت
 * @param date - التاريخ (string أو Date)
 * @param locale - اللغة (افتراضي: ar-SA)
 * 
 * @example
 * formatDateTime('2025-01-15T10:30:00') // "15/1/2025، 10:30 ص"
 */
export function formatDateTime(date: string | Date | undefined | null, locale: 'ar-SA' | 'en-US' = 'ar-SA'): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(locale);
  } catch {
    return '-';
  }
}

/**
 * تنسيق التاريخ فقط (بدون الوقت)
 */
export function formatDate(date: string | Date | undefined | null, locale: 'ar-SA' | 'en-US' = 'ar-SA'): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale);
  } catch {
    return '-';
  }
}

/**
 * تنسيق الوقت فقط
 */
export function formatTime(date: string | Date | undefined | null, locale: 'ar-SA' | 'en-US' = 'ar-SA'): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(locale);
  } catch {
    return '-';
  }
}

// ===== تنسيق حجم الملفات =====

/**
 * تنسيق حجم الملف
 * @param bytes - الحجم بالبايت
 * 
 * @example
 * formatFileSize(1536) // "1.5 KB"
 * formatFileSize(1048576) // "1.0 MB"
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ===== تنسيق التقييمات =====

/**
 * تنسيق التقييم (النجوم)
 * @param rating - التقييم (0-5)
 * 
 * @example
 * formatRating(4.5) // "4.5"
 */
export function formatRating(rating: number | undefined | null): string {
  if (rating === undefined || rating === null || isNaN(rating)) {
    return '0.0';
  }
  return rating.toFixed(1);
}
