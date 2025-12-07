import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Play, 
  Sparkles, 
  Lightbulb, 
  Loader2, 
  Calendar, 
  Filter, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';

interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  category: string;
}

interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  [key: string]: string | undefined;
}

interface ReportResult {
  summary?: Record<string, any>;
  breakdown?: any[];
  details?: any[];
  metadata?: {
    generatedAt: string;
    filters: ReportFilters;
    rowCount: number;
  };
}

interface AIAnalysisResult {
  aiText: string;
  cached: boolean;
  mode: 'SUMMARY' | 'INSIGHTS';
}

const API_BASE = '/api/v1';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('siniCar_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const AdminReportsCenterPage = () => {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const isRTL = language === 'ar';

  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [runningReport, setRunningReport] = useState(false);
  const [analyzingReport, setAnalyzingReport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    status: '',
    category: ''
  });

  useEffect(() => {
    loadDefinitions();
  }, []);

  const loadDefinitions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reports/definitions`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }
      
      const data = await response.json();
      if (data.success) {
        setDefinitions(data.data);
      }
    } catch (error: any) {
      addToast(isRTL ? 'فشل في تحميل التقارير' : 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runReport = async () => {
    if (!selectedReport) return;

    setRunningReport(true);
    setReportResult(null);
    setAiAnalysis(null);

    try {
      const response = await fetch(`${API_BASE}/reports/${selectedReport.code}/run`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run report');
      }

      const data = await response.json();
      if (data.success) {
        setReportResult(data.data);
        addToast(isRTL ? 'تم تشغيل التقرير بنجاح' : 'Report executed successfully', 'success');
      }
    } catch (error: any) {
      addToast(error.message || (isRTL ? 'فشل في تشغيل التقرير' : 'Failed to run report'), 'error');
    } finally {
      setRunningReport(false);
    }
  };

  const analyzeReport = async (mode: 'SUMMARY' | 'INSIGHTS') => {
    if (!selectedReport) return;

    setAnalyzingReport(true);

    try {
      const response = await fetch(`${API_BASE}/reports/${selectedReport.code}/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ filters, mode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze report');
      }

      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.data);
        addToast(
          data.data.cached 
            ? (isRTL ? 'تم استرجاع التحليل من الذاكرة المؤقتة' : 'Analysis retrieved from cache')
            : (isRTL ? 'تم التحليل بنجاح' : 'Analysis completed'),
          'success'
        );
      }
    } catch (error: any) {
      addToast(error.message || (isRTL ? 'فشل في تحليل التقرير' : 'Failed to analyze report'), 'error');
    } finally {
      setAnalyzingReport(false);
    }
  };

  const getReportName = (report: ReportDefinition) => {
    return isRTL ? (report.nameAr || report.name) : (report.nameEn || report.name);
  };

  const getReportDescription = (report: ReportDefinition) => {
    return isRTL ? (report.descriptionAr || report.description) : (report.descriptionEn || report.description);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      'SALES': { ar: 'المبيعات', en: 'Sales' },
      'OPERATIONS': { ar: 'العمليات', en: 'Operations' },
      'FINANCE': { ar: 'المالية', en: 'Finance' },
      'ANALYTICS': { ar: 'التحليلات', en: 'Analytics' },
      'AUDIT': { ar: 'التدقيق', en: 'Audit' },
      'GENERAL': { ar: 'عام', en: 'General' }
    };
    return labels[category]?.[isRTL ? 'ar' : 'en'] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'SALES': 'bg-green-100 text-green-800',
      'OPERATIONS': 'bg-blue-100 text-blue-800',
      'FINANCE': 'bg-purple-100 text-purple-800',
      'ANALYTICS': 'bg-orange-100 text-orange-800',
      'AUDIT': 'bg-red-100 text-red-800',
      'GENERAL': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderSummary = (summary: Record<string, any>) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBreakdown = (breakdown: any[]) => {
    if (breakdown.length === 0) return null;

    const columns = Object.keys(breakdown[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {breakdown.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {breakdown.length > 10 && (
          <div className="text-center py-2 text-sm text-gray-500">
            {isRTL ? `وأكثر من ${breakdown.length - 10} صف...` : `And ${breakdown.length - 10} more rows...`}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-reports-title">
              {isRTL ? 'مركز التقارير' : 'Reports Center'}
            </h1>
            <p className="text-sm text-gray-500">
              {isRTL ? 'تشغيل وتحليل التقارير بالذكاء الاصطناعي' : 'Run and analyze reports with AI'}
            </p>
          </div>
        </div>
        <button
          onClick={loadDefinitions}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          data-testid="button-refresh-reports"
        >
          <RefreshCw size={18} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              {isRTL ? 'التقارير المتاحة' : 'Available Reports'}
            </h2>

            <div className="space-y-2">
              {definitions.map(report => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setReportResult(null);
                    setAiAnalysis(null);
                  }}
                  className={`w-full text-right p-3 rounded-lg border transition ${
                    selectedReport?.id === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  data-testid={`button-select-report-${report.code}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{getReportName(report)}</div>
                      {getReportDescription(report) && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {getReportDescription(report)}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getCategoryColor(report.category)}`}>
                      {getCategoryLabel(report.category)}
                    </span>
                  </div>
                </button>
              ))}

              {definitions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{isRTL ? 'لا توجد تقارير متاحة' : 'No reports available'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedReport ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getReportName(selectedReport)}
                  </h2>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    data-testid="button-toggle-filters"
                  >
                    <Filter size={16} />
                    {isRTL ? 'الفلاتر' : 'Filters'}
                    {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? 'من تاريخ' : 'From Date'}
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        data-testid="input-date-from"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? 'إلى تاريخ' : 'To Date'}
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        data-testid="input-date-to"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? 'الحالة' : 'Status'}
                      </label>
                      <select
                        value={filters.status || ''}
                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        data-testid="select-status"
                      >
                        <option value="">{isRTL ? 'الكل' : 'All'}</option>
                        <option value="ACTIVE">{isRTL ? 'نشط' : 'Active'}</option>
                        <option value="PENDING">{isRTL ? 'معلق' : 'Pending'}</option>
                        <option value="COMPLETED">{isRTL ? 'مكتمل' : 'Completed'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? 'الفئة' : 'Category'}
                      </label>
                      <input
                        type="text"
                        value={filters.category || ''}
                        onChange={e => setFilters({ ...filters, category: e.target.value })}
                        placeholder={isRTL ? 'أدخل الفئة' : 'Enter category'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        data-testid="input-category"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={runReport}
                    disabled={runningReport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    data-testid="button-run-report"
                  >
                    {runningReport ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                    {isRTL ? 'تشغيل التقرير' : 'Run Report'}
                  </button>

                  {reportResult && (
                    <>
                      <button
                        onClick={() => analyzeReport('SUMMARY')}
                        disabled={analyzingReport}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                        data-testid="button-ai-summary"
                      >
                        {analyzingReport ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {isRTL ? 'ملخص AI' : 'AI Summary'}
                      </button>
                      <button
                        onClick={() => analyzeReport('INSIGHTS')}
                        disabled={analyzingReport}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
                        data-testid="button-ai-insights"
                      >
                        {analyzingReport ? <Loader2 size={18} className="animate-spin" /> : <Lightbulb size={18} />}
                        {isRTL ? 'رؤى AI' : 'AI Insights'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {aiAnalysis && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {aiAnalysis.mode === 'SUMMARY' ? (
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-orange-600" />
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {aiAnalysis.mode === 'SUMMARY'
                        ? (isRTL ? 'ملخص الذكاء الاصطناعي' : 'AI Summary')
                        : (isRTL ? 'رؤى الذكاء الاصطناعي' : 'AI Insights')}
                    </h3>
                    {aiAnalysis.cached && (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                        {isRTL ? 'من الذاكرة المؤقتة' : 'Cached'}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap" data-testid="text-ai-analysis">
                    {aiAnalysis.aiText}
                  </div>
                </div>
              )}

              {reportResult && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {isRTL ? 'نتائج التقرير' : 'Report Results'}
                    </h3>
                    {reportResult.metadata && (
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(reportResult.metadata.generatedAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Info size={14} />
                          {reportResult.metadata.rowCount} {isRTL ? 'صف' : 'rows'}
                        </span>
                      </div>
                    )}
                  </div>

                  {reportResult.summary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {isRTL ? 'الملخص' : 'Summary'}
                      </h4>
                      {renderSummary(reportResult.summary)}
                    </div>
                  )}

                  {reportResult.breakdown && reportResult.breakdown.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {isRTL ? 'التفاصيل' : 'Breakdown'}
                      </h4>
                      {renderBreakdown(reportResult.breakdown)}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {isRTL ? 'اختر تقريراً للبدء' : 'Select a report to begin'}
              </h3>
              <p className="text-sm text-gray-400">
                {isRTL ? 'اختر تقريراً من القائمة لتشغيله وتحليله' : 'Choose a report from the list to run and analyze'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsCenterPage;
