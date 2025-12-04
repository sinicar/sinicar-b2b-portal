/**
 * شريط البحث والفلاتر المركزي
 * Universal Filter Bar Component
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc, RefreshCw } from 'lucide-react';
import { FilterDefinition, ActiveFilter, SortConfig, FilterEngine, createFilterEngine, FilterResult } from '../services/indexingFilterEngine';

interface FilterBarProps<T extends Record<string, any>> {
    items: T[];
    searchableFields: (keyof T)[];
    filterDefinitions?: FilterDefinition<T>[];
    onResultChange: (result: FilterResult<T>) => void;
    placeholder?: string;
    pageSize?: number;
    showSort?: boolean;
    sortOptions?: { field: keyof T; label: string }[];
    className?: string;
    debounceMs?: number;
}

export function FilterBar<T extends Record<string, any>>({
    items,
    searchableFields,
    filterDefinitions = [],
    onResultChange,
    placeholder = 'ابحث...',
    pageSize = 20,
    showSort = false,
    sortOptions = [],
    className = '',
    debounceMs = 300
}: FilterBarProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter<T>[]>([]);
    const [sort, setSort] = useState<SortConfig<T> | null>(null);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    
    // إنشاء محرك الفلترة
    const engine = useMemo(() => {
        return createFilterEngine(items, searchableFields);
    }, [items, searchableFields]);
    
    // تأخير البحث
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs]);
    
    // تنفيذ البحث والفلترة
    useEffect(() => {
        // تطبيق الفلاتر
        activeFilters.forEach(f => engine.addFilter(f));
        engine.setSort(sort);
        
        const result = engine.execute(debouncedQuery, page, pageSize);
        onResultChange(result);
    }, [engine, debouncedQuery, activeFilters, sort, page, pageSize, onResultChange]);
    
    // إضافة/تحديث فلتر
    const handleFilterChange = useCallback((definition: FilterDefinition<T>, value: any) => {
        setActiveFilters(prev => {
            const filtered = prev.filter(f => f.field !== definition.field);
            if (value !== null && value !== undefined && value !== '' && 
                !(Array.isArray(value) && value.length === 0)) {
                return [...filtered, {
                    field: definition.field,
                    type: definition.type,
                    value
                }];
            }
            return filtered;
        });
        setPage(1);
    }, []);
    
    // مسح فلتر معين
    const clearFilter = useCallback((field: keyof T) => {
        setActiveFilters(prev => prev.filter(f => f.field !== field));
        setPage(1);
    }, []);
    
    // مسح جميع الفلاتر
    const clearAllFilters = useCallback(() => {
        setActiveFilters([]);
        setSearchQuery('');
        setSort(null);
        setPage(1);
    }, []);
    
    // تغيير الترتيب
    const handleSortChange = useCallback((field: keyof T) => {
        setSort(prev => {
            if (!prev || prev.field !== field) {
                return { field, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { field, direction: 'desc' };
            }
            return null;
        });
    }, []);
    
    // القيم الفريدة للفلاتر المنسدلة
    const getFilterOptions = useCallback((field: keyof T) => {
        return engine.getUniqueValues(field);
    }, [engine]);
    
    const hasActiveFilters = activeFilters.length > 0 || searchQuery.trim() !== '';
    
    return (
        <div className={`space-y-3 ${className}`}>
            {/* شريط البحث الرئيسي */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="w-full sm:flex-1 sm:min-w-[250px] relative">
                    <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pr-12 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent transition-all"
                        data-testid="input-search"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                
                {filterDefinitions.length > 0 && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl font-bold text-sm transition-colors ${
                            showFilters || activeFilters.length > 0
                                ? 'bg-[#C8A04F] text-white border-[#C8A04F]'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        data-testid="button-toggle-filters"
                    >
                        <Filter size={18} />
                        <span className="hidden sm:inline">الفلاتر</span>
                        {activeFilters.length > 0 && (
                            <span className="bg-white text-[#C8A04F] px-2 py-0.5 rounded-full text-xs font-bold">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>
                )}
                
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-sm transition-colors"
                        data-testid="button-clear-filters"
                    >
                        <RefreshCw size={18} />
                        <span className="hidden sm:inline">مسح</span>
                    </button>
                )}
            </div>
            
            {/* لوحة الفلاتر */}
            {showFilters && filterDefinitions.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filterDefinitions.map((def) => {
                            const filterValue = activeFilters.find(f => f.field === def.field)?.value;
                            return (
                                <div key={String(def.field)}>
                                    <FilterInput
                                        definition={def}
                                        value={filterValue}
                                        onChange={(value) => handleFilterChange(def, value)}
                                        onClear={() => clearFilter(def.field)}
                                        getOptions={() => getFilterOptions(def.field)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* شريط الترتيب */}
            {showSort && sortOptions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500 font-bold">ترتيب:</span>
                    {sortOptions.map((option) => (
                        <button
                            key={String(option.field)}
                            onClick={() => handleSortChange(option.field)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                                sort?.field === option.field
                                    ? 'bg-[#C8A04F] text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                            data-testid={`button-sort-${String(option.field)}`}
                        >
                            {option.label}
                            {sort?.field === option.field && (
                                sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                            )}
                        </button>
                    ))}
                </div>
            )}
            
            {/* شارات الفلاتر النشطة */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => {
                        const def = filterDefinitions.find(d => d.field === filter.field);
                        return (
                            <span
                                key={String(filter.field)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold"
                            >
                                {def?.label || String(filter.field)}: {formatFilterValue(filter)}
                                <button
                                    onClick={() => clearFilter(filter.field)}
                                    className="hover:text-blue-900"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// تنسيق قيمة الفلتر للعرض
function formatFilterValue(filter: ActiveFilter<any>): string {
    if (filter.type === 'range') {
        const { min, max } = filter.value;
        if (min != null && max != null) return `${min} - ${max}`;
        if (min != null) return `≥ ${min}`;
        if (max != null) return `≤ ${max}`;
        return '';
    }
    if (filter.type === 'list') {
        return `${filter.value.length} محدد`;
    }
    if (filter.type === 'boolean') {
        return filter.value ? 'نعم' : 'لا';
    }
    return String(filter.value);
}

// مكون إدخال الفلتر
interface FilterInputProps<T> {
    definition: FilterDefinition<T>;
    value: any;
    onChange: (value: any) => void;
    onClear: () => void;
    getOptions: () => any[];
}

function FilterInput<T>({
    definition,
    value,
    onChange,
    onClear,
    getOptions
}: FilterInputProps<T>) {
    const [showDropdown, setShowDropdown] = useState(false);
    
    switch (definition.type) {
        case 'text':
            return (
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">{definition.label}</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value || null)}
                            placeholder={definition.placeholder || `بحث ${definition.label}...`}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent text-sm"
                            data-testid={`filter-text-${String(definition.field)}`}
                        />
                        {value && (
                            <button
                                onClick={onClear}
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            );
            
        case 'range':
            return (
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">{definition.label}</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={value?.min ?? ''}
                            onChange={(e) => onChange({
                                ...value,
                                min: e.target.value ? Number(e.target.value) : null
                            })}
                            placeholder="من"
                            min={definition.min}
                            max={definition.max}
                            className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent text-sm"
                            data-testid={`filter-range-min-${String(definition.field)}`}
                        />
                        <input
                            type="number"
                            value={value?.max ?? ''}
                            onChange={(e) => onChange({
                                ...value,
                                max: e.target.value ? Number(e.target.value) : null
                            })}
                            placeholder="إلى"
                            min={definition.min}
                            max={definition.max}
                            className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent text-sm"
                            data-testid={`filter-range-max-${String(definition.field)}`}
                        />
                    </div>
                </div>
            );
            
        case 'list':
            const options = definition.options || getOptions().map((v: any) => ({ value: v, label: String(v) }));
            return (
                <div className="space-y-1 relative">
                    <label className="text-sm font-bold text-slate-700">{definition.label}</label>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm hover:bg-slate-50"
                        data-testid={`filter-list-${String(definition.field)}`}
                    >
                        <span className={value?.length ? 'text-slate-800' : 'text-slate-400'}>
                            {value?.length ? `${value.length} محدد` : 'اختر...'}
                        </span>
                        <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {options.map((opt: { value: any; label: string }) => (
                                <label
                                    key={opt.value}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={value?.includes(opt.value) || false}
                                        onChange={(e) => {
                                            const current = value || [];
                                            if (e.target.checked) {
                                                onChange([...current, opt.value]);
                                            } else {
                                                onChange(current.filter((v: any) => v !== opt.value));
                                            }
                                        }}
                                        className="rounded text-[#C8A04F] focus:ring-[#C8A04F]"
                                    />
                                    <span className="text-sm">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            );
            
        case 'boolean':
            return (
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">{definition.label}</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onChange(value === true ? null : true)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                value === true
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            نعم
                        </button>
                        <button
                            onClick={() => onChange(value === false ? null : false)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                value === false
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            لا
                        </button>
                    </div>
                </div>
            );
            
        case 'date':
            return (
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">{definition.label}</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={value?.from || ''}
                            onChange={(e) => onChange({ ...value, from: e.target.value || null })}
                            className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent text-sm"
                            data-testid={`filter-date-from-${String(definition.field)}`}
                        />
                        <input
                            type="date"
                            value={value?.to || ''}
                            onChange={(e) => onChange({ ...value, to: e.target.value || null })}
                            className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent text-sm"
                            data-testid={`filter-date-to-${String(definition.field)}`}
                        />
                    </div>
                </div>
            );
            
        default:
            return null;
    }
}

// مكون ترقيم الصفحات
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    filteredItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    filteredItems,
    pageSize,
    onPageChange
}: PaginationProps) {
    if (totalPages <= 1) return null;
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, filteredItems);
    
    return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
                عرض {start} - {end} من {filteredItems}
                {filteredItems !== totalItems && (
                    <span className="text-slate-400"> (إجمالي {totalItems})</span>
                )}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    data-testid="button-prev-page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <span className="px-4 py-2 font-bold text-slate-700">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    data-testid="button-next-page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default FilterBar;
