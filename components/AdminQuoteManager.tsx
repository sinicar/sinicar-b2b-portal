import React, { useState, useMemo } from 'react';
import { QuoteRequest, QuoteItem, QuoteRequestStatus } from '../types';
import { MockApi } from '../services/mockApi';
import { 
    Search, Filter, CheckCircle, XCircle, Clock, Eye, 
    MoreHorizontal, FileText, Download, CheckSquare, 
    Square, Save, X, Layers, AlertCircle
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { formatDateTime } from '../utils/dateUtils';

interface AdminQuoteManagerProps {
    quotes: QuoteRequest[];
    onUpdate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    'NEW': 'جديد',
    'UNDER_REVIEW': 'قيد المراجعة',
    'PARTIALLY_APPROVED': 'معتمد جزئياً',
    'APPROVED': 'معتمد بالكامل',
    'QUOTED': 'تم التسعير',
    'PROCESSED': 'تمت المعالجة',
    'REJECTED': 'مرفوض'
};

const STATUS_COLORS: Record<string, string> = {
    'NEW': 'bg-blue-100 text-blue-700',
    'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700',
    'PARTIALLY_APPROVED': 'bg-purple-100 text-purple-700',
    'APPROVED': 'bg-green-100 text-green-700',
    'QUOTED': 'bg-green-100 text-green-700',
    'PROCESSED': 'bg-green-100 text-green-700',
    'REJECTED': 'bg-red-100 text-red-700'
};

export const AdminQuoteManager: React.FC<AdminQuoteManagerProps> = ({ quotes, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Working State for selected quote
    const [localItems, setLocalItems] = useState<QuoteItem[]>([]);
    const [selectedItemIndices, setSelectedItemIndices] = useState<Set<number>>(new Set());
    const [generalNote, setGeneralNote] = useState('');

    const { addToast } = useToast();

    // Filtering
    const filteredQuotes = useMemo(() => {
        let res = [...quotes];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(q => 
                q.id.toLowerCase().includes(lower) || 
                q.companyName.toLowerCase().includes(lower) || 
                q.userName.toLowerCase().includes(lower)
            );
        }
        if (statusFilter !== 'ALL') {
            res = res.filter(q => q.status === statusFilter);
        }
        return res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [quotes, searchTerm, statusFilter]);

    // --- Handlers ---

    const openQuote = (quote: QuoteRequest) => {
        setSelectedQuote(quote);
        setLocalItems(JSON.parse(JSON.stringify(quote.items))); // Deep copy
        setGeneralNote(quote.adminGeneralNote || '');
        setSelectedItemIndices(new Set());
    };

    const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...localItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setLocalItems(newItems);
    };

    const toggleSelection = (index: number) => {
        const newSet = new Set(selectedItemIndices);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setSelectedItemIndices(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedItemIndices.size === localItems.length) {
            setSelectedItemIndices(new Set());
        } else {
            setSelectedItemIndices(new Set(localItems.map((_, i) => i)));
        }
    };

    const bulkUpdateStatus = (status: 'APPROVED' | 'MISSING' | 'REJECTED') => {
        const newItems = [...localItems];
        selectedItemIndices.forEach(idx => {
            newItems[idx].approvalStatus = status;
            // Reset fields if changing status logic
            if (status === 'MISSING' || status === 'REJECTED') {
                newItems[idx].matchedPrice = undefined;
            }
        });
        setLocalItems(newItems);
        addToast(`تم تحديث ${selectedItemIndices.size} صنف`, 'info');
    };

    const handleFinalize = async () => {
        if (!selectedQuote) return;
        
        // Basic validation
        const hasApprovedWithoutPrice = localItems.some(i => i.approvalStatus === 'APPROVED' && (!i.matchedPrice || i.matchedPrice <= 0));
        if (hasApprovedWithoutPrice) {
            if (!confirm('تنبيه: يوجد أصناف معتمدة (Approved) بدون سعر. هل أنت متأكد من المتابعة؟')) return;
        }

        setIsSaving(true);
        try {
            // Update items in the quote object
            const updatedQuote = {
                ...selectedQuote,
                items: localItems
            };
            
            // Save updates first
            await MockApi.updateQuoteRequest(updatedQuote);
            
            // Finalize
            await MockApi.finalizeQuoteRequest(selectedQuote.id, 'Admin', generalNote);
            
            addToast('تم اعتماد التسعير وإرسال النتيجة للعميل', 'success');
            onUpdate();
            setSelectedQuote(null);
        } catch (e) {
            addToast('حدث خطأ أثناء الحفظ', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const approvedCount = localItems.filter(i => i.approvalStatus === 'APPROVED').length;
    const missingCount = localItems.filter(i => i.approvalStatus === 'MISSING').length;
    const totalPotential = localItems.reduce((sum, item) => sum + ((item.matchedPrice || 0) * item.requestedQty), 0);

    return (
        <div className="space-y-6 animate-fade-in relative">
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="بحث برقم الطلب، العميل..." 
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none w-full md:w-auto"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">جميع الحالات</option>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">رقم الطلب</th>
                            <th className="p-4">المنشأة / العميل</th>
                            <th className="p-4">تاريخ الرفع</th>
                            <th className="p-4 text-center">عدد الأصناف</th>
                            <th className="p-4 text-center">نوع السعر</th>
                            <th className="p-4 text-center">الحالة</th>
                            <th className="p-4 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredQuotes.map(quote => (
                            <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#C8A04F]">{quote.id}</td>
                                <td className="p-4">
                                    <p className="font-bold text-slate-800">{quote.companyName}</p>
                                    <p className="text-xs text-slate-500">{quote.userName}</p>
                                </td>
                                <td className="p-4 text-slate-500 text-xs" dir="ltr">{formatDateTime(quote.date)}</td>
                                <td className="p-4 text-center font-bold">{quote.items.length}</td>
                                <td className="p-4 text-center">
                                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">{quote.priceType}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABELS[quote.status] || quote.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => openQuote(quote)}
                                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
                                    >
                                        مراجعة / تفاصيل
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredQuotes.length === 0 && (
                            <tr><td colSpan={7} className="p-10 text-center text-slate-400">لا توجد طلبات</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- WORKSPACE SLIDEOVER --- */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedQuote(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                <X size={24} />
                            </button>
                            <div>
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    مراجعة الطلب <span className="font-mono text-[#C8A04F] bg-[#0B1B3A] px-2 py-0.5 rounded text-base">{selectedQuote.id}</span>
                                </h2>
                                <p className="text-xs text-slate-500 font-bold">{selectedQuote.companyName} • {selectedQuote.priceType}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="text-center px-4 border-l border-slate-200">
                                <p className="text-xs font-bold text-slate-400">إجمالي المقترح</p>
                                <p className="text-lg font-black text-slate-800">{totalPotential.toLocaleString()} ر.س</p>
                            </div>
                            <button 
                                onClick={handleFinalize}
                                disabled={isSaving}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} /> {isSaving ? 'جاري الاعتماد...' : 'اعتماد وإرسال للعميل'}
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex gap-3 items-center overflow-x-auto shrink-0">
                        <div className="flex items-center gap-2 px-2 border-l border-slate-300 ml-2">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300"
                                checked={selectedItemIndices.size === localItems.length && localItems.length > 0}
                                onChange={toggleSelectAll}
                            />
                            <span className="text-sm font-bold text-slate-600">تحديد الكل</span>
                        </div>
                        
                        <span className="text-xs font-bold text-slate-400 mx-2">تغيير حالة المحدد ({selectedItemIndices.size}):</span>
                        
                        <button onClick={() => bulkUpdateStatus('APPROVED')} disabled={selectedItemIndices.size === 0} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 disabled:opacity-50">
                            متوفر (Approved)
                        </button>
                        <button onClick={() => bulkUpdateStatus('MISSING')} disabled={selectedItemIndices.size === 0} className="px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100 disabled:opacity-50">
                            غير متوفر (Missing)
                        </button>
                        <button onClick={() => bulkUpdateStatus('REJECTED')} disabled={selectedItemIndices.size === 0} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50">
                            مرفوض (Rejected)
                        </button>
                    </div>

                    {/* Content Table */}
                    <div className="flex-1 overflow-auto p-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-3 w-10"></th>
                                        <th className="p-3">رقم القطعة (العميل)</th>
                                        <th className="p-3">اسم القطعة (العميل)</th>
                                        <th className="p-3 w-20 text-center">الكمية</th>
                                        <th className="p-3 w-40">المطابقة (اسم المنتج)</th>
                                        <th className="p-3 w-32 text-center">السعر</th>
                                        <th className="p-3 w-40 text-center">القرار</th>
                                        <th className="p-3">ملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {localItems.map((item, idx) => {
                                        const isSelected = selectedItemIndices.has(idx);
                                        return (
                                            <tr key={idx} className={`${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'} transition-colors`}>
                                                <td className="p-3 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        onChange={() => toggleSelection(idx)}
                                                        className="rounded border-gray-300 text-brand-600 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="p-3 font-mono font-bold text-slate-700">{item.partNumber}</td>
                                                <td className="p-3 text-slate-600">{item.partName}</td>
                                                <td className="p-3 text-center font-bold">{item.requestedQty}</td>
                                                
                                                <td className="p-3">
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-2 text-xs border border-slate-200 rounded bg-white"
                                                        placeholder="ابحث للمطابقة..."
                                                        value={item.matchedProductName || ''}
                                                        onChange={(e) => handleItemChange(idx, 'matchedProductName', e.target.value)}
                                                    />
                                                </td>
                                                
                                                <td className="p-3">
                                                    <input 
                                                        type="number" 
                                                        className={`w-full p-2 text-xs text-center border rounded font-bold ${item.approvalStatus === 'APPROVED' && !item.matchedPrice ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                                                        placeholder="0.00"
                                                        value={item.matchedPrice || ''}
                                                        onChange={(e) => handleItemChange(idx, 'matchedPrice', parseFloat(e.target.value))}
                                                        disabled={item.approvalStatus !== 'APPROVED'}
                                                    />
                                                </td>

                                                <td className="p-3 text-center">
                                                    <select 
                                                        className={`w-full p-1.5 text-xs font-bold rounded border ${
                                                            item.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            item.approvalStatus === 'MISSING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                            item.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}
                                                        value={item.approvalStatus || 'PENDING'}
                                                        onChange={(e) => handleItemChange(idx, 'approvalStatus', e.target.value)}
                                                    >
                                                        <option value="PENDING">مراجعة</option>
                                                        <option value="APPROVED">متوفر</option>
                                                        <option value="MISSING">غير متوفر</option>
                                                        <option value="REJECTED">مرفوض</option>
                                                    </select>
                                                </td>

                                                <td className="p-3">
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-2 text-xs border border-slate-200 rounded bg-white text-slate-500"
                                                        placeholder="ملاحظة..."
                                                        value={item.adminNote || ''}
                                                        onChange={(e) => handleItemChange(idx, 'adminNote', e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 max-w-2xl">
                            <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات عامة على الطلب (تظهر للعميل)</label>
                            <textarea 
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                rows={3}
                                value={generalNote}
                                onChange={(e) => setGeneralNote(e.target.value)}
                                placeholder="مثال: بعض الأصناف غير متوفرة حالياً، تم تسعير المتوفر فقط."
                            ></textarea>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};