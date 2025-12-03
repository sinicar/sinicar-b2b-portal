/**
 * صفحة إعدادات API المتقدمة
 * Advanced API Settings Page
 */

import React, { useState, useEffect } from 'react';
import { 
    Globe, Key, Server, RefreshCw, CheckCircle, XCircle, 
    AlertTriangle, Save, TestTube, Link2, Webhook, Settings2,
    Database, Clock, Shield, Eye, EyeOff, Copy, Trash2, Plus, Edit2
} from 'lucide-react';
import { MockApi } from '../services/mockApi';
import { ApiConfig, WebhookConfig, SiteSettings } from '../types';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';

interface ConnectionStatus {
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
    latency?: number;
}

export const AdminApiSettings: React.FC = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
    const [showToken, setShowToken] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'idle' });
    const [activeTab, setActiveTab] = useState<'connection' | 'sync' | 'webhooks' | 'advanced'>('connection');
    
    // Webhook Modal State
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
    const [webhookForm, setWebhookForm] = useState<Partial<WebhookConfig>>({});
    
    useEffect(() => {
        loadSettings();
    }, []);
    
    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await MockApi.getSettings();
            setSettings(data);
            setApiConfig(data.apiConfig);
        } catch (err) {
            addToast('فشل في تحميل الإعدادات', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const updateApiConfig = (updates: Partial<ApiConfig>) => {
        if (!apiConfig) return;
        setApiConfig({ ...apiConfig, ...updates });
    };
    
    const saveSettings = async () => {
        if (!settings || !apiConfig) return;
        
        setSaving(true);
        try {
            await MockApi.updateSettings({ ...settings, apiConfig });
            addToast('تم حفظ إعدادات API', 'success');
        } catch (err) {
            addToast('فشل في حفظ الإعدادات', 'error');
        } finally {
            setSaving(false);
        }
    };
    
    const testConnection = async () => {
        if (!apiConfig?.baseUrl) {
            addToast('الرجاء إدخال عنوان API أولاً', 'error');
            return;
        }
        
        setConnectionStatus({ status: 'testing' });
        
        try {
            const startTime = Date.now();
            // محاكاة اختبار الاتصال
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            const latency = Date.now() - startTime;
            
            // نجاح عشوائي للتجربة
            if (Math.random() > 0.3) {
                setConnectionStatus({
                    status: 'success',
                    message: 'تم الاتصال بنجاح',
                    latency
                });
                addToast('الاتصال ناجح!', 'success');
            } else {
                throw new Error('Connection timeout');
            }
        } catch (err: any) {
            setConnectionStatus({
                status: 'error',
                message: err.message || 'فشل الاتصال'
            });
            addToast('فشل في الاتصال بالخادم', 'error');
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast('تم النسخ', 'info');
    };
    
    const handleAddWebhook = () => {
        setEditingWebhook(null);
        setWebhookForm({
            name: '',
            url: '',
            events: [],
            isActive: true,
            secret: generateSecret()
        });
        setShowWebhookModal(true);
    };
    
    const handleEditWebhook = (webhook: WebhookConfig) => {
        setEditingWebhook(webhook);
        setWebhookForm({ ...webhook });
        setShowWebhookModal(true);
    };
    
    const handleSaveWebhook = () => {
        if (!webhookForm.name || !webhookForm.url) {
            addToast('الرجاء إدخال الاسم والرابط', 'error');
            return;
        }
        
        if (!apiConfig) return;
        
        const newWebhook: WebhookConfig = {
            id: editingWebhook?.id || `wh_${Date.now()}`,
            name: webhookForm.name || '',
            url: webhookForm.url || '',
            events: webhookForm.events || [],
            isActive: webhookForm.isActive ?? true,
            secret: webhookForm.secret || generateSecret(),
            status: 'Inactive'
        };
        
        let updatedWebhooks = apiConfig.webhooks || [];
        if (editingWebhook) {
            updatedWebhooks = updatedWebhooks.map(w => w.id === editingWebhook.id ? newWebhook : w);
        } else {
            updatedWebhooks = [...updatedWebhooks, newWebhook];
        }
        
        updateApiConfig({ webhooks: updatedWebhooks });
        setShowWebhookModal(false);
        addToast(editingWebhook ? 'تم تحديث Webhook' : 'تم إضافة Webhook', 'success');
    };
    
    const handleDeleteWebhook = (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الـ Webhook؟')) return;
        if (!apiConfig) return;
        
        updateApiConfig({
            webhooks: apiConfig.webhooks.filter(w => w.id !== id)
        });
        addToast('تم حذف Webhook', 'info');
    };
    
    const generateSecret = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };
    
    const availableEvents = [
        { value: 'order.created', label: 'طلب جديد' },
        { value: 'order.updated', label: 'تحديث طلب' },
        { value: 'order.cancelled', label: 'إلغاء طلب' },
        { value: 'product.updated', label: 'تحديث منتج' },
        { value: 'inventory.changed', label: 'تغيير مخزون' },
        { value: 'customer.created', label: 'عميل جديد' },
        { value: 'quote.submitted', label: 'طلب تسعير جديد' }
    ];
    
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="animate-spin text-[#C8A04F]" size={32} />
            </div>
        );
    }
    
    if (!apiConfig) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                <p className="text-slate-600 font-bold">فشل في تحميل إعدادات API</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Globe className="text-[#C8A04F]" size={24} />
                            إعدادات API المتقدمة
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            ربط النظام مع Onyx ERP أو أي نظام خارجي
                        </p>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-[#C8A04F] hover:bg-[#b8904a] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        data-testid="button-save-api-settings"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        حفظ الإعدادات
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    {[
                        { id: 'connection', label: 'الاتصال', icon: Link2 },
                        { id: 'sync', label: 'المزامنة', icon: RefreshCw },
                        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                        { id: 'advanced', label: 'متقدم', icon: Settings2 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
                                activeTab === tab.id
                                    ? 'text-[#C8A04F] border-[#C8A04F]'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                            data-testid={`tab-${tab.id}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Connection Tab */}
            {activeTab === 'connection' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Server size={20} />
                        إعدادات الاتصال
                    </h3>
                    
                    {/* Environment Toggle */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => updateApiConfig({ environment: 'SANDBOX' })}
                            className={`flex-1 py-4 rounded-xl border-2 font-bold transition-colors ${
                                apiConfig.environment === 'SANDBOX'
                                    ? 'bg-amber-50 border-amber-400 text-amber-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            data-testid="button-env-sandbox"
                        >
                            <AlertTriangle className="mx-auto mb-2" size={24} />
                            بيئة التجربة (Sandbox)
                        </button>
                        <button
                            onClick={() => updateApiConfig({ environment: 'PRODUCTION' })}
                            className={`flex-1 py-4 rounded-xl border-2 font-bold transition-colors ${
                                apiConfig.environment === 'PRODUCTION'
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            data-testid="button-env-production"
                        >
                            <CheckCircle className="mx-auto mb-2" size={24} />
                            بيئة الإنتاج (Production)
                        </button>
                    </div>
                    
                    {/* Base URL */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            عنوان API الأساسي (Base URL)
                        </label>
                        <input
                            type="url"
                            value={apiConfig.baseUrl}
                            onChange={(e) => updateApiConfig({ baseUrl: e.target.value })}
                            placeholder="https://api.onyx-erp.com/v1"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            data-testid="input-base-url"
                        />
                    </div>
                    
                    {/* Auth Token */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            رمز المصادقة (API Token)
                        </label>
                        <div className="relative">
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={apiConfig.authToken}
                                onChange={(e) => updateApiConfig({ authToken: e.target.value })}
                                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full px-4 py-3 pr-24 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent font-mono text-sm"
                                data-testid="input-auth-token"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600"
                                    title={showToken ? 'إخفاء' : 'إظهار'}
                                >
                                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(apiConfig.authToken)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600"
                                    title="نسخ"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Endpoints */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700">نقاط النهاية (Endpoints)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['products', 'orders', 'customers'].map((endpoint) => (
                                <div key={endpoint} className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-600 capitalize">
                                        {endpoint === 'products' ? 'المنتجات' : endpoint === 'orders' ? 'الطلبات' : 'العملاء'}
                                    </label>
                                    <input
                                        type="text"
                                        value={apiConfig.endpoints[endpoint as keyof typeof apiConfig.endpoints]}
                                        onChange={(e) => updateApiConfig({
                                            endpoints: { ...apiConfig.endpoints, [endpoint]: e.target.value }
                                        })}
                                        placeholder={`/api/${endpoint}`}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Connection Test */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {connectionStatus.status === 'idle' && (
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                )}
                                {connectionStatus.status === 'testing' && (
                                    <RefreshCw className="animate-spin text-blue-500" size={16} />
                                )}
                                {connectionStatus.status === 'success' && (
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                )}
                                {connectionStatus.status === 'error' && (
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                )}
                                <div>
                                    <p className="font-bold text-slate-700">
                                        {connectionStatus.status === 'idle' && 'لم يتم الاختبار بعد'}
                                        {connectionStatus.status === 'testing' && 'جاري اختبار الاتصال...'}
                                        {connectionStatus.status === 'success' && 'متصل'}
                                        {connectionStatus.status === 'error' && 'فشل الاتصال'}
                                    </p>
                                    {connectionStatus.latency && (
                                        <p className="text-xs text-slate-500">
                                            زمن الاستجابة: {connectionStatus.latency}ms
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={testConnection}
                                disabled={connectionStatus.status === 'testing'}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                                data-testid="button-test-connection"
                            >
                                <TestTube size={16} />
                                اختبار الاتصال
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Sync Tab */}
            {activeTab === 'sync' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Database size={20} />
                        إعدادات المزامنة
                    </h3>
                    
                    {/* Sync Interval */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">فترة المزامنة التلقائية</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'REALTIME', label: 'فوري', icon: '⚡' },
                                { value: '15MIN', label: 'كل 15 دقيقة', icon: '🔄' },
                                { value: 'HOURLY', label: 'كل ساعة', icon: '⏰' },
                                { value: 'DAILY', label: 'يومي', icon: '📅' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateApiConfig({ syncInterval: option.value as any })}
                                    className={`p-4 rounded-xl border-2 text-center transition-colors ${
                                        apiConfig.syncInterval === option.value
                                            ? 'bg-[#C8A04F]/10 border-[#C8A04F] text-[#C8A04F]'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">{option.icon}</span>
                                    <span className="font-bold text-sm">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Sync Entities */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">البيانات المراد مزامنتها</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { key: 'products', label: 'المنتجات', icon: '📦' },
                                { key: 'inventory', label: 'المخزون', icon: '📊' },
                                { key: 'prices', label: 'الأسعار', icon: '💰' },
                                { key: 'customers', label: 'العملاء', icon: '👥' },
                                { key: 'orders', label: 'الطلبات', icon: '🛒' }
                            ].map((entity) => (
                                <button
                                    key={entity.key}
                                    onClick={() => updateApiConfig({
                                        syncEntities: {
                                            ...apiConfig.syncEntities,
                                            [entity.key]: !apiConfig.syncEntities[entity.key as keyof typeof apiConfig.syncEntities]
                                        }
                                    })}
                                    className={`p-4 rounded-xl border-2 text-center transition-colors ${
                                        apiConfig.syncEntities[entity.key as keyof typeof apiConfig.syncEntities]
                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">{entity.icon}</span>
                                    <span className="font-bold text-sm">{entity.label}</span>
                                    <div className="mt-2">
                                        {apiConfig.syncEntities[entity.key as keyof typeof apiConfig.syncEntities] ? (
                                            <CheckCircle className="mx-auto text-emerald-500" size={18} />
                                        ) : (
                                            <XCircle className="mx-auto text-slate-300" size={18} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Enable Live Sync Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <h4 className="font-bold text-slate-700">تفعيل المزامنة المباشرة</h4>
                            <p className="text-sm text-slate-500">
                                عند التفعيل، سيتم تحديث البيانات تلقائياً حسب الفترة المحددة
                            </p>
                        </div>
                        <button
                            onClick={() => updateApiConfig({ enableLiveSync: !apiConfig.enableLiveSync })}
                            className={`relative w-14 h-7 rounded-full transition-colors ${
                                apiConfig.enableLiveSync ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            data-testid="toggle-live-sync"
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                apiConfig.enableLiveSync ? 'translate-x-1' : 'translate-x-8'
                            }`} />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Webhook size={20} />
                            Webhooks
                        </h3>
                        <button
                            onClick={handleAddWebhook}
                            className="flex items-center gap-2 px-4 py-2 bg-[#C8A04F] hover:bg-[#b8904a] text-white rounded-lg font-bold text-sm transition-colors"
                            data-testid="button-add-webhook"
                        >
                            <Plus size={16} />
                            إضافة Webhook
                        </button>
                    </div>
                    
                    {apiConfig.webhooks.length === 0 ? (
                        <div className="text-center py-12">
                            <Webhook size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">لا توجد Webhooks مضافة</p>
                            <p className="text-sm text-slate-400 mt-1">
                                أضف Webhook لاستلام إشعارات فورية عند حدوث أحداث معينة
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {apiConfig.webhooks.map((webhook) => (
                                <div
                                    key={webhook.id}
                                    className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800">{webhook.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    webhook.isActive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {webhook.isActive ? 'مفعل' : 'معطل'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    webhook.status === 'Healthy'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : webhook.status === 'Failing'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {webhook.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 font-mono mt-1 truncate">
                                                {webhook.url}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {webhook.events.map((event) => (
                                                    <span
                                                        key={event}
                                                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold"
                                                    >
                                                        {availableEvents.find(e => e.value === event)?.label || event}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditWebhook(webhook)}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWebhook(webhook.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Settings2 size={20} />
                        إعدادات متقدمة
                    </h3>
                    
                    {/* Rate Limit */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            الحد الأقصى للطلبات (في الدقيقة)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={apiConfig.rateLimit}
                            onChange={(e) => updateApiConfig({ rateLimit: parseInt(e.target.value) || 60 })}
                            className="w-full md:w-64 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            data-testid="input-rate-limit"
                        />
                        <p className="text-xs text-slate-500">
                            يحد من عدد الطلبات المرسلة للخادم الخارجي لتجنب الحظر
                        </p>
                    </div>
                    
                    {/* Debug Mode */}
                    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div>
                            <h4 className="font-bold text-amber-800 flex items-center gap-2">
                                <AlertTriangle size={18} />
                                وضع التصحيح (Debug Mode)
                            </h4>
                            <p className="text-sm text-amber-700 mt-1">
                                عند التفعيل، سيتم تسجيل جميع طلبات API في وحدة التحكم
                            </p>
                        </div>
                        <button
                            onClick={() => updateApiConfig({ debugMode: !apiConfig.debugMode })}
                            className={`relative w-14 h-7 rounded-full transition-colors ${
                                apiConfig.debugMode ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            data-testid="toggle-debug-mode"
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                apiConfig.debugMode ? 'translate-x-1' : 'translate-x-8'
                            }`} />
                        </button>
                    </div>
                    
                    {/* Webhook Secret */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Shield size={16} />
                            مفتاح التحقق السري (Webhook Secret)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={apiConfig.webhookSecret || ''}
                                onChange={(e) => updateApiConfig({ webhookSecret: e.target.value })}
                                placeholder="whsec_xxxxxxxxxxxxxxxx"
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-webhook-secret"
                            />
                            <button
                                onClick={() => updateApiConfig({ webhookSecret: generateSecret() })}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                            >
                                توليد جديد
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            يُستخدم للتحقق من صحة طلبات Webhook الواردة
                        </p>
                    </div>
                </div>
            )}
            
            {/* Webhook Modal */}
            {showWebhookModal && (
                <Modal
                    isOpen={showWebhookModal}
                    onClose={() => setShowWebhookModal(false)}
                    title={editingWebhook ? 'تعديل Webhook' : 'إضافة Webhook جديد'}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">اسم الـ Webhook</label>
                            <input
                                type="text"
                                value={webhookForm.name || ''}
                                onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                                placeholder="مثال: إشعار الطلبات الجديدة"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-webhook-name"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">عنوان URL</label>
                            <input
                                type="url"
                                value={webhookForm.url || ''}
                                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                                placeholder="https://example.com/webhook"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-webhook-url"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">الأحداث</label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableEvents.map((event) => (
                                    <label
                                        key={event.value}
                                        className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={webhookForm.events?.includes(event.value) || false}
                                            onChange={(e) => {
                                                const events = webhookForm.events || [];
                                                if (e.target.checked) {
                                                    setWebhookForm({ ...webhookForm, events: [...events, event.value] });
                                                } else {
                                                    setWebhookForm({ ...webhookForm, events: events.filter(ev => ev !== event.value) });
                                                }
                                            }}
                                            className="rounded text-[#C8A04F] focus:ring-[#C8A04F]"
                                        />
                                        <span className="text-sm font-bold text-slate-700">{event.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="font-bold text-slate-700">تفعيل Webhook</span>
                            <button
                                type="button"
                                onClick={() => setWebhookForm({ ...webhookForm, isActive: !webhookForm.isActive })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                    webhookForm.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    webhookForm.isActive ? 'translate-x-0.5' : 'translate-x-6'
                                }`} />
                            </button>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveWebhook}
                                className="flex-1 py-3 bg-[#C8A04F] hover:bg-[#b8904a] text-white rounded-xl font-bold transition-colors"
                                data-testid="button-save-webhook"
                            >
                                حفظ
                            </button>
                            <button
                                onClick={() => setShowWebhookModal(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminApiSettings;
