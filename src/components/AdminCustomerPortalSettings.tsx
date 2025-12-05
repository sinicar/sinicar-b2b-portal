import { useState, useEffect, memo, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { 
    CustomerPortalSettings, 
    MultilingualText, 
    NavMenuItemConfig, 
    DashboardSectionConfig, 
    HeroBannerConfig, 
    AnnouncementConfig, 
    InfoCardConfig,
    PortalFeatureToggles,
    PortalDesignSettings
} from '../types';
import { 
    Settings, Save, RefreshCw, Palette, Layout, Navigation, ToggleLeft, 
    FileText, Bell, CreditCard, Eye, EyeOff, ChevronUp, ChevronDown, 
    Plus, Trash2, Edit2, Check, X, Moon, Sun, Monitor, 
    Home, ShoppingBag, FileText as FileIcon, Globe, Wrench, Building2, 
    Users, Clock, Info, Shield, Truck, BadgeDollarSign, Megaphone,
    Languages, GripVertical, Loader2, AlertCircle
} from 'lucide-react';
import { useToast } from '../services/ToastContext';

type TabType = 'design' | 'layout' | 'navigation' | 'features' | 'content';

const LANGUAGES = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
];

const ICON_MAP: Record<string, ReactNode> = {
    'Home': <Home size={18} />,
    'ShoppingBag': <ShoppingBag size={18} />,
    'FileText': <FileIcon size={18} />,
    'Globe': <Globe size={18} />,
    'Wrench': <Wrench size={18} />,
    'Building2': <Building2 size={18} />,
    'Users': <Users size={18} />,
    'Clock': <Clock size={18} />,
    'Info': <Info size={18} />,
    'Shield': <Shield size={18} />,
    'Truck': <Truck size={18} />,
    'BadgeDollarSign': <BadgeDollarSign size={18} />,
    'Megaphone': <Megaphone size={18} />
};

const AVAILABLE_ICONS = ['Home', 'ShoppingBag', 'FileText', 'Globe', 'Wrench', 'Building2', 'Users', 'Clock', 'Info', 'Shield', 'Truck', 'BadgeDollarSign', 'Megaphone'];

const COLOR_PRESETS = [
    { name: 'Navy Blue', value: '#0B1B3A' },
    { name: 'Gold', value: '#C8A04F' },
    { name: 'Deep Blue', value: '#1e40af' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Teal', value: '#0d9488' }
];

const TabButton = memo(({ active, icon, label, onClick, testId }: { active: boolean, icon: ReactNode, label: string, onClick: () => void, testId: string }) => (
    <button
        onClick={onClick}
        data-testid={testId}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            active 
                ? 'bg-[#0B1B3A] text-white shadow-lg' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
    >
        {icon}
        <span className="text-sm">{label}</span>
    </button>
));

const SectionCard = memo(({ title, children, icon }: { title: string, children: ReactNode, icon: ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1B3A] text-white flex items-center justify-center">
                {icon}
            </div>
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
));

const ToggleSwitch = memo(({ enabled, onChange, label, description, testId }: { enabled: boolean, onChange: (val: boolean) => void, label: string, description?: string, testId: string }) => (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
        <div className="flex-1">
            <p className="font-medium text-slate-700">{label}</p>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button 
            onClick={() => onChange(!enabled)}
            data-testid={testId}
            className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}
        >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
    </div>
));

