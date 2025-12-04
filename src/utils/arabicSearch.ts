
import { Product } from '../types';
import { extractNumericCore, normalizePartNumberRaw } from './partNumberUtils';

/**
 * دالة لتطبيع النصوص العربية وتوحيد الحروف
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .trim()
    // توحيد الألفات
    .replace(/[أإآ]/g, 'ا')
    // توحيد الهاء والتاء المربوطة (سنعتمد الهاء للتعميم)
    .replace(/ة/g, 'ه')
    // توحيد الياء والألف المقصورة
    .replace(/ى/g, 'ي')
    // إزالة التشكيل (الفتحة، الضمة، الكسرة، إلخ)
    .replace(/[\u064B-\u065F]/g, '')
    // إزالة المدة والرموز الخاصة
    .replace(/[ـ]/g, '')
    // إزالة الهمزات المفردة إن وجدت في غير مواضعها (اختياري، لكن مفيد)
    .replace(/ء/g, '')
    // إزالة أي رموز غير حرفية (نبقي الأحرف العربية والإنجليزية والأرقام)
    .replace(/[^\w\s\u0600-\u06FF]/g, ' '); 
}

/**
 * تقسيم النص إلى كلمات (Tokens) مع تجاهل الكلمات القصيرة جداً
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeArabic(text);
  return normalized
    .split(/\s+/)
    .filter(word => word.length >= 2); // تجاهل الكلمات المكونة من حرف واحد
}

/**
 * حساب مسافة ليفنشتاين (Levenshtein Distance) لقياس التشابه بين كلمتين
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * حساب درجة التطابق بين جملة البحث والنص المستهدف
 */
export function scoreMatch(query: string, target: string): number {
  const queryTokens = tokenize(query);
  const targetTokens = tokenize(target);

  let totalScore = 0;

  for (const qToken of queryTokens) {
    let maxTokenScore = 0;

    for (const tToken of targetTokens) {
      let currentScore = 0;

      // 1. تطابق تام
      if (qToken === tToken) {
        currentScore = 3;
      }
      // 2. تطابق جزئي (الكلمة جزء من كلمة في الهدف)
      else if (tToken.includes(qToken)) {
        currentScore = 2;
      }
      // 3. تطابق ضبابي (Typo tolerance)
      else {
        // نسمح بخطأ واحد لكل 4 حروف تقريباً
        const dist = levenshteinDistance(qToken, tToken);
        const allowedErrors = Math.floor(qToken.length / 3) + 1; // e.g., length 3-5 -> 1 error, 6+ -> 2 errors
        
        if (dist <= 1 || (qToken.length > 4 && dist <= allowedErrors)) {
             currentScore = 1;
        }
      }

      if (currentScore > maxTokenScore) {
        maxTokenScore = currentScore;
      }
    }

    totalScore += maxTokenScore;
  }

  return totalScore;
}

/**
 * دالة البحث الرئيسية في المنتجات
 * تدعم الآن البحث الذكي بأرقام القطع
 */
export function searchProducts(query: string, products: Product[]): Product[] {
  if (!query.trim()) return [];

  const isPartSearch = /[0-9٠-٩]/.test(query); // هل يحتوي البحث على أرقام؟
  let queryClean = "";
  let queryNumeric = "";

  if (isPartSearch) {
      queryClean = normalizePartNumberRaw(query);
      queryNumeric = extractNumericCore(query);
  }

  const results = products.map(product => {
    let score = 0;

    // 1. حساب درجة تطابق رقم القطعة (إذا كان البحث يحتوي على أرقام)
    if (isPartSearch && queryClean.length > 2) { // تأكد من أن البحث ليس مجرد رقم عشوائي قصير
        const pNormalized = product.normalizedPart || normalizePartNumberRaw(product.partNumber);
        const pNumeric = product.numericPartCore || extractNumericCore(product.partNumber);

        if (pNormalized === queryClean) {
            score += 15; // تطابق تام لرقم القطعة
        } else if (pNumeric === queryNumeric && pNumeric.length > 3) {
            score += 10; // تطابق للأرقام الجوهرية (تجاهل البادئة/اللاحقة)
        } else if (pNumeric.includes(queryNumeric) || queryNumeric.includes(pNumeric)) {
            // احتواء جزئي للأرقام (بشرط طول معقول)
            if(queryNumeric.length > 4) score += 6; 
            else if(queryNumeric.length > 2) score += 3;
        } else if (pNormalized.includes(queryClean)) {
            score += 4; // احتواء جزئي للنص النظيف
        }
    }

    // 2. حساب درجة تطابق النصوص (أسماء، وصف)
    // إذا وجدنا تطابق قوي في رقم القطعة، لا داعي للتركيز كثيراً على النص، لكن نبقيه لزيادة الدقة
    
    const targetText = [
      product.name,
      product.brand,
      product.category || '',
      product.description || ''
    ].join(' ');

    score += scoreMatch(query, targetText);

    return { product, score };
  });

  // تصفية النتائج وترتيبها
  return results
    .filter(item => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}
