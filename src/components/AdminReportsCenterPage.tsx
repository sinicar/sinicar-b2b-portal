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
  Info,
  TrendingUp,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Package
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
  customerId?: string;
  page?: string;
  [key: string]: string | undefined;
}

interface QuotesOverviewData {
  summary: {
    totalQuotes: number;
    totalApproved: number;
    totalRejected: number;
    totalPending: number;
    totalAmountApproved: number;
  };
  byStatus: Array<{ status: string; count: number }>;
  byCustomer: Array<{ customerId: string; customerName: string; count: number; totalAmount: number }>;
  rows: Array<{
    id: string;
    number: string;
    customerName: string;
    status: string;
    amount: number;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface SalesSummaryData {
  totals: {
    totalSalesAmount: number;
    totalInvoices: number;
    avgInvoiceValue: number;
  };
  byCustomer: Array<{ customerId: string; customerName: string; totalAmount: number; count: number }>;
  byProduct: Array<{ productId: string; productName: string; totalAmount: number; qty: number }>;
  byDay: Array<{ date: string; totalAmount: number }>;
  rows: Array<{
    id: string;
    number: string;
    customerName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
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
    category: '',
    customerId: '',
    productId: '',
    page: '1'
  });

  const [currentPage, setCurrentPage] = useState(1);

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'NEW': 'bg-blue-100 text-blue-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      'NEW': { ar: 'جديد', en: 'New' },
      'PENDING': { ar: 'معلق', en: 'Pending' },
      'APPROVED': { ar: 'موافق عليه', en: 'Approved' },
      'COMPLETED': { ar: 'مكتمل', en: 'Completed' },
      'REJECTED': { ar: 'مرفوض', en: 'Rejected' },
      'CANCELLED': { ar: 'ملغى', en: 'Cancelled' }
    };
    return labels[status]?.[isRTL ? 'ar' : 'en'] || status;
  };

  const handlePageChange = async (newPage: number) => {
    if (!selectedReport) return;
    setCurrentPage(newPage);
    setRunningReport(true);

    try {
      const response = await fetch(`${API_BASE}/reports/${selectedReport.code}/run`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ filters: { ...filters, page: String(newPage) } })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run report');
      }

      const data = await response.json();
      if (data.success) {
        setReportResult(data.data);
      }
    } catch (error: any) {
      addToast(error.message || (isRTL ? 'فشل في تحميل الصفحة' : 'Failed to load page'), 'error');
    } finally {
      setRunningReport(false);
    }
  };

  const renderQuotesOverview = (data: QuotesOverviewData) => {
    const { summary, byStatus, byCustomer, rows, pagination } = data;
    const maxStatusCount = Math.max(...byStatus.map(s => s.count), 1);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="quotes-overview-summary">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">{isRTL ? 'إجمالي الطلبات' : 'Total Quotes'}</span>
            </div>
            <div className="text-2xl font-bold text-blue-900" data-testid="text-total-quotes">
              {summary.totalQuotes.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">{isRTL ? 'موافق عليها' : 'Approved'}</span>
            </div>
            <div className="text-2xl font-bold text-green-900" data-testid="text-total-approved">
              {summary.totalApproved.toLocaleString()}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{isRTL ? 'مرفوضة' : 'Rejected'}</span>
            </div>
            <div className="text-2xl font-bold text-red-900" data-testid="text-total-rejected">
              {summary.totalRejected.toLocaleString()}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-700">{isRTL ? 'معلقة' : 'Pending'}</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900" data-testid="text-total-pending">
              {summary.totalPending.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700">{isRTL ? 'قيمة الموافقات' : 'Approved Amount'}</span>
            </div>
            <div className="text-2xl font-bold text-purple-900" data-testid="text-total-amount">
              {summary.totalAmountApproved.toLocaleString()} <span className="text-sm font-normal">SAR</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              {isRTL ? 'توزيع الحالات' : 'Status Distribution'}
            </h4>
            <div className="space-y-3" data-testid="quotes-by-status">
              {byStatus.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full min-w-[80px] text-center ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={16} />
              {isRTL ? 'أعلى العملاء' : 'Top Customers'}
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto" data-testid="quotes-by-customer">
              {byCustomer.length > 0 ? byCustomer.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                    <div className="text-xs text-gray-500">{item.count} {isRTL ? 'طلب' : 'quotes'}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {item.totalAmount.toLocaleString()} SAR
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  {isRTL ? 'لا توجد بيانات' : 'No data'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            {isRTL ? 'قائمة الطلبات' : 'Quote List'}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" data-testid="quotes-rows-table">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'الرقم' : 'Number'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'العميل' : 'Customer'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'التاريخ' : 'Date'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length > 0 ? rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50" data-testid={`quote-row-${idx}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{row.number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(row.status)}`}>
                        {getStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.amount.toLocaleString()} SAR
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(row.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {isRTL ? 'لا توجد طلبات' : 'No quotes found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {isRTL 
                  ? `صفحة ${pagination.page} من ${pagination.totalPages} (${pagination.totalCount} طلب)`
                  : `Page ${pagination.page} of ${pagination.totalPages} (${pagination.totalCount} quotes)`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || runningReport}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                  data-testid="button-prev-page"
                >
                  {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  {pagination.page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || runningReport}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                  data-testid="button-next-page"
                >
                  {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSalesSummary = (data: SalesSummaryData) => {
    const { totals, byCustomer, byProduct, byDay, rows, pagination } = data;
    const maxDayAmount = Math.max(...byDay.map(d => d.totalAmount), 1);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="sales-summary-totals">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">{isRTL ? 'إجمالي المبيعات' : 'Total Sales'}</span>
            </div>
            <div className="text-2xl font-bold text-green-900" data-testid="text-total-sales">
              {totals.totalSalesAmount.toLocaleString()} <span className="text-sm font-normal">SAR</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">{isRTL ? 'عدد الفواتير' : 'Total Invoices'}</span>
            </div>
            <div className="text-2xl font-bold text-blue-900" data-testid="text-total-invoices">
              {totals.totalInvoices.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700">{isRTL ? 'متوسط قيمة الفاتورة' : 'Avg Invoice Value'}</span>
            </div>
            <div className="text-2xl font-bold text-purple-900" data-testid="text-avg-invoice">
              {totals.avgInvoiceValue.toLocaleString()} <span className="text-sm font-normal">SAR</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar size={16} />
            {isRTL ? 'المبيعات اليومية' : 'Daily Sales'}
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto" data-testid="sales-by-day">
            {byDay.length > 0 ? byDay.slice(-14).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 min-w-[80px]">
                  {new Date(item.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{ width: `${(item.totalAmount / maxDayAmount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 min-w-[80px] text-right">
                  {item.totalAmount.toLocaleString()} SAR
                </span>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">
                {isRTL ? 'لا توجد بيانات' : 'No data'}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={16} />
              {isRTL ? 'أعلى العملاء' : 'Top Customers'}
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto" data-testid="sales-by-customer">
              {byCustomer.length > 0 ? byCustomer.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                    <div className="text-xs text-gray-500">{item.count} {isRTL ? 'طلب' : 'orders'}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {item.totalAmount.toLocaleString()} SAR
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  {isRTL ? 'لا توجد بيانات' : 'No data'}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Package size={16} />
              {isRTL ? 'أعلى المنتجات' : 'Top Products'}
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto" data-testid="sales-by-product">
              {byProduct.length > 0 ? byProduct.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    <div className="text-xs text-gray-500">{item.qty} {isRTL ? 'وحدة' : 'units'}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {item.totalAmount.toLocaleString()} SAR
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  {isRTL ? 'لا توجد بيانات' : 'No data'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            {isRTL ? 'قائمة الطلبات' : 'Orders List'}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" data-testid="sales-rows-table">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'الرقم' : 'Number'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'العميل' : 'Customer'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isRTL ? 'التاريخ' : 'Date'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length > 0 ? rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50" data-testid={`sales-row-${idx}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{row.number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        row.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        row.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.amount.toLocaleString()} SAR
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(row.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {isRTL ? 'لا توجد طلبات' : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {isRTL 
                  ? `صفحة ${pagination.page} من ${pagination.totalPages} (${pagination.totalCount} طلب)`
                  : `Page ${pagination.page} of ${pagination.totalPages} (${pagination.totalCount} orders)`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || runningReport}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                  data-testid="button-prev-page"
                >
                  {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  {pagination.page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || runningReport}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                  data-testid="button-next-page"
                >
                  {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
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
                        {selectedReport?.code === 'QUOTES_OVERVIEW' ? (
                          <>
                            <option value="NEW">{isRTL ? 'جديد' : 'New'}</option>
                            <option value="PENDING">{isRTL ? 'معلق' : 'Pending'}</option>
                            <option value="APPROVED">{isRTL ? 'موافق عليه' : 'Approved'}</option>
                            <option value="REJECTED">{isRTL ? 'مرفوض' : 'Rejected'}</option>
                            <option value="COMPLETED">{isRTL ? 'مكتمل' : 'Completed'}</option>
                            <option value="CANCELLED">{isRTL ? 'ملغى' : 'Cancelled'}</option>
                          </>
                        ) : (
                          <>
                            <option value="ACTIVE">{isRTL ? 'نشط' : 'Active'}</option>
                            <option value="PENDING">{isRTL ? 'معلق' : 'Pending'}</option>
                            <option value="COMPLETED">{isRTL ? 'مكتمل' : 'Completed'}</option>
                          </>
                        )}
                      </select>
                    </div>
                    {(selectedReport?.code === 'QUOTES_OVERVIEW' || selectedReport?.code === 'SALES_SUMMARY') ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isRTL ? 'معرف العميل' : 'Customer ID'}
                          </label>
                          <input
                            type="text"
                            value={filters.customerId || ''}
                            onChange={e => setFilters({ ...filters, customerId: e.target.value })}
                            placeholder={isRTL ? 'اختياري' : 'Optional'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            data-testid="input-customer-id"
                          />
                        </div>
                        {selectedReport?.code === 'SALES_SUMMARY' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {isRTL ? 'معرف المنتج' : 'Product ID'}
                            </label>
                            <input
                              type="text"
                              value={filters.productId || ''}
                              onChange={e => setFilters({ ...filters, productId: e.target.value })}
                              placeholder={isRTL ? 'اختياري' : 'Optional'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              data-testid="input-product-id"
                            />
                          </div>
                        )}
                      </>
                    ) : (
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
                    )}
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
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
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

                    {selectedReport?.code === 'QUOTES_OVERVIEW' && (reportResult as any).data ? (
                      renderQuotesOverview((reportResult as any).data as QuotesOverviewData)
                    ) : selectedReport?.code === 'SALES_SUMMARY' && (reportResult as any).data ? (
                      renderSalesSummary((reportResult as any).data as SalesSummaryData)
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
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