const MultilingualInput = memo(({ value, onChange, label, placeholder, testIdPrefix }: { 
    value: MultilingualText, 
    onChange: (val: MultilingualText) => void, 
    label: string, 
    placeholder?: string,
    testIdPrefix: string 
}) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-[#C8A04F] hover:underline flex items-center gap-1"
                    data-testid={`${testIdPrefix}-expand`}
                >
                    <Languages size={14} />
                    {expanded ? 'Collapse' : 'Show All Languages'}
                </button>
            </div>
            
            {expanded ? (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
                    {LANGUAGES.map(lang => (
                        <div key={lang.code} className="flex items-center gap-2">
                            <span className="w-8 text-center">{lang.flag}</span>
                            <input
                                type="text"
                                value={value[lang.code as keyof MultilingualText]}
                                onChange={(e) => onChange({ ...value, [lang.code]: e.target.value })}
                                placeholder={`${lang.label}: ${placeholder || ''}`}
                                data-testid={`${testIdPrefix}-${lang.code}`}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <input
                    type="text"
                    value={value.ar}
                    onChange={(e) => onChange({ ...value, ar: e.target.value })}
                    placeholder={placeholder}
                    data-testid={`${testIdPrefix}-ar`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                    dir="rtl"
                />
            )}
        </div>
    );
});

export const AdminCustomerPortalSettings = memo(() => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    
    const [settings, setSettings] = useState<CustomerPortalSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('design');
    const [hasChanges, setHasChanges] = useState(false);
    
    useEffect(() => {
        loadSettings();
    }, []);
    
    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await MockApi.getCustomerPortalSettings();
            setSettings(data);
        } catch (error) {
            addToast('error', 'Failed to load settings');
        }
        setLoading(false);
    };
    
    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await MockApi.saveCustomerPortalSettings(settings);
            addToast('success', t('adminPortalSettings.savedSuccess') || 'Settings saved successfully');
            setHasChanges(false);
        } catch (error) {
            addToast('error', 'Failed to save settings');
        }
        setSaving(false);
    };
    
    const handleReset = async () => {
        if (!confirm(t('adminPortalSettings.confirmReset') || 'Are you sure you want to reset all settings to defaults?')) return;
        setLoading(true);
        try {
            const defaults = await MockApi.resetCustomerPortalSettings();
            setSettings(defaults);
            addToast('success', 'Settings reset to defaults');
            setHasChanges(false);
        } catch (error) {
            addToast('error', 'Failed to reset settings');
        }
        setLoading(false);
    };
    
    const updateSettings = useCallback(<K extends keyof CustomerPortalSettings>(key: K, value: CustomerPortalSettings[K]) => {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
        setHasChanges(true);
    }, []);
    
    const updateDesign = useCallback(<K extends keyof PortalDesignSettings>(key: K, value: PortalDesignSettings[K]) => {
        setSettings(prev => prev ? { ...prev, design: { ...prev.design, [key]: value } } : null);
        setHasChanges(true);
    }, []);
    
    const updateFeature = useCallback(<K extends keyof PortalFeatureToggles>(key: K, value: boolean) => {
        setSettings(prev => prev ? { ...prev, features: { ...prev.features, [key]: value } } : null);
        setHasChanges(true);
    }, []);
    
    const updateNavItem = useCallback((id: string, updates: Partial<NavMenuItemConfig>) => {
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                navigationMenu: prev.navigationMenu.map(item => 
                    item.id === id ? { ...item, ...updates } : item
                )
            };
        });
        setHasChanges(true);
    }, []);
    
    const updateSection = useCallback((id: string, updates: Partial<DashboardSectionConfig>) => {
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                dashboardSections: prev.dashboardSections.map(item => 
                    item.id === id ? { ...item, ...updates } : item
                )
            };
        });
        setHasChanges(true);
    }, []);
    
    const updateBanner = useCallback((id: string, updates: Partial<HeroBannerConfig>) => {
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                heroBanners: prev.heroBanners.map(item => 
                    item.id === id ? { ...item, ...updates } : item
                )
            };
        });
        setHasChanges(true);
    }, []);
    
    const addBanner = useCallback(() => {
        const newBanner: HeroBannerConfig = {
            id: `banner-${Date.now()}`,
            enabled: true,
            order: (settings?.heroBanners.length || 0) + 1,
            title: { ar: 'عنوان جديد', en: 'New Title', hi: 'नया शीर्षक', zh: '新标题' },
            subtitle: { ar: 'وصف جديد', en: 'New Description', hi: 'नया विवरण', zh: '新描述' },
            buttonText: { ar: 'اضغط هنا', en: 'Click Here', hi: 'यहाँ क्लिक करें', zh: '点击这里' },
            buttonUrl: '#',
            colorClass: 'from-primary-700 to-primary-900'
        };
        setSettings(prev => prev ? { ...prev, heroBanners: [...prev.heroBanners, newBanner] } : null);
        setHasChanges(true);
    }, [settings?.heroBanners.length]);
    
    const deleteBanner = useCallback((id: string) => {
        setSettings(prev => prev ? { ...prev, heroBanners: prev.heroBanners.filter(b => b.id !== id) } : null);
        setHasChanges(true);
    }, []);
    
    const updateInfoCard = useCallback((id: string, updates: Partial<InfoCardConfig>) => {
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                infoCards: prev.infoCards.map(item => 
                    item.id === id ? { ...item, ...updates } : item
                )
            };
        });
        setHasChanges(true);
    }, []);
    
    const addInfoCard = useCallback(() => {
        const newCard: InfoCardConfig = {
            id: `card-${Date.now()}`,
            enabled: true,
            order: (settings?.infoCards.length || 0) + 1,
            icon: 'Shield',
            title: { ar: 'عنوان جديد', en: 'New Title', hi: 'नया शीर्षक', zh: '新标题' },
            description: { ar: 'وصف جديد', en: 'New Description', hi: 'नया विवरण', zh: '新描述' },
            colorClass: 'bg-slate-50 text-slate-600'
        };
        setSettings(prev => prev ? { ...prev, infoCards: [...prev.infoCards, newCard] } : null);
        setHasChanges(true);
    }, [settings?.infoCards.length]);
    
    const deleteInfoCard = useCallback((id: string) => {
        setSettings(prev => prev ? { ...prev, infoCards: prev.infoCards.filter(c => c.id !== id) } : null);
        setHasChanges(true);
    }, []);
    
    const updateAnnouncement = useCallback((id: string, updates: Partial<AnnouncementConfig>) => {
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                announcements: prev.announcements.map(item => 
                    item.id === id ? { ...item, ...updates } : item
                )
            };
        });
        setHasChanges(true);
    }, []);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A04F]" />
            </div>
        );
    }
    
    if (!settings) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <AlertCircle size={48} className="mb-4" />
                <p>Failed to load settings. Please try again.</p>
            </div>
        );
    }
    
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="admin-portal-settings">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Settings className="text-[#C8A04F]" size={28} />
                        {t('adminPortalSettings.title') || 'Customer Portal Settings'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {t('adminPortalSettings.description') || 'Configure the appearance, layout, and features of the customer portal'}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        data-testid="button-reset-settings"
                        className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        {t('adminPortalSettings.resetDefaults') || 'Reset Defaults'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        data-testid="button-save-settings"
                        className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            hasChanges 
                                ? 'bg-[#C8A04F] text-white hover:bg-[#b8903f] shadow-lg shadow-[#C8A04F]/30' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {t('adminPortalSettings.saveChanges') || 'Save Changes'}
                    </button>
                </div>
            </div>
            
            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <AlertCircle className="text-amber-500" size={20} />
                    <span className="text-amber-700 text-sm font-medium">
                        {t('adminPortalSettings.unsavedChanges') || 'You have unsaved changes'}
                    </span>
                </div>
            )}
            
            {/* Tabs - 5 Main Configuration Areas */}
            <div className="flex flex-wrap gap-2">
                <TabButton 
                    active={activeTab === 'design'} 
                    icon={<Palette size={18} />} 
                    label={t('adminPortalSettings.tabs.design') || 'Design & Theme'} 
                    onClick={() => setActiveTab('design')}
                    testId="tab-design"
                />
                <TabButton 
                    active={activeTab === 'layout'} 
                    icon={<Layout size={18} />} 
                    label={t('adminPortalSettings.tabs.layout') || 'Dashboard Layout'} 
                    onClick={() => setActiveTab('layout')}
                    testId="tab-layout"
                />
                <TabButton 
                    active={activeTab === 'navigation'} 
                    icon={<Navigation size={18} />} 
                    label={t('adminPortalSettings.tabs.navigation') || 'Navigation Menu'} 
                    onClick={() => setActiveTab('navigation')}
                    testId="tab-navigation"
                />
                <TabButton 
                    active={activeTab === 'features'} 
                    icon={<ToggleLeft size={18} />} 
                    label={t('adminPortalSettings.tabs.features') || 'Features'} 
                    onClick={() => setActiveTab('features')}
                    testId="tab-features"
                />
                <TabButton 
                    active={activeTab === 'content'} 
                    icon={<FileText size={18} />} 
                    label={t('adminPortalSettings.tabs.content') || 'Content'} 
                    onClick={() => setActiveTab('content')}
                    testId="tab-content"
                />
            </div>
            
            {/* Content */}
            <div className="space-y-6">
                {/* Design Tab */}
                {activeTab === 'design' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard title={t('adminPortalSettings.design.themeMode') || 'Theme Mode'} icon={<Moon size={20} />}>
                            <div className="flex gap-3">
                                {[
                                    { mode: 'light', icon: <Sun size={20} />, label: 'Light' },
                                    { mode: 'dark', icon: <Moon size={20} />, label: 'Dark' },
                                    { mode: 'system', icon: <Monitor size={20} />, label: 'System' }
                                ].map(({ mode, icon, label }) => (
                                    <button
                                        key={mode}
                                        onClick={() => updateDesign('themeMode', mode as 'light' | 'dark' | 'system')}
                                        data-testid={`button-theme-${mode}`}
                                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                            settings.design.themeMode === mode 
                                                ? 'border-[#C8A04F] bg-[#C8A04F]/10' 
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {icon}
                                        <span className="text-sm font-medium">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.design.colors') || 'Color Scheme'} icon={<Palette size={20} />}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={settings.design.primaryColor}
                                            onChange={(e) => updateDesign('primaryColor', e.target.value)}
                                            data-testid="input-primary-color"
                                            className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {COLOR_PRESETS.slice(0, 4).map(preset => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => updateDesign('primaryColor', preset.value)}
                                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                    style={{ backgroundColor: preset.value }}
                                                    title={preset.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Accent Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={settings.design.accentColor}
                                            onChange={(e) => updateDesign('accentColor', e.target.value)}
                                            data-testid="input-accent-color"
                                            className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {COLOR_PRESETS.slice(4).map(preset => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => updateDesign('accentColor', preset.value)}
                                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                    style={{ backgroundColor: preset.value }}
                                                    title={preset.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.design.appearance') || 'Appearance'} icon={<Layout size={20} />}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Border Radius</label>
                                    <div className="flex gap-2">
                                        {['none', 'small', 'medium', 'large'].map(radius => (
                                            <button
                                                key={radius}
                                                onClick={() => updateDesign('borderRadius', radius as 'none' | 'small' | 'medium' | 'large')}
                                                data-testid={`button-radius-${radius}`}
                                                className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm ${
                                                    settings.design.borderRadius === radius 
                                                        ? 'border-[#C8A04F] bg-[#C8A04F]/10 text-[#C8A04F] font-medium' 
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                {radius.charAt(0).toUpperCase() + radius.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <ToggleSwitch
                                    enabled={settings.design.enableAnimations}
                                    onChange={(val) => updateDesign('enableAnimations', val)}
                                    label="Enable Animations"
                                    description="Show smooth transitions and hover effects"
                                    testId="toggle-animations"
                                />
                            </div>
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.design.font') || 'Font Family'} icon={<FileText size={20} />}>
                            <div className="grid grid-cols-2 gap-2">
                                {['Cairo', 'Tajawal', 'Inter', 'Roboto'].map(font => (
                                    <button
                                        key={font}
                                        onClick={() => updateDesign('fontFamily', font)}
                                        data-testid={`button-font-${font}`}
                                        className={`py-3 px-4 rounded-xl border transition-all text-center ${
                                            settings.design.fontFamily === font 
                                                ? 'border-[#C8A04F] bg-[#C8A04F]/10' 
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                        style={{ fontFamily: font }}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}
                
                {/* Layout Tab */}
                {activeTab === 'layout' && (
                    <SectionCard title={t('adminPortalSettings.layout.sections') || 'Dashboard Sections'} icon={<Layout size={20} />}>
                        <p className="text-sm text-slate-500 mb-4">
                            Enable or disable sections on the customer dashboard. Drag to reorder.
                        </p>
                        <div className="space-y-2">
                            {settings.dashboardSections.sort((a, b) => a.order - b.order).map((section, index) => (
                                <div 
                                    key={section.id}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                                >
                                    <GripVertical className="text-slate-400 cursor-move" size={20} />
                                    
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-700">{section.title.en}</p>
                                        <p className="text-xs text-slate-500">{section.key}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (index > 0) {
                                                    const newSections = [...settings.dashboardSections];
                                                    const prev = newSections[index - 1];
                                                    const curr = newSections[index];
                                                    [prev.order, curr.order] = [curr.order, prev.order];
                                                    updateSettings('dashboardSections', newSections);
                                                }
                                            }}
                                            disabled={index === 0}
                                            className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                                        >
                                            <ChevronUp size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (index < settings.dashboardSections.length - 1) {
                                                    const newSections = [...settings.dashboardSections];
                                                    const next = newSections[index + 1];
                                                    const curr = newSections[index];
                                                    [next.order, curr.order] = [curr.order, next.order];
                                                    updateSettings('dashboardSections', newSections);
                                                }
                                            }}
                                            disabled={index === settings.dashboardSections.length - 1}
                                            className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={() => updateSection(section.id, { enabled: !section.enabled })}
                                        data-testid={`toggle-section-${section.key}`}
                                        className={`p-2 rounded-lg transition-colors ${
                                            section.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                                        }`}
                                    >
                                        {section.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}
                
                {/* Navigation Tab */}
                {activeTab === 'navigation' && (
                    <SectionCard title={t('adminPortalSettings.navigation.menu') || 'Navigation Menu Items'} icon={<Navigation size={20} />}>
                        <p className="text-sm text-slate-500 mb-4">
                            Configure which menu items appear in the customer portal sidebar.
                        </p>
                        <div className="space-y-3">
                            {settings.navigationMenu.sort((a, b) => a.order - b.order).map((item, index) => (
                                <div 
                                    key={item.id}
                                    className={`p-4 rounded-xl border ${item.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <GripVertical className="text-slate-400 cursor-move" size={20} />
                                        
                                        <div className="w-10 h-10 rounded-xl bg-[#0B1B3A] text-white flex items-center justify-center">
                                            {ICON_MAP[item.icon] || <Home size={18} />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <input
                                                type="text"
                                                value={item.label.en}
                                                onChange={(e) => updateNavItem(item.id, { label: { ...item.label, en: e.target.value } })}
                                                className="w-full font-medium text-slate-700 bg-transparent border-0 focus:ring-0 p-0"
                                                data-testid={`input-nav-label-${item.key}`}
                                            />
                                            <p className="text-xs text-slate-500">{item.key}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    if (index > 0) {
                                                        const newMenu = [...settings.navigationMenu];
                                                        const prev = newMenu[index - 1];
                                                        const curr = newMenu[index];
                                                        [prev.order, curr.order] = [curr.order, prev.order];
                                                        updateSettings('navigationMenu', newMenu);
                                                    }
                                                }}
                                                disabled={index === 0}
                                                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                                            >
                                                <ChevronUp size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (index < settings.navigationMenu.length - 1) {
                                                        const newMenu = [...settings.navigationMenu];
                                                        const next = newMenu[index + 1];
                                                        const curr = newMenu[index];
                                                        [next.order, curr.order] = [curr.order, next.order];
                                                        updateSettings('navigationMenu', newMenu);
                                                    }
                                                }}
                                                disabled={index === settings.navigationMenu.length - 1}
                                                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                                            >
                                                <ChevronDown size={18} />
                                            </button>
                                            
                                            <button
                                                onClick={() => updateNavItem(item.id, { enabled: !item.enabled })}
                                                data-testid={`toggle-nav-${item.key}`}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    item.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                                                }`}
                                            >
                                                {item.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {item.enabled && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2">
                                            {LANGUAGES.map(lang => (
                                                <input
                                                    key={lang.code}
                                                    type="text"
                                                    value={item.label[lang.code as keyof MultilingualText]}
                                                    onChange={(e) => updateNavItem(item.id, { label: { ...item.label, [lang.code]: e.target.value } })}
                                                    placeholder={lang.label}
                                                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                                                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                                    data-testid={`input-nav-${item.key}-${lang.code}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}
                
                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard title={t('adminPortalSettings.features.core') || 'Core Features'} icon={<ToggleLeft size={20} />}>
                            <ToggleSwitch
                                enabled={settings.features.enableSearch}
                                onChange={(val) => updateFeature('enableSearch', val)}
                                label="Search"
                                description="Allow customers to search for products"
                                testId="toggle-feature-search"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableCart}
                                onChange={(val) => updateFeature('enableCart', val)}
                                label="Shopping Cart"
                                description="Enable cart functionality"
                                testId="toggle-feature-cart"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableOrders}
                                onChange={(val) => updateFeature('enableOrders', val)}
                                label="Order History"
                                description="Show order history page"
                                testId="toggle-feature-orders"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableQuoteRequests}
                                onChange={(val) => updateFeature('enableQuoteRequests', val)}
                                label="Quote Requests"
                                description="Allow quote/pricing requests"
                                testId="toggle-feature-quotes"
                            />
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.features.tools') || 'Trader Tools'} icon={<Wrench size={20} />}>
                            <ToggleSwitch
                                enabled={settings.features.enableImportFromChina}
                                onChange={(val) => updateFeature('enableImportFromChina', val)}
                                label="Import from China"
                                description="Enable China import requests"
                                testId="toggle-feature-import"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableVinDecoder}
                                onChange={(val) => updateFeature('enableVinDecoder', val)}
                                label="VIN Decoder"
                                description="Extract parts from VIN number"
                                testId="toggle-feature-vin"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enablePdfToExcel}
                                onChange={(val) => updateFeature('enablePdfToExcel', val)}
                                label="PDF to Excel"
                                description="Convert PDF price lists to Excel"
                                testId="toggle-feature-pdf"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enablePriceComparison}
                                onChange={(val) => updateFeature('enablePriceComparison', val)}
                                label="Price Comparison"
                                description="Compare prices across suppliers"
                                testId="toggle-feature-compare"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableSupplierMarketplace}
                                onChange={(val) => updateFeature('enableSupplierMarketplace', val)}
                                label="Supplier Marketplace"
                                description="Access supplier marketplace"
                                testId="toggle-feature-marketplace"
                            />
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.features.b2b') || 'B2B Features'} icon={<Building2 size={20} />}>
                            <ToggleSwitch
                                enabled={settings.features.enableInstallments}
                                onChange={(val) => updateFeature('enableInstallments', val)}
                                label="Installment Purchases"
                                description="Enable BNPL payment options"
                                testId="toggle-feature-installments"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableOrganization}
                                onChange={(val) => updateFeature('enableOrganization', val)}
                                label="Organization Management"
                                description="Manage business organization"
                                testId="toggle-feature-organization"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableTeamManagement}
                                onChange={(val) => updateFeature('enableTeamManagement', val)}
                                label="Team Management"
                                description="Manage team members"
                                testId="toggle-feature-team"
                            />
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.features.marketing') || 'Marketing & Content'} icon={<Megaphone size={20} />}>
                            <ToggleSwitch
                                enabled={settings.features.enableMarketingBanners}
                                onChange={(val) => updateFeature('enableMarketingBanners', val)}
                                label="Marketing Banners"
                                description="Show promotional banners"
                                testId="toggle-feature-banners"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableMarketingPopups}
                                onChange={(val) => updateFeature('enableMarketingPopups', val)}
                                label="Marketing Popups"
                                description="Show promotional popups"
                                testId="toggle-feature-popups"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableMarketingCards}
                                onChange={(val) => updateFeature('enableMarketingCards', val)}
                                label="Marketing Cards"
                                description="Show dashboard marketing cards"
                                testId="toggle-feature-cards"
                            />
                            <ToggleSwitch
                                enabled={settings.features.enableAnnouncementTicker}
                                onChange={(val) => updateFeature('enableAnnouncementTicker', val)}
                                label="Announcement Ticker"
                                description="Show scrolling announcements"
                                testId="toggle-feature-ticker"
                            />
                        </SectionCard>
                        
                        <SectionCard title={t('adminPortalSettings.features.guest') || 'Guest Mode'} icon={<Users size={20} />}>
                            <ToggleSwitch
                                enabled={settings.features.enableGuestMode}
                                onChange={(val) => updateFeature('enableGuestMode', val)}
                                label="Enable Guest Mode"
                                description="Allow browsing without login"
                                testId="toggle-feature-guest"
                            />
                            <ToggleSwitch
                                enabled={settings.features.guestCanSearch}
                                onChange={(val) => updateFeature('guestCanSearch', val)}
                                label="Guest Can Search"
                                description="Allow guests to search products"
                                testId="toggle-feature-guest-search"
                            />
                            <ToggleSwitch
                                enabled={settings.features.guestCanViewPrices}
                                onChange={(val) => updateFeature('guestCanViewPrices', val)}
                                label="Guest Can View Prices"
                                description="Show prices to guest users"
                                testId="toggle-feature-guest-prices"
                            />
                        </SectionCard>
                    </div>
                )}
                
                {/* Content Tab - Unified Content Management (Banners, Announcements, Info Cards) */}
                {activeTab === 'content' && (
                    <div className="space-y-8">
                        {/* Hero Banners Section */}
                        <SectionCard title={t('adminPortalSettings.banners.hero') || 'Hero Banners'} icon={<FileText size={20} />}>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-500">
                                    Configure the rotating hero banners on the dashboard.
                                </p>
                                <button
                                    onClick={addBanner}
                                    data-testid="button-add-banner"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#C8A04F] text-white rounded-xl hover:bg-[#b8903f] transition-colors"
                                >
                                    <Plus size={18} />
                                    Add Banner
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {settings.heroBanners.sort((a, b) => a.order - b.order).map((banner) => (
                                    <div 
                                        key={banner.id}
                                        className={`p-4 rounded-xl border ${banner.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${banner.colorClass} flex items-center justify-center`}
                                                >
                                                    <Megaphone className="text-white" size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">{banner.title.en}</p>
                                                    <p className="text-xs text-slate-500">Order: {banner.order}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateBanner(banner.id, { enabled: !banner.enabled })}
                                                    data-testid={`toggle-banner-${banner.id}`}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        banner.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                                                    }`}
                                                >
                                                    {banner.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => deleteBanner(banner.id)}
                                                    data-testid={`button-delete-banner-${banner.id}`}
                                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {banner.enabled && (
                                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                                <MultilingualInput
                                                    value={banner.title}
                                                    onChange={(val) => updateBanner(banner.id, { title: val })}
                                                    label="Title"
                                                    placeholder="Banner title..."
                                                    testIdPrefix={`banner-title-${banner.id}`}
                                                />
                                                <MultilingualInput
                                                    value={banner.subtitle}
                                                    onChange={(val) => updateBanner(banner.id, { subtitle: val })}
                                                    label="Subtitle"
                                                    placeholder="Banner subtitle..."
                                                    testIdPrefix={`banner-subtitle-${banner.id}`}
                                                />
                                                <MultilingualInput
                                                    value={banner.buttonText}
                                                    onChange={(val) => updateBanner(banner.id, { buttonText: val })}
                                                    label="Button Text"
                                                    placeholder="Button text..."
                                                    testIdPrefix={`banner-button-${banner.id}`}
                                                />
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Button URL</label>
                                                    <input
                                                        type="text"
                                                        value={banner.buttonUrl}
                                                        onChange={(e) => updateBanner(banner.id, { buttonUrl: e.target.value })}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                        data-testid={`input-banner-url-${banner.id}`}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                        
                        {/* Announcements Section */}
                        <SectionCard title={t('adminPortalSettings.announcements.title') || 'Announcements'} icon={<Bell size={20} />}>
                            <p className="text-sm text-slate-500 mb-4">
                                Configure ticker, banner, and popup announcements.
                            </p>
                            
                            <div className="space-y-4">
                                {settings.announcements.map((announcement) => (
                                    <div 
                                        key={announcement.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-white"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}
                                                >
                                                    <Bell size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700 capitalize">{announcement.type} Announcement</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-xs">{announcement.content.en}</p>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => updateAnnouncement(announcement.id, { enabled: !announcement.enabled })}
                                                data-testid={`toggle-announcement-${announcement.id}`}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    announcement.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                                                }`}
                                            >
                                                {announcement.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        
                                        {announcement.enabled && (
                                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                                <MultilingualInput
                                                    value={announcement.content}
                                                    onChange={(val) => updateAnnouncement(announcement.id, { content: val })}
                                                    label="Content"
                                                    placeholder="Announcement text..."
                                                    testIdPrefix={`announcement-content-${announcement.id}`}
                                                />
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Background Color</label>
                                                        <input
                                                            type="color"
                                                            value={announcement.backgroundColor}
                                                            onChange={(e) => updateAnnouncement(announcement.id, { backgroundColor: e.target.value })}
                                                            className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                                                            data-testid={`input-announcement-bg-${announcement.id}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Text Color</label>
                                                        <input
                                                            type="color"
                                                            value={announcement.textColor}
                                                            onChange={(e) => updateAnnouncement(announcement.id, { textColor: e.target.value })}
                                                            className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                                                            data-testid={`input-announcement-text-${announcement.id}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                        
                        {/* Info Cards Section */}
                        <SectionCard title={t('adminPortalSettings.cards.info') || 'Info Cards'} icon={<CreditCard size={20} />}>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-500">
                                    Configure the info/marketing cards displayed on the dashboard.
                                </p>
                                <button
                                    onClick={addInfoCard}
                                    data-testid="button-add-card"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#C8A04F] text-white rounded-xl hover:bg-[#b8903f] transition-colors"
                                >
                                    <Plus size={18} />
                                    Add Card
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {settings.infoCards.sort((a, b) => a.order - b.order).map((card) => (
                                    <div 
                                        key={card.id}
                                        className={`p-4 rounded-xl border ${card.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl ${card.colorClass} flex items-center justify-center`}>
                                                    {ICON_MAP[card.icon] || <Shield size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">{card.title.en}</p>
                                                    <p className="text-xs text-slate-500">Order: {card.order}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateInfoCard(card.id, { enabled: !card.enabled })}
                                                    data-testid={`toggle-card-${card.id}`}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        card.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                                                    }`}
                                                >
                                                    {card.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => deleteInfoCard(card.id)}
                                                    data-testid={`button-delete-card-${card.id}`}
                                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {card.enabled && (
                                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Icon</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {AVAILABLE_ICONS.map(iconName => (
                                                            <button
                                                                key={iconName}
                                                                onClick={() => updateInfoCard(card.id, { icon: iconName })}
                                                                className={`p-2 rounded-lg border transition-all ${
                                                                    card.icon === iconName 
                                                                        ? 'border-[#C8A04F] bg-[#C8A04F]/10' 
                                                                        : 'border-slate-200 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                {ICON_MAP[iconName]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <MultilingualInput
                                                    value={card.title}
                                                    onChange={(val) => updateInfoCard(card.id, { title: val })}
                                                    label="Title"
                                                    placeholder="Card title..."
                                                    testIdPrefix={`card-title-${card.id}`}
                                                />
                                                <MultilingualInput
                                                    value={card.description}
                                                    onChange={(val) => updateInfoCard(card.id, { description: val })}
                                                    label="Description"
                                                    placeholder="Card description..."
                                                    testIdPrefix={`card-desc-${card.id}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}
            </div>
        </div>
    );
});
