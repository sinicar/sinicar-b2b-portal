/**
 * محرك الفهرسة والتصفية المركزي
 * Central Indexing & Filtering Engine
 * 
 * يدعم:
 * - البحث متعدد اللغات (عربي، إنجليزي، أرقام)
 * - الفهرسة السريعة للجداول الكبيرة
 * - فلاتر متقدمة (نطاق، قائمة، نص)
 * - ترتيب متعدد الأعمدة
 */

// أنواع الفلاتر المدعومة
export type FilterType = 'text' | 'range' | 'list' | 'boolean' | 'date';

// واجهة تعريف الفلتر
export interface FilterDefinition<T = any> {
    field: keyof T;
    type: FilterType;
    label: string;
    placeholder?: string;
    options?: { value: any; label: string }[];
    min?: number;
    max?: number;
}

// قيمة الفلتر النشط
export interface ActiveFilter<T = any> {
    field: keyof T;
    type: FilterType;
    value: any;
    operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
}

// إعدادات الترتيب
export interface SortConfig<T = any> {
    field: keyof T;
    direction: 'asc' | 'desc';
}

// نتيجة البحث والفلترة
export interface FilterResult<T> {
    items: T[];
    totalCount: number;
    filteredCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// تطبيع النص للبحث (عربي وإنجليزي)
export function normalizeText(text: string): string {
    if (!text) return '';
    
    let normalized = text.toString().toLowerCase();
    
    // تطبيع الحروف العربية
    normalized = normalized
        .replace(/[إأآا]/g, 'ا')
        .replace(/[ىي]/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/ء/g, '')
        .replace(/[ًٌٍَُِّْ]/g, '') // إزالة التشكيل
        .replace(/\s+/g, ' ')
        .trim();
    
    return normalized;
}

// تحويل الأرقام العربية إلى إنجليزية
export function normalizeNumbers(text: string): string {
    const arabicNums = '٠١٢٣٤٥٦٧٨٩';
    const englishNums = '0123456789';
    
    let result = text;
    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(arabicNums[i], 'g'), englishNums[i]);
    }
    return result;
}

// فهرسة البيانات
export class DataIndex<T extends Record<string, any>> {
    private data: T[] = [];
    private textIndex: Map<string, Set<number>> = new Map();
    private fieldIndexes: Map<keyof T, Map<any, Set<number>>> = new Map();
    private searchableFields: (keyof T)[] = [];
    
    constructor(items: T[], searchableFields: (keyof T)[]) {
        this.searchableFields = searchableFields;
        this.buildIndex(items);
    }
    
    // بناء الفهرس
    private buildIndex(items: T[]): void {
        this.data = items;
        this.textIndex.clear();
        this.fieldIndexes.clear();
        
        items.forEach((item, idx) => {
            // فهرسة الحقول النصية للبحث السريع
            this.searchableFields.forEach(field => {
                const value = item[field];
                if (value != null) {
                    const normalized = normalizeText(normalizeNumbers(String(value)));
                    const words = normalized.split(/\s+/);
                    
                    words.forEach(word => {
                        if (word.length >= 2) {
                            // فهرسة الكلمة كاملة وأجزائها
                            for (let i = 2; i <= word.length; i++) {
                                const prefix = word.substring(0, i);
                                if (!this.textIndex.has(prefix)) {
                                    this.textIndex.set(prefix, new Set());
                                }
                                this.textIndex.get(prefix)!.add(idx);
                            }
                        }
                    });
                }
                
                // فهرسة القيم للفلترة السريعة
                if (!this.fieldIndexes.has(field)) {
                    this.fieldIndexes.set(field, new Map());
                }
                const fieldIndex = this.fieldIndexes.get(field)!;
                const rawValue = item[field];
                if (!fieldIndex.has(rawValue)) {
                    fieldIndex.set(rawValue, new Set());
                }
                fieldIndex.get(rawValue)!.add(idx);
            });
        });
    }
    
    // البحث السريع
    search(query: string): Set<number> {
        if (!query.trim()) {
            return new Set(this.data.map((_, i) => i));
        }
        
        const normalized = normalizeText(normalizeNumbers(query));
        const words = normalized.split(/\s+/).filter(w => w.length >= 2);
        
        if (words.length === 0) {
            return new Set(this.data.map((_, i) => i));
        }
        
        // البحث في كل كلمة والجمع بين النتائج (AND)
        let result: Set<number> | null = null;
        
        for (const word of words) {
            const wordMatches = new Set<number>();
            
            // البحث في الفهرس
            this.textIndex.forEach((indices, key) => {
                if (key.includes(word) || word.includes(key)) {
                    indices.forEach(i => wordMatches.add(i));
                }
            });
            
            if (result === null) {
                result = wordMatches;
            } else {
                // تقاطع النتائج
                result = new Set([...result].filter(x => wordMatches.has(x)));
            }
        }
        
        return result || new Set();
    }
    
    // الحصول على البيانات
    getData(): T[] {
        return this.data;
    }
    
    // تحديث الفهرس
    rebuild(items: T[]): void {
        this.buildIndex(items);
    }
}

// محرك الفلترة الرئيسي
export class FilterEngine<T extends Record<string, any>> {
    private index: DataIndex<T>;
    private filters: ActiveFilter<T>[] = [];
    private sort: SortConfig<T> | null = null;
    
