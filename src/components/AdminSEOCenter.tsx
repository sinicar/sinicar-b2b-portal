/**
 * Advanced SEO Settings Center
 * Modern, comprehensive SEO configuration for SINI CAR B2B Portal
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Globe, FileText, Zap, Layout, AlertTriangle, Save,
    Download, Upload, RefreshCw, Check, X, ChevronDown,
    Monitor, Smartphone, Search, Code, Settings, Eye,
    AlertCircle, CheckCircle, Info, History, RotateCcw, Bot, Sparkles, Key
} from 'lucide-react';
import { SEOService } from '../services/seoService';
import { AISEOService, AIConfig } from '../services/aiSeoService';
import {
    CompleteSEOSettings,
    DiagnosticReport,
    SEODiagnostic,
    SEOSettingsVersion,
    getDefaultSEOSettings
} from '../types/seoTypes';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';

// ============================================================================
// Tab Types
// ============================================================================

type SEOTab = 'global' | 'structured' | 'performance' | 'pages' | 'diagnostics' | 'ai';

const TAB_CONFIG: { id: SEOTab; icon: React.ReactNode; labelKey: string }[] = [
    { id: 'global', icon: <Globe size={18} />, labelKey: 'SEO العام' },
    { id: 'structured', icon: <Code size={18} />, labelKey: 'البيانات المهيكلة' },
    { id: 'performance', icon: <Zap size={18} />, labelKey: 'الأداء' },
    { id: 'pages', icon: <Layout size={18} />, labelKey: 'SEO الصفحات' },
    { id: 'diagnostics', icon: <AlertTriangle size={18} />, labelKey: 'التشخيصات' },
    { id: 'ai', icon: <Sparkles size={18} />, labelKey: 'الذكاء الاصطناعي' }
];

// ============================================================================
// Main Component
// ============================================================================

export const AdminSEOCenter: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();

    // State
    const [activeTab, setActiveTab] = useState<SEOTab>('global');
    const [settings, setSettings] = useState<CompleteSEOSettings>(getDefaultSEOSettings());
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showHistory, setShowHistory] = useState(false);
    const [versionHistory, setVersionHistory] = useState<SEOSettingsVersion[]>([]);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = useCallback(() => {
        const loaded = SEOService.getSEOSettings();
        setSettings(loaded);
        setIsDirty(false);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            SEOService.saveSEOSettings(settings, 'admin', 'Manual save from SEO Center');
            addToast('تم حفظ إعدادات SEO بنجاح', 'success');
            setIsDirty(false);
        } catch (error) {
            addToast('فشل حفظ الإعدادات', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        SEOService.exportToFile();
        addToast('تم تصدير الإعدادات', 'success');
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const imported = SEOService.importSettings(content);
            if (imported) {
                setSettings(imported);
                addToast('تم استيراد الإعدادات بنجاح', 'success');
            } else {
                addToast('فشل استيراد الإعدادات', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const runDiagnostics = () => {
        const report = SEOService.runDiagnostics();
        setDiagnostics(report);
        addToast(`تم الفحص - النتيجة: ${report.score}%`, report.score >= 70 ? 'success' : 'warning');
    };

    const loadVersionHistory = () => {
        const history = SEOService.getVersionHistory();
        setVersionHistory(history);
        setShowHistory(true);
    };

    const restoreVersion = (versionId: string) => {
        const restored = SEOService.restoreVersion(versionId);
        if (restored) {
            setSettings(restored);
            setShowHistory(false);
            addToast('تم استعادة النسخة بنجاح', 'success');
        }
    };

    const updateSettings = (path: string, value: any) => {
        setSettings(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = newSettings;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
        setIsDirty(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B1B3A] to-[#1a3a5c] rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Search size={28} className="text-[#C8A04F]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">مركز إعدادات SEO</h1>
                            <p className="text-white/70 text-sm">إدارة تحسين محركات البحث المتقدمة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Version History */}
                        <button
                            onClick={loadVersionHistory}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                        >
                            <History size={16} />
                            <span>السجل</span>
                        </button>

                        {/* Export */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                        >
                            <Download size={16} />
                            <span>تصدير</span>
                        </button>

                        {/* Import */}
                        <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm cursor-pointer">
                            <Upload size={16} />
                            <span>استيراد</span>
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>

                        {/* Preview */}
                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                        >
                            <Eye size={16} />
                            <span>معاينة</span>
                        </button>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || isSaving}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${isDirty
                                ? 'bg-[#C8A04F] text-[#0B1B3A] hover:bg-[#b08d45]'
                                : 'bg-white/10 text-white/50 cursor-not-allowed'
                                }`}
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
                        </button>
                    </div>
                </div>

                {/* Dirty indicator */}
                {isDirty && (
                    <div className="mt-4 flex items-center gap-2 text-amber-300 text-sm">
                        <AlertCircle size={14} />
                        <span>يوجد تغييرات غير محفوظة</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    {TAB_CONFIG.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-[#C8A04F] border-[#C8A04F] bg-amber-50/50 dark:bg-amber-900/10'
                                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.labelKey}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'global' && (
                        <GlobalSEOTab settings={settings} updateSettings={updateSettings} />
                    )}
                    {activeTab === 'structured' && (
                        <StructuredDataTab settings={settings} updateSettings={updateSettings} />
                    )}
                    {activeTab === 'performance' && (
                        <PerformanceTab settings={settings} updateSettings={updateSettings} />
                    )}
                    {activeTab === 'pages' && (
                        <PageLevelSEOTab settings={settings} updateSettings={updateSettings} />
                    )}
                    {activeTab === 'diagnostics' && (
                        <DiagnosticsTab
                            diagnostics={diagnostics}
                            onRunDiagnostics={runDiagnostics}
                            settings={settings}
                            updateSettings={updateSettings}
                        />
                    )}
                    {activeTab === 'ai' && (
                        <AISettingsTab settings={settings} updateSettings={updateSettings} />
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="معاينة SEO"
                maxWidth="max-w-4xl"
            >
                <SEOPreview settings={settings} device={previewDevice} onDeviceChange={setPreviewDevice} />
            </Modal>

            {/* Version History Modal */}
            <Modal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                title="سجل الإصدارات"
                maxWidth="max-w-2xl"
            >
                <VersionHistoryPanel versions={versionHistory} onRestore={restoreVersion} />
            </Modal>
        </div>
    );
};

// ============================================================================
// Global SEO Tab
// ============================================================================

interface TabProps {
    settings: CompleteSEOSettings;
    updateSettings: (path: string, value: any) => void;
}

const GlobalSEOTab: React.FC<TabProps> = ({ settings, updateSettings }) => {
    const { global } = settings;

    return (
        <div className="space-y-8">
            {/* Site Title */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-[#C8A04F]" />
                    العنوان والوصف الأساسي
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            عنوان الموقع (عربي)
                        </label>
                        <input
                            type="text"
                            value={global.siteTitle.ar}
                            onChange={(e) => updateSettings('global.siteTitle.ar', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="صيني كار - بوابة عملاء الجملة"
                            maxLength={60}
                        />
                        <p className="text-xs text-slate-400 mt-1">{global.siteTitle.ar.length}/60 حرف</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            عنوان الموقع (إنجليزي)
                        </label>
                        <input
                            type="text"
                            value={global.siteTitle.en}
                            onChange={(e) => updateSettings('global.siteTitle.en', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="SINI CAR - Wholesale B2B Portal"
                            maxLength={60}
                            dir="ltr"
                        />
                        <p className="text-xs text-slate-400 mt-1">{global.siteTitle.en.length}/60 chars</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            وصف الموقع (عربي)
                        </label>
                        <textarea
                            value={global.siteDescription.ar}
                            onChange={(e) => updateSettings('global.siteDescription.ar', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="بوابة قطع غيار السيارات بالجملة..."
                            rows={3}
                            maxLength={160}
                        />
                        <p className="text-xs text-slate-400 mt-1">{global.siteDescription.ar.length}/160 حرف</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            وصف الموقع (إنجليزي)
                        </label>
                        <textarea
                            value={global.siteDescription.en}
                            onChange={(e) => updateSettings('global.siteDescription.en', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="Wholesale Auto Parts Portal..."
                            rows={3}
                            maxLength={160}
                            dir="ltr"
                        />
                        <p className="text-xs text-slate-400 mt-1">{global.siteDescription.en.length}/160 chars</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            الكلمات المفتاحية (مفصولة بفواصل)
                        </label>
                        <input
                            type="text"
                            value={global.siteKeywords.ar}
                            onChange={(e) => updateSettings('global.siteKeywords.ar', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="قطع غيار, سيارات, جملة, تاجر"
                        />
                    </div>
                </div>
            </div>

            {/* Open Graph */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-500" />
                    Open Graph (للمشاركة على التواصل الاجتماعي)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            رابط صورة OG
                        </label>
                        <input
                            type="text"
                            value={global.openGraph.ogImage}
                            onChange={(e) => updateSettings('global.openGraph.ogImage', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="/og-image.jpg"
                            dir="ltr"
                        />
                        <p className="text-xs text-slate-400 mt-1">الحجم الموصى به: 1200x630 بكسل</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            نوع الصفحة
                        </label>
                        <select
                            value={global.openGraph.ogType}
                            onChange={(e) => updateSettings('global.openGraph.ogType', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                        >
                            <option value="website">Website</option>
                            <option value="article">Article</option>
                            <option value="product">Product</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            Locale
                        </label>
                        <input
                            type="text"
                            value={global.openGraph.ogLocale}
                            onChange={(e) => updateSettings('global.openGraph.ogLocale', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="ar_SA"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* Twitter Card */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-500 fill-current">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter Card
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            نوع البطاقة
                        </label>
                        <select
                            value={global.twitterCard.cardType}
                            onChange={(e) => updateSettings('global.twitterCard.cardType', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                        >
                            <option value="summary">Summary</option>
                            <option value="summary_large_image">Summary Large Image</option>
                            <option value="app">App</option>
                            <option value="player">Player</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            @site
                        </label>
                        <input
                            type="text"
                            value={global.twitterCard.site}
                            onChange={(e) => updateSettings('global.twitterCard.site', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="@sinicar"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* Canonical & URLs */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-purple-500" />
                    الروابط والإعدادات الأساسية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            الرابط الأساسي (Canonical URL)
                        </label>
                        <input
                            type="text"
                            value={global.canonicalUrl}
                            onChange={(e) => updateSettings('global.canonicalUrl', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="https://sinicar.com"
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            Google Verification Code
                        </label>
                        <input
                            type="text"
                            value={global.googleVerification}
                            onChange={(e) => updateSettings('global.googleVerification', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            placeholder="xxxxxxxxxxxxxxxxxxxx"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Structured Data Tab
// ============================================================================

const StructuredDataTab: React.FC<TabProps> = ({ settings, updateSettings }) => {
    const { structuredData } = settings;
    const [jsonLdPreview, setJsonLdPreview] = useState('');

    useEffect(() => {
        if (structuredData.organization.enabled) {
            setJsonLdPreview(SEOService.generateOrganizationJsonLd());
        }
    }, [structuredData]);

    return (
        <div className="space-y-8">
            {/* Organization Schema */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                        <Code size={20} className="text-emerald-500" />
                        Organization Schema
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={structuredData.organization.enabled}
                            onChange={(e) => updateSettings('structuredData.organization.enabled', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                        />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">مفعّل</span>
                    </label>
                </div>

                {structuredData.organization.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                اسم المؤسسة
                            </label>
                            <input
                                type="text"
                                value={structuredData.organization.name}
                                onChange={(e) => updateSettings('structuredData.organization.name', e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                رابط الشعار
                            </label>
                            <input
                                type="text"
                                value={structuredData.organization.logo}
                                onChange={(e) => updateSettings('structuredData.organization.logo', e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={structuredData.organization.email}
                                onChange={(e) => updateSettings('structuredData.organization.email', e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                رقم الهاتف
                            </label>
                            <input
                                type="tel"
                                value={structuredData.organization.phone}
                                onChange={(e) => updateSettings('structuredData.organization.phone', e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                dir="ltr"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                معاينة JSON-LD
                            </label>
                            <pre className="p-4 bg-slate-800 text-green-400 rounded-lg text-xs overflow-x-auto max-h-64" dir="ltr">
                                {jsonLdPreview || 'Schema غير مفعل'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Breadcrumb Schema */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                        <Code size={20} className="text-amber-500" />
                        Breadcrumb Schema
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={structuredData.breadcrumb.enabled}
                            onChange={(e) => updateSettings('structuredData.breadcrumb.enabled', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                        />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">مفعّل</span>
                    </label>
                </div>

                {structuredData.breadcrumb.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                عنوان الرئيسية (عربي)
                            </label>
                            <input
                                type="text"
                                value={structuredData.breadcrumb.homeLabel.ar}
                                onChange={(e) => updateSettings('structuredData.breadcrumb.homeLabel.ar', e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                placeholder="الرئيسية"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                الفاصل
                            </label>
                            <input
                                type="text"
                                value={structuredData.breadcrumb.separator}
                                onChange={(e) => updateSettings('structuredData.breadcrumb.separator', e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                placeholder="/"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Custom JSON-LD */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Code size={20} className="text-purple-500" />
                    JSON-LD مخصص
                </h3>
                <textarea
                    value={structuredData.customJsonLd}
                    onChange={(e) => updateSettings('structuredData.customJsonLd', e.target.value)}
                    className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-800 text-green-400 font-mono text-sm"
                    rows={10}
                    placeholder='{"@context": "https://schema.org", ...}'
                    dir="ltr"
                />
                <p className="text-xs text-slate-400 mt-2">أضف أي JSON-LD مخصص هنا (للمستخدمين المتقدمين)</p>
            </div>
        </div>
    );
};

// ============================================================================
// Performance Tab
// ============================================================================

const PerformanceTab: React.FC<TabProps> = ({ settings, updateSettings }) => {
    const { performance } = settings;

    return (
        <div className="space-y-8">
            {/* Lazy Loading */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                        <Zap size={20} className="text-amber-500" />
                        التحميل الكسول (Lazy Loading)
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={performance.lazyLoading.enabled}
                            onChange={(e) => updateSettings('performance.lazyLoading.enabled', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                        />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">مفعّل</span>
                    </label>
                </div>

                {performance.lazyLoading.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={performance.lazyLoading.images}
                                onChange={(e) => updateSettings('performance.lazyLoading.images', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                            />
                            <span className="font-bold text-slate-700 dark:text-white">الصور</span>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={performance.lazyLoading.iframes}
                                onChange={(e) => updateSettings('performance.lazyLoading.iframes', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                            />
                            <span className="font-bold text-slate-700 dark:text-white">الإطارات</span>
                        </label>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                المسافة من الشاشة (px)
                            </label>
                            <input
                                type="number"
                                value={performance.lazyLoading.threshold}
                                onChange={(e) => updateSettings('performance.lazyLoading.threshold', parseInt(e.target.value))}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                min={0}
                                max={1000}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Image Optimization */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-green-500" />
                    تحسين الصور
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={performance.images.autoWebP}
                            onChange={(e) => updateSettings('performance.images.autoWebP', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                        />
                        <div>
                            <span className="font-bold text-slate-700 dark:text-white block">تحويل WebP تلقائي</span>
                            <span className="text-xs text-slate-500">تحويل الصور لصيغة WebP لتقليل الحجم</span>
                        </div>
                    </label>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            جودة الصور (%)
                        </label>
                        <input
                            type="range"
                            value={performance.images.defaultQuality}
                            onChange={(e) => updateSettings('performance.images.defaultQuality', parseInt(e.target.value))}
                            className="w-full"
                            min={10}
                            max={100}
                        />
                        <p className="text-sm text-slate-500 text-center">{performance.images.defaultQuality}%</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            أقصى عرض للصور (px)
                        </label>
                        <input
                            type="number"
                            value={performance.images.maxWidth}
                            onChange={(e) => updateSettings('performance.images.maxWidth', parseInt(e.target.value))}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            min={100}
                            max={4000}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            نوع Placeholder
                        </label>
                        <select
                            value={performance.images.placeholderType}
                            onChange={(e) => updateSettings('performance.images.placeholderType', e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                        >
                            <option value="blur">Blur</option>
                            <option value="skeleton">Skeleton</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Scripts */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Code size={20} className="text-blue-500" />
                    السكربتات
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={performance.scripts.deferNonCritical}
                            onChange={(e) => updateSettings('performance.scripts.deferNonCritical', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                        />
                        <div>
                            <span className="font-bold text-slate-700 dark:text-white block">تأجيل السكربتات غير الحرجة</span>
                            <span className="text-xs text-slate-500">استخدام defer للسكربتات الثانوية</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={performance.scripts.asyncAnalytics}
                            onChange={(e) => updateSettings('performance.scripts.asyncAnalytics', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#C8A04F] focus:ring-[#C8A04F]"
                        />
                        <div>
                            <span className="font-bold text-slate-700 dark:text-white block">تحميل Analytics بشكل async</span>
                            <span className="text-xs text-slate-500">عدم حظر تحميل الصفحة</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Page Level SEO Tab
// ============================================================================

const PageLevelSEOTab: React.FC<TabProps> = ({ settings, updateSettings }) => {
    const PAGES = [
        { id: 'dashboard', label: 'لوحة التحكم' },
        { id: 'product_search', label: 'بحث المنتجات' },
        { id: 'product_details', label: 'تفاصيل المنتج' },
        { id: 'supplier_portal', label: 'بوابة الموردين' },
        { id: 'quote_request', label: 'طلب عرض سعر' },
        { id: 'import_china', label: 'الاستيراد من الصين' },
        { id: 'orders', label: 'الطلبات' },
        { id: 'about', label: 'من نحن' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>ملاحظة:</strong> تمكنك هذه الإعدادات من تخصيص SEO لكل صفحة على حدة. الصفحات غير المعدّلة ستستخدم الإعدادات العامة.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PAGES.map(page => (
                    <div
                        key={page.id}
                        className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-800 dark:text-white">{page.label}</span>
                            <span className="text-xs text-slate-400 font-mono">{page.id}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            يستخدم الإعدادات العامة
                        </p>
                        <button className="mt-3 text-sm text-[#C8A04F] font-bold hover:underline">
                            تخصيص SEO
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// Diagnostics Tab
// ============================================================================

interface DiagnosticsTabProps extends TabProps {
    diagnostics: DiagnosticReport | null;
    onRunDiagnostics: () => void;
}

const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({ diagnostics, onRunDiagnostics }) => {
    const getSeverityIcon = (severity: SEODiagnostic['severity']) => {
        switch (severity) {
            case 'error': return <AlertCircle size={18} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'info': return <Info size={18} className="text-blue-500" />;
            case 'success': return <CheckCircle size={18} className="text-green-500" />;
        }
    };

    const getSeverityBg = (severity: SEODiagnostic['severity']) => {
        switch (severity) {
            case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
            case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Run Button & Score */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <button
                    onClick={onRunDiagnostics}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a3a5c] transition-colors"
                >
                    <RefreshCw size={18} />
                    تشغيل الفحص
                </button>

                {diagnostics && (
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl font-black ${diagnostics.score >= 80 ? 'text-green-500' :
                            diagnostics.score >= 60 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                            {diagnostics.score}%
                        </div>
                        <div className="text-sm text-slate-500">
                            <p>أخطاء: <span className="font-bold text-red-500">{diagnostics.summary.errors}</span></p>
                            <p>تحذيرات: <span className="font-bold text-amber-500">{diagnostics.summary.warnings}</span></p>
                            <p>ناجح: <span className="font-bold text-green-500">{diagnostics.summary.passed}</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {diagnostics ? (
                <div className="space-y-3">
                    {diagnostics.diagnostics.map(diag => (
                        <div
                            key={diag.id}
                            className={`p-4 rounded-xl border ${getSeverityBg(diag.severity)}`}
                        >
                            <div className="flex items-start gap-3">
                                {getSeverityIcon(diag.severity)}
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white">{diag.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{diag.description}</p>
                                    {diag.recommendation && (
                                        <p className="text-sm text-slate-500 mt-2">
                                            <strong>التوصية:</strong> {diag.recommendation}
                                        </p>
                                    )}
                                </div>
                                {diag.autoFixable && (
                                    <button className="text-sm text-[#C8A04F] font-bold hover:underline whitespace-nowrap">
                                        إصلاح تلقائي
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-slate-400">
                    <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>اضغط "تشغيل الفحص" لبدء تحليل SEO</p>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// SEO Preview Component
// ============================================================================

interface SEOPreviewProps {
    settings: CompleteSEOSettings;
    device: 'desktop' | 'mobile';
    onDeviceChange: (device: 'desktop' | 'mobile') => void;
}

const SEOPreview: React.FC<SEOPreviewProps> = ({ settings, device, onDeviceChange }) => {
    const { global } = settings;
    const title = global.siteTitle.ar || global.siteTitle.en;
    const description = global.siteDescription.ar || global.siteDescription.en;
    const url = global.canonicalUrl || 'https://sinicar.com';

    return (
        <div className="space-y-6">
            {/* Device Toggle */}
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => onDeviceChange('desktop')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${device === 'desktop'
                        ? 'bg-[#0B1B3A] text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <Monitor size={16} />
                    Desktop
                </button>
                <button
                    onClick={() => onDeviceChange('mobile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${device === 'mobile'
                        ? 'bg-[#0B1B3A] text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <Smartphone size={16} />
                    Mobile
                </button>
            </div>

            {/* Google Preview */}
            <div>
                <h4 className="font-bold text-slate-600 dark:text-slate-300 mb-3">معاينة نتائج Google</h4>
                <div className={`bg-white rounded-xl p-4 border border-slate-200 ${device === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                    <p className="text-sm text-green-700 truncate" dir="ltr">{url}</p>
                    <h3 className="text-xl text-blue-600 hover:underline cursor-pointer truncate">{title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
                </div>
            </div>

            {/* Facebook Preview */}
            <div>
                <h4 className="font-bold text-slate-600 dark:text-slate-300 mb-3">معاينة Facebook / LinkedIn</h4>
                <div className={`bg-white rounded-xl overflow-hidden border border-slate-200 ${device === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                    <div className="bg-slate-200 h-48 flex items-center justify-center">
                        {global.openGraph.ogImage ? (
                            <img src={global.openGraph.ogImage} alt="OG" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-400">لا توجد صورة OG</span>
                        )}
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-slate-500 uppercase">{url.replace('https://', '').split('/')[0]}</p>
                        <h3 className="font-bold text-slate-800 mt-1">{global.openGraph.ogTitle.ar || title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{global.openGraph.ogDescription.ar || description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Version History Panel
// ============================================================================

interface VersionHistoryPanelProps {
    versions: SEOSettingsVersion[];
    onRestore: (versionId: string) => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ versions, onRestore }) => {
    if (versions.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>لا يوجد سجل إصدارات حتى الآن</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {versions.map(version => (
                <div
                    key={version.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-slate-800 dark:text-white">الإصدار {version.version}</span>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(version.createdAt).toLocaleString('ar-SA')} • بواسطة {version.createdBy}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{version.description}</p>
                        </div>
                        <button
                            onClick={() => onRestore(version.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#C8A04F] text-[#0B1B3A] rounded-lg font-bold text-sm hover:bg-[#b08d45] transition-colors"
                        >
                            <RotateCcw size={14} />
                            استعادة
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// AI Settings Tab
// ============================================================================

const AISettingsTab: React.FC<TabProps> = ({ settings, updateSettings }) => {
    const { addToast } = useToast();
    const [aiConfig, setAiConfig] = useState<AIConfig>(AISEOService.getConfig());
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});

    const saveConfig = (updates: Partial<AIConfig>) => {
        const updated = AISEOService.saveConfig(updates);
        setAiConfig(updated);
        addToast('تم حفظ إعدادات AI', 'success');
    };

    const generateContent = async (type: 'title' | 'description' | 'keywords' | 'schema') => {
        setIsGenerating(type);
        try {
            const context = {
                businessName: 'SINI CAR',
                industry: 'Auto Parts Wholesale',
                language: 'ar' as const,
                currentContent: type === 'title' ? settings.global.siteTitle.ar : settings.global.siteDescription.ar
            };

            let result;
            switch (type) {
                case 'title':
                    result = await AISEOService.generateTitle(context);
                    break;
                case 'description':
                    result = await AISEOService.generateDescription(context);
                    break;
                case 'keywords':
                    result = await AISEOService.generateKeywords(context);
                    break;
                case 'schema':
                    result = await AISEOService.generateSchema(context);
                    break;
            }

            if (result.success && result.result) {
                setGeneratedContent(prev => ({ ...prev, [type]: result.result! }));
                addToast('تم التوليد بنجاح!', 'success');
            } else {
                addToast(result.error || 'فشل التوليد', 'error');
            }
        } catch (error) {
            addToast('حدث خطأ أثناء التوليد', 'error');
        } finally {
            setIsGenerating(null);
        }
    };

    const applyGenerated = (type: string, value: string) => {
        switch (type) {
            case 'title':
                updateSettings('global.siteTitle.ar', value);
                break;
            case 'description':
                updateSettings('global.siteDescription.ar', value);
                break;
            case 'keywords':
                updateSettings('global.siteKeywords.ar', value);
                break;
        }
        addToast('تم تطبيق المحتوى', 'success');
    };

    return (
        <div className="space-y-8">
            {/* AI Status Banner */}
            <div className={`rounded-xl p-4 border ${aiConfig.enabled && aiConfig.apiKey
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}>
                <div className="flex items-center gap-3">
                    {aiConfig.enabled && aiConfig.apiKey ? (
                        <>
                            <CheckCircle size={20} className="text-green-500" />
                            <div>
                                <p className="font-bold text-green-800 dark:text-green-200">AI SEO مفعّل</p>
                                <p className="text-sm text-green-600 dark:text-green-300">المزود: {aiConfig.provider} • النموذج: {aiConfig.model}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={20} className="text-amber-500" />
                            <div>
                                <p className="font-bold text-amber-800 dark:text-amber-200">AI SEO غير مفعّل</p>
                                <p className="text-sm text-amber-600 dark:text-amber-300">أضف مفتاح API لتفعيل ميزات الذكاء الاصطناعي. حالياً يعمل بوضع الاختبار.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* API Configuration */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Key size={20} className="text-[#C8A04F]" />
                    إعدادات API
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            مزود الخدمة
                        </label>
                        <select
                            value={aiConfig.provider}
                            onChange={(e) => saveConfig({ provider: e.target.value as any })}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                        >
                            <option value="mock">وضع الاختبار (بدون API)</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="custom">API مخصص</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            النموذج
                        </label>
                        <select
                            value={aiConfig.model}
                            onChange={(e) => saveConfig({ model: e.target.value })}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            disabled={aiConfig.provider === 'mock'}
                        >
                            {aiConfig.provider === 'openai' && (
                                <>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                </>
                            )}
                            {aiConfig.provider === 'gemini' && (
                                <>
                                    <option value="gemini-pro">Gemini Pro</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                </>
                            )}
                            {aiConfig.provider === 'mock' && (
                                <option value="mock">وضع الاختبار</option>
                            )}
                            {aiConfig.provider === 'custom' && (
                                <option value="custom">مخصص</option>
                            )}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            مفتاح API
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={aiConfig.apiKey}
                                onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                className="flex-1 p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                placeholder={aiConfig.provider === 'openai' ? 'sk-...' : aiConfig.provider === 'gemini' ? 'AIza...' : 'أدخل مفتاح API'}
                                dir="ltr"
                                disabled={aiConfig.provider === 'mock'}
                            />
                            <button
                                onClick={() => saveConfig({ apiKey: aiConfig.apiKey, enabled: true })}
                                disabled={!aiConfig.apiKey || aiConfig.provider === 'mock'}
                                className="px-4 py-2 bg-[#0B1B3A] text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                تفعيل
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {aiConfig.provider === 'openai' && 'احصل على مفتاح من: https://platform.openai.com/api-keys'}
                            {aiConfig.provider === 'gemini' && 'احصل على مفتاح من: https://makersuite.google.com/app/apikey'}
                            {aiConfig.provider === 'mock' && 'وضع الاختبار لا يحتاج مفتاح API'}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Generation Tools */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-500" />
                    أدوات التوليد بالذكاء الاصطناعي
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title Generator */}
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-700 dark:text-white">توليد العنوان</span>
                            <button
                                onClick={() => generateContent('title')}
                                disabled={isGenerating === 'title'}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                {isGenerating === 'title' ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isGenerating === 'title' ? 'جاري...' : 'توليد'}
                            </button>
                        </div>
                        {generatedContent.title && (
                            <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-600 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-white mb-2">{generatedContent.title}</p>
                                <button
                                    onClick={() => applyGenerated('title', generatedContent.title)}
                                    className="text-xs text-[#C8A04F] font-bold hover:underline"
                                >
                                    تطبيق ←
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description Generator */}
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-700 dark:text-white">توليد الوصف</span>
                            <button
                                onClick={() => generateContent('description')}
                                disabled={isGenerating === 'description'}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                {isGenerating === 'description' ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isGenerating === 'description' ? 'جاري...' : 'توليد'}
                            </button>
                        </div>
                        {generatedContent.description && (
                            <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-600 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-white mb-2">{generatedContent.description}</p>
                                <button
                                    onClick={() => applyGenerated('description', generatedContent.description)}
                                    className="text-xs text-[#C8A04F] font-bold hover:underline"
                                >
                                    تطبيق ←
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Keywords Generator */}
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-700 dark:text-white">توليد الكلمات المفتاحية</span>
                            <button
                                onClick={() => generateContent('keywords')}
                                disabled={isGenerating === 'keywords'}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                {isGenerating === 'keywords' ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isGenerating === 'keywords' ? 'جاري...' : 'توليد'}
                            </button>
                        </div>
                        {generatedContent.keywords && (
                            <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-600 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-white mb-2">{generatedContent.keywords}</p>
                                <button
                                    onClick={() => applyGenerated('keywords', generatedContent.keywords)}
                                    className="text-xs text-[#C8A04F] font-bold hover:underline"
                                >
                                    تطبيق ←
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Schema Generator */}
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-700 dark:text-white">توليد Schema</span>
                            <button
                                onClick={() => generateContent('schema')}
                                disabled={isGenerating === 'schema'}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                {isGenerating === 'schema' ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isGenerating === 'schema' ? 'جاري...' : 'توليد'}
                            </button>
                        </div>
                        {generatedContent.schema && (
                            <div className="mt-2 p-3 bg-slate-800 rounded-lg">
                                <pre className="text-xs text-green-400 overflow-x-auto max-h-32" dir="ltr">{generatedContent.schema}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Info size={18} />
                    نصائح للاستخدام الأمثل
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>يمكنك استخدام وضع الاختبار لرؤية أمثلة على المحتوى المولّد</li>
                    <li>للحصول على أفضل النتائج، استخدم GPT-4 أو Gemini Pro</li>
                    <li>راجع المحتوى المولّد دائماً قبل تطبيقه</li>
                    <li>يمكنك تعديل المحتوى بعد التوليد ليناسب احتياجاتك</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminSEOCenter;
