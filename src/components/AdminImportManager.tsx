
import React, { useState, useMemo } from 'react';
import { ImportRequest, ImportRequestStatus, ImportRequestTimelineEntry } from '../types';
import Api from '../services/api';
import { 
    Globe, Clock, CheckCircle, Ship, Archive, FileText, 
    Upload, Save, X, ChevronRight, ChevronLeft, MapPin, 
    AlertCircle, Truck, DollarSign, Calendar
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

interface AdminImportManagerProps {
    requests: ImportRequest[];
    onUpdate: () => void;
}

const STATUS_KEYS: Record<string, string> = {
    'NEW': 'new',
    'UNDER_REVIEW': 'underReview',
    'WAITING_CUSTOMER_EXCEL': 'waitingCustomerExcel',
    'PRICING_IN_PROGRESS': 'pricingInProgress',
    'PRICING_SENT': 'pricingSent',
    'WAITING_CUSTOMER_APPROVAL': 'waitingCustomerApproval',
    'APPROVED_BY_CUSTOMER': 'approvedByCustomer',
    'IN_FACTORY': 'inFactory',
    'SHIPMENT_BOOKED': 'shipmentBooked',
    'ON_THE_SEA': 'onTheSea',
    'IN_PORT': 'inPort',
    'CUSTOMS_CLEARED': 'customsCleared',
    'ON_THE_WAY': 'onTheWay',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled'
};

const STATUS_COLORS: Record<string, string> = {
    'NEW': 'bg-blue-100 text-blue-700',
    'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700',
    'APPROVED_BY_CUSTOMER': 'bg-green-100 text-green-700',
    'ON_THE_SEA': 'bg-cyan-100 text-cyan-700',
    'DELIVERED': 'bg-emerald-100 text-emerald-700',
    'CANCELLED': 'bg-red-100 text-red-700',
    'PRICING_SENT': 'bg-purple-100 text-purple-700'
};

export const AdminImportManager: React.FC<AdminImportManagerProps> = ({ requests, onUpdate }) => {
    const { t } = useTranslation();
    const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Pricing Form
    const [pricingForm, setPricingForm] = useState({ totalAmount: 0, note: '' });

    const { addToast } = useToast();
    
    const getStatusLabel = (status: string): string => {
        const key = STATUS_KEYS[status];
        return key ? t(`adminImport.status.${key}`) : status;
    };

    // Sort requests by date desc
    const safeRequests = Array.isArray(requests) ? requests : [];
    const sortedRequests = useMemo(() => {
        return [...safeRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [safeRequests]);

    // Handlers
    const handleStatusUpdate = async (newStatus: ImportRequestStatus, note?: string) => {
        if (!selectedRequest) return;
        setIsUpdating(true);
        try {
            await Api.updateImportRequestStatus(selectedRequest.id, newStatus, {
                note: note || '',
                changedBy: 'Admin',
                actorRole: 'ADMIN'
            });
            addToast(t('adminImport.toast.statusUpdated'), 'success');
            onUpdate();
            setSelectedRequest(null);
        } catch (e) {
            addToast(t('adminImport.toast.updateFailed'), 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendPricing = async () => {
        if (!selectedRequest || pricingForm.totalAmount <= 0) {
            addToast(t('adminImport.toast.enterValidAmount'), 'error');
            return;
        }
        setIsUpdating(true);
        try {
            await Api.completeImportRequestPricing(selectedRequest.id, {
                totalAmount: pricingForm.totalAmount,
                pricingFileName: 'Price_Offer.pdf', // Mock file
                adminName: 'Admin'
            });
            addToast(t('adminImport.toast.pricingSent'), 'success');
            onUpdate();
            setSelectedRequest(null);
        } catch (e) {
            addToast(t('adminImport.toast.sendFailed'), 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('adminImport.stats.newRequests')}</p>
                    <p className="text-2xl font-black text-blue-600">{safeRequests.filter(r => r.status === 'NEW').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('adminImport.stats.inProgress')}</p>
                    <p className="text-2xl font-black text-yellow-600">
                        {safeRequests.filter(r => ['IN_FACTORY', 'SHIPMENT_BOOKED', 'ON_THE_SEA'].includes(r.status)).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('adminImport.stats.awaitingCustomer')}</p>
                    <p className="text-2xl font-black text-purple-600">
                        {safeRequests.filter(r => ['WAITING_CUSTOMER_EXCEL', 'PRICING_SENT', 'WAITING_CUSTOMER_APPROVAL'].includes(r.status)).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('adminImport.stats.completed')}</p>
                    <p className="text-2xl font-black text-green-600">{safeRequests.filter(r => r.status === 'DELIVERED').length}</p>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">{t('adminImport.table.requestNumber')}</th>
                            <th className="p-4">{t('adminImport.table.customer')}</th>
                            <th className="p-4">{t('adminImport.table.service')}</th>
                            <th className="p-4">{t('adminImport.table.requestDate')}</th>
                            <th className="p-4 text-center">{t('adminImport.table.status')}</th>
                            <th className="p-4 text-center">{t('adminImport.table.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-brand-700">{req.id}</td>
                                <td className="p-4 font-bold text-slate-800">{req.businessName}</td>
                                <td className="p-4 text-slate-600">{req.serviceMode === 'FULL_SERVICE' ? t('adminImport.serviceType.fullService') : t('adminImport.serviceType.processingOnly')}</td>
                                <td className="p-4 text-slate-500 text-xs" dir="ltr">{formatDateTime(req.createdAt)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {getStatusLabel(req.status)}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => setSelectedRequest(req)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        {t('adminImport.actions.manageRequest')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sortedRequests.length === 0 && (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-400">{t('adminImport.noRequests')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title={`${t('adminImport.modal.manageRequest')} #${selectedRequest?.id}`}
                maxWidth="max-w-5xl"
            >
                {selectedRequest && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left: Timeline & Status */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Current Status Banner */}
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${STATUS_COLORS[selectedRequest.status] || 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/50 rounded-lg"><Clock size={20}/></div>
                                    <div>
                                        <p className="text-xs font-bold uppercase opacity-70">{t('adminImport.modal.currentStatus')}</p>
                                        <p className="text-lg font-black">{getStatusLabel(selectedRequest.status)}</p>
                                    </div>
                                </div>
                                {/* Quick Actions based on status */}
                                {selectedRequest.status === 'NEW' && (
                                    <button 
                                        onClick={() => handleStatusUpdate('UNDER_REVIEW')}
                                        className="bg-white text-slate-800 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                                    >
                                        {t('adminImport.actions.startReview')}
                                    </button>
                                )}
                                {selectedRequest.status === 'UNDER_REVIEW' && (
                                    <button 
                                        onClick={() => handleStatusUpdate('WAITING_CUSTOMER_EXCEL')}
                                        className="bg-white text-slate-800 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                                    >
                                        {t('adminImport.actions.requestItemsFile')}
                                    </button>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Globe size={18}/> {t('adminImport.modal.timeline')}</h4>
                                <div className="space-y-6 relative before:absolute before:right-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {(selectedRequest.timeline || []).slice().reverse().map((entry, idx) => (
                                        <div key={idx} className="relative pr-10">
                                            <div className={`absolute right-3 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${entry.actorRole === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{getStatusLabel(entry.status)}</p>
                                                    {entry.note && <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 inline-block">{entry.note}</p>}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] text-slate-400 font-mono">{formatDateTime(entry.changedAt)}</p>
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase">{entry.changedBy}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing Section (Shows if waiting for pricing) */}
                            {(selectedRequest.status === 'WAITING_CUSTOMER_EXCEL' || selectedRequest.status === 'PRICING_IN_PROGRESS') && (
                                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                    <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2"><DollarSign size={18}/> {t('adminImport.pricing.preparePricing')}</h4>
                                    
                                    {selectedRequest.customerExcelFileName ? (
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-purple-200 mb-4">
                                            <FileText className="text-green-600"/>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">{t('adminImport.pricing.customerFile')}: {selectedRequest.customerExcelFileName}</p>
                                                <p className="text-xs text-slate-400">{formatDateTime(selectedRequest.customerExcelUploadedAt)}</p>
                                            </div>
                                            <button className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded font-bold">{t('adminImport.pricing.download')}</button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-purple-600 mb-4 italic">{t('adminImport.pricing.waitingForFile')}</p>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-purple-700 mb-1">{t('adminImport.pricing.totalOffer')}</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-2 rounded-lg border border-purple-200"
                                                value={pricingForm.totalAmount}
                                                onChange={e => setPricingForm({...pricingForm, totalAmount: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                onClick={handleSendPricing}
                                                disabled={isUpdating}
                                                className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {t('adminImport.pricing.sendToCustomer')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Info & Controls */}
                        <div className="space-y-6">
                            
                            {/* Request Details */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">{t('adminImport.details.title')}</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">{t('adminImport.details.requestedBrands')}</span>
                                        <span className="font-bold text-slate-700">{selectedRequest.targetCarBrands.join(', ')}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">{t('adminImport.details.serviceType')}</span>
                                        <span className="font-bold text-brand-600">{selectedRequest.serviceMode === 'FULL_SERVICE' ? t('adminImport.serviceType.fullImport') : t('adminImport.serviceType.goodsPreparation')}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">{t('adminImport.details.branchesCount')}</span>
                                        <span className="font-bold text-slate-700">{selectedRequest.branchesCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">{t('adminImport.details.estimatedValue')}</span>
                                        <span className="font-bold text-slate-700">{selectedRequest.estimatedAnnualValue || '-'}</span>
                                    </div>
                                    {selectedRequest.notes && (
                                        <div className="bg-white p-3 rounded border border-slate-100 mt-2">
                                            <span className="text-xs text-slate-400 block mb-1">{t('adminImport.details.customerNotes')}:</span>
                                            <p className="text-slate-600">{selectedRequest.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Manual Status Control */}
                            <div className="bg-[#0B1B3A] p-5 rounded-2xl text-white shadow-lg">
                                <h4 className="font-bold text-[#C8A04F] mb-4 flex items-center gap-2"><Save size={18}/> {t('adminImport.statusControl.title')}</h4>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm mb-4 text-white"
                                    value={selectedRequest.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value as ImportRequestStatus)}
                                    disabled={isUpdating}
                                >
                                    {Object.keys(STATUS_KEYS).map(key => (
                                        <option key={key} value={key}>{getStatusLabel(key)}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mb-2">{t('adminImport.statusControl.hint')}</p>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <button 
                                    onClick={() => handleStatusUpdate('CANCELLED')}
                                    className="w-full text-red-600 font-bold text-sm py-2 hover:bg-red-100 rounded transition-colors"
                                >
                                    {t('adminImport.actions.cancelRequest')}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
