import { useState, useEffect, ReactNode } from 'react';
import { 
  InstallmentRequest, 
  InstallmentOffer, 
  InstallmentSettings,
  PaymentFrequency
} from '../types';
import Api from '../services/api';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
  CreditCard,
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
  Building2,
  Truck,
  Check,
  Ban,
  Eye,
  Package,
  AlertCircle
} from 'lucide-react';

const STATUS_CONFIGS: Record<string, { labelKey: string; color: string; icon: ReactNode }> = {
  'FORWARDED_TO_SUPPLIERS': { labelKey: 'installment.status.available', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} /> },
  'WAITING_FOR_SUPPLIER_OFFERS': { labelKey: 'installment.status.waiting', color: 'bg-amber-100 text-amber-700', icon: <Clock size={16} /> },
  'SUPPLIER_OFFER_SUBMITTED': { labelKey: 'installment.status.submitted', color: 'bg-blue-100 text-blue-700', icon: <Send size={16} /> },
  'APPROVED_BY_CUSTOMER': { labelKey: 'installment.status.approved', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={16} /> },
  'REJECTED_BY_CUSTOMER': { labelKey: 'installment.status.rejected', color: 'bg-red-100 text-red-700', icon: <XCircle size={16} /> },
  'COMPLETED': { labelKey: 'installment.status.completed', color: 'bg-slate-100 text-slate-700', icon: <CheckCircle size={16} /> },
  'PENDING_APPROVAL': { labelKey: 'installment.status.pending_approval', color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle size={16} /> },
};

interface SupplierInstallmentPageProps {
  supplierId: string;
  supplierName?: string;
}

