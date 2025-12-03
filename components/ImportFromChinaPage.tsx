
import React, { useState, useEffect } from 'react';
import { User, BusinessProfile, ImportRequest } from '../types';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { 
    Globe, Ship, Container, PackageCheck, Anchor, 
    ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, 
    Truck, Building2, History, Layers, FileText,
    Clock, Upload, DollarSign, Download, Check
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

interface ImportFromChinaPageProps {
    user: User;
    userProfile: BusinessProfile | null;
}

const BRANDS_LIST = [
    'Changan', 'MG', 'Geely', 'Haval', 'Chery', 'GAC', 'BYD', 'Great Wall', 
    'Jetour', 'Hongqi', 'Jac', 'Omoda', 'Exeed', 'Wuling', 'Maxus'
];

const STATUS_LABELS: Record<string, string> = {
    'NEW': 'طلب جديد',
    'UNDER_REVIEW': 'قيد المراجعة',
    'WAITING_CUSTOMER_EXCEL': 'بانتظار رفع ملف الأصناف',
    'PRICING_IN_PROGRESS': 'جاري إعداد عرض السعر',
    'PRICING_SENT': 'تم إرسال عرض السعر',
    'WAITING_CUSTOMER_APPROVAL': 'بانتظار موافقتكم',
    'APPROVED_BY_CUSTOMER': 'تمت الموافقة - قيد التنفيذ',
    'IN_FACTORY': 'في المصنع / التجهيز',
    'SHIPMENT_BOOKED': 'تم حجز الشحن',
    'ON_THE_SEA': 'الشحنة في البحر',
    'IN_PORT': 'وصلت الميناء',
    'CUSTOMS_CLEARED': 'تم التخليص الجمركي',
    'ON_THE_WAY': 'في الطريق إليكم',
    'DELIVERED': 'تم التسليم',
    'CANCELLED': 'ملغي'
};

const STATUS_STEPS = [
    { key: 'NEW', label: 'طلب جديد' },
    { key: 'PRICING_SENT', label: 'التسعير' },
    { key: 'APPROVED_BY_CUSTOMER', label: 'الموافقة' },
    { key: 'ON_THE_SEA', label: 'الشحن' },
    { key: 'DELIVERED', label: 'التسليم' }
];

export const ImportFromChinaPage: React.FC<ImportFromChinaPageProps> = ({ user, userProfile }) => {
    // Mode: LIST (Dashboard) or NEW (Wizard)
    const [viewMode, setViewMode] = useState<'LIST' | 'NEW'>('LIST');
    const [myRequests, setMyRequests] = useState<ImportRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Wizard State
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // File Upload State
    const [isUploading, setIsUploading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<Partial<ImportRequest>>({
        businessName: userProfile?.companyName || user.name,
        branchesCount: userProfile?.branches?.length || 1,
        targetCarBrands: [],
        hasImportedBefore: false,
        serviceMode: 'FULL_SERVICE',
        notes: ''
    });

    const [customBrand, setCustomBrand] = useState('');
    const { addToast } = useToast();

    // Load Requests
    useEffect(() => {
        loadMyRequests();
    }, [user.id]);

    const loadMyRequests = async () => {
        setLoading(true);
        try {
            const allRequests = await MockApi.getImportRequests();
            const mine = allRequests.filter(r => r.customerId === user.id);
            setMyRequests(mine.reverse());
            // If no requests, default to NEW view
            if (mine.length === 0) setViewMode('NEW');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers for Wizard ---
    const toggleBrand = (brand: string) => {
        const current = formData.targetCarBrands || [];
        if (current.includes(brand)) {
            setFormData({ ...formData, targetCarBrands: current.filter(b => b !== brand) });
        } else {
            setFormData({ ...formData, targetCarBrands: [...current, brand] });
        }
    };

    const addCustomBrand = () => {
        if (customBrand && !formData.targetCarBrands?.includes(customBrand)) {
            setFormData({ ...formData, targetCarBrands: [...(formData.targetCarBrands || []), customBrand] });
            setCustomBrand('');
        }
    };

    const handleNext = () => {
        // Validation Step 1
        if (step === 1) {
            if (!formData.businessName || !formData.branchesCount) {
                addToast('يرجى تعبئة اسم المنشأة وعدد الفروع', 'error');
                return;
            }
            if ((formData.targetCarBrands?.length || 0) === 0) {
                addToast('يرجى اختيار شركة واحدة على الأقل', 'error');
                return;
            }
        }
        // Validation Step 2
        if (step === 2) {
             if (formData.hasImportedBefore && !formData.previousImportDetails) {
                 addToast('يرجى كتابة نبذة مختصرة عن تجربتكم السابقة', 'error');
                 return;
             }
        }
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await MockApi.createImportRequest({
                ...formData as any,
                customerId: user.id
            });
            addToast('تم إرسال طلب الاستيراد بنجاح', 'success');
            await loadMyRequests();
            setViewMode('LIST');
            // Reset form
            setStep(1);
            setFormData({
                businessName: userProfile?.companyName || user.name,
                branchesCount: userProfile?.branches?.length || 1,
                targetCarBrands: [],
                hasImportedBefore: false,
                serviceMode: 'FULL_SERVICE',
                notes: ''
            });
        } catch (e) {
            addToast('حدث خطأ أثناء الإرسال', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Actions for Existing Requests ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, requestId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            // Mock upload
            await MockApi.uploadImportRequestExcel(requestId, file.name, user.name);
            addToast('تم رفع الملف بنجاح', 'success');
            loadMyRequests();
        } catch (e) {
            addToast('فشل الرفع', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleApprovePricing = async (requestId: string) => {
        if (!confirm('هل أنت متأكد من الموافقة على عرض السعر والبدء في الإجراءات؟')) return;
        try {
            await MockApi.confirmImportRequestByCustomer(requestId, { customerName: user.name });
            addToast('تم اعتماد العرض، سيبدأ الفريق بالتنفيذ', 'success');
            loadMyRequests();
        } catch (e) {
            addToast('حدث خطأ', 'error');
        }
    };

    // --- Sub-components for View ---
    
    // Status Tracker Component
    const StatusTracker = ({ status }: { status: string }) => {
        // Find current step index
        // Simplified mapping for visual progress
        const getStepIndex = (s: string) => {
            if (s === 'NEW' || s === 'UNDER_REVIEW' || s === 'WAITING_CUSTOMER_EXCEL') return 0;
            if (s.includes('PRICING') || s === 'WAITING_CUSTOMER_APPROVAL') return 1;
            if (s === 'APPROVED_BY_CUSTOMER' || s === 'IN_FACTORY') return 2;
            if (s === 'SHIPMENT_BOOKED' || s === 'ON_THE_SEA' || s === 'IN_PORT' || s === 'CUSTOMS_CLEARED' || s === 'ON_THE_WAY') return 3;
            if (s === 'DELIVERED') return 4;
            return 0;
        };
        const currentIdx = getStepIndex(status);

        return (
            <div className="w-full py-4">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10 rounded-full"></div>
                    {STATUS_STEPS.map((step, idx) => (
                        <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                                idx <= currentIdx ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                                {idx < currentIdx ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold ${idx <= currentIdx ? 'text-brand-700' : 'text-slate-400'}`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---

    if (viewMode === 'NEW') {
        // ... The Existing Wizard Code ...
        return (
            <div className="animate-fade-in pb-20">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-800">طلب استيراد جديد</h2>
                    {myRequests.length > 0 && (
                        <button onClick={() => setViewMode('LIST')} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2">
                            <ArrowRight size={16} /> العودة لطلباتي
                        </button>
                    )}
                </div>

                {/* Hero Section (Keep existing) */}
                <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-3xl overflow-hidden shadow-xl text-white relative mb-10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-10"></div>
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-600/30 to-transparent"></div>
                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 bg-brand-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-400/30 text-brand-200 text-xs font-bold uppercase tracking-wider mb-2">
                                <Globe size={14} /> خدمة جديدة للشركات
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight">الاستيراد المباشر من الصين</h1>
                            <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                                تتيح لك منظومة صيني كار استيراد قطع الغيار مباشرة من المصانع الصينية، مع مكاتبنا المعتمدة في 3 مدن رئيسية لتأمين الجودة والسعر.
                            </p>
                        </div>
                        <div className="hidden md:block opacity-80">
                             <Ship size={180} strokeWidth={0.5} className="text-white/20" />
                        </div>
                    </div>
                </div>

                {/* Wizard Container */}
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 min-h-[500px] flex flex-col">
                    {/* Steps Logic (Same as before) */}
                    {step === 1 && (
                        <div className="animate-fade-in flex-1">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Building2 className="text-brand-600" /> معلومات المنشأة والنشاط
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنشأة / الشركة</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                        value={formData.businessName}
                                        onChange={e => setFormData({...formData, businessName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">عدد الفروع الحالية</label>
                                    <input 
                                        type="number" 
                                        min={1}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                        value={formData.branchesCount}
                                        onChange={e => setFormData({...formData, branchesCount: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-3">الشركات المستهدفة (اختر واحدة أو أكثر)</label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {BRANDS_LIST.map(brand => (
                                        <button 
                                            key={brand}
                                            onClick={() => toggleBrand(brand)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                                                formData.targetCarBrands?.includes(brand)
                                                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in flex-1">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <History className="text-brand-600" /> خبرة الاستيراد
                            </h2>
                            <div className="mb-8">
                                <label className="block text-lg font-bold text-slate-700 mb-4">هل سبق لكم الاستيراد من الصين مباشرة؟</label>
                                <div className="grid grid-cols-2 gap-4 max-w-md">
                                    <button 
                                        onClick={() => setFormData({...formData, hasImportedBefore: true})}
                                        className={`p-6 rounded-2xl border-2 text-center transition-all ${formData.hasImportedBefore ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <span className="font-bold text-lg">نعم، سبق لي</span>
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, hasImportedBefore: false, previousImportDetails: ''})}
                                        className={`p-6 rounded-2xl border-2 text-center transition-all ${!formData.hasImportedBefore ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <span className="font-bold text-lg">لا، أول مرة</span>
                                    </button>
                                </div>
                            </div>
                            {formData.hasImportedBefore && (
                                <div className="animate-slide-up">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">نبذة مختصرة عن تجربتكم السابقة</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl"
                                        placeholder="مثال: استوردنا حاويتين فلاتر من جوانزو..."
                                        value={formData.previousImportDetails || ''}
                                        onChange={e => setFormData({...formData, previousImportDetails: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in flex-1">
                             <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Layers className="text-brand-600" /> تفاصيل الخدمة المطلوبة
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <button 
                                    onClick={() => setFormData({...formData, serviceMode: 'FULL_SERVICE'})}
                                    className={`p-6 rounded-2xl border-2 text-right transition-all group ${formData.serviceMode === 'FULL_SERVICE' ? 'border-brand-600 bg-brand-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">استيراد كامل (Full Service)</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        نحن نتولى البحث، الشراء، الفحص، الشحن، والتخليص الجمركي حتى وصول البضاعة لمستودعك.
                                    </p>
                                </button>
                                <button 
                                    onClick={() => setFormData({...formData, serviceMode: 'GOODS_ONLY'})}
                                    className={`p-6 rounded-2xl border-2 text-right transition-all group ${formData.serviceMode === 'GOODS_ONLY' ? 'border-brand-600 bg-brand-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">تجهيز بضاعة (EXW/FOB)</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        نحن نتولى الشراء وتجهيز البضاعة في الصين، وأنتم تتولون عمليات الشحن والتخليص.
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fade-in flex-1">
                             <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FileText className="text-brand-600" /> مراجعة وإرسال
                            </h2>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 space-y-4 text-sm">
                                <p className="font-bold">يرجى التأكد من البيانات قبل الإرسال.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات إضافية</label>
                                <textarea 
                                    rows={3}
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl"
                                    placeholder="اكتب أي تفاصيل أخرى هنا..."
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50">
                                <ArrowRight size={18} /> السابق
                            </button>
                        ) : <div></div>}

                        {step < 4 ? (
                            <button onClick={handleNext} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">
                                التالي <ArrowLeft size={18} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition-all">
                                {isSubmitting ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'} <CheckCircle2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW (Dashboard) ---
    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">طلبات الاستيراد</h2>
                    <p className="text-slate-500 font-medium">متابعة حالة الشحنات والطلبات الخاصة من الصين.</p>
                </div>
                <button 
                    onClick={() => setViewMode('NEW')}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 shadow-lg"
                >
                    <Globe size={18} /> طلب جديد
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20">جاري التحميل...</div>
            ) : (
                <div className="space-y-8">
                    {myRequests.map(req => (
                        <div key={req.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-6 bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-lg font-bold text-brand-700">#{req.id}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-white ${
                                            req.status === 'CANCELLED' ? 'border-red-200 text-red-600' : 
                                            req.status === 'DELIVERED' ? 'border-green-200 text-green-600' : 'border-blue-200 text-blue-600'
                                        }`}>
                                            {STATUS_LABELS[req.status] || req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">تاريخ الطلب: {formatDateTime(req.createdAt)}</p>
                                </div>
                                
                                {/* Action Area based on Status */}
                                <div className="flex items-center gap-4">
                                    {req.status === 'WAITING_CUSTOMER_EXCEL' && (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                id={`file-${req.id}`} 
                                                className="hidden" 
                                                accept=".xlsx,.xls"
                                                onChange={(e) => handleFileUpload(e, req.id)}
                                            />
                                            <label 
                                                htmlFor={`file-${req.id}`}
                                                className={`cursor-pointer bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-700 shadow-lg shadow-brand-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <Upload size={18} /> {isUploading ? 'جاري الرفع...' : 'رفع ملف الأصناف (Excel)'}
                                            </label>
                                        </div>
                                    )}

                                    {(req.status === 'PRICING_SENT' || req.status === 'WAITING_CUSTOMER_APPROVAL') && (
                                        <div className="flex gap-2">
                                            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50">
                                                <Download size={16} /> عرض السعر
                                            </button>
                                            <button 
                                                onClick={() => handleApprovePricing(req.id)}
                                                className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200"
                                            >
                                                <CheckCircle2 size={18} /> موافقة واعتماد
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 md:p-8">
                                <StatusTracker status={req.status} />
                                
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Info Block */}
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-sm space-y-3">
                                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={16}/> تفاصيل الطلب</h4>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">نوع الخدمة</span>
                                            <span className="font-bold">{req.serviceMode === 'FULL_SERVICE' ? 'استيراد شامل' : 'تجهيز فقط'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">الماركات</span>
                                            <span className="font-bold">{req.targetCarBrands.join(', ')}</span>
                                        </div>
                                        {req.pricingTotalAmount && (
                                            <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                                                <span className="text-slate-500">قيمة العرض</span>
                                                <span className="font-black text-brand-600 text-lg">{req.pricingTotalAmount} ر.س</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline Feed */}
                                    <div className="border-r-2 border-slate-100 pr-6 mr-2 relative">
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><History size={16}/> آخر التحديثات</h4>
                                        <div className="space-y-6">
                                            {(req.timeline || []).slice().reverse().slice(0, 3).map((entry, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -right-[31px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                                                    <p className="text-xs font-bold text-slate-800">{STATUS_LABELS[entry.status] || entry.status}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(entry.changedAt)}</p>
                                                    {entry.note && <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded">{entry.note}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
