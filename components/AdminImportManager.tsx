
import React, { useState, useMemo } from 'react';
import { ImportRequest, ImportRequestStatus, ImportRequestTimelineEntry } from '../types';
import { MockApi } from '../services/mockApi';
import { 
    Globe, Clock, CheckCircle, Ship, Archive, FileText, 
    Upload, Save, X, ChevronRight, ChevronLeft, MapPin, 
    AlertCircle, Truck, DollarSign, Calendar
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';

interface AdminImportManagerProps {
    requests: ImportRequest[];
    onUpdate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    'NEW': 'طلب جديد',
    'UNDER_REVIEW': 'قيد المراجعة',
    'WAITING_CUSTOMER_EXCEL': 'بانتظار ملف العميل',
    'PRICING_IN_PROGRESS': 'جاري التسعير',
    'PRICING_SENT': 'تم إرسال العرض',
    'WAITING_CUSTOMER_APPROVAL': 'بانتظار الموافقة',
    'APPROVED_BY_CUSTOMER': 'تمت موافقة العميل',
    'IN_FACTORY': 'في المصنع',
    'SHIPMENT_BOOKED': 'تم حجز الشحن',
    'ON_THE_SEA': 'في البحر',
    'IN_PORT': 'وصل الميناء',
    'CUSTOMS_CLEARED': 'تم التخليص',
    'ON_THE_WAY': 'في الطريق',
    'DELIVERED': 'تم التسليم',
    'CANCELLED': 'ملغي'
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
    const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Pricing Form
    const [pricingForm, setPricingForm] = useState({ totalAmount: 0, note: '' });

    const { addToast } = useToast();

    // Sort requests by date desc
    const sortedRequests = useMemo(() => {
        return [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [requests]);

    // Handlers
    const handleStatusUpdate = async (newStatus: ImportRequestStatus, note?: string) => {
        if (!selectedRequest) return;
        setIsUpdating(true);
        try {
            await MockApi.updateImportRequestStatus(selectedRequest.id, newStatus, {
                note: note || '',
                changedBy: 'Admin',
                actorRole: 'ADMIN'
            });
            addToast('تم تحديث الحالة بنجاح', 'success');
            onUpdate();
            setSelectedRequest(null);
        } catch (e) {
            addToast('فشل التحديث', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendPricing = async () => {
        if (!selectedRequest || pricingForm.totalAmount <= 0) {
            addToast('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }
        setIsUpdating(true);
        try {
            await MockApi.completeImportRequestPricing(selectedRequest.id, {
                totalAmount: pricingForm.totalAmount,
                pricingFileName: 'Price_Offer.pdf', // Mock file
                adminName: 'Admin'
            });
            addToast('تم إرسال عرض السعر للعميل', 'success');
            onUpdate();
            setSelectedRequest(null);
        } catch (e) {
            addToast('فشل الإرسال', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">طلبات جديدة</p>
                    <p className="text-2xl font-black text-blue-600">{requests.filter(r => r.status === 'NEW').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">قيد التنفيذ</p>
                    <p className="text-2xl font-black text-yellow-600">
                        {requests.filter(r => ['IN_FACTORY', 'SHIPMENT_BOOKED', 'ON_THE_SEA'].includes(r.status)).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">بانتظار العميل</p>
                    <p className="text-2xl font-black text-purple-600">
                        {requests.filter(r => ['WAITING_CUSTOMER_EXCEL', 'PRICING_SENT', 'WAITING_CUSTOMER_APPROVAL'].includes(r.status)).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">مكتملة</p>
                    <p className="text-2xl font-black text-green-600">{requests.filter(r => r.status === 'DELIVERED').length}</p>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">رقم الطلب</th>
                            <th className="p-4">العميل</th>
                            <th className="p-4">الخدمة</th>
                            <th className="p-4">تاريخ الطلب</th>
                            <th className="p-4 text-center">الحالة</th>
                            <th className="p-4 text-center">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-brand-700">{req.id}</td>
                                <td className="p-4 font-bold text-slate-800">{req.businessName}</td>
                                <td className="p-4 text-slate-600">{req.serviceMode === 'FULL_SERVICE' ? 'شامل' : 'تجهيز فقط'}</td>
                                <td className="p-4 text-slate-500 text-xs" dir="ltr">{formatDateTime(req.createdAt)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABELS[req.status] || req.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => setSelectedRequest(req)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        إدارة الطلب
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sortedRequests.length === 0 && (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-400">لا توجد طلبات استيراد</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title={`إدارة طلب الاستيراد #${selectedRequest?.id}`}
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
                                        <p className="text-xs font-bold uppercase opacity-70">الحالة الحالية</p>
                                        <p className="text-lg font-black">{STATUS_LABELS[selectedRequest.status] || selectedRequest.status}</p>
                                    </div>
                                </div>
                                {/* Quick Actions based on status */}
                                {selectedRequest.status === 'NEW' && (
                                    <button 
                                        onClick={() => handleStatusUpdate('UNDER_REVIEW')}
                                        className="bg-white text-slate-800 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                                    >
                                        بدء المراجعة
                                    </button>
                                )}
                                {selectedRequest.status === 'UNDER_REVIEW' && (
                                    <button 
                                        onClick={() => handleStatusUpdate('WAITING_CUSTOMER_EXCEL')}
                                        className="bg-white text-slate-800 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                                    >
                                        طلب ملف الأصناف
                                    </button>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Globe size={18}/> سجل الأحداث (Timeline)</h4>
                                <div className="space-y-6 relative before:absolute before:right-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {(selectedRequest.timeline || []).slice().reverse().map((entry, idx) => (
                                        <div key={idx} className="relative pr-10">
                                            <div className={`absolute right-3 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${entry.actorRole === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{STATUS_LABELS[entry.status] || entry.status}</p>
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
                                    <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2"><DollarSign size={18}/> إعداد عرض السعر</h4>
                                    
                                    {selectedRequest.customerExcelFileName ? (
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-purple-200 mb-4">
                                            <FileText className="text-green-600"/>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">ملف العميل: {selectedRequest.customerExcelFileName}</p>
                                                <p className="text-xs text-slate-400">{formatDateTime(selectedRequest.customerExcelUploadedAt)}</p>
                                            </div>
                                            <button className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded font-bold">تحميل</button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-purple-600 mb-4 italic">بانتظار رفع ملف الأصناف من العميل...</p>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-purple-700 mb-1">إجمالي العرض (ر.س)</label>
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
                                                إرسال العرض للعميل
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
                                <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">تفاصيل الطلب</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">الماركات المطلوبة</span>
                                        <span className="font-bold text-slate-700">{selectedRequest.targetCarBrands.join(', ')}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">نوع الخدمة</span>
                                        <span className="font-bold text-brand-600">{selectedRequest.serviceMode === 'FULL_SERVICE' ? 'استيراد شامل' : 'تجهيز بضاعة'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">عدد الفروع</span>
                                        <span className="font-bold text-slate-700">{selectedRequest.branchesCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs block uppercase">قيمة تقديرية</span>
                                        <span className="font-bold text-slate-700">{selectedRequest.estimatedAnnualValue || '-'}</span>
                                    </div>
                                    {selectedRequest.notes && (
                                        <div className="bg-white p-3 rounded border border-slate-100 mt-2">
                                            <span className="text-xs text-slate-400 block mb-1">ملاحظات العميل:</span>
                                            <p className="text-slate-600">{selectedRequest.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Manual Status Control */}
                            <div className="bg-[#0B1B3A] p-5 rounded-2xl text-white shadow-lg">
                                <h4 className="font-bold text-[#C8A04F] mb-4 flex items-center gap-2"><Save size={18}/> تحديث الحالة (يدوي)</h4>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm mb-4 text-white"
                                    value={selectedRequest.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value as ImportRequestStatus)}
                                    disabled={isUpdating}
                                >
                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mb-2">استخدم هذا الخيار للتقدم في مراحل الشحن (المصنع، البحر، الميناء...)</p>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <button 
                                    onClick={() => handleStatusUpdate('CANCELLED')}
                                    className="w-full text-red-600 font-bold text-sm py-2 hover:bg-red-100 rounded transition-colors"
                                >
                                    إلغاء الطلب
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
