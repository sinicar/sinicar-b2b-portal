/**
 * Performance Utilities for handling large datasets
 * Used across the application for products, orders, etc.
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 * Useful for search inputs to avoid too many re-renders
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * Throttle function - ensures function is called at most once per wait period
 * Useful for scroll handlers and resize events
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= wait) {
            lastCall = now;
            func(...args);
        }
    };
}

/**
 * Create an indexed lookup map for fast O(1) searches by key
 * Much faster than array.find() for large datasets
 */
export function createIndexedLookup<T>(
    items: T[],
    keyField: keyof T
): Map<string, T> {
    const map = new Map<string, T>();
    items.forEach(item => {
        const key = String(item[keyField]);
        map.set(key, item);
    });
    return map;
}

/**
 * Create multiple indexed lookups for common search fields
 */
export function createMultiFieldIndex<T>(
    items: T[],
    fields: (keyof T)[]
): Map<string, Set<T>> {
    const index = new Map<string, Set<T>>();

    items.forEach(item => {
        fields.forEach(field => {
            const value = String(item[field] || '').toLowerCase();
            const words = value.split(/\s+/);

            words.forEach(word => {
                if (word.length < 2) return;
                if (!index.has(word)) {
                    index.set(word, new Set());
                }
                index.get(word)!.add(item);
            });
        });
    });

    return index;
}

/**
 * Fast search using pre-built index
 */
export function searchWithIndex<T>(
    query: string,
    index: Map<string, Set<T>>,
    maxResults: number = 100
): T[] {
    if (!query.trim()) return [];

    const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
    if (words.length === 0) return [];

    // Find items matching all words
    let resultSet: Set<T> | null = null;

    for (const word of words) {
        const matchingItems = new Set<T>();

        // Prefix matching for better UX
        index.forEach((items, key) => {
            if (key.startsWith(word) || key.includes(word)) {
                items.forEach(item => matchingItems.add(item));
            }
        });

        if (resultSet === null) {
            resultSet = matchingItems;
        } else {
            // Intersection for multi-word queries
            resultSet = new Set([...resultSet].filter(item => matchingItems.has(item)));
        }
    }

    return Array.from(resultSet || []).slice(0, maxResults);
}

/**
 * Chunk array for batch processing
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Virtual pagination info
 */
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    hasPrev: boolean;
    hasNext: boolean;
}

export function calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
): PaginationInfo {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
        currentPage: safePage,
        totalPages,
        totalItems,
        itemsPerPage,
        startIndex,
        endIndex,
        hasPrev: safePage > 1,
        hasNext: safePage < totalPages
    };
}

/**
 * Memoization helper for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    maxCacheSize: number = 100
): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args);

        // Limit cache size
        if (cache.size >= maxCacheSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        cache.set(key, result);
        return result;
    }) as T;
}
