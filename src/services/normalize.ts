/**
 * Normalize List Response Helper
 * توحيد parsing لنتائج القوائم من Backend
 * 
 * يدعم الأشكال التالية:
 * - { success: true, data: { items: [], total: 0 } }
 * - { data: { items: [], total: 0 } }
 * - { items: [], total: 0 }
 * - { data: [] }
 * - []
 */

export interface NormalizedListResponse<T = unknown> {
  items: T[];
  total: number;
}

/**
 * تحويل أي شكل من أشكال responses القوائم إلى شكل موحد
 * @param result - الاستجابة من API
 * @returns { items: T[], total: number }
 */
export function normalizeListResponse<T = unknown>(result: unknown): NormalizedListResponse<T> {
  // Handle null/undefined
  if (!result) {
    return { items: [], total: 0 };
  }

  // Handle direct array
  if (Array.isArray(result)) {
    return { items: result as T[], total: result.length };
  }

  const res = result as Record<string, unknown>;

  // Try to extract items
  let items: T[];
  
  // Check nested paths: result.data.items, result.items, result.data, result
  if (res.data && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>;
    if (Array.isArray(data.items)) {
      items = data.items as T[];
    } else if (Array.isArray(data)) {
      items = data as unknown as T[];
    } else {
      items = [];
    }
  } else if (Array.isArray(res.items)) {
    items = res.items as T[];
  } else if (Array.isArray(res.orders)) {
    // دعم شكل { orders: [] } من backend orders endpoints
    items = res.orders as T[];
  } else if (Array.isArray(res.quotes)) {
    // دعم شكل { quotes: [] } من backend quotes endpoints
    items = res.quotes as T[];
  } else if (Array.isArray(res.notifications)) {
    // دعم شكل { notifications: [] } من backend notifications endpoints
    items = res.notifications as T[];
  } else if (Array.isArray(res.customers)) {
    // دعم شكل { customers: [] } من backend customers endpoints
    items = res.customers as T[];
  } else if (Array.isArray(res.data)) {
    items = res.data as T[];
  } else {
    items = [];
  }

  // Try to extract total
  let total: number;
  
  if (res.data && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>;
    total = typeof data.total === 'number' ? data.total : 
            typeof res.total === 'number' ? res.total : 
            items.length;
  } else {
    total = typeof res.total === 'number' ? res.total : items.length;
  }

  return { items, total };
}

/**
 * Safe access لـ array length - يمنع undefined errors
 */
export function safeLength(arr: unknown[] | undefined | null): number {
  return Array.isArray(arr) ? arr.length : 0;
}
