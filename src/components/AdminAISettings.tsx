import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Api from '../services/api';
import { 
  AISettings, 
  AIProviderConfig, 
  AIFeatureSettings,
  AIUsageLimits,
  AIProvider 
} from '../types';
import { 
  Bot, 
  Settings, 
  Zap, 
  Shield, 
  BarChart3,
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  MessageSquare,
  Search,
  Languages,
  FileSearch,
  TrendingUp,
  Users,
  AlertTriangle,
  Package,
  Megaphone,
  Target
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';

type TabType = 'providers' | 'features' | 'limits' | 'prompts' | 'safety';

// Reusable toggle switch component that works reliably with Playwright
const ToggleSwitch = ({ 
  checked, 
  onChange, 
  testId 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  testId: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    }`}
    data-testid={testId}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

export default function AdminAISettings() {
  const { t } = useTranslation();
  const { language, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('providers');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await Api.getAISettings();
      // Safe check - ensure providers is an array
      if (data && typeof data === 'object') {
        const safeData = {
          ...data,
          providers: Array.isArray(data.providers) ? data.providers : [],
          usageLimits: Array.isArray(data.usageLimits) ? data.usageLimits : [],
          blockedTopics: Array.isArray(data.blockedTopics) ? data.blockedTopics : [],
        };
        setSettings(safeData as AISettings);
        
        const expanded: Record<string, boolean> = {};
        safeData.providers.forEach(p => {
          expanded[p.id] = p.enabled;
        });
        setExpandedProviders(expanded);
      } else {
        throw new Error('Invalid settings data');
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      addToast(t('common.loadError', 'فشل في تحميل الإعدادات'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await Api.saveAISettings(settings);
      setHasChanges(false);
      addToast(t('aiSettings.savedSuccess', 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح'), 'success');
    } catch (error) {
      addToast(t('common.saveError', 'حدث خطأ أثناء الحفظ'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(t('aiSettings.confirmReset', 'هل أنت متأكد من إعادة تعيين الإعدادات؟'))) {
      try {
        const defaults = await Api.resetAISettings();
        setSettings(defaults);
        setHasChanges(false);
        addToast(t('aiSettings.resetSuccess', 'تم إعادة تعيين الإعدادات'), 'success');
      } catch (error) {
        addToast(t('common.error', 'حدث خطأ'), 'error');
      }
    }
  };

  const updateSettings = (updates: Partial<AISettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
    setHasChanges(true);
  };

  const updateProvider = (providerId: string, updates: Partial<AIProviderConfig>) => {
    if (!settings) return;
    const updatedProviders = settings.providers.map(p => 
      p.id === providerId ? { ...p, ...updates } : p
    );
    updateSettings({ providers: updatedProviders });
  };

  const setDefaultProvider = (providerId: string) => {
    if (!settings) return;
    const provider = settings.providers.find(p => p.id === providerId);
    if (!provider) return;
    
    const updatedProviders = settings.providers.map(p => ({
      ...p,
      isDefault: p.id === providerId
    }));
    updateSettings({ 
      providers: updatedProviders,
      defaultProvider: provider.provider
    });
  };

  const updateFeature = (key: keyof AIFeatureSettings, value: boolean) => {
    if (!settings) return;
    updateSettings({
      features: { ...settings.features, [key]: value }
    });
  };

  const updateUsageLimit = (role: string, updates: Partial<AIUsageLimits>) => {
    if (!settings) return;
    const updatedLimits = settings.usageLimits.map(l => 
      l.role === role ? { ...l, ...updates } : l
    );
    updateSettings({ usageLimits: updatedLimits });
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'gemini': return '✨';
      case 'anthropic': return '🧠';
      default: return '⚙️';
    }
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'openai': return 'bg-green-100 text-green-800';
      case 'gemini': return 'bg-blue-100 text-blue-800';
      case 'anthropic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!settings) return null;

  const tabs = [
    { id: 'providers', label: t('aiSettings.tabs.providers', 'مزودي الخدمة'), icon: Zap },
    { id: 'features', label: t('aiSettings.tabs.features', 'الميزات'), icon: Sparkles },
    { id: 'limits', label: t('aiSettings.tabs.limits', 'حدود الاستخدام'), icon: BarChart3 },
    { id: 'prompts', label: t('aiSettings.tabs.prompts', 'النصوص'), icon: MessageSquare },
    { id: 'safety', label: t('aiSettings.tabs.safety', 'الأمان'), icon: Shield }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Bot className="w-7 h-7 text-blue-600" />
            {t('aiSettings.title', 'إعدادات الذكاء الاصطناعي')}
          </h1>
          <p className="text-slate-500 mt-1">{t('aiSettings.description', 'إدارة مزودي الذكاء الاصطناعي وميزاتهم')}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
              {t('aiSettings.unsavedChanges', 'تغييرات غير محفوظة')}
            </span>
          )}
          <button 
            onClick={handleReset} 
            disabled={saving} 
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            data-testid="button-reset-ai"
          >
            <RotateCcw className="w-4 h-4" />
            {t('aiSettings.resetDefaults', 'إعادة تعيين')}
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || !hasChanges} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="button-save-ai"
          >
            <Save className="w-4 h-4" />
            {saving ? t('common.saving', 'جاري الحفظ...') : t('aiSettings.saveChanges', 'حفظ التغييرات')}
          </button>
        </div>
      </div>

      {/* Global Toggle */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Bot className={`w-5 h-5 ${settings.enabled ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <label className="text-base font-medium text-slate-800">{t('aiSettings.globalEnable', 'تفعيل الذكاء الاصطناعي')}</label>
              <p className="text-sm text-slate-500">{t('aiSettings.globalEnableDesc', 'تفعيل أو تعطيل جميع ميزات الذكاء الاصطناعي')}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            data-testid="switch-ai-global"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            data-testid={`tab-ai-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {t('aiSettings.providers.title', 'مزودي الذكاء الاصطناعي')}
              </h2>
              <p className="text-slate-500 mt-1">{t('aiSettings.providers.description', 'إدارة اتصالات OpenAI و Gemini و Anthropic')}</p>
            </div>
            
            <div className="space-y-4">
              {(settings?.providers || []).map(provider => (
                <div 
                  key={provider.id} 
                  className={`border rounded-xl overflow-hidden ${provider.enabled ? 'border-blue-200' : 'border-slate-200'}`}
                >
                  {/* Provider Header */}
                  <div 
                    className={`flex items-center justify-between p-4 cursor-pointer ${provider.enabled ? 'bg-blue-50' : 'bg-slate-50'}`}
                    onClick={() => setExpandedProviders(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getProviderIcon(provider.provider)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {provider.displayName[language as keyof typeof provider.displayName] || provider.displayName.en}
                          </span>
                          {provider.isDefault && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              {t('aiSettings.providers.default', 'افتراضي')}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getProviderColor(provider.provider)}`}>
                            {provider.model}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {provider.enabled ? t('aiSettings.providers.enabled', 'مفعل') : t('aiSettings.providers.disabled', 'معطل')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={provider.enabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProvider(provider.id, { enabled: !provider.enabled });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          provider.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        data-testid={`switch-provider-${provider.id}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform ${
                            provider.enabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      {expandedProviders[provider.id] ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </div>
                  </div>

                  {/* Provider Details */}
                  {expandedProviders[provider.id] && (
                    <div className="p-4 border-t border-slate-200 space-y-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* API Key */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">{t('aiSettings.providers.apiKey', 'مفتاح API')}</label>
                          <div className="relative">
                            <input
                              type={showApiKeys[provider.id] ? 'text' : 'password'}
                              value={provider.apiKey || ''}
                              onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                              placeholder={t('aiSettings.providers.apiKeyPlaceholder', 'أدخل مفتاح API')}
                              className="w-full px-4 py-2 pe-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              data-testid={`input-apikey-${provider.id}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                              className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showApiKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">{t('aiSettings.providers.apiKeyNote', 'يمكن ترك هذا الحقل فارغاً لاستخدام Replit AI')}</p>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">{t('aiSettings.providers.model', 'النموذج')}</label>
                          <select 
                            value={provider.model} 
                            onChange={(e) => updateProvider(provider.id, { model: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            data-testid={`select-model-${provider.id}`}
                          >
                            {provider.provider === 'openai' && (
                              <>
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini">GPT-4o Mini</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                              </>
                            )}
                            {provider.provider === 'gemini' && (
                              <>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-pro">Gemini Pro</option>
                              </>
                            )}
                            {provider.provider === 'anthropic' && (
                              <>
                                <option value="claude-opus-4-5">Claude Opus 4.5</option>
                                <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                                <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Max Tokens */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">{t('aiSettings.providers.maxTokens', 'الحد الأقصى للرموز')}</label>
                          <input
                            type="number"
                            value={provider.maxTokens}
                            onChange={(e) => updateProvider(provider.id, { maxTokens: parseInt(e.target.value) || 4096 })}
                            min={256}
                            max={32000}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            data-testid={`input-tokens-${provider.id}`}
                          />
                        </div>

                        {/* Rate Limits */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">{t('aiSettings.providers.rateLimit', 'حدود الطلبات')}</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={provider.maxRequestsPerMinute}
                              onChange={(e) => updateProvider(provider.id, { maxRequestsPerMinute: parseInt(e.target.value) || 60 })}
                              placeholder={t('aiSettings.providers.perMinute', 'في الدقيقة')}
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <input
                              type="number"
                              value={provider.maxRequestsPerDay}
                              onChange={(e) => updateProvider(provider.id, { maxRequestsPerDay: parseInt(e.target.value) || 1000 })}
                              placeholder={t('aiSettings.providers.perDay', 'في اليوم')}
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${provider.supportsChat ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {provider.supportsChat ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {t('aiSettings.providers.chat', 'محادثة')}
                        </span>
                        <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${provider.supportsImageGeneration ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {provider.supportsImageGeneration ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {t('aiSettings.providers.imageGen', 'توليد الصور')}
                        </span>
                        <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${provider.supportsVision ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {provider.supportsVision ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {t('aiSettings.providers.vision', 'رؤية')}
                        </span>
                        <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${provider.supportsAudio ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {provider.supportsAudio ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {t('aiSettings.providers.audio', 'صوت')}
                        </span>
                      </div>

                      {/* Set as Default */}
                      {!provider.isDefault && provider.enabled && (
                        <button 
                          onClick={() => setDefaultProvider(provider.id)}
                          className="px-4 py-2 text-sm font-medium border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          data-testid={`button-default-${provider.id}`}
                        >
                          {t('aiSettings.providers.setDefault', 'تعيين كافتراضي')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-4">
          {/* Customer Features */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('aiSettings.features.customerTitle', 'ميزات العملاء')}
              </h2>
              <p className="text-slate-500 mt-1">{t('aiSettings.features.customerDesc', 'ميزات الذكاء الاصطناعي المتاحة للعملاء')}</p>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'enableAIAssistant', icon: MessageSquare, label: 'المساعد الذكي', desc: 'مساعد دردشة يساعد العملاء في الاستفسارات' },
                { key: 'enableAIProductSearch', icon: Search, label: 'البحث الذكي', desc: 'بحث محسن بالذكاء الاصطناعي عن المنتجات' },
                { key: 'enableAIPartMatching', icon: FileSearch, label: 'مطابقة القطع', desc: 'مطابقة ذكية لأرقام القطع' },
                { key: 'enableAIVinDecoding', icon: Package, label: 'فك شيفرة VIN', desc: 'استخراج معلومات السيارة من رقم الهيكل' },
                { key: 'enableAIPriceAnalysis', icon: TrendingUp, label: 'تحليل الأسعار', desc: 'مقارنة وتحليل الأسعار' },
                { key: 'enableAITranslation', icon: Languages, label: 'الترجمة الفورية', desc: 'ترجمة تلقائية للمحتوى' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-slate-400" />
                    <div>
                      <label className="font-medium text-slate-800">{t(`aiSettings.features.${feature.key}`, feature.label)}</label>
                      <p className="text-sm text-slate-500">{t(`aiSettings.features.${feature.key}Desc`, feature.desc)}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.features[feature.key as keyof AIFeatureSettings]}
                    onChange={(checked) => updateFeature(feature.key as keyof AIFeatureSettings, checked)}
                    testId={`switch-feature-${feature.key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Admin Features */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('aiSettings.features.adminTitle', 'ميزات المشرفين')}
              </h2>
              <p className="text-slate-500 mt-1">{t('aiSettings.features.adminDesc', 'ميزات الذكاء الاصطناعي المتاحة للمشرفين')}</p>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'enableAIOrderAnalysis', icon: BarChart3, label: 'تحليل الطلبات', desc: 'تحليل ذكي لبيانات الطلبات' },
                { key: 'enableAICustomerInsights', icon: Users, label: 'رؤى العملاء', desc: 'تحليل سلوك العملاء' },
                { key: 'enableAIReports', icon: TrendingUp, label: 'التقارير الذكية', desc: 'توليد تقارير تلقائية' },
                { key: 'enableAIFraudDetection', icon: AlertTriangle, label: 'كشف الاحتيال', desc: 'اكتشاف الأنشطة المشبوهة' },
                { key: 'enableAIInventoryPrediction', icon: Package, label: 'توقع المخزون', desc: 'توقع احتياجات المخزون' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-slate-400" />
                    <div>
                      <label className="font-medium text-slate-800">{t(`aiSettings.features.${feature.key}`, feature.label)}</label>
                      <p className="text-sm text-slate-500">{t(`aiSettings.features.${feature.key}Desc`, feature.desc)}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.features[feature.key as keyof AIFeatureSettings]}
                    onChange={(checked) => updateFeature(feature.key as keyof AIFeatureSettings, checked)}
                    testId={`switch-feature-${feature.key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Features */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                {t('aiSettings.features.marketingTitle', 'ميزات التسويق')}
              </h2>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'enableAIContentGeneration', icon: Sparkles, label: 'توليد المحتوى', desc: 'إنشاء محتوى تسويقي تلقائي' },
                { key: 'enableAICampaignOptimization', icon: Target, label: 'تحسين الحملات', desc: 'تحسين الحملات الإعلانية تلقائياً' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-slate-400" />
                    <div>
                      <label className="font-medium text-slate-800">{t(`aiSettings.features.${feature.key}`, feature.label)}</label>
                      <p className="text-sm text-slate-500">{t(`aiSettings.features.${feature.key}Desc`, feature.desc)}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.features[feature.key as keyof AIFeatureSettings]}
                    onChange={(checked) => updateFeature(feature.key as keyof AIFeatureSettings, checked)}
                    testId={`switch-feature-${feature.key}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'limits' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('aiSettings.limits.title', 'حدود الاستخدام')}
            </h2>
            <p className="text-slate-500 mt-1">{t('aiSettings.limits.description', 'تعيين حدود الاستخدام حسب دور المستخدم')}</p>
          </div>
          
          <div className="space-y-6">
            {(settings?.usageLimits || []).map(limit => (
              <div key={limit.role} className="p-4 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700 rounded-full">
                    {limit.role}
                  </span>
                  <span className="text-sm text-slate-500">
                    {t(`aiSettings.limits.role.${limit.role}`, limit.role)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">{t('aiSettings.limits.dailyRequests', 'الطلبات اليومية')}</label>
                    <input
                      type="number"
                      value={limit.dailyRequests}
                      onChange={(e) => updateUsageLimit(limit.role, { dailyRequests: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid={`input-daily-${limit.role}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">{t('aiSettings.limits.monthlyRequests', 'الطلبات الشهرية')}</label>
                    <input
                      type="number"
                      value={limit.monthlyRequests}
                      onChange={(e) => updateUsageLimit(limit.role, { monthlyRequests: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid={`input-monthly-${limit.role}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">{t('aiSettings.limits.maxTokens', 'الحد الأقصى للرموز')}</label>
                    <input
                      type="number"
                      value={limit.maxTokensPerRequest}
                      onChange={(e) => updateUsageLimit(limit.role, { maxTokensPerRequest: parseInt(e.target.value) || 0 })}
                      min={256}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid={`input-maxtokens-${limit.role}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t('aiSettings.prompts.title', 'النصوص التوجيهية')}
            </h2>
            <p className="text-slate-500 mt-1">{t('aiSettings.prompts.description', 'تخصيص النصوص التوجيهية للذكاء الاصطناعي')}</p>
          </div>
          
          <div className="space-y-6">
            {/* Customer Assistant Prompt */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-slate-800">{t('aiSettings.prompts.customerAssistant', 'المساعد الذكي للعملاء')}</label>
              <p className="text-sm text-slate-500">{t('aiSettings.prompts.customerAssistantDesc', 'النص التوجيهي لمساعد الدردشة')}</p>
              <textarea
                value={settings.systemPrompts.customerAssistant[language as keyof typeof settings.systemPrompts.customerAssistant] || settings.systemPrompts.customerAssistant.en}
                onChange={(e) => updateSettings({
                  systemPrompts: {
                    ...settings.systemPrompts,
                    customerAssistant: {
                      ...settings.systemPrompts.customerAssistant,
                      [language]: e.target.value
                    }
                  }
                })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="textarea-prompt-assistant"
              />
            </div>

            {/* Product Search Prompt */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-slate-800">{t('aiSettings.prompts.productSearch', 'البحث عن المنتجات')}</label>
              <p className="text-sm text-slate-500">{t('aiSettings.prompts.productSearchDesc', 'النص التوجيهي للبحث الذكي')}</p>
              <textarea
                value={settings.systemPrompts.productSearch[language as keyof typeof settings.systemPrompts.productSearch] || settings.systemPrompts.productSearch.en}
                onChange={(e) => updateSettings({
                  systemPrompts: {
                    ...settings.systemPrompts,
                    productSearch: {
                      ...settings.systemPrompts.productSearch,
                      [language]: e.target.value
                    }
                  }
                })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="textarea-prompt-search"
              />
            </div>

            {/* Part Matching Prompt */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-slate-800">{t('aiSettings.prompts.partMatching', 'مطابقة القطع')}</label>
              <p className="text-sm text-slate-500">{t('aiSettings.prompts.partMatchingDesc', 'النص التوجيهي لمطابقة أرقام القطع')}</p>
              <textarea
                value={settings.systemPrompts.partMatching[language as keyof typeof settings.systemPrompts.partMatching] || settings.systemPrompts.partMatching.en}
                onChange={(e) => updateSettings({
                  systemPrompts: {
                    ...settings.systemPrompts,
                    partMatching: {
                      ...settings.systemPrompts.partMatching,
                      [language]: e.target.value
                    }
                  }
                })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="textarea-prompt-matching"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('aiSettings.safety.title', 'الأمان والخصوصية')}
              </h2>
              <p className="text-slate-500 mt-1">{t('aiSettings.safety.description', 'إعدادات أمان الذكاء الاصطناعي')}</p>
            </div>
            
            <div className="space-y-6">
              {/* Content Moderation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-slate-800">{t('aiSettings.safety.contentModeration', 'مراقبة المحتوى')}</label>
                  <p className="text-sm text-slate-500">{t('aiSettings.safety.contentModerationDesc', 'تصفية المحتوى غير المناسب')}</p>
                </div>
                <ToggleSwitch
                  checked={settings.enableContentModeration}
                  onChange={(checked) => updateSettings({ enableContentModeration: checked })}
                  testId="switch-moderation"
                />
              </div>

              {/* Blocked Topics */}
              <div className="space-y-2">
                <label className="block font-medium text-slate-800">{t('aiSettings.safety.blockedTopics', 'المواضيع المحظورة')}</label>
                <p className="text-sm text-slate-500">{t('aiSettings.safety.blockedTopicsDesc', 'قائمة المواضيع التي لن يناقشها الذكاء الاصطناعي')}</p>
                <div className="flex flex-wrap gap-2">
                  {(settings?.blockedTopics || []).map((topic, index) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700 rounded-full">
                      {topic}
                      <button
                        onClick={() => updateSettings({
                          blockedTopics: (settings?.blockedTopics || []).filter((_, i) => i !== index)
                        })}
                        className="ms-1 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  placeholder={t('aiSettings.safety.addTopic', 'أضف موضوع واضغط Enter')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !settings.blockedTopics.includes(value)) {
                        updateSettings({
                          blockedTopics: [...settings.blockedTopics, value]
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="input-blocked-topic"
                />
              </div>

              {/* Max Conversation Length */}
              <div className="space-y-2">
                <label className="block font-medium text-slate-800">{t('aiSettings.safety.maxConversation', 'الحد الأقصى للمحادثة')}</label>
                <p className="text-sm text-slate-500">{t('aiSettings.safety.maxConversationDesc', 'عدد الرسائل القصوى في المحادثة الواحدة')}</p>
                <input
                  type="number"
                  value={settings.maxConversationLength}
                  onChange={(e) => updateSettings({ maxConversationLength: parseInt(e.target.value) || 50 })}
                  min={10}
                  max={200}
                  className="w-full max-w-xs px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="input-max-conversation"
                />
              </div>

              {/* Analytics Toggles */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-slate-800">{t('aiSettings.safety.trackUsage', 'تتبع الاستخدام')}</label>
                    <p className="text-sm text-slate-500">{t('aiSettings.safety.trackUsageDesc', 'تسجيل استخدام الذكاء الاصطناعي')}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.trackUsage}
                    onChange={(checked) => updateSettings({ trackUsage: checked })}
                    testId="switch-track-usage"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-slate-800">{t('aiSettings.safety.trackCosts', 'تتبع التكاليف')}</label>
                    <p className="text-sm text-slate-500">{t('aiSettings.safety.trackCostsDesc', 'حساب تكاليف API')}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.trackCosts}
                    onChange={(checked) => updateSettings({ trackCosts: checked })}
                    testId="switch-track-costs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
