import { useState, useEffect, ReactNode, useMemo } from 'react';
import {
  ToolConfig, ToolKey, TraderToolAction, TraderToolType, TraderToolActionStatus,
  TraderToolsAdminFilters, TraderToolsAdminResponse
} from '../types';
import Api from '../services/api';
import { toolsAccessService } from '../services/toolsAccess';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import { formatDateTime, formatDate } from '../utils/dateUtils';
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
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Table,
  Upload,
  Loader2
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

// Tool type labels for usage log
const TRADER_TOOL_LABELS: Record<TraderToolType, { ar: string; en: string; icon: ReactNode }> = {
  VIN: { ar: 'استخراج VIN', en: 'VIN Extraction', icon: <Car size={16} /> },
  PDF_EXCEL: { ar: 'تحويل PDF إلى Excel', en: 'PDF to Excel', icon: <FileSpreadsheet size={16} /> },
  COMPARISON: { ar: 'مقارنة الأسعار', en: 'Price Comparison', icon: <Scale size={16} /> },
  ALTERNATIVES: { ar: 'رفع البدائل', en: 'Alternatives Upload', icon: <Upload size={16} /> },
  SEARCH: { ar: 'الطلبات السريعة', en: 'Quick Orders', icon: <Search size={16} /> },
  EXCEL_QUOTE: { ar: 'طلب شراء Excel', en: 'Excel Purchase Order', icon: <Table size={16} /> }
};

const STATUS_LABELS: Record<TraderToolActionStatus, { ar: string; en: string; color: string }> = {
  SUCCESS: { ar: 'ناجح', en: 'Success', color: 'bg-green-100 text-green-700' },
  FAILED: { ar: 'فشل', en: 'Failed', color: 'bg-red-100 text-red-700' },
  PENDING: { ar: 'قيد الانتظار', en: 'Pending', color: 'bg-amber-100 text-amber-700' },
  PROCESSING: { ar: 'قيد المعالجة', en: 'Processing', color: 'bg-blue-100 text-blue-700' }
};

