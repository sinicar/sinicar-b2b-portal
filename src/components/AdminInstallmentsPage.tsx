import { useState, useEffect, ReactNode } from 'react';
import { 
  InstallmentRequest, 
  InstallmentOffer, 
  InstallmentSettings,
  CustomerCreditProfile,
  InstallmentRequestStatus,
  InstallmentOfferItem,
  PaymentFrequency,
  InstallmentStats
} from '../types';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
  CreditCard,
  Settings,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  RefreshCw,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Truck,
  Check,
  Ban,
  Filter,
  BarChart3,
  TrendingUp,
  Eye,
  Edit,
  Save,
  ArrowRight,
  Forward,
  Star
} from 'lucide-react';

const STATUS_CONFIGS: Record<string, { labelAr: string; labelEn: string; color: string; icon: ReactNode }> = {
  'PENDING_SINICAR_REVIEW': { labelAr: 'قيد المراجعة', labelEn: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: <Clock size={16} /> },
  'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR': { labelAr: 'بانتظار قرار العميل', labelEn: 'Awaiting Customer Decision', color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle size={16} /> },
  'REJECTED_BY_SINICAR': { labelAr: 'مرفوض من صيني كار', labelEn: 'Rejected by SINI CAR', color: 'bg-red-100 text-red-700', icon: <XCircle size={16} /> },
  'FORWARDED_TO_SUPPLIERS': { labelAr: 'محول للموردين', labelEn: 'Forwarded to Suppliers', color: 'bg-purple-100 text-purple-700', icon: <Truck size={16} /> },
  'WAITING_FOR_SUPPLIER_OFFERS': { labelAr: 'بانتظار عروض الموردين', labelEn: 'Waiting for Supplier Offers', color: 'bg-indigo-100 text-indigo-700', icon: <Clock size={16} /> },
  'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER': { labelAr: 'بانتظار قرار العميل على عرض المورد', labelEn: 'Awaiting Customer Decision on Supplier Offer', color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle size={16} /> },
  'ACTIVE_CONTRACT': { labelAr: 'عقد نشط', labelEn: 'Active Contract', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} /> },
  'CLOSED': { labelAr: 'مغلق', labelEn: 'Closed', color: 'bg-slate-100 text-slate-600', icon: <Ban size={16} /> },
  'CANCELLED': { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-slate-100 text-slate-600', icon: <XCircle size={16} /> }
};

type TabKey = 'pending' | 'customer-decisions' | 'forwarded' | 'active' | 'settings' | 'credit-profiles';

const TABS: { key: TabKey; labelAr: string; labelEn: string; icon: ReactNode }[] = [
  { key: 'pending', labelAr: 'طلبات جديدة', labelEn: 'New Requests', icon: <Clock size={18} /> },
  { key: 'customer-decisions', labelAr: 'قرارات العملاء', labelEn: 'Customer Decisions', icon: <Users size={18} /> },
  { key: 'forwarded', labelAr: 'محولة للموردين', labelEn: 'Forwarded', icon: <Truck size={18} /> },
  { key: 'active', labelAr: 'عقود نشطة', labelEn: 'Active Contracts', icon: <CheckCircle size={18} /> },
  { key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: <Settings size={18} /> },
  { key: 'credit-profiles', labelAr: 'الملفات الائتمانية', labelEn: 'Credit Profiles', icon: <Star size={18} /> }
];

