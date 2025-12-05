import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { 
  InstallmentRequest, 
  InstallmentOffer, 
  InstallmentSettings,
  InstallmentRequestItem,
  PaymentFrequency,
  Product
} from '../types';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Package,
  ArrowRight,
  ArrowLeft,
  Eye,
  RefreshCw,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Truck,
  Check,
  Ban
} from 'lucide-react';

const STATUS_CONFIGS: Record<string, { labelAr: string; labelEn: string; color: string; icon: ReactNode }> = {
  'PENDING_SINICAR_REVIEW': { labelAr: 'قيد المراجعة', labelEn: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: <Clock size={16} /> },
  'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR': { labelAr: 'بانتظار قرارك', labelEn: 'Awaiting Your Decision', color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle size={16} /> },
  'REJECTED_BY_SINICAR': { labelAr: 'مرفوض', labelEn: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle size={16} /> },
  'FORWARDED_TO_SUPPLIERS': { labelAr: 'محول للموردين', labelEn: 'Forwarded to Suppliers', color: 'bg-purple-100 text-purple-700', icon: <Truck size={16} /> },
  'WAITING_FOR_SUPPLIER_OFFERS': { labelAr: 'بانتظار عروض الموردين', labelEn: 'Waiting for Supplier Offers', color: 'bg-indigo-100 text-indigo-700', icon: <Clock size={16} /> },
  'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER': { labelAr: 'بانتظار قرارك على عرض المورد', labelEn: 'Awaiting Your Decision on Supplier Offer', color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle size={16} /> },
  'ACTIVE_CONTRACT': { labelAr: 'عقد نشط', labelEn: 'Active Contract', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} /> },
  'CLOSED': { labelAr: 'مغلق', labelEn: 'Closed', color: 'bg-slate-100 text-slate-600', icon: <Ban size={16} /> },
  'CANCELLED': { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-slate-100 text-slate-600', icon: <XCircle size={16} /> }
};

interface CustomerInstallmentPageProps {
  customerId: string;
  customerName?: string;
}