    constructor(items: T[], searchableFields: (keyof T)[]) {
        this.index = new DataIndex(items, searchableFields);
    }
    
    // تحديث البيانات
    setData(items: T[], searchableFields: (keyof T)[]): void {
        this.index = new DataIndex(items, searchableFields);
    }
    
    // إضافة فلتر
    addFilter(filter: ActiveFilter<T>): void {
        this.filters = this.filters.filter(f => f.field !== filter.field);
        this.filters.push(filter);
    }
    
    // إزالة فلتر
    removeFilter(field: keyof T): void {
        this.filters = this.filters.filter(f => f.field !== field);
    }
    
    // مسح جميع الفلاتر
    clearFilters(): void {
        this.filters = [];
    }
    
    // تعيين الترتيب
    setSort(config: SortConfig<T> | null): void {
        this.sort = config;
    }
    
    // تطبيق فلتر واحد
    private applyFilter(items: T[], filter: ActiveFilter<T>): T[] {
        return items.filter(item => {
            const value = item[filter.field];
            const filterValue = filter.value;
            
            switch (filter.type) {
                case 'text':
                    if (!filterValue) return true;
                    const normalizedValue = normalizeText(normalizeNumbers(String(value || '')));
                    const normalizedFilter = normalizeText(normalizeNumbers(String(filterValue)));
                    return normalizedValue.includes(normalizedFilter);
                    
                case 'range':
                    if (filterValue.min != null && value < filterValue.min) return false;
                    if (filterValue.max != null && value > filterValue.max) return false;
                    return true;
                    
                case 'list':
                    if (!filterValue || filterValue.length === 0) return true;
                    return filterValue.includes(value);
                    
                case 'boolean':
                    if (filterValue === null || filterValue === undefined) return true;
                    return value === filterValue;
                    
                case 'date':
                    if (!filterValue) return true;
                    const itemDate = new Date(value).getTime();
                    if (filterValue.from && itemDate < new Date(filterValue.from).getTime()) return false;
                    if (filterValue.to && itemDate > new Date(filterValue.to).getTime()) return false;
                    return true;
                    
                default:
                    return true;
            }
        });
    }
    
    // تطبيق الترتيب
    private applySort(items: T[]): T[] {
        if (!this.sort) return items;
        
        const { field, direction } = this.sort;
        return [...items].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            // معالجة القيم الفارغة
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return direction === 'asc' ? 1 : -1;
            if (bVal == null) return direction === 'asc' ? -1 : 1;
            
            // مقارنة النصوص
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const comparison = aVal.localeCompare(bVal, 'ar');
                return direction === 'asc' ? comparison : -comparison;
            }
            
            // مقارنة الأرقام
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    // تنفيذ البحث والفلترة
    execute(searchQuery: string = '', page: number = 1, pageSize: number = 20): FilterResult<T> {
        const data = this.index.getData();
        
        // البحث أولاً
        let matchedIndices = this.index.search(searchQuery);
        let results = data.filter((_, i) => matchedIndices.has(i));
        
        // تطبيق الفلاتر
        for (const filter of this.filters) {
            results = this.applyFilter(results, filter);
        }
        
        // تطبيق الترتيب
        results = this.applySort(results);
        
        // الترقيم
        const totalCount = data.length;
        const filteredCount = results.length;
        const totalPages = Math.ceil(filteredCount / pageSize);
        const start = (page - 1) * pageSize;
        const items = results.slice(start, start + pageSize);
        
        return {
            items,
            totalCount,
            filteredCount,
            page,
            pageSize,
            totalPages
        };
    }
    
    // الحصول على قيم فريدة لحقل معين (للفلاتر المنسدلة)
    getUniqueValues(field: keyof T): any[] {
        const data = this.index.getData();
        const values = new Set<any>();
        data.forEach(item => {
            if (item[field] != null) {
                values.add(item[field]);
            }
        });
        return Array.from(values).sort();
    }
    
    // الحصول على نطاق القيم لحقل رقمي
    getRange(field: keyof T): { min: number; max: number } | null {
        const data = this.index.getData();
        let min = Infinity;
        let max = -Infinity;
        let hasValues = false;
        
        data.forEach(item => {
            const value = item[field];
            if (typeof value === 'number') {
                hasValues = true;
                if (value < min) min = value;
                if (value > max) max = value;
            }
        });
        
        return hasValues ? { min, max } : null;
    }
}

// دالة مساعدة لإنشاء محرك فلترة
export function createFilterEngine<T extends Record<string, any>>(
    items: T[],
    searchableFields: (keyof T)[]
): FilterEngine<T> {
    return new FilterEngine(items, searchableFields);
}

// Hook للاستخدام في React
export function useFilterEngine<T extends Record<string, any>>(
    items: T[],
    searchableFields: (keyof T)[],
    initialPageSize: number = 20
) {
    // سيتم استخدام هذا في المكونات
    const engine = createFilterEngine(items, searchableFields);
    
    return {
        engine,
        search: (query: string, page: number = 1) => engine.execute(query, page, initialPageSize),
        addFilter: engine.addFilter.bind(engine),
        removeFilter: engine.removeFilter.bind(engine),
        clearFilters: engine.clearFilters.bind(engine),
        setSort: engine.setSort.bind(engine),
        getUniqueValues: engine.getUniqueValues.bind(engine),
        getRange: engine.getRange.bind(engine)
    };
}
