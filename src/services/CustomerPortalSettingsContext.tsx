import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CustomerPortalSettings, MultilingualText } from '../types';
import { Api } from './api';
import i18n from './i18n';

interface CustomerPortalSettingsContextType {
    settings: CustomerPortalSettings | null;
    loading: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;
    getText: (text: MultilingualText) => string;
}

const CustomerPortalSettingsContext = createContext<CustomerPortalSettingsContextType | undefined>(undefined);

export const CustomerPortalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<CustomerPortalSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await Api.getCustomerPortalSettings();
            // تأكد من وجود القوائم الافتراضية
            if (data) {
                data.navigationMenu = data.navigationMenu ?? [];
                data.dashboardSections = data.dashboardSections ?? [];
            }
            setSettings(data);
        } catch (err) {
            console.warn('Failed to load customer portal settings, using defaults:', err);
            // استخدام قيم افتراضية بدلاً من كسر التطبيق
            setSettings({
                navigationMenu: [],
                dashboardSections: [],
                features: {},
                texts: {}
            } as any);
            setError(null); // لا نعرض خطأ للمستخدم
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const getText = useCallback((text: MultilingualText): string => {
        const currentLang = i18n.language || 'en';
        const langMap: Record<string, keyof MultilingualText> = {
            'ar': 'ar',
            'en': 'en',
            'hi': 'hi',
            'zh': 'zh'
        };
        const key = langMap[currentLang] || 'en';
        return text[key] || text.en || '';
    }, []);

    const refreshSettings = useCallback(async () => {
        await fetchSettings();
    }, [fetchSettings]);

    return (
        <CustomerPortalSettingsContext.Provider value={{
            settings,
            loading,
            error,
            refreshSettings,
            getText
        }}>
            {children}
        </CustomerPortalSettingsContext.Provider>
    );
};

export const useCustomerPortalSettings = (): CustomerPortalSettingsContextType => {
    const context = useContext(CustomerPortalSettingsContext);
    if (context === undefined) {
        throw new Error('useCustomerPortalSettings must be used within a CustomerPortalSettingsProvider');
    }
    return context;
};

export const isFeatureEnabled = (settings: CustomerPortalSettings | null, feature: keyof CustomerPortalSettings['features']): boolean => {
    if (!settings) return true;
    return settings.features[feature] ?? true;
};

export const getNavigationItems = (settings: CustomerPortalSettings | null): string[] => {
    if (!settings) {
        return ['dashboard', 'trader_tools', 'marketplace', 'orders', 'favorites', 'account'];
    }
    // إضافة Optional Chaining لمنع crash
    return (settings?.navigationMenu ?? [])
        .filter(item => item?.enabled)
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(item => item?.id ?? '');
};

export const getDashboardSections = (settings: CustomerPortalSettings | null): string[] => {
    if (!settings) {
        return ['welcome_banner', 'quick_stats', 'quick_actions', 'recent_orders', 'announcements'];
    }
    // إضافة Optional Chaining لمنع crash
    return (settings?.dashboardSections ?? [])
        .filter(section => section?.enabled)
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(section => section?.id ?? '');
};