export const CustomerInstallmentPage = ({ customerId, customerName }: CustomerInstallmentPageProps) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<InstallmentSettings | null>(null);
  const [requests, setRequests] = useState<InstallmentRequest[]>([]);
  const [offers, setOffers] = useState<InstallmentOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InstallmentRequest | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, requestsData, productsData] = await Promise.all([
        MockApi.getInstallmentSettings(),
        MockApi.getInstallmentRequestsByCustomerId(customerId),
        MockApi.getProducts()
      ]);
      setSettings(settingsData);
      setRequests(requestsData);
      setProducts(productsData);
    } catch (error) {
      addToast(t('installment.loadError', 'حدث خطأ في تحميل البيانات'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOffersForRequest = async (requestId: string) => {
    try {
      const offersData = await MockApi.getOffersByRequestId(requestId);
      setOffers(offersData);
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const handleSelectRequest = async (request: InstallmentRequest) => {
    setSelectedRequest(request);
    await loadOffersForRequest(request.id);
  };

  const handleRespondToOffer = async (offerId: string, decision: 'accept' | 'reject') => {
    setProcessingAction(true);
    try {
      await MockApi.customerRespondToOffer(offerId, decision);
      const message = decision === 'accept' 
        ? t('installment.offerAccepted', 'تم قبول العرض بنجاح') 
        : t('installment.offerRejected', 'تم رفض العرض');
      addToast(message, 'success');
      await loadData();
      if (selectedRequest) {
        const updatedRequest = await MockApi.getInstallmentRequestById(selectedRequest.id);
        setSelectedRequest(updatedRequest);
        await loadOffersForRequest(selectedRequest.id);
      }
    } catch (error: any) {
      addToast(error.message || t('installment.actionError', 'حدث خطأ'), 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm(t('installment.confirmCancel', 'هل أنت متأكد من إلغاء الطلب؟'))) return;
    
    setProcessingAction(true);
    try {
      await MockApi.cancelInstallmentRequest(requestId);
      addToast(t('installment.requestCancelled', 'تم إلغاء الطلب'), 'success');
      await loadData();
      setSelectedRequest(null);
    } catch (error: any) {
      addToast(error.message || t('installment.cancelError', 'حدث خطأ في الإلغاء'), 'error');
    } finally {
      setProcessingAction(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-brand-600" size={48} />
      </div>
    );
  }

  if (!settings?.enabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <CreditCard className="text-slate-400 mb-4" size={64} />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          {t('installment.disabled', 'خدمة التقسيط غير متاحة حالياً')}
        </h2>
        <p className="text-slate-500">
          {t('installment.disabledDesc', 'سيتم تفعيل الخدمة قريباً، يرجى المحاولة لاحقاً')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <CreditCard className="text-brand-600" size={28} />
            {t('installment.title', 'طلبات الشراء بالتقسيط')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('installment.subtitle', 'تقديم ومتابعة طلبات الشراء بالتقسيط')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
            data-testid="button-refresh"
          >
            <RefreshCw size={18} />
            {t('common.refresh', 'تحديث')}
          </button>
          <button
            onClick={() => setShowNewRequestForm(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
            data-testid="button-new-request"
          >
            <Plus size={18} />
            {t('installment.newRequest', 'طلب جديد')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${selectedRequest ? '1' : '3'}`}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">
                {t('installment.myRequests', 'طلباتي')} ({requests.length})
              </h2>
            </div>
            
            {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="mx-auto mb-4 text-slate-300" size={48} />
                <p>{t('installment.noRequests', 'لا توجد طلبات تقسيط')}</p>
                <button
                  onClick={() => setShowNewRequestForm(true)}
                  className="mt-4 text-brand-600 hover:text-brand-700 font-medium"
                  data-testid="button-create-first-request"
                >
                  {t('installment.createFirst', 'أنشئ طلبك الأول')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests.map(request => {
                  const statusConfig = STATUS_CONFIGS[request.status];
                  const isSelected = selectedRequest?.id === request.id;
                  
                  return (
                    <div
                      key={request.id}
                      onClick={() => handleSelectRequest(request)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-50 border-r-4 border-brand-600' : 'hover:bg-slate-50'
                      }`}
                      data-testid={`request-row-${request.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm text-slate-500">#{request.id.slice(-8)}</span>
                          <div className="font-medium text-slate-800 mt-1">
                            {formatCurrency(request.totalRequestedValue || 0)}
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                          {statusConfig?.icon}
                          {isRTL ? statusConfig?.labelAr : statusConfig?.labelEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(request.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {request.requestedDurationMonths} {t('installment.months', 'شهور')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {selectedRequest && (
          <div className="lg:col-span-2">
            <RequestDetailView
              request={selectedRequest}
              offers={offers}
              onClose={() => setSelectedRequest(null)}
              onRespondToOffer={handleRespondToOffer}
              onCancelRequest={handleCancelRequest}
              processingAction={processingAction}
              t={t}
              isRTL={isRTL}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
      </div>

      {showNewRequestForm && settings && (
        <NewRequestModal
          customerId={customerId}
          customerName={customerName}
          settings={settings}
          products={products}
          onClose={() => setShowNewRequestForm(false)}
          onSuccess={() => {
            setShowNewRequestForm(false);
            loadData();
          }}
          t={t}
          isRTL={isRTL}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

interface RequestDetailViewProps {
  request: InstallmentRequest;
  offers: InstallmentOffer[];
  onClose: () => void;
  onRespondToOffer: (offerId: string, decision: 'accept' | 'reject') => void;
  onCancelRequest: (requestId: string) => void;
  processingAction: boolean;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const RequestDetailView = ({
  request, offers, onClose, onRespondToOffer, onCancelRequest, processingAction,
  t, isRTL, formatDate, formatCurrency
}: RequestDetailViewProps) => {
  const statusConfig = STATUS_CONFIGS[request.status];
  const pendingOffers = offers.filter(o => o.status === 'WAITING_FOR_CUSTOMER');
  const acceptedOffer = offers.find(o => o.id === request.acceptedOfferId);
  const canCancel = !['ACTIVE_CONTRACT', 'CLOSED', 'CANCELLED'].includes(request.status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-slate-800">
            {t('installment.requestDetails', 'تفاصيل الطلب')}
          </h2>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
            {statusConfig?.icon}
            {isRTL ? statusConfig?.labelAr : statusConfig?.labelEn}
          </span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg" data-testid="button-close-detail">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">{t('installment.requestedValue', 'القيمة المطلوبة')}</div>
            <div className="text-lg font-bold text-slate-800">{formatCurrency(request.totalRequestedValue || 0)}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">{t('installment.duration', 'المدة')}</div>
            <div className="text-lg font-bold text-slate-800">
              {request.requestedDurationMonths} {t('installment.months', 'شهور')}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">{t('installment.frequency', 'التكرار')}</div>
            <div className="text-lg font-bold text-slate-800">
              {request.paymentFrequency === 'monthly' ? t('installment.monthly', 'شهري') : t('installment.weekly', 'أسبوعي')}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">{t('installment.downPayment', 'الدفعة المقدمة')}</div>
            <div className="text-lg font-bold text-slate-800">
              {request.downPaymentAmount ? formatCurrency(request.downPaymentAmount) : '-'}
            </div>
          </div>
        </div>

        {request.items.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">{t('installment.requestedItems', 'المنتجات المطلوبة')}</h3>
            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                      {t('installment.product', 'المنتج')}
                    </th>
                    <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                      {t('installment.quantity', 'الكمية')}
                    </th>
                    <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                      {t('installment.price', 'السعر')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {request.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {item.productName || item.description || item.productId}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.quantityRequested}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {item.unitPriceRequested ? formatCurrency(item.unitPriceRequested) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {request.notes && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">{t('installment.notes', 'ملاحظات')}</h3>
            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">{request.notes}</p>
          </div>
        )}

        {pendingOffers.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              {t('installment.pendingOffers', 'عروض بانتظار قرارك')}
            </h3>
            <div className="space-y-4">
              {pendingOffers.map(offer => (
                <OfferCard 
                  key={offer.id}
                  offer={offer}
                  onAccept={() => onRespondToOffer(offer.id, 'accept')}
                  onReject={() => onRespondToOffer(offer.id, 'reject')}
                  processingAction={processingAction}
                  t={t}
                  isRTL={isRTL}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        )}

        {acceptedOffer && request.status === 'ACTIVE_CONTRACT' && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              {t('installment.activeContract', 'العقد النشط')}
            </h3>
            <ContractView
              offer={acceptedOffer}
              t={t}
              isRTL={isRTL}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            {t('installment.createdAt', 'تاريخ الإنشاء')}: {formatDate(request.createdAt)}
          </div>
          {canCancel && (
            <button
              onClick={() => onCancelRequest(request.id)}
              disabled={processingAction}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-cancel-request"
            >
              <XCircle size={18} />
              {t('installment.cancelRequest', 'إلغاء الطلب')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface OfferCardProps {
  offer: InstallmentOffer;
  onAccept: () => void;
  onReject: () => void;
  processingAction: boolean;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const OfferCard = ({ offer, onAccept, onReject, processingAction, t, isRTL, formatDate, formatCurrency }: OfferCardProps) => (
  <div className="bg-gradient-to-br from-brand-50 to-white border-2 border-brand-200 rounded-xl p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {offer.sourceType === 'sinicar' ? (
          <div className="p-2 bg-brand-100 rounded-lg">
            <Building2 className="text-brand-600" size={24} />
          </div>
        ) : (
          <div className="p-2 bg-purple-100 rounded-lg">
            <Truck className="text-purple-600" size={24} />
          </div>
        )}
        <div>
          <h4 className="font-semibold text-slate-800">
            {offer.sourceType === 'sinicar' 
              ? t('installment.sinicarOffer', 'عرض صيني كار')
              : `${t('installment.supplierOffer', 'عرض')} ${offer.supplierName}`
            }
          </h4>
          <span className={`text-sm ${offer.type === 'full' ? 'text-green-600' : 'text-amber-600'}`}>
            {offer.type === 'full' 
              ? t('installment.fullApproval', 'موافقة كاملة')
              : t('installment.partialApproval', 'موافقة جزئية')
            }
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-brand-600">{formatCurrency(offer.totalApprovedValue)}</div>
        <div className="text-sm text-slate-500">{t('installment.approvedValue', 'القيمة الموافق عليها')}</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
      <div className="bg-white/80 p-3 rounded-lg">
        <div className="text-sm text-slate-500">{t('installment.installments', 'عدد الأقساط')}</div>
        <div className="font-bold text-slate-800">{offer.schedule.numberOfInstallments}</div>
      </div>
      <div className="bg-white/80 p-3 rounded-lg">
        <div className="text-sm text-slate-500">{t('installment.installmentAmount', 'قيمة القسط')}</div>
        <div className="font-bold text-slate-800">{formatCurrency(offer.schedule.installmentAmount)}</div>
      </div>
      <div className="bg-white/80 p-3 rounded-lg">
        <div className="text-sm text-slate-500">{t('installment.startDate', 'تاريخ البدء')}</div>
        <div className="font-bold text-slate-800">{formatDate(offer.schedule.startDate)}</div>
      </div>
    </div>

    {offer.notes && (
      <p className="text-sm text-slate-600 bg-white/80 p-3 rounded-lg mb-4">{offer.notes}</p>
    )}

    <div className="flex items-center gap-3">
      <button
        onClick={onAccept}
        disabled={processingAction}
        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        data-testid={`button-accept-offer-${offer.id}`}
      >
        <Check size={18} />
        {t('installment.acceptOffer', 'قبول العرض')}
      </button>
      <button
        onClick={onReject}
        disabled={processingAction}
        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        data-testid={`button-reject-offer-${offer.id}`}
      >
        <X size={18} />
        {t('installment.rejectOffer', 'رفض العرض')}
      </button>
    </div>
  </div>
);

interface ContractViewProps {
  offer: InstallmentOffer;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const ContractView = ({ offer, t, isRTL, formatDate, formatCurrency }: ContractViewProps) => {
  const paidInstallments = offer.schedule.installments.filter(i => i.status === 'paid');
  const pendingInstallments = offer.schedule.installments.filter(i => i.status === 'pending');
  const overdueInstallments = offer.schedule.installments.filter(i => i.status === 'overdue');
  
  const totalPaid = paidInstallments.reduce((sum, i) => sum + i.amount, 0);
  const totalRemaining = offer.totalApprovedValue - totalPaid;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-sm text-green-600 mb-1">{t('installment.totalPaid', 'المدفوع')}</div>
          <div className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl">
          <div className="text-sm text-amber-600 mb-1">{t('installment.remaining', 'المتبقي')}</div>
          <div className="text-lg font-bold text-amber-700">{formatCurrency(totalRemaining)}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="text-sm text-blue-600 mb-1">{t('installment.paidInstallments', 'الأقساط المدفوعة')}</div>
          <div className="text-lg font-bold text-blue-700">{paidInstallments.length} / {offer.schedule.numberOfInstallments}</div>
        </div>
        {overdueInstallments.length > 0 && (
          <div className="bg-red-50 p-4 rounded-xl">
            <div className="text-sm text-red-600 mb-1">{t('installment.overdueInstallments', 'أقساط متأخرة')}</div>
            <div className="text-lg font-bold text-red-700">{overdueInstallments.length}</div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                {t('installment.installmentNumber', 'رقم القسط')}
              </th>
              <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                {t('installment.dueDate', 'تاريخ الاستحقاق')}
              </th>
              <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                {t('installment.amount', 'المبلغ')}
              </th>
              <th className={`px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm font-medium text-slate-600`}>
                {t('installment.status', 'الحالة')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {offer.schedule.installments.map((inst, index) => (
              <tr key={inst.id} className={inst.status === 'overdue' ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-sm text-slate-800">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(inst.dueDate)}</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{formatCurrency(inst.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inst.status === 'paid' ? 'bg-green-100 text-green-700' :
                    inst.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {inst.status === 'paid' 
                      ? t('installment.paid', 'مدفوع')
                      : inst.status === 'overdue'
                        ? t('installment.overdue', 'متأخر')
                        : t('installment.pending', 'قيد الانتظار')
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface NewRequestModalProps {
  customerId: string;
  customerName?: string;
  settings: InstallmentSettings;
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
}

const NewRequestModal = ({
  customerId, customerName, settings, products, onClose, onSuccess, t, isRTL, formatCurrency
}: NewRequestModalProps) => {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [useProducts, setUseProducts] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(!settings.requireTermsAcceptance);

  const [form, setForm] = useState({
    totalRequestedValue: 0,
    paymentFrequency: settings.defaultPaymentFrequency || 'monthly' as PaymentFrequency,
    requestedDurationMonths: settings.minDurationMonths,
    downPaymentAmount: 0,
    notes: '',
    items: [] as { productId: string; productName: string; quantity: number; price: number }[]
  });

  const calculateTotalFromItems = () => {
    return form.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = form.items.find(i => i.productId === productId);
    if (existing) {
      setForm(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.productId === productId 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }));
    } else {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price
        }]
      }));
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(i => i.productId !== productId)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const totalValue = useProducts ? calculateTotalFromItems() : form.totalRequestedValue;
    
    if (totalValue < (settings.minRequestAmount || 0)) {
      addToast(t('installment.minAmountError', 'القيمة أقل من الحد الأدنى المسموح'), 'error');
      return;
    }
    
    if (settings.maxRequestAmount && totalValue > settings.maxRequestAmount) {
      addToast(t('installment.maxAmountError', 'القيمة أكبر من الحد الأقصى المسموح'), 'error');
      return;
    }
    
    if (settings.requireDownPayment) {
      const minDown = (totalValue * (settings.minDownPaymentPercent || 10)) / 100;
      if (form.downPaymentAmount < minDown) {
        addToast(t('installment.minDownPaymentError', 'الدفعة المقدمة أقل من الحد الأدنى'), 'error');
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const items: InstallmentRequestItem[] = useProducts 
        ? form.items.map((item, idx) => ({
            id: `ITEM-${Date.now()}-${idx}`,
            requestId: '',
            productId: item.productId,
            productName: item.productName,
            quantityRequested: item.quantity,
            unitPriceRequested: item.price
          }))
        : [];
      
      await MockApi.createInstallmentRequest({
        customerId,
        customerName,
        items,
        totalRequestedValue: totalValue,
        paymentFrequency: form.paymentFrequency,
        requestedDurationMonths: form.requestedDurationMonths,
        downPaymentAmount: form.downPaymentAmount || undefined,
        notes: form.notes || undefined
      });
      
      addToast(t('installment.requestCreated', 'تم تقديم الطلب بنجاح'), 'success');
      onSuccess();
    } catch (error: any) {
      addToast(error.message || t('installment.createError', 'حدث خطأ في تقديم الطلب'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = useProducts ? calculateTotalFromItems() : form.totalRequestedValue;
  const monthlyPayment = form.requestedDurationMonths > 0 
    ? (totalValue - (form.downPaymentAmount || 0)) / form.requestedDurationMonths 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-brand-600" size={24} />
            {t('installment.newRequest', 'طلب تقسيط جديد')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="button-close-new-request">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useProducts}
                onChange={() => setUseProducts(false)}
                className="w-4 h-4 text-brand-600"
                data-testid="radio-total-value"
              />
              <span className="text-sm font-medium text-slate-700">
                {t('installment.enterTotalValue', 'إدخال القيمة الإجمالية')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useProducts}
                onChange={() => setUseProducts(true)}
                className="w-4 h-4 text-brand-600"
                data-testid="radio-select-products"
              />
              <span className="text-sm font-medium text-slate-700">
                {t('installment.selectProducts', 'اختيار منتجات')}
              </span>
            </label>
          </div>

          {!useProducts ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.totalValue', 'القيمة الإجمالية المطلوبة')} *
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
                <input
                  type="number"
                  min={settings.minRequestAmount || 0}
                  max={settings.maxRequestAmount}
                  value={form.totalRequestedValue}
                  onChange={(e) => setForm({ ...form, totalRequestedValue: parseFloat(e.target.value) || 0 })}
                  required
                  className={`w-full border border-slate-200 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} focus:ring-2 focus:ring-brand-500`}
                  placeholder={`${settings.minRequestAmount || 0} - ${settings.maxRequestAmount || '∞'}`}
                  data-testid="input-total-value"
                />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {t('installment.minMax', 'الحد الأدنى')}: {formatCurrency(settings.minRequestAmount || 0)} | {t('installment.max', 'الحد الأقصى')}: {settings.maxRequestAmount ? formatCurrency(settings.maxRequestAmount) : t('installment.unlimited', 'غير محدود')}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.selectProducts', 'اختر المنتجات')}
              </label>
              <select
                onChange={(e) => handleAddProduct(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-3 px-4"
                value=""
                data-testid="select-product"
              >
                <option value="">{t('installment.selectProduct', '-- اختر منتج --')}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                ))}
              </select>
              
              {form.items.length > 0 && (
                <div className="mt-4 space-y-2">
                  {form.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">{item.productName}</div>
                        <div className="text-sm text-slate-500">{formatCurrency(item.price)} × {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-slate-800">{formatCurrency(item.price * item.quantity)}</div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.productId)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          data-testid={`button-remove-product-${item.productId}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                    <span>{t('installment.total', 'الإجمالي')}</span>
                    <span>{formatCurrency(calculateTotalFromItems())}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.paymentFrequency', 'تكرار الدفع')}
              </label>
              <select
                value={form.paymentFrequency}
                onChange={(e) => setForm({ ...form, paymentFrequency: e.target.value as PaymentFrequency })}
                className="w-full border border-slate-200 rounded-lg py-3 px-4"
                data-testid="select-frequency"
              >
                <option value="monthly">{t('installment.monthly', 'شهري')}</option>
                <option value="weekly">{t('installment.weekly', 'أسبوعي')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.duration', 'مدة التقسيط')}
              </label>
              <select
                value={form.requestedDurationMonths}
                onChange={(e) => setForm({ ...form, requestedDurationMonths: parseInt(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg py-3 px-4"
                data-testid="select-duration"
              >
                {Array.from({ length: settings.maxDurationMonths - settings.minDurationMonths + 1 }, (_, i) => settings.minDurationMonths + i).map(months => (
                  <option key={months} value={months}>{months} {t('installment.months', 'شهور')}</option>
                ))}
              </select>
            </div>
          </div>

          {(settings.requireDownPayment || form.downPaymentAmount > 0) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.downPayment', 'الدفعة المقدمة')} {settings.requireDownPayment && '*'}
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
                <input
                  type="number"
                  min={0}
                  value={form.downPaymentAmount}
                  onChange={(e) => setForm({ ...form, downPaymentAmount: parseFloat(e.target.value) || 0 })}
                  required={settings.requireDownPayment}
                  className={`w-full border border-slate-200 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} focus:ring-2 focus:ring-brand-500`}
                  data-testid="input-down-payment"
                />
              </div>
              {settings.requireDownPayment && settings.minDownPaymentPercent && (
                <p className="text-sm text-slate-500 mt-1">
                  {t('installment.minDownPayment', 'الحد الأدنى')}: {settings.minDownPaymentPercent}% ({formatCurrency((totalValue * settings.minDownPaymentPercent) / 100)})
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('installment.notes', 'ملاحظات')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-500"
              placeholder={t('installment.notesPlaceholder', 'أي ملاحظات إضافية...')}
              data-testid="textarea-notes"
            />
          </div>

          {totalValue > 0 && (
            <div className="bg-brand-50 p-4 rounded-xl">
              <h4 className="font-semibold text-brand-800 mb-3">{t('installment.paymentPreview', 'معاينة خطة الدفع')}</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-brand-600">{t('installment.totalValue', 'القيمة الإجمالية')}</div>
                  <div className="font-bold text-brand-800">{formatCurrency(totalValue)}</div>
                </div>
                <div>
                  <div className="text-sm text-brand-600">{t('installment.afterDownPayment', 'بعد الدفعة المقدمة')}</div>
                  <div className="font-bold text-brand-800">{formatCurrency(totalValue - (form.downPaymentAmount || 0))}</div>
                </div>
                <div>
                  <div className="text-sm text-brand-600">{t('installment.estimatedInstallment', 'القسط التقريبي')}</div>
                  <div className="font-bold text-brand-800">{formatCurrency(monthlyPayment)}</div>
                </div>
              </div>
            </div>
          )}

          {settings.requireTermsAcceptance && (
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="max-h-32 overflow-y-auto text-sm text-slate-600 mb-4">
                {isRTL ? settings.termsAndConditionsAr : settings.termsAndConditionsEn}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                  data-testid="checkbox-terms"
                />
                <span className="text-sm font-medium text-slate-700">
                  {t('installment.acceptTerms', 'أوافق على الشروط والأحكام')}
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-cancel-new-request"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={submitting || !acceptedTerms || totalValue <= 0}
              className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-submit-request"
            >
              {submitting ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              {t('installment.submitRequest', 'تقديم الطلب')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerInstallmentPage;
