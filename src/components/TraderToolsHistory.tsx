import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { 
  History, Car, FileSpreadsheet, Scale, Search, Table, Upload,
  CheckCircle, XCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight,
  Filter, Download, FileText, ExternalLink, Loader2
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { MockApi } from '../services/mockApi';
import { 
  User, TraderToolAction, TraderToolType, TraderToolActionStatus,
  TraderToolsCustomerFilters
} from '../types';
import { formatDateTime, formatDate } from '../utils/dateUtils';

interface TraderToolsHistoryProps {
  user: User;
}

const TOOL_LABELS: Record<TraderToolType, { ar: string; en: string; icon: ReactNode }> = {
  VIN: { ar: 'استخراج VIN', en: 'VIN Extraction', icon: <Car size={16} /> },
  PDF_EXCEL: { ar: 'تحويل PDF إلى Excel', en: 'PDF to Excel', icon: <FileSpreadsheet size={16} /> },
  COMPARISON: { ar: 'مقارنة الأسعار', en: 'Price Comparison', icon: <Scale size={16} /> },
  ALTERNATIVES: { ar: 'رفع البدائل', en: 'Alternatives Upload', icon: <Upload size={16} /> },
  SEARCH: { ar: 'بحث المنتجات', en: 'Product Search', icon: <Search size={16} /> },
  EXCEL_QUOTE: { ar: 'طلب تسعير Excel', en: 'Excel Quote', icon: <Table size={16} /> }
};

const STATUS_LABELS: Record<TraderToolActionStatus, { ar: string; en: string; color: string; icon: ReactNode }> = {
  SUCCESS: { 
    ar: 'ناجح', 
    en: 'Success', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle size={14} />
  },
  FAILED: { 
    ar: 'فشل', 
    en: 'Failed', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <XCircle size={14} />
  },
  PENDING: { 
    ar: 'قيد الانتظار', 
    en: 'Pending', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock size={14} />
  },
  PROCESSING: { 
    ar: 'قيد المعالجة', 
    en: 'Processing', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Loader2 size={14} className="animate-spin" />
  }
};

const StatusBadge = ({ status, isRTL }: { status: TraderToolActionStatus; isRTL: boolean }) => {
  const config = STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      {config.icon}
      {isRTL ? config.ar : config.en}
    </span>
  );
};

const ToolBadge = ({ toolType, isRTL }: { toolType: TraderToolType; isRTL: boolean }) => {
  const config = TOOL_LABELS[toolType];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 border border-brand-200">
      {config.icon}
      {isRTL ? config.ar : config.en}
    </span>
  );
};