export const AdminInstallmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [requests, setRequests] = useState<InstallmentRequest[]>([]);
  const [offers, setOffers] = useState<InstallmentOffer[]>([]);
  const [settings, setSettings] = useState<InstallmentSettings | null>(null);
  const [creditProfiles, setCreditProfiles] = useState<CustomerCreditProfile[]>([]);
  const [stats, setStats] = useState<InstallmentStats | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<InstallmentRequest | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, offersData, settingsData, profilesData, statsData] = await Promise.all([
        MockApi.getInstallmentRequests(),
        MockApi.getInstallmentOffers(),
        MockApi.getInstallmentSettings(),
        MockApi.getCustomerCreditProfiles(),
        MockApi.getInstallmentStats()
      ]);
      setRequests(requestsData);
      setOffers(offersData);
      setSettings(settingsData);
      setCreditProfiles(profilesData);
      setStats(statsData);
    } catch (error) {
      addToast({ type: 'error', message: t('installment.loadError', 'حدث خطأ في تحميل البيانات') });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'pending':
        return requests.filter(r => r.status === 'PENDING_SINICAR_REVIEW');
      case 'customer-decisions':
        return requests.filter(r => 
          ['WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR', 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER'].includes(r.status)
        );
      case 'forwarded':
        return requests.filter(r => 
          ['FORWARDED_TO_SUPPLIERS', 'WAITING_FOR_SUPPLIER_OFFERS'].includes(r.status)
        );
      case 'active':
        return requests.filter(r => r.status === 'ACTIVE_CONTRACT');
      default:
        return [];
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING_SINICAR_REVIEW').length;
  const customerDecisionCount = requests.filter(r => 
    ['WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR', 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER'].includes(r.status)
  ).length;
  const forwardedCount = requests.filter(r => 
    ['FORWARDED_TO_SUPPLIERS', 'WAITING_FOR_SUPPLIER_OFFERS'].includes(r.status)
  ).length;
  const activeCount = requests.filter(r => r.status === 'ACTIVE_CONTRACT').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-brand-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <CreditCard className="text-brand-600" size={28} />
            {t('installment.adminTitle', 'إدارة طلبات التقسيط')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('installment.adminSubtitle', 'مراجعة واعتماد طلبات الشراء بالتقسيط')}
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
          data-testid="button-refresh"
        >
          <RefreshCw size={18} />
          {t('common.refresh', 'تحديث')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                <FileText className="text-brand-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{t('installment.totalRequests', 'إجمالي الطلبات')}</div>
                <div className="text-xl font-bold text-slate-800">{stats.totalRequests}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{t('installment.pendingRequests', 'قيد المراجعة')}</div>
                <div className="text-xl font-bold text-slate-800">{stats.pendingRequests}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{t('installment.activeContracts', 'عقود نشطة')}</div>
                <div className="text-xl font-bold text-slate-800">{stats.activeContracts}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{t('installment.approvedValue', 'القيمة الموافق عليها')}</div>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalApprovedValue)}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{t('installment.totalPaid', 'إجمالي المدفوع')}</div>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalPaidAmount)}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{t('installment.overdueAmount', 'متأخرات')}</div>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalOverdueAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => {
            let count = 0;
            if (tab.key === 'pending') count = pendingCount;
            else if (tab.key === 'customer-decisions') count = customerDecisionCount;
            else if (tab.key === 'forwarded') count = forwardedCount;
            else if (tab.key === 'active') count = activeCount;
            else if (tab.key === 'credit-profiles') count = creditProfiles.length;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key 
                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50' 
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.icon}
                {isRTL ? tab.labelAr : tab.labelEn}
                {count > 0 && (
                  <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {(activeTab === 'pending' || activeTab === 'customer-decisions' || activeTab === 'forwarded' || activeTab === 'active') && (
            <RequestsListView
              requests={getFilteredRequests()}
              offers={offers}
              settings={settings!}
              onSelectRequest={setSelectedRequest}
              selectedRequest={selectedRequest}
              onRefresh={loadData}
              t={t}
              isRTL={isRTL}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              showActions={activeTab === 'pending'}
            />
          )}
          
          {activeTab === 'settings' && settings && (
            <SettingsView
              settings={settings}
              onSave={async (updated) => {
                try {
                  await MockApi.updateInstallmentSettings(updated);
                  await loadData();
                  addToast({ type: 'success', message: t('installment.settingsSaved', 'تم حفظ الإعدادات') });
                } catch (error) {
                  addToast({ type: 'error', message: t('installment.settingsError', 'حدث خطأ في حفظ الإعدادات') });
                }
              }}
              t={t}
              isRTL={isRTL}
            />
          )}
          
          {activeTab === 'credit-profiles' && (
            <CreditProfilesView
              profiles={creditProfiles}
              t={t}
              isRTL={isRTL}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {selectedRequest && activeTab === 'pending' && (
        <RequestActionModal
          request={selectedRequest}
          settings={settings!}
          onClose={() => setSelectedRequest(null)}
          onAction={async (action, data) => {
            setProcessingAction(true);
            try {
              if (action === 'approve_full' || action === 'approve_partial') {
                await MockApi.recordSinicarDecision(selectedRequest.id, {
                  decisionType: action,
                  offer: data?.offer,
                  adminNotes: data?.notes
                });
                addToast({ type: 'success', message: t('installment.decisionRecorded', 'تم تسجيل القرار') });
              } else if (action === 'reject') {
                await MockApi.recordSinicarDecision(selectedRequest.id, {
                  decisionType: 'reject',
                  adminNotes: data?.notes,
                  forwardToSuppliers: data?.forwardToSuppliers,
                  supplierIds: data?.supplierIds
                });
                addToast({ type: 'success', message: t('installment.requestRejected', 'تم رفض الطلب') });
              } else if (action === 'forward') {
                await MockApi.forwardRequestToSuppliers(selectedRequest.id, data?.supplierIds || []);
                addToast({ type: 'success', message: t('installment.forwarded', 'تم تحويل الطلب للموردين') });
              }
              await loadData();
              setSelectedRequest(null);
            } catch (error: any) {
              addToast({ type: 'error', message: error.message || t('installment.actionError', 'حدث خطأ') });
            } finally {
              setProcessingAction(false);
            }
          }}
          processing={processingAction}
          t={t}
          isRTL={isRTL}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

interface RequestsListViewProps {
  requests: InstallmentRequest[];
  offers: InstallmentOffer[];
  settings: InstallmentSettings;
  onSelectRequest: (request: InstallmentRequest | null) => void;
  selectedRequest: InstallmentRequest | null;
  onRefresh: () => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  showActions: boolean;
}

const RequestsListView = ({
  requests, offers, settings, onSelectRequest, selectedRequest, onRefresh,
  t, isRTL, formatDate, formatCurrency, showActions
}: RequestsListViewProps) => {
  if (requests.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <FileText className="mx-auto mb-4 text-slate-300" size={48} />
        <p>{t('installment.noRequestsInTab', 'لا توجد طلبات في هذا القسم')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.requestId', 'رقم الطلب')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.customer', 'العميل')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.amount', 'المبلغ')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.duration', 'المدة')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.date', 'التاريخ')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.status', 'الحالة')}
            </th>
            {showActions && (
              <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                {t('installment.actions', 'الإجراءات')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map(request => {
            const statusConfig = STATUS_CONFIGS[request.status];
            const requestOffers = offers.filter(o => o.requestId === request.id);
            
            return (
              <tr 
                key={request.id} 
                className={`hover:bg-slate-50 ${selectedRequest?.id === request.id ? 'bg-brand-50' : ''}`}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                  #{request.id.slice(-8)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {request.customerName || request.customerId}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                  {formatCurrency(request.totalRequestedValue || 0)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {request.requestedDurationMonths} {t('installment.months', 'شهور')}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${statusConfig?.color}`}>
                    {statusConfig?.icon}
                    {isRTL ? statusConfig?.labelAr : statusConfig?.labelEn}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectRequest(request)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                      data-testid={`button-review-${request.id}`}
                    >
                      <Eye size={14} />
                      {t('installment.review', 'مراجعة')}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface RequestActionModalProps {
  request: InstallmentRequest;
  settings: InstallmentSettings;
  onClose: () => void;
  onAction: (action: 'approve_full' | 'approve_partial' | 'reject' | 'forward', data?: any) => Promise<void>;
  processing: boolean;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
}

const RequestActionModal = ({
  request, settings, onClose, onAction, processing, t, isRTL, formatCurrency
}: RequestActionModalProps) => {
  const [actionType, setActionType] = useState<'approve_full' | 'approve_partial' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [forwardToSuppliers, setForwardToSuppliers] = useState(settings.autoForwardToSuppliersOnSinicarReject);
  const [partialAmount, setPartialAmount] = useState(request.totalRequestedValue || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {t('installment.reviewRequest', 'مراجعة طلب التقسيط')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="button-close-modal">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">{t('installment.customer', 'العميل')}</div>
              <div className="font-medium text-slate-800">{request.customerName || request.customerId}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">{t('installment.requestedValue', 'القيمة المطلوبة')}</div>
              <div className="font-bold text-slate-800">{formatCurrency(request.totalRequestedValue || 0)}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">{t('installment.duration', 'المدة')}</div>
              <div className="font-medium text-slate-800">{request.requestedDurationMonths} {t('installment.months', 'شهور')}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">{t('installment.frequency', 'التكرار')}</div>
              <div className="font-medium text-slate-800">
                {request.paymentFrequency === 'monthly' ? t('installment.monthly', 'شهري') : t('installment.weekly', 'أسبوعي')}
              </div>
            </div>
          </div>

          {request.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">{t('installment.requestedItems', 'المنتجات المطلوبة')}</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                {request.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.productName || item.productId}</span>
                    <span>{item.quantityRequested} × {formatCurrency(item.unitPriceRequested || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {request.notes && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">{t('installment.customerNotes', 'ملاحظات العميل')}</h3>
              <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">{request.notes}</p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">{t('installment.yourDecision', 'قرارك')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setActionType('approve_full')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  actionType === 'approve_full' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-200 hover:border-green-300'
                }`}
                data-testid="button-action-approve-full"
              >
                <CheckCircle className={`mx-auto mb-2 ${actionType === 'approve_full' ? 'text-green-600' : 'text-slate-400'}`} size={32} />
                <div className="font-medium text-slate-800">{t('installment.approveFullAction', 'موافقة كاملة')}</div>
                <div className="text-xs text-slate-500">{t('installment.approveFullDesc', 'الموافقة على كامل المبلغ')}</div>
              </button>
              
              {settings.allowPartialApprovalBySinicar && (
                <button
                  onClick={() => setActionType('approve_partial')}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    actionType === 'approve_partial' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                  data-testid="button-action-approve-partial"
                >
                  <AlertTriangle className={`mx-auto mb-2 ${actionType === 'approve_partial' ? 'text-amber-600' : 'text-slate-400'}`} size={32} />
                  <div className="font-medium text-slate-800">{t('installment.approvePartialAction', 'موافقة جزئية')}</div>
                  <div className="text-xs text-slate-500">{t('installment.approvePartialDesc', 'الموافقة على جزء من المبلغ')}</div>
                </button>
              )}
              
              <button
                onClick={() => setActionType('reject')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  actionType === 'reject' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-slate-200 hover:border-red-300'
                }`}
                data-testid="button-action-reject"
              >
                <XCircle className={`mx-auto mb-2 ${actionType === 'reject' ? 'text-red-600' : 'text-slate-400'}`} size={32} />
                <div className="font-medium text-slate-800">{t('installment.rejectAction', 'رفض')}</div>
                <div className="text-xs text-slate-500">{t('installment.rejectDesc', 'رفض الطلب')}</div>
              </button>
            </div>

            {actionType === 'approve_partial' && (
              <div className="bg-amber-50 p-4 rounded-xl mb-4">
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  {t('installment.approvedAmount', 'المبلغ الموافق عليه')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={request.totalRequestedValue}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-amber-200 rounded-lg py-2 px-4 focus:ring-2 focus:ring-amber-500"
                  data-testid="input-partial-amount"
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div className="bg-red-50 p-4 rounded-xl mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forwardToSuppliers}
                    onChange={(e) => setForwardToSuppliers(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                    data-testid="checkbox-forward-on-reject"
                  />
                  <span className="text-sm font-medium text-red-800">
                    {t('installment.forwardOnReject', 'تحويل الطلب للموردين بعد الرفض')}
                  </span>
                </label>
              </div>
            )}

            {actionType && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('installment.adminNotes', 'ملاحظات المدير')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-500"
                  placeholder={t('installment.notesPlaceholder', 'أي ملاحظات إضافية...')}
                  data-testid="textarea-admin-notes"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-cancel-action"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            {actionType && (
              <button
                onClick={() => onAction(actionType, {
                  notes,
                  forwardToSuppliers: actionType === 'reject' ? forwardToSuppliers : undefined,
                  offer: actionType === 'approve_partial' ? {
                    totalApprovedValue: partialAmount,
                    itemsApproved: []
                  } : actionType === 'approve_full' ? {
                    totalApprovedValue: request.totalRequestedValue,
                    itemsApproved: []
                  } : undefined
                })}
                disabled={processing}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === 'approve_full' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  actionType === 'approve_partial' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  'bg-red-600 hover:bg-red-700 text-white'
                }`}
                data-testid="button-confirm-action"
              >
                {processing ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                {t('installment.confirmDecision', 'تأكيد القرار')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsViewProps {
  settings: InstallmentSettings;
  onSave: (settings: Partial<InstallmentSettings>) => Promise<void>;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
}

const SettingsView = ({ settings, onSave, t, isRTL }: SettingsViewProps) => {
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-6 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-brand-600" />
            {t('installment.generalSettings', 'الإعدادات العامة')}
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.enableSystem', 'تفعيل نظام التقسيط')}</span>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-enabled"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.sinicarPriority', 'صيني كار لها الأولوية')}</span>
              <input
                type="checkbox"
                checked={form.sinicarHasFirstPriority}
                onChange={(e) => setForm({ ...form, sinicarHasFirstPriority: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-sinicar-priority"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.allowPartialSinicar', 'السماح بالموافقة الجزئية من صيني كار')}</span>
              <input
                type="checkbox"
                checked={form.allowPartialApprovalBySinicar}
                onChange={(e) => setForm({ ...form, allowPartialApprovalBySinicar: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-partial-sinicar"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.allowPartialSuppliers', 'السماح بالموافقة الجزئية من الموردين')}</span>
              <input
                type="checkbox"
                checked={form.allowPartialApprovalBySuppliers}
                onChange={(e) => setForm({ ...form, allowPartialApprovalBySuppliers: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-partial-suppliers"
              />
            </label>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Forward size={18} className="text-brand-600" />
            {t('installment.forwardingSettings', 'إعدادات التحويل')}
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.autoForwardOnReject', 'تحويل تلقائي للموردين عند الرفض')}</span>
              <input
                type="checkbox"
                checked={form.autoForwardToSuppliersOnSinicarReject}
                onChange={(e) => setForm({ ...form, autoForwardToSuppliersOnSinicarReject: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-auto-forward-reject"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.autoForwardOnPartial', 'تحويل تلقائي للمتبقي عند الموافقة الجزئية')}</span>
              <input
                type="checkbox"
                checked={form.autoForwardToSuppliersOnSinicarPartialRemainder}
                onChange={(e) => setForm({ ...form, autoForwardToSuppliersOnSinicarPartialRemainder: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-auto-forward-partial"
              />
            </label>
            
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {t('installment.onCustomerRejectsSinicar', 'عند رفض العميل عرض صيني كار')}
              </label>
              <select
                value={form.onCustomerRejectsSinicarPartial}
                onChange={(e) => setForm({ ...form, onCustomerRejectsSinicarPartial: e.target.value as any })}
                className="w-full border border-slate-200 rounded-lg py-2 px-4"
                data-testid="select-on-customer-rejects-sinicar"
              >
                <option value="forward_to_suppliers">{t('installment.forwardToSuppliers', 'تحويل للموردين')}</option>
                <option value="close_request">{t('installment.closeRequest', 'إغلاق الطلب')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-brand-600" />
            {t('installment.financialLimits', 'الحدود المالية')}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">{t('installment.minAmount', 'الحد الأدنى')}</label>
                <input
                  type="number"
                  value={form.minRequestAmount}
                  onChange={(e) => setForm({ ...form, minRequestAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg py-2 px-4"
                  data-testid="input-min-amount"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">{t('installment.maxAmount', 'الحد الأقصى')}</label>
                <input
                  type="number"
                  value={form.maxRequestAmount}
                  onChange={(e) => setForm({ ...form, maxRequestAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg py-2 px-4"
                  data-testid="input-max-amount"
                />
              </div>
            </div>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{t('installment.requireDownPayment', 'طلب دفعة مقدمة')}</span>
              <input
                type="checkbox"
                checked={form.requireDownPayment}
                onChange={(e) => setForm({ ...form, requireDownPayment: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded"
                data-testid="toggle-require-down-payment"
              />
            </label>
            
            {form.requireDownPayment && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">{t('installment.minDownPercent', 'الحد الأدنى %')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.minDownPaymentPercent}
                    onChange={(e) => setForm({ ...form, minDownPaymentPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg py-2 px-4"
                    data-testid="input-min-down-percent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">{t('installment.maxDownPercent', 'الحد الأقصى %')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.maxDownPaymentPercent}
                    onChange={(e) => setForm({ ...form, maxDownPaymentPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg py-2 px-4"
                    data-testid="input-max-down-percent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" />
            {t('installment.durationSettings', 'إعدادات المدة')}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">{t('installment.minMonths', 'الحد الأدنى (شهور)')}</label>
                <input
                  type="number"
                  min={1}
                  value={form.minDurationMonths}
                  onChange={(e) => setForm({ ...form, minDurationMonths: parseInt(e.target.value) || 1 })}
                  className="w-full border border-slate-200 rounded-lg py-2 px-4"
                  data-testid="input-min-months"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">{t('installment.maxMonths', 'الحد الأقصى (شهور)')}</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxDurationMonths}
                  onChange={(e) => setForm({ ...form, maxDurationMonths: parseInt(e.target.value) || 12 })}
                  className="w-full border border-slate-200 rounded-lg py-2 px-4"
                  data-testid="input-max-months"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-700 mb-1">{t('installment.defaultFrequency', 'التكرار الافتراضي')}</label>
              <select
                value={form.defaultPaymentFrequency}
                onChange={(e) => setForm({ ...form, defaultPaymentFrequency: e.target.value as PaymentFrequency })}
                className="w-full border border-slate-200 rounded-lg py-2 px-4"
                data-testid="select-default-frequency"
              >
                <option value="monthly">{t('installment.monthly', 'شهري')}</option>
                <option value="weekly">{t('installment.weekly', 'أسبوعي')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50"
          data-testid="button-save-settings"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {t('common.save', 'حفظ الإعدادات')}
        </button>
      </div>
    </div>
  );
};

interface CreditProfilesViewProps {
  profiles: CustomerCreditProfile[];
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
}

const CreditProfilesView = ({ profiles, t, isRTL, formatCurrency }: CreditProfilesViewProps) => {
  const scoreLevelColors: Record<string, string> = {
    'excellent': 'bg-green-100 text-green-700',
    'good': 'bg-blue-100 text-blue-700',
    'medium': 'bg-amber-100 text-amber-700',
    'low': 'bg-orange-100 text-orange-700',
    'blocked': 'bg-red-100 text-red-700'
  };
  
  const scoreLevelLabels: Record<string, { ar: string; en: string }> = {
    'excellent': { ar: 'ممتاز', en: 'Excellent' },
    'good': { ar: 'جيد', en: 'Good' },
    'medium': { ar: 'متوسط', en: 'Medium' },
    'low': { ar: 'منخفض', en: 'Low' },
    'blocked': { ar: 'محظور', en: 'Blocked' }
  };

  if (profiles.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Users className="mx-auto mb-4 text-slate-300" size={48} />
        <p>{t('installment.noCreditProfiles', 'لا توجد ملفات ائتمانية')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.customer', 'العميل')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.creditScore', 'التصنيف الائتماني')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.totalRequests', 'إجمالي الطلبات')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.activeContracts', 'عقود نشطة')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.totalPaid', 'المدفوع')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.remaining', 'المتبقي')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
              {t('installment.overdue', 'متأخرات')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {profiles.map(profile => (
            <tr key={profile.customerId} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-800">
                {profile.customerName || profile.customerId}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreLevelColors[profile.scoreLevel] || 'bg-slate-100 text-slate-600'}`}>
                  {isRTL ? scoreLevelLabels[profile.scoreLevel]?.ar : scoreLevelLabels[profile.scoreLevel]?.en}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{profile.totalInstallmentRequests}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{profile.totalActiveContracts}</td>
              <td className="px-4 py-3 text-sm text-green-600 font-medium">{formatCurrency(profile.totalPaidAmount || 0)}</td>
              <td className="px-4 py-3 text-sm text-amber-600 font-medium">{formatCurrency(profile.totalRemainingAmount || 0)}</td>
              <td className="px-4 py-3 text-sm text-red-600 font-medium">
                {profile.totalOverdueInstallments > 0 ? profile.totalOverdueInstallments : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInstallmentsPage;