export const AdminTraderToolsSettings = () => {
  const [activeTab, setActiveTab] = useState<'TOOLS' | 'ANALYTICS' | 'USAGE_LOG'>('TOOLS');
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

  // Usage Log State
  const [usageLogLoading, setUsageLogLoading] = useState(false);
  const [usageLogData, setUsageLogData] = useState<TraderToolsAdminResponse | null>(null);
  const [usageLogFilters, setUsageLogFilters] = useState<TraderToolsAdminFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<TraderToolAction | null>(null);

  const { addToast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await Api.getToolConfigs();
      // Safe array extraction - handle different response formats
      const configs = Array.isArray(result) 
        ? result 
        : (result?.data && Array.isArray(result.data)) 
          ? result.data 
          : (result?.configs && Array.isArray(result.configs))
            ? result.configs
            : [];
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

  const loadUsageLog = async () => {
    setUsageLogLoading(true);
    try {
      const filters: TraderToolsAdminFilters = {
        ...usageLogFilters,
        search: searchTerm || undefined
      };
      const data = await Api.getTraderToolActionsAdmin(filters);
      setUsageLogData(data);
    } catch (e) {
      addToast(language === 'ar' ? 'فشل في تحميل سجل الاستخدام' : 'Failed to load usage log', 'error');
    } finally {
      setUsageLogLoading(false);
    }
  };

  // Load usage log when tab changes to USAGE_LOG or filters change
  useEffect(() => {
    if (activeTab === 'USAGE_LOG') {
      loadUsageLog();
    }
  }, [activeTab, usageLogFilters]);

  const handleExportUsageLog = async () => {
    try {
      const exportData = await Api.exportTraderToolActions(usageLogFilters);
      // Create CSV
      const headers = ['ID', 'Customer ID', 'Customer Name', 'Tool Type', 'Status', 'Device', 'Date', 'Has Input File', 'Has Output File'];
      const rows = exportData.map(row => [
        row.id,
        row.customerId,
        row.customerName,
        row.toolType,
        row.status,
        row.deviceType,
        row.createdAt,
        row.hasInputFile ? 'Yes' : 'No',
        row.hasOutputFile ? 'Yes' : 'No'
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trader_tools_usage_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      addToast(language === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully', 'success');
    } catch (e) {
      addToast(language === 'ar' ? 'فشل في تصدير البيانات' : 'Failed to export data', 'error');
    }
  };

  const getInputSummary = (action: TraderToolAction): string => {
    const { toolType, metadata, inputData } = action;
    switch (toolType) {
      case 'VIN': return metadata?.vin || inputData?.imageFile || '-';
      case 'PDF_EXCEL': return action.inputFileName || inputData?.fileName || '-';
      case 'COMPARISON': return metadata?.partNumber || metadata?.partName || '-';
      case 'SEARCH': return metadata?.searchQuery || inputData?.query || '-';
      case 'EXCEL_QUOTE': return action.inputFileName || `${metadata?.itemsCount || 0} items`;
      case 'ALTERNATIVES': return action.inputFileName || '-';
      default: return '-';
    }
  };

  const getOutputSummary = (action: TraderToolAction): string => {
    const { toolType, metadata } = action;
    switch (toolType) {
      case 'VIN': return metadata?.manufacturer ? `${metadata.manufacturer} ${metadata.model || ''} (${metadata.year})` : '-';
      case 'PDF_EXCEL': return metadata?.rowCount ? `${metadata.rowCount} rows` : '-';
      case 'COMPARISON': return metadata?.suppliersCount ? `${metadata.suppliersCount} suppliers` : '-';
      case 'SEARCH': return metadata?.resultsCount !== undefined ? `${metadata.resultsCount} results` : '-';
      case 'EXCEL_QUOTE': return metadata?.quotedTotal !== undefined ? `${metadata.quotedTotal.toLocaleString()} SAR` : '-';
      default: return '-';
    }
  };

  const totalPages = usageLogData ? Math.ceil(usageLogData.total / (usageLogFilters.pageSize || 20)) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await Api.saveToolConfigs(toolConfigs);
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

  const TabButton = ({ id, icon, label }: { id: 'TOOLS' | 'ANALYTICS' | 'USAGE_LOG', icon: ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === id
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
        <div className="flex gap-3 flex-wrap">
          <TabButton id="TOOLS" icon={<Settings size={18} />} label={language === 'ar' ? 'الإعدادات' : 'Settings'} />
          <TabButton id="ANALYTICS" icon={<BarChart3 size={18} />} label={language === 'ar' ? 'التحليلات' : 'Analytics'} />
          <TabButton id="USAGE_LOG" icon={<Activity size={18} />} label={language === 'ar' ? 'سجل الاستخدام' : 'Usage Log'} />
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
              className={`bg-white rounded-2xl shadow-sm border transition-all ${config.enabled ? 'border-slate-100' : 'border-slate-200 opacity-75'
                }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-t-2xl transition-colors"
                onClick={() => setExpandedTool(expandedTool === config.toolKey ? null : config.toolKey)}
                data-testid={`tool-header-${config.toolKey}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${config.enabled
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
                    className={`p-2 rounded-lg transition-colors ${config.enabled
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
                        className={`w-12 h-6 rounded-full transition-colors relative ${config.showInDashboardShortcuts ? 'bg-brand-600' : 'bg-slate-300'
                          }`}
                        data-testid={`toggle-show-${config.toolKey}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showInDashboardShortcuts ? 'right-1' : 'left-1'
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
                        className={`w-12 h-6 rounded-full transition-colors relative ${config.logUsageForAnalytics ? 'bg-brand-600' : 'bg-slate-300'
                          }`}
                        data-testid={`toggle-log-${config.toolKey}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.logUsageForAnalytics ? 'right-1' : 'left-1'
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
                        className={`w-12 h-6 rounded-full transition-colors relative ${config.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                          }`}
                        data-testid={`toggle-maintenance-${config.toolKey}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.maintenanceMode ? 'right-1' : 'left-1'
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
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isAllowed
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

      {activeTab === 'USAGE_LOG' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-slate-500" />
              <span className="font-semibold text-slate-700">{language === 'ar' ? 'الفلاتر' : 'Filters'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">{language === 'ar' ? 'بحث' : 'Search'}</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsageLog()}
                    placeholder={language === 'ar' ? 'اسم، VIN، ملف...' : 'Name, VIN, file...'}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
                    data-testid="input-search-log"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">{language === 'ar' ? 'نوع الأداة' : 'Tool Type'}</label>
                <select
                  value={usageLogFilters.toolType || 'ALL'}
                  onChange={(e) => setUsageLogFilters(prev => ({ ...prev, toolType: e.target.value as TraderToolType | 'ALL', page: 1 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  data-testid="select-tool-type-log"
                >
                  <option value="ALL">{language === 'ar' ? 'الكل' : 'All'}</option>
                  {Object.entries(TRADER_TOOL_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{language === 'ar' ? val.ar : val.en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">{language === 'ar' ? 'الحالة' : 'Status'}</label>
                <select
                  value={usageLogFilters.status || 'ALL'}
                  onChange={(e) => setUsageLogFilters(prev => ({ ...prev, status: e.target.value as TraderToolActionStatus | 'ALL', page: 1 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  data-testid="select-status-log"
                >
                  <option value="ALL">{language === 'ar' ? 'الكل' : 'All'}</option>
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{language === 'ar' ? val.ar : val.en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">{language === 'ar' ? 'من تاريخ' : 'From Date'}</label>
                <input
                  type="date"
                  value={usageLogFilters.dateFrom || ''}
                  onChange={(e) => setUsageLogFilters(prev => ({ ...prev, dateFrom: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  data-testid="input-date-from-log"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">{language === 'ar' ? 'إلى تاريخ' : 'To Date'}</label>
                <input
                  type="date"
                  value={usageLogFilters.dateTo || ''}
                  onChange={(e) => setUsageLogFilters(prev => ({ ...prev, dateTo: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  data-testid="input-date-to-log"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => { setSearchTerm(''); setUsageLogFilters({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' }); }}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  data-testid="button-clear-filters-log"
                >
                  {language === 'ar' ? 'مسح' : 'Clear'}
                </button>
                <button
                  onClick={handleExportUsageLog}
                  className="px-4 py-2 text-sm text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                  data-testid="button-export-log"
                >
                  <Download size={16} />
                  {language === 'ar' ? 'تصدير' : 'Export'}
                </button>
              </div>
            </div>
          </div>

          {usageLogData?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">{language === 'ar' ? 'إجمالي العمليات' : 'Total Actions'}</div>
                <div className="text-2xl font-bold text-slate-800" data-testid="text-summary-total">{usageLogData.summary.total}</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">{language === 'ar' ? 'ناجحة' : 'Successful'}</div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-summary-success">{usageLogData.summary.byStatus.SUCCESS}</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">{language === 'ar' ? 'فاشلة' : 'Failed'}</div>
                <div className="text-2xl font-bold text-red-600" data-testid="text-summary-failed">{usageLogData.summary.byStatus.FAILED}</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">{language === 'ar' ? 'نسبة النجاح' : 'Success Rate'}</div>
                <div className="text-2xl font-bold text-brand-600" data-testid="text-summary-rate">{usageLogData.summary.successRate.toFixed(1)}%</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {usageLogLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-600" size={40} />
              </div>
            ) : !usageLogData || usageLogData.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Activity size={60} className="mb-4 opacity-50" />
                <p className="text-lg font-semibold">{language === 'ar' ? 'لا توجد سجلات' : 'No records'}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'الأداة' : 'Tool'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'المدخلات' : 'Input'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'المخرجات' : 'Output'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usageLogData.items.map((action) => (
                        <tr
                          key={action.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAction(action)}
                          data-testid={`row-log-${action.id}`}
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-700 font-medium">{formatDate(action.createdAt)}</div>
                            <div className="text-xs text-slate-400">{formatDateTime(action.createdAt).split(' ').slice(-1)[0]}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-700">{action.customerName || '-'}</div>
                            <div className="text-xs text-slate-400">{action.customerId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
                              {TRADER_TOOL_LABELS[action.toolType]?.icon}
                              {language === 'ar' ? TRADER_TOOL_LABELS[action.toolType]?.ar : TRADER_TOOL_LABELS[action.toolType]?.en}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600 truncate max-w-[150px] block">{getInputSummary(action)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600 truncate max-w-[150px] block">{getOutputSummary(action)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[action.status]?.color}`}>
                              {action.status === 'SUCCESS' && <CheckCircle size={12} />}
                              {action.status === 'FAILED' && <XCircle size={12} />}
                              {action.status === 'PENDING' && <Clock size={12} />}
                              {action.status === 'PROCESSING' && <Loader2 size={12} className="animate-spin" />}
                              {language === 'ar' ? STATUS_LABELS[action.status]?.ar : STATUS_LABELS[action.status]?.en}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedAction(action); }}
                              className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                              data-testid={`button-view-${action.id}`}
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                    <span className="text-sm text-slate-500">
                      {language === 'ar' ? 'عرض' : 'Showing'} {((usageLogFilters.page || 1) - 1) * (usageLogFilters.pageSize || 20) + 1}-{Math.min((usageLogFilters.page || 1) * (usageLogFilters.pageSize || 20), usageLogData.total)} {language === 'ar' ? 'من' : 'of'} {usageLogData.total}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsageLogFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                        disabled={(usageLogFilters.page || 1) === 1}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                        data-testid="button-prev-page-log"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm text-slate-600 px-3">{usageLogFilters.page || 1} / {totalPages}</span>
                      <button
                        onClick={() => setUsageLogFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                        disabled={(usageLogFilters.page || 1) === totalPages}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                        data-testid="button-next-page-log"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAction(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {language === 'ar' ? 'تفاصيل العملية' : 'Action Details'}
              </h2>
              <button
                onClick={() => setSelectedAction(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid="button-close-detail"
              >
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'الأداة' : 'Tool'}</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
                      {TRADER_TOOL_LABELS[selectedAction.toolType]?.icon}
                      {language === 'ar' ? TRADER_TOOL_LABELS[selectedAction.toolType]?.ar : TRADER_TOOL_LABELS[selectedAction.toolType]?.en}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[selectedAction.status]?.color}`}>
                      {language === 'ar' ? STATUS_LABELS[selectedAction.status]?.ar : STATUS_LABELS[selectedAction.status]?.en}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'العميل' : 'Customer'}</label>
                <p className="text-sm text-slate-700 font-medium">{selectedAction.customerName || '-'}</p>
                <p className="text-xs text-slate-400">{selectedAction.customerId}</p>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</label>
                <p className="text-sm text-slate-700 font-medium">{formatDateTime(selectedAction.createdAt)}</p>
              </div>

              {selectedAction.processingTimeMs && (
                <div>
                  <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'وقت المعالجة' : 'Processing Time'}</label>
                  <p className="text-sm text-slate-700">{(selectedAction.processingTimeMs / 1000).toFixed(2)}s</p>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'المدخلات' : 'Input'}</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{getInputSummary(selectedAction)}</p>
                  {selectedAction.inputFileName && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <FileText size={12} />
                      {selectedAction.inputFileName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">{language === 'ar' ? 'المخرجات' : 'Output'}</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{getOutputSummary(selectedAction)}</p>
                  {selectedAction.outputFileName && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <FileText size={12} />
                      {selectedAction.outputFileName}
                    </p>
                  )}
                </div>
              </div>

              {selectedAction.status === 'FAILED' && selectedAction.errorMessage && (
                <div>
                  <label className="text-xs text-red-500 uppercase">{language === 'ar' ? 'رسالة الخطأ' : 'Error'}</label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{selectedAction.errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>ID: {selectedAction.id}</span>
                <span>•</span>
                <span>{selectedAction.deviceType}</span>
                {selectedAction.createdFromIp && (
                  <>
                    <span>•</span>
                    <span>IP: {selectedAction.createdFromIp}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTraderToolsSettings;
