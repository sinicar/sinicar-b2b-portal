/**
 * Feature Visibility Service
 * Integrates with UnifiedPermissionCenter visibility settings
 * Controls what features each account type can see
 */

import { useState, useEffect, useCallback } from 'react';

// Storage key matching UnifiedPermissionCenter
const STORAGE_KEY_VISIBILITY = 'sini_feature_visibility';

export type OwnerType = 'customers' | 'suppliers' | 'advertisers' | 'affiliates';

export interface FeatureVisibility {
    id: string;
    name: string;
    description: string;
    icon: string;
    customers: boolean;
    suppliers: boolean;
    advertisers: boolean;
    affiliates: boolean;
}

// Default features - same as in UnifiedPermissionCenter
const DEFAULT_FEATURES: FeatureVisibility[] = [
    { id: 'orders', name: 'الطلبات', description: 'إنشاء ومتابعة الطلبات', icon: 'ShoppingBag', customers: true, suppliers: false, advertisers: false, affiliates: false },
    { id: 'quotes', name: 'عروض الأسعار', description: 'طلب عروض أسعار مخصصة', icon: 'FileText', customers: true, suppliers: true, advertisers: false, affiliates: false },
    { id: 'products', name: 'كتالوج المنتجات', description: 'تصفح وبحث المنتجات', icon: 'Package', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'cart', name: 'سلة التسوق', description: 'إضافة منتجات للسلة', icon: 'ShoppingCart', customers: true, suppliers: false, advertisers: false, affiliates: false },
    { id: 'missing', name: 'طلب قطع مفقودة', description: 'طلب قطع غير متوفرة', icon: 'Search', customers: true, suppliers: false, advertisers: false, affiliates: false },
    { id: 'imports', name: 'طلبات الاستيراد', description: 'طلب استيراد منتجات', icon: 'Globe', customers: true, suppliers: true, advertisers: false, affiliates: false },
    { id: 'invoices', name: 'الفواتير', description: 'عرض وتحميل الفواتير', icon: 'Receipt', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'statements', name: 'كشف الحساب', description: 'عرض كشف الحساب المالي', icon: 'BarChart', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'support', name: 'الدعم الفني', description: 'التواصل مع الدعم', icon: 'MessageCircle', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'notifications', name: 'الإشعارات', description: 'استلام الإشعارات', icon: 'Bell', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'team', name: 'إدارة الفريق', description: 'إضافة أعضاء للفريق', icon: 'Users', customers: true, suppliers: true, advertisers: false, affiliates: false },
    { id: 'analytics', name: 'التحليلات', description: 'عرض الإحصائيات والتقارير', icon: 'TrendingUp', customers: false, suppliers: true, advertisers: true, affiliates: true },
    { id: 'commissions', name: 'العمولات', description: 'عرض العمولات المستحقة', icon: 'DollarSign', customers: false, suppliers: false, advertisers: false, affiliates: true },
    { id: 'campaigns', name: 'الحملات الإعلانية', description: 'إدارة الحملات الإعلانية', icon: 'Megaphone', customers: false, suppliers: false, advertisers: true, affiliates: false },
    { id: 'links', name: 'روابط التسويق', description: 'إنشاء روابط تسويقية', icon: 'Link', customers: false, suppliers: false, advertisers: false, affiliates: true },
];

/**
 * Get all feature visibility settings from localStorage
 */
export const getFeatureVisibilitySettings = (): FeatureVisibility[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_VISIBILITY);
        return stored ? JSON.parse(stored) : DEFAULT_FEATURES;
    } catch (e) {
        console.error('Failed to load visibility settings', e);
        return DEFAULT_FEATURES;
    }
};

/**
 * Check if a specific feature is visible for a given owner type
 */
export const isFeatureVisibleForOwner = (featureId: string, ownerType: OwnerType): boolean => {
    const features = getFeatureVisibilitySettings();
    const feature = features.find(f => f.id === featureId);
    if (!feature) return true; // If feature not found, default to visible
    return feature[ownerType];
};

/**
 * Get list of visible feature IDs for an owner type
 */
export const getVisibleFeatures = (ownerType: OwnerType): string[] => {
    const features = getFeatureVisibilitySettings();
    return features.filter(f => f[ownerType]).map(f => f.id);
};

/**
 * Get list of hidden feature IDs for an owner type
 */
export const getHiddenFeatures = (ownerType: OwnerType): string[] => {
    const features = getFeatureVisibilitySettings();
    return features.filter(f => !f[ownerType]).map(f => f.id);
};

/**
 * Hook to use feature visibility in components
 */
export const useFeatureVisibility = (ownerType: OwnerType) => {
    const [features, setFeatures] = useState<FeatureVisibility[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFeatures = useCallback(() => {
        setLoading(true);
        const data = getFeatureVisibilitySettings();
        setFeatures(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadFeatures();

        // Listen for storage changes (when admin updates visibility)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY_VISIBILITY) {
                loadFeatures();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadFeatures]);

    const isVisible = useCallback((featureId: string): boolean => {
        const feature = features.find(f => f.id === featureId);
        if (!feature) return true;
        return feature[ownerType];
    }, [features, ownerType]);

    const visibleFeatureIds = features.filter(f => f[ownerType]).map(f => f.id);
    const hiddenFeatureIds = features.filter(f => !f[ownerType]).map(f => f.id);

    return {
        features,
        loading,
        isVisible,
        visibleFeatureIds,
        hiddenFeatureIds,
        refresh: loadFeatures
    };
};

/**
 * Map user type to owner type for visibility checking
 */
export const mapUserTypeToOwnerType = (userType: string): OwnerType => {
    const mapping: Record<string, OwnerType> = {
        'customer': 'customers',
        'supplier': 'suppliers',
        'advertiser': 'advertisers',
        'affiliate': 'affiliates',
        'marketer': 'affiliates',
        'partner': 'suppliers'
    };
    return mapping[userType.toLowerCase()] || 'customers';
};

export default {
    getFeatureVisibilitySettings,
    isFeatureVisibleForOwner,
    getVisibleFeatures,
    getHiddenFeatures,
    useFeatureVisibility,
    mapUserTypeToOwnerType
};