export const TraderToolsHistory = ({ user }: TraderToolsHistoryProps) => {
  const { t, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<TraderToolAction[]>([]);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [toolTypeFilter, setToolTypeFilter] = useState<TraderToolType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TraderToolActionStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
  // Detail Modal
  const [selectedAction, setSelectedAction] = useState<TraderToolAction | null>(null);
  
  // Initialize demo data and load actions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await MockApi.initializeTraderToolsDemoData(user.id);
        
        const filters: TraderToolsCustomerFilters = {
          page: currentPage,
          pageSize,
          toolType: toolTypeFilter === 'ALL' ? undefined : toolTypeFilter,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        };
        
        const response = await MockApi.getTraderToolActionsCustomer(user.id, filters);
        setActions(response.items);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load tool history:', error);
        addToast(t('traderHistory.loadError', 'حدث خطأ أثناء تحميل السجل'), 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user.id, currentPage, toolTypeFilter, statusFilter, dateFrom, dateTo]);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [toolTypeFilter, statusFilter, dateFrom, dateTo]);
  
  const totalPages = Math.ceil(total / pageSize);
  
  const getInputSummary = (action: TraderToolAction): string => {
    const { toolType, metadata, inputData } = action;
    
    switch (toolType) {
      case 'VIN':
        return metadata?.vin || inputData?.imageFile || '-';
      case 'PDF_EXCEL':
        return action.inputFileName || inputData?.fileName || '-';
      case 'COMPARISON':
        return metadata?.partNumber || metadata?.partName || inputData?.partNumber || '-';
      case 'SEARCH':
        return metadata?.searchQuery || inputData?.query || '-';
      case 'EXCEL_QUOTE':
        return action.inputFileName || `${metadata?.itemsCount || 0} ${isRTL ? 'عنصر' : 'items'}`;
      case 'ALTERNATIVES':
        return action.inputFileName || '-';
      default:
        return '-';
    }
  };
  
  const getOutputSummary = (action: TraderToolAction): string => {
    const { toolType, metadata, outputData } = action;
    
    switch (toolType) {
      case 'VIN':
        return metadata?.manufacturer && metadata?.year 
          ? `${metadata.manufacturer} ${metadata.model || ''} (${metadata.year})`
          : '-';
      case 'PDF_EXCEL':
        return metadata?.rowCount 
          ? `${metadata.rowCount} ${isRTL ? 'صف' : 'rows'}, ${metadata.columnCount} ${isRTL ? 'عمود' : 'cols'}`
          : '-';
      case 'COMPARISON':
        return metadata?.suppliersCount 
          ? `${metadata.suppliersCount} ${isRTL ? 'موردين' : 'suppliers'} | ${metadata.lowestPrice} - ${metadata.highestPrice}`
          : '-';
      case 'SEARCH':
        return metadata?.resultsCount !== undefined 
          ? `${metadata.resultsCount} ${isRTL ? 'نتيجة' : 'results'}`
          : '-';
      case 'EXCEL_QUOTE':
        return metadata?.quotedTotal !== undefined 
          ? `${metadata.quotedTotal.toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}`
          : '-';
      case 'ALTERNATIVES':
        return outputData ? JSON.stringify(outputData).substring(0, 50) : '-';
      default:
        return '-';
    }
  };
  
  const handleClearFilters = () => {
    setToolTypeFilter('ALL');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };
  
  const usageSummary = useMemo(() => {
    return {
      total: actions.length,
      success: actions.filter(a => a.status === 'SUCCESS').length,
      failed: actions.filter(a => a.status === 'FAILED').length
    };
  }, [actions]);

  return (
    <div className="p-4 md:p-6 space-y-6" dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="text-brand-600" size={28} />
            {t('traderHistory.title', 'سجل استخدام الأدوات')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('traderHistory.subtitle', 'تتبع جميع عمليات استخدام أدوات التاجر')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
            <span className="text-slate-500 text-sm">{t('traderHistory.totalUsage', 'إجمالي')}:</span>
            <span className="font-bold text-lg text-brand-700" data-testid="text-total-usage">{total}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-500" />
          <span className="font-semibold text-slate-700">{t('traderHistory.filters', 'الفلاتر')}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('traderHistory.toolType', 'نوع الأداة')}</label>
            <select
              value={toolTypeFilter}
              onChange={(e) => setToolTypeFilter(e.target.value as TraderToolType | 'ALL')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              data-testid="select-tool-type"
            >
              <option value="ALL">{t('common.all', 'الكل')}</option>
              {Object.entries(TOOL_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{isRTL ? val.ar : val.en}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('traderHistory.status', 'الحالة')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TraderToolActionStatus | 'ALL')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              data-testid="select-status"
            >
              <option value="ALL">{t('common.all', 'الكل')}</option>
              {Object.entries(STATUS_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{isRTL ? val.ar : val.en}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('traderHistory.dateFrom', 'من تاريخ')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              data-testid="input-date-from"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('traderHistory.dateTo', 'إلى تاريخ')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              data-testid="input-date-to"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              data-testid="button-clear-filters"
            >
              {t('common.clearFilters', 'مسح الفلاتر')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-600" size={40} />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <History size={60} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold">{t('traderHistory.noRecords', 'لا توجد سجلات')}</p>
            <p className="text-sm">{t('traderHistory.noRecordsDesc', 'ابدأ باستخدام أدوات التاجر لتظهر هنا')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-slate-600 uppercase`}>
                      {t('traderHistory.col.date', 'التاريخ')}
                    </th>
                    <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-slate-600 uppercase`}>
                      {t('traderHistory.col.tool', 'الأداة')}
                    </th>
                    <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-slate-600 uppercase`}>
                      {t('traderHistory.col.input', 'المدخلات')}
                    </th>
                    <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-slate-600 uppercase`}>
                      {t('traderHistory.col.output', 'المخرجات')}
                    </th>
                    <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-slate-600 uppercase`}>
                      {t('traderHistory.col.status', 'الحالة')}
                    </th>
                    <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold text-slate-600 uppercase`}>
                      {t('traderHistory.col.actions', 'إجراءات')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actions.map((action) => (
                    <tr 
                      key={action.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAction(action)}
                      data-testid={`row-action-${action.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-700 font-medium">
                          {formatDate(action.createdAt)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDateTime(action.createdAt).split(' ').slice(-1)[0]}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ToolBadge toolType={action.toolType} isRTL={isRTL} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 truncate max-w-[200px] block">
                          {getInputSummary(action)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 truncate max-w-[200px] block">
                          {getOutputSummary(action)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={action.status} isRTL={isRTL} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {action.outputFileUrl && (
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                              title={t('common.download', 'تحميل')}
                              data-testid={`button-download-${action.id}`}
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedAction(action); }}
                            className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                            title={t('common.details', 'التفاصيل')}
                            data-testid={`button-details-${action.id}`}
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <span className="text-sm text-slate-500">
                  {t('common.showing', 'عرض')} {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} {t('common.of', 'من')} {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    data-testid="button-prev-page"
                  >
                    {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  </button>
                  <span className="text-sm text-slate-600 px-3">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    data-testid="button-next-page"
                  >
                    {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAction(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {t('traderHistory.detailsTitle', 'تفاصيل العملية')}
              </h2>
              <button
                onClick={() => setSelectedAction(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid="button-close-modal"
              >
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase">{t('traderHistory.col.tool', 'الأداة')}</label>
                  <div className="mt-1">
                    <ToolBadge toolType={selectedAction.toolType} isRTL={isRTL} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase">{t('traderHistory.col.status', 'الحالة')}</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedAction.status} isRTL={isRTL} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 uppercase">{t('traderHistory.col.date', 'التاريخ')}</label>
                <p className="text-sm text-slate-700 font-medium">{formatDateTime(selectedAction.createdAt)}</p>
              </div>
              
              {selectedAction.processingTimeMs && (
                <div>
                  <label className="text-xs text-slate-500 uppercase">{t('traderHistory.processingTime', 'وقت المعالجة')}</label>
                  <p className="text-sm text-slate-700">{(selectedAction.processingTimeMs / 1000).toFixed(2)} {t('common.seconds', 'ثانية')}</p>
                </div>
              )}
              
              <div>
                <label className="text-xs text-slate-500 uppercase">{t('traderHistory.col.input', 'المدخلات')}</label>
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
                <label className="text-xs text-slate-500 uppercase">{t('traderHistory.col.output', 'المخرجات')}</label>
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
                  <label className="text-xs text-red-500 uppercase">{t('traderHistory.errorMessage', 'رسالة الخطأ')}</label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{selectedAction.errorMessage}</p>
                  </div>
                </div>
              )}
              
              {selectedAction.metadata && Object.keys(selectedAction.metadata).length > 0 && (
                <div>
                  <label className="text-xs text-slate-500 uppercase">{t('traderHistory.additionalInfo', 'معلومات إضافية')}</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded-lg text-sm">
                    {selectedAction.toolType === 'VIN' && selectedAction.metadata.confidence && (
                      <p className="text-slate-600">
                        {t('traderHistory.confidence', 'الدقة')}: <span className="font-medium">{selectedAction.metadata.confidence}%</span>
                      </p>
                    )}
                    {selectedAction.toolType === 'COMPARISON' && selectedAction.metadata.suppliersCount && (
                      <p className="text-slate-600">
                        {t('traderHistory.suppliersCompared', 'عدد الموردين')}: <span className="font-medium">{selectedAction.metadata.suppliersCount}</span>
                      </p>
                    )}
                    {selectedAction.toolType === 'PDF_EXCEL' && selectedAction.metadata.pageCount && (
                      <p className="text-slate-600">
                        {t('traderHistory.pagesProcessed', 'الصفحات')}: <span className="font-medium">{selectedAction.metadata.pageCount}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>ID: {selectedAction.id}</span>
                <span>•</span>
                <span>{selectedAction.deviceType}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