export const SupplierInstallmentPage = ({ supplierId, supplierName }: SupplierInstallmentPageProps) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<InstallmentSettings | null>(null);
  const [requests, setRequests] = useState<InstallmentRequest[]>([]);
  const [myOffers, setMyOffers] = useState<InstallmentOffer[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<InstallmentRequest | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'my-offers'>('requests');

  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const getStatusInfo = (status: string) => {
    const config = STATUS_CONFIGS[status] || { labelKey: 'installment.status.unknown', color: 'bg-slate-100 text-slate-700', icon: <Clock size={16} /> };
    return {
      label: t(config.labelKey),
      className: `flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`,
      icon: config.icon
    };
  };

  useEffect(() => {
    loadData();
  }, [supplierId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, requestsData, offersData] = await Promise.all([
        Api.getInstallmentSettings(),
        Api.getInstallmentRequestsForSupplier(supplierId),
        Api.getInstallmentOffers()
      ]);
      setSettings(settingsData);
      setRequests(requestsData);
      setMyOffers(offersData.filter(o => o.supplierId === supplierId));
    } catch (error) {
      addToast(t('installment.loadError', 'حدث خطأ في تحميل البيانات'), 'error');
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

  const hasSubmittedOffer = (requestId: string) => {
    return myOffers.some(o => o.requestId === requestId);
  };

  const getMyOfferForRequest = (requestId: string) => {
    return myOffers.find(o => o.requestId === requestId);
  };

  const availableRequests = requests.filter(r => 
    ['FORWARDED_TO_SUPPLIERS', 'WAITING_FOR_SUPPLIER_OFFERS'].includes(r.status) && 
    !hasSubmittedOffer(r.id)
  );
  const requestsWithMyOffers = requests.filter(r => hasSubmittedOffer(r.id));

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
          {t('installment.disabled', 'نظام التقسيط غير متاح حالياً')}
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Truck className="text-brand-600" size={28} />
            {t('installment.supplierTitle', 'طلبات التقسيط للموردين')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('installment.supplierSubtitle', 'عرض وتقديم عروض على طلبات التقسيط')}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500">{t('installment.availableRequests', 'طلبات متاحة')}</div>
              <div className="text-xl font-bold text-slate-800">{availableRequests.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500">{t('installment.submittedOffers', 'عروض مقدمة')}</div>
              <div className="text-xl font-bold text-slate-800">{myOffers.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="text-amber-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500">{t('installment.pendingDecisions', 'بانتظار القرار')}</div>
              <div className="text-xl font-bold text-slate-800">
                {myOffers.filter(o => o.status === 'SUPPLIER_OFFER_SUBMITTED').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t('installment.availableRequests', 'طلبات متاحة')} ({availableRequests.length})
            {activeTab === 'requests' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('my-offers')}
            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'my-offers' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t('installment.myOffers', 'عروضي')} ({requestsWithMyOffers.length})
            {activeTab === 'my-offers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full" />
            )}
          </button>
        </div>

        {activeTab === 'requests' && (
          availableRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="mx-auto mb-4 text-slate-300" size={48} />
              <p>{t('installment.noAvailableRequests', 'لا توجد طلبات متاحة حالياً')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {availableRequests.map(request => {
                const statusInfo = getStatusInfo(request.status);
                
                return (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-500">#{request.id.slice(-8)}</span>
                          <span className={statusInfo.className}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="font-medium text-slate-800">
                          {request.customerName || t('installment.anonymousCustomer', 'عميل')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-brand-600">
                          {formatCurrency(request.totalRequestedValue || 0)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {request.requestedDurationMonths} {t('installment.months', 'شهور')}
                        </div>
                      </div>
                    </div>

                    {request.items.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {request.items.slice(0, 3).map(item => (
                          <span key={item.id} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-sm text-slate-600">
                            <Package size={14} />
                            {item.productName || item.productId}
                          </span>
                        ))}
                        {request.items.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-500">
                            +{request.items.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        <Calendar size={14} className="inline mr-1" />
                        {formatDate(request.createdAt)}
                      </div>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                        data-testid={`button-submit-offer-${request.id}`}
                      >
                        <Send size={14} />
                        {t('installment.submitOffer', 'تقديم عرض')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'my-offers' && (
          requestsWithMyOffers.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="mx-auto mb-4 text-slate-300" size={48} />
              <p>{t('installment.noSubmittedOffers', 'لم تقدم أي عروض بعد')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requestsWithMyOffers.map(request => {
                const myOffer = getMyOfferForRequest(request.id);
                if (!myOffer) return null;
                
                const offerStatusInfo = getStatusInfo(myOffer.status);
                
                return (
                  <div key={request.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-500">#{request.id.slice(-8)}</span>
                          <span className={offerStatusInfo.className}>
                            {offerStatusInfo.icon}
                            {offerStatusInfo.label}
                          </span>
                        </div>
                        <div className="font-medium text-slate-800">
                          {request.customerName || t('installment.anonymousCustomer', 'عميل')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">{t('installment.myOffer', 'عرضي')}</div>
                        <div className="text-lg font-bold text-brand-600">
                          {formatCurrency(myOffer.totalApprovedValue)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>
                        {myOffer.schedule.numberOfInstallments} {t('installment.installments', 'قسط')}
                      </span>
                      <span>
                        {formatCurrency(myOffer.schedule.installmentAmount)} / {t('installment.perInstallment', 'للقسط')}
                      </span>
                      <span>
                        {myOffer.type === 'full' ? t('installment.fullApproval', 'موافقة كاملة') : t('installment.partialApproval', 'موافقة جزئية')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {selectedRequest && settings && (
        <SubmitOfferModal
          request={selectedRequest}
          settings={settings}
          supplierId={supplierId}
          supplierName={supplierName}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
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

interface SubmitOfferModalProps {
  request: InstallmentRequest;
  settings: InstallmentSettings;
  supplierId: string;
  supplierName?: string;
  onClose: () => void;
  onSuccess: () => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
}

const SubmitOfferModal = ({
  request, settings, supplierId, supplierName, onClose, onSuccess, t, isRTL, formatCurrency
}: SubmitOfferModalProps) => {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [offerType, setOfferType] = useState<'full' | 'partial'>('full');
  const [form, setForm] = useState({
    totalApprovedValue: request.totalRequestedValue || 0,
    numberOfInstallments: request.requestedDurationMonths || 3,
    frequency: request.paymentFrequency || 'monthly' as PaymentFrequency,
    notes: ''
  });

  const handleSubmit = async () => {
    if (form.totalApprovedValue <= 0) {
      addToast(t('installment.invalidAmount', 'المبلغ غير صحيح'), 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await Api.supplierSubmitOffer(
        request.id,
        supplierId,
        supplierName || 'مورد',
        {
          type: offerType,
          itemsApproved: [],
          totalApprovedValue: form.totalApprovedValue,
          frequency: form.frequency,
          numberOfInstallments: form.numberOfInstallments,
          notes: form.notes
        }
      );
      
      addToast(t('installment.offerSubmitted', 'تم تقديم العرض بنجاح'), 'success');
      onSuccess();
    } catch (error: any) {
      addToast(error.message || t('installment.offerError', 'حدث خطأ في تقديم العرض'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const installmentAmount = form.numberOfInstallments > 0 
    ? form.totalApprovedValue / form.numberOfInstallments 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="text-brand-600" size={24} />
            {t('installment.submitOffer', 'تقديم عرض')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="button-close-offer-modal">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">{t('installment.requestedValue', 'القيمة المطلوبة')}</span>
              <span className="font-bold text-slate-800">{formatCurrency(request.totalRequestedValue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('installment.requestedDuration', 'المدة المطلوبة')}</span>
              <span className="font-medium text-slate-800">{request.requestedDurationMonths} {t('installment.months', 'شهور')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setOfferType('full');
                setForm(prev => ({ ...prev, totalApprovedValue: request.totalRequestedValue || 0 }));
              }}
              className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                offerType === 'full' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-200 hover:border-green-300'
              }`}
              data-testid="button-offer-full"
            >
              <CheckCircle className={`mx-auto mb-2 ${offerType === 'full' ? 'text-green-600' : 'text-slate-400'}`} size={24} />
              <div className="font-medium text-slate-800">{t('installment.fullOffer', 'عرض كامل')}</div>
            </button>
            
            {settings.allowPartialApprovalBySuppliers && (
              <button
                onClick={() => setOfferType('partial')}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  offerType === 'partial' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-slate-200 hover:border-amber-300'
                }`}
                data-testid="button-offer-partial"
              >
                <AlertTriangle className={`mx-auto mb-2 ${offerType === 'partial' ? 'text-amber-600' : 'text-slate-400'}`} size={24} />
                <div className="font-medium text-slate-800">{t('installment.partialOffer', 'عرض جزئي')}</div>
              </button>
            )}
          </div>

          {offerType === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.offerAmount', 'قيمة العرض')}
              </label>
              <input
                type="number"
                min={1}
                max={request.totalRequestedValue}
                value={form.totalApprovedValue}
                onChange={(e) => setForm({ ...form, totalApprovedValue: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-500"
                data-testid="input-offer-amount"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.numberOfInstallments', 'عدد الأقساط')}
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.numberOfInstallments}
                onChange={(e) => setForm({ ...form, numberOfInstallments: parseInt(e.target.value) || 1 })}
                className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-500"
                data-testid="input-installments"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('installment.frequency', 'التكرار')}
              </label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as PaymentFrequency })}
                className="w-full border border-slate-200 rounded-lg py-3 px-4"
                data-testid="select-frequency"
              >
                <option value="monthly">{t('installment.monthly', 'شهري')}</option>
                <option value="weekly">{t('installment.weekly', 'أسبوعي')}</option>
              </select>
            </div>
          </div>

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
              data-testid="textarea-offer-notes"
            />
          </div>

          <div className="bg-brand-50 p-4 rounded-xl">
            <h4 className="font-semibold text-brand-800 mb-3">{t('installment.offerSummary', 'ملخص العرض')}</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-brand-600">{t('installment.totalValue', 'القيمة الإجمالية')}</div>
                <div className="font-bold text-brand-800">{formatCurrency(form.totalApprovedValue)}</div>
              </div>
              <div>
                <div className="text-sm text-brand-600">{t('installment.installmentAmount', 'قيمة القسط')}</div>
                <div className="font-bold text-brand-800">{formatCurrency(installmentAmount)}</div>
              </div>
              <div>
                <div className="text-sm text-brand-600">{t('installment.numberOfInstallments', 'عدد الأقساط')}</div>
                <div className="font-bold text-brand-800">{form.numberOfInstallments}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-cancel-offer"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || form.totalApprovedValue <= 0}
              className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-confirm-offer"
            >
              {submitting ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              {t('installment.submitOffer', 'تقديم العرض')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInstallmentPage;
