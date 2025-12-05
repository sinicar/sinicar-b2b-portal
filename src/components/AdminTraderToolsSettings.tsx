import { useState, useEffect, ReactNode } from 'react';
import { ToolConfig, ToolKey } from '../types';
import { MockApi } from '../services/mockApi';
import { toolsAccessService } from '../services/toolsAccess';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import { 
  Settings, 
  Save, 
  FileSpreadsheet, 
  Car, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  Power, 
  PowerOff, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  AlertTriangle,
  Wrench,
  Eye,
  EyeOff,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const TOOL_ICONS: Record<ToolKey, ReactNode> = {
  'PDF_TO_EXCEL': <FileSpreadsheet size={24} />,
  'VIN_EXTRACTOR': <Car size={24} />,
  'PRICE_COMPARISON': <Scale size={24} />
};

const CUSTOMER_TYPES: { value: string; labelAr: string; labelEn: string }[] = [
  { value: 'PARTS_SHOP', labelAr: 'محل قطع غيار', labelEn: 'Parts Shop' },
  { value: 'RENTAL_COMPANY', labelAr: 'شركة تأجير', labelEn: 'Rental Company' },
  { value: 'INSURANCE_COMPANY', labelAr: 'شركة تأمين', labelEn: 'Insurance Company' },
  { value: 'SALES_AGENT', labelAr: 'وكيل مبيعات', labelEn: 'Sales Agent' },
  { value: 'FLEET_CUSTOMER', labelAr: 'عميل أسطول', labelEn: 'Fleet Customer' },
  { value: 'MAINTENANCE_CENTER', labelAr: 'مركز صيانة', labelEn: 'Maintenance Center' },
  { value: 'TRADING_COMPANY', labelAr: 'شركة تجارية', labelEn: 'Trading Company' }
];

export const AdminTraderToolsSettings = () => {
  const [activeTab, setActiveTab] = useState<'TOOLS' | 'ANALYTICS'>('TOOLS');
  const [toolConfigs, setToolConfigs] = useState<ToolConfig[]>([]);
  const [expandedTool, setExpandedTool] = useState<ToolKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usageStats, setUsageStats] = useState<{
    [key: string]: {
      totalUsage: number;
      successfulUsage: number;
      failedUsage: number;
      avgProcessingTime: number;
      uniqueCustomers: number;
      byDay: { date: string; count: number }[];
    };
  }>({});

  const { addToast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const configs = await MockApi.getToolConfigs();
      setToolConfigs(configs);

      const stats: typeof usageStats = {};
      for (const config of configs) {
        stats[config.toolKey] = await toolsAccessService.getToolUsageStats(config.toolKey, undefined, 'month');
      }
      setUsageStats(stats);
    } catch (e) {
      addToast('فشل في تحميل إعدادات الأدوات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await MockApi.saveToolConfigs(toolConfigs);
      addToast(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully', 'success');
    } catch (e) {
      addToast(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleToolEnabled = (toolKey: ToolKey) => {
    setToolConfigs(prev => prev.map(config => 
      config.toolKey === toolKey 
        ? { ...config, enabled: !config.enabled }
        : config
    ));
  };

  const toggleMaintenanceMode = (toolKey: ToolKey) => {
    setToolConfigs(prev => prev.map(config => 
      config.toolKey === toolKey 
        ? { ...config, maintenanceMode: !config.maintenanceMode }
        : config
    ));
  };

  const toggleShowInDashboard = (toolKey: ToolKey) => {
    setToolConfigs(prev => prev.map(config => 
      config.toolKey === toolKey 
        ? { ...config, showInDashboardShortcuts: !config.showInDashboardShortcuts }
        : config
    ));
  };

  const toggleLogUsage = (toolKey: ToolKey) => {
    setToolConfigs(prev => prev.map(config => 
      config.toolKey === toolKey 
        ? { ...config, logUsageForAnalytics: !config.logUsageForAnalytics }
        : config
    ));
  };

  const updateToolConfig = (toolKey: ToolKey, field: keyof ToolConfig, value: any) => {
    setToolConfigs(prev => prev.map(config => 
      config.toolKey === toolKey 
        ? { ...config, [field]: value }
        : config
    ));
  };

  const toggleCustomerType = (toolKey: ToolKey, customerType: string) => {
    setToolConfigs(prev => prev.map(config => {
      if (config.toolKey !== toolKey) return config;
      const types = [...config.allowedCustomerTypes];
      const index = types.indexOf(customerType);
      if (index === -1) {
        types.push(customerType);
      } else {
        types.splice(index, 1);
      }
      return { ...config, allowedCustomerTypes: types };
    }));
  };

  const getToolName = (config: ToolConfig) => {
    return language === 'ar' ? config.toolNameAr : config.toolNameEn;
  };

  const getToolDescription = (config: ToolConfig) => {
    return language === 'ar' ? config.descriptionAr : config.descriptionEn;
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
        <span className="text-slate-500">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  const TabButton = ({ id, icon, label }: { id: 'TOOLS' | 'ANALYTICS', icon: ReactNode, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-bold ${
        activeTab === id 
          ? 'bg-brand-600 text-white shadow-lg' 
          : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
      }`}
      data-testid={`tab-${id.toLowerCase()}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Wrench className="text-brand-600" />
            {language === 'ar' ? 'إدارة أدوات التاجر' : 'Trader Tools Management'}
          </h1>
          <p className="text-slate-500 mt-1">
            {language === 'ar' 
              ? 'تفعيل/تعطيل الأدوات وتحديد صلاحيات الوصول لكل نوع عميل'
              : 'Enable/disable tools and configure access permissions per customer type'}
          </p>
        </div>
        <div className="flex gap-3">
          <TabButton id="TOOLS" icon={<Settings size={18} />} label={language === 'ar' ? 'الإعدادات' : 'Settings'} />
          <TabButton id="ANALYTICS" icon={<BarChart3 size={18} />} label={language === 'ar' ? 'التحليلات' : 'Analytics'} />
        </div>
      </div>

      {activeTab === 'TOOLS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2 transition-all"
              data-testid="btn-save-tools"
            >
              <Save size={18} />
              {saving 
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
            </button>
          </div>

          {toolConfigs.map(config => (
            <div 
              key={config.toolKey}
              className={`bg-white rounded-2xl shadow-sm border transition-all ${
                config.enabled ? 'border-slate-100' : 'border-slate-200 opacity-75'
              }`}
            >
              <div 
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-t-2xl transition-colors"
                onClick={() => setExpandedTool(expandedTool === config.toolKey ? null : config.toolKey)}
                data-testid={`tool-header-${config.toolKey}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    config.enabled 
                      ? config.maintenanceMode 
                        ? 'bg-amber-50 text-amber-600' 
                        : 'bg-brand-50 text-brand-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {TOOL_ICONS[config.toolKey]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{getToolName(config)}</h3>
                    <p className="text-sm text-slate-500">{getToolDescription(config)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {config.maintenanceMode && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {language === 'ar' ? 'صيانة' : 'Maintenance'}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleToolEnabled(config.toolKey); }}
                    className={`p-2 rounded-lg transition-colors ${
                      config.enabled 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    data-testid={`toggle-tool-${config.toolKey}`}
                  >
                    {config.enabled ? <Power size={20} /> : <PowerOff size={20} />}
                  </button>
                  {expandedTool === config.toolKey ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedTool === config.toolKey && (
                <div className="border-t border-slate-100 p-6 space-y-6 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {config.showInDashboardShortcuts ? <Eye size={18} className="text-brand-600" /> : <EyeOff size={18} className="text-slate-400" />}
                        <span className="font-medium">{language === 'ar' ? 'إظهار في الاختصارات' : 'Show in Shortcuts'}</span>
                      </div>
                      <button
                        onClick={() => toggleShowInDashboard(config.toolKey)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          config.showInDashboardShortcuts ? 'bg-brand-600' : 'bg-slate-300'
                        }`}
                        data-testid={`toggle-show-${config.toolKey}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          config.showInDashboardShortcuts ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Activity size={18} className={config.logUsageForAnalytics ? 'text-brand-600' : 'text-slate-400'} />
                        <span className="font-medium">{language === 'ar' ? 'تسجيل الاستخدام' : 'Log Usage'}</span>
                      </div>
                      <button
                        onClick={() => toggleLogUsage(config.toolKey)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          config.logUsageForAnalytics ? 'bg-brand-600' : 'bg-slate-300'
                        }`}
                        data-testid={`toggle-log-${config.toolKey}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          config.logUsageForAnalytics ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className={config.maintenanceMode ? 'text-amber-600' : 'text-slate-400'} />
                        <span className="font-medium">{language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</span>
                      </div>
                      <button
                        onClick={() => toggleMaintenanceMode(config.toolKey)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          config.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        data-testid={`toggle-maintenance-${config.toolKey}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          config.maintenanceMode ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <Clock size={14} className="inline ml-1" />
                        {language === 'ar' ? 'الحد اليومي (ملفات)' : 'Daily Limit (files)'}
                      </label>
                      <input
                        type="number"
                        value={config.maxFilesPerDay || ''}
                        onChange={(e) => updateToolConfig(config.toolKey, 'maxFilesPerDay', parseInt(e.target.value) || undefined)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder={language === 'ar' ? 'بدون حد' : 'No limit'}
                        data-testid={`input-daily-limit-${config.toolKey}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <Clock size={14} className="inline ml-1" />
                        {language === 'ar' ? 'الحد الشهري (ملفات)' : 'Monthly Limit (files)'}
                      </label>
                      <input
                        type="number"
                        value={config.maxFilesPerMonth || ''}
                        onChange={(e) => updateToolConfig(config.toolKey, 'maxFilesPerMonth', parseInt(e.target.value) || undefined)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder={language === 'ar' ? 'بدون حد' : 'No limit'}
                        data-testid={`input-monthly-limit-${config.toolKey}`}
                      />
                    </div>
                  </div>

                  {config.maintenanceMode && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {language === 'ar' ? 'رسالة الصيانة' : 'Maintenance Message'}
                      </label>
                      <input
                        type="text"
                        value={config.maintenanceMessage || ''}
                        onChange={(e) => updateToolConfig(config.toolKey, 'maintenanceMessage', e.target.value)}
                        className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder={language === 'ar' ? 'الأداة تحت الصيانة حالياً...' : 'Tool is currently under maintenance...'}
                        data-testid={`input-maintenance-msg-${config.toolKey}`}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Users size={16} />
                      {language === 'ar' ? 'أنواع العملاء المسموح لهم' : 'Allowed Customer Types'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CUSTOMER_TYPES.map(type => {
                        const isAllowed = config.allowedCustomerTypes.includes(type.value);
                        return (
                          <button
                            key={type.value}
                            onClick={() => toggleCustomerType(config.toolKey, type.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              isAllowed
                                ? 'bg-brand-100 text-brand-700 border-2 border-brand-300'
                                : 'bg-slate-100 text-slate-500 border-2 border-transparent hover:border-slate-200'
                            }`}
                            data-testid={`customer-type-${config.toolKey}-${type.value}`}
                          >
                            {isAllowed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {language === 'ar' ? type.labelAr : type.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {language === 'ar' ? 'اسم الأداة (عربي)' : 'Tool Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={config.toolNameAr}
                        onChange={(e) => updateToolConfig(config.toolKey, 'toolNameAr', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        dir="rtl"
                        data-testid={`input-name-ar-${config.toolKey}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {language === 'ar' ? 'اسم الأداة (إنجليزي)' : 'Tool Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={config.toolNameEn}
                        onChange={(e) => updateToolConfig(config.toolKey, 'toolNameEn', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        dir="ltr"
                        data-testid={`input-name-en-${config.toolKey}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-brand-600" />
              {language === 'ar' ? 'إحصائيات الاستخدام الشهرية' : 'Monthly Usage Statistics'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {toolConfigs.map(config => {
                const stats = usageStats[config.toolKey];
                if (!stats) return null;
                
                return (
                  <div key={config.toolKey} className="bg-slate-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                        {TOOL_ICONS[config.toolKey]}
                      </div>
                      <h3 className="font-bold text-slate-800">{getToolName(config)}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{language === 'ar' ? 'إجمالي الاستخدام' : 'Total Usage'}</span>
                        <span className="font-bold text-slate-800">{stats.totalUsage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{language === 'ar' ? 'ناجح' : 'Successful'}</span>
                        <span className="font-bold text-green-600">{stats.successfulUsage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{language === 'ar' ? 'فاشل' : 'Failed'}</span>
                        <span className="font-bold text-red-600">{stats.failedUsage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{language === 'ar' ? 'عملاء فريدين' : 'Unique Customers'}</span>
                        <span className="font-bold text-slate-800">{stats.uniqueCustomers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{language === 'ar' ? 'متوسط الوقت' : 'Avg Time'}</span>
                        <span className="font-bold text-slate-800">{stats.avgProcessingTime}ms</span>
                      </div>
                    </div>

                    {stats.byDay.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="text-xs text-slate-500 mb-2">{language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}</div>
                        <div className="flex items-end gap-1 h-16">
                          {stats.byDay.slice(-7).map((day, i) => {
                            const maxCount = Math.max(...stats.byDay.slice(-7).map(d => d.count), 1);
                            const height = (day.count / maxCount) * 100;
                            return (
                              <div 
                                key={i}
                                className="flex-1 bg-brand-500 rounded-t"
                                style={{ height: `${Math.max(height, 4)}%` }}
                                title={`${day.date}: ${day.count}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-slate-500 text-sm">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              data-testid="btn-refresh-analytics"
            >
              <RefreshCw size={16} />
              {language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTraderToolsSettings;
