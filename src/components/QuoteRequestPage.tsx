

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, FileText, CheckCircle, ArrowLeft, Download, AlertTriangle, Loader2, ShieldCheck, Cog, Layers, ArrowRight, Printer, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import Api from '../services/api';
import { normalizeListResponse } from '../services/normalize';
import { User, QuoteItem, PriceType, QuoteRequest } from '../types';
import { useToast } from '../services/ToastContext';
import { formatDateTime, formatDate } from '../utils/dateUtils';

interface QuoteRequestPageProps {
    user: User;
    onSuccess: () => void;
}

export const QuoteRequestPage: React.FC<QuoteRequestPageProps> = ({ user, onSuccess }) => {
    // Logic State
    const [selectedPriceType, setSelectedPriceType] = useState<PriceType | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [parsedItems, setParsedItems] = useState<QuoteItem[]>([]);

    // UI State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Recent Quotes
    const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);

    // Pagination State for Recent Quotes
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // For PDF Generation
    const printRef = useRef<HTMLDivElement>(null);
    const [quoteForPdf, setQuoteForPdf] = useState<QuoteRequest | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    useEffect(() => {
        loadRecentQuotes();
    }, [isSuccess]);

    const loadRecentQuotes = async () => {
        const result = await Api.getAllQuoteRequests();
        // استخدام normalizeListResponse لضمان items دائماً array
        const { items } = normalizeListResponse<QuoteRequest>(result);
        setRecentQuotes(items.filter(q => q.userId === user.id).reverse());
    };

    // Memoized pagination logic
    const paginatedQuotes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return recentQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [recentQuotes, currentPage]);

    const totalPages = Math.ceil(recentQuotes.length / ITEMS_PER_PAGE);

    const handleDownloadTemplate = async () => {
        try {
            const { utils, writeFile } = await import('xlsx');
            const wb = utils.book_new();
            const ws_data = [
                ["PartNumber", "PartName", "Quantity"],
                ["CN-102030", "فحمات شانجان", 10],
                ["MG-998877", "فلتر زيت ام جي", 5],
                ["GL-COOL-01", "راديتر كولراي", 1]
            ];
            const ws = utils.aoa_to_sheet(ws_data);
            utils.book_append_sheet(wb, ws, "Template");
            writeFile(wb, "SiniCar_Quote_Template.xlsx");
        } catch (e) {
            addToast('حدث خطأ أثناء تحميل النموذج', 'error');
        }
    };

    const validateExcelHeaders = (headers: unknown[]): boolean => {
        if (!headers || headers.length < 3) return false;
        const h = headers.map(s => String(s).toLowerCase());

        const hasPartNum = h.some(s => s.includes('number') || s.includes('num') || s.includes('part') || s.includes('رقم'));
        const hasPartName = h.some(s => s.includes('name') || s.includes('desc') || s.includes('اسم') || s.includes('وصف'));
        const hasQty = h.some(s => s.includes('qty') || s.includes('quantity') || s.includes('count') || s.includes('كمية') || s.includes('عدد'));

        return hasPartNum && hasPartName && hasQty;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedPriceType) {
            addToast('الرجاء اختيار نوع السعر المطلوب قبل رفع الملف', 'error');
            return;
        }

        setFile(file);
        setIsProcessing(true);
        setUploadProgress(10); // Start

        try {
            const { read, utils } = await import('xlsx');
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

            if (jsonData.length < 2) throw new Error('الملف فارغ');

            // Check Headers (Row 0)
            const headers = jsonData[0];
            if (!validateExcelHeaders(headers)) {
                throw new Error('يجب أن يحتوي الملف على أعمدة: رقم الصنف، اسم الصنف، الكمية');
            }

            setUploadProgress(40);

            const items: QuoteItem[] = [];
            // Attempt to find indexes
            const h = headers.map(s => String(s).toLowerCase());
            const idxNum = h.findIndex(s => s.includes('number') || s.includes('num') || s.includes('part') || s.includes('رقم'));
            const idxName = h.findIndex(s => s.includes('name') || s.includes('desc') || s.includes('اسم') || s.includes('وصف'));
            const idxQty = h.findIndex(s => s.includes('qty') || s.includes('quantity') || s.includes('count') || s.includes('كمية'));

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row[idxNum]) {
                    items.push({
                        partNumber: String(row[idxNum]).trim(),
                        partName: String(row[idxName] || 'Unknown').trim(),
                        requestedQty: Number(row[idxQty]) || 1
                    });
                }
            }

            if (items.length === 0) throw new Error('لم يتم العثور على أصناف صالحة');

            // Simulate Processing Time
            let p = 40;
            const interval = setInterval(() => {
                p += 5;
                setUploadProgress(p);
                if (p >= 90) clearInterval(interval);
            }, 50);

            await new Promise(resolve => setTimeout(resolve, 500));
            clearInterval(interval);
            setUploadProgress(100);

            setParsedItems(items);

            // Auto Submit logic after parsing
            await submitQuote(items);

        } catch (error: any) {
            addToast(error.message || 'حدث خطأ أثناء قراءة الملف', 'error');
            setFile(null);
            setIsProcessing(false);
            setUploadProgress(0);
        }
    };

    const submitQuote = async (items: QuoteItem[]) => {
        try {
            const profile = (await Api.getAllUsers()).find(u => u.user.id === user.id)?.profile;
            await Api.createQuoteRequest({
                userId: user.id,
                userName: user.name,
                companyName: profile?.companyName || 'Unknown',
                items: items,
                priceType: selectedPriceType!
            });

            setIsSuccess(true);
            addToast('تم استلام طلب التسعير بنجاح', 'success');
        } catch (e) {
            addToast('فشل في إرسال الطلب', 'error');
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setParsedItems([]);
        setIsProcessing(false);
        setIsSuccess(false);
        setUploadProgress(0);
        setSelectedPriceType(null);
    };

    // --- Download Generators ---

    // New PDF Generation using html2canvas to support Arabic
    const handleDownloadQuotePDF = async (quote: QuoteRequest) => {
        setQuoteForPdf(quote);
        // Wait for React to render the hidden component
        setTimeout(async () => {
            if (printRef.current) {
                try {
                    const { default: html2canvas } = await import('html2canvas');
                    const { default: jsPDF } = await import('jspdf');

                    const canvas = await html2canvas(printRef.current, {
                        scale: 2,
                        useCORS: true
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Quote_${quote.id}_Matched.pdf`);
                    addToast('تم تحميل عرض السعر بنجاح', 'success');
                } catch (err) {
                    console.error(err);
                    addToast('حدث خطأ أثناء إنشاء ملف PDF', 'error');
                } finally {
                    setQuoteForPdf(null);
                }
            }
        }, 100);
    };

    const generateExcel = async (quote: QuoteRequest) => {
        // Logic modified to export "Missing/Rejected" items
        const rejectedItems = quote.items
            .filter(i => i.approvalStatus === 'MISSING' || i.approvalStatus === 'REJECTED' || i.status === 'NOT_FOUND' || i.status === 'REJECTED')
            .map(i => ({
                "Part Number": i.partNumber,
                "Part Name": i.partName,
                "Quantity": i.requestedQty,
                "Reason": i.adminNote || i.notes || 'غير موجود في النظام'
            }));

        if (rejectedItems.length === 0) {
            addToast('لا توجد أصناف غير متوفرة', 'info');
            return;
        }

        try {
            const { utils, writeFile } = await import('xlsx');
            const ws = utils.json_to_sheet(rejectedItems);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Missing Items");
            writeFile(wb, `Quote_${quote.id}_Missing.xlsx`);
        } catch (err) {
            addToast('حدث خطأ أثناء تحميل الملف', 'error');
        }
    };

    return (
        <div className="w-full animate-fade-in py-8 space-y-10">

            {/* Main Upload Card */}
            {!isSuccess ? (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-10 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black mb-3">رفع طلب شراء (Bulk Request)</h2>
                                <p className="text-slate-200 text-lg font-medium">نظام ذكي لمعالجة ملفات Excel ومعالجة مئات الأصناف.</p>
                            </div>
                            <button
                                onClick={handleDownloadTemplate}
                                className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all backdrop-blur-sm"
                            >
                                <Download size={18} /> نموذج Excel
                            </button>
                        </div>
                    </div>

                    <div className="p-10">
                        {/* Step 1: Price Selection */}
                        <div className="mb-10">
                            <label className="block text-base font-bold text-slate-700 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">1</span>
                                الرجاء اختيار نوع التسعير المطلوب:
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button
                                    onClick={() => setSelectedPriceType('OEM')}
                                    disabled={isProcessing}
                                    className={`p-8 rounded-2xl border-2 transition-all text-right group ${selectedPriceType === 'OEM' ? 'border-brand-600 bg-brand-50 shadow-md ring-2 ring-brand-200' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <ShieldCheck className={`w-10 h-10 ${selectedPriceType === 'OEM' ? 'text-brand-600' : 'text-slate-300'}`} />
                                        {selectedPriceType === 'OEM' && <CheckCircle size={24} className="text-brand-600" />}
                                    </div>
                                    <h3 className={`font-bold text-xl mb-2 ${selectedPriceType === 'OEM' ? 'text-brand-800' : 'text-slate-700'}`}>أصلي فقط (OEM)</h3>
                                    <p className="text-sm text-slate-500 font-medium">تسعير القطع الأصلية فقط من الوكلاء المعتمدين.</p>
                                </button>

                                <button
                                    onClick={() => setSelectedPriceType('AFTERMARKET')}
                                    disabled={isProcessing}
                                    className={`p-8 rounded-2xl border-2 transition-all text-right group ${selectedPriceType === 'AFTERMARKET' ? 'border-brand-600 bg-brand-50 shadow-md ring-2 ring-brand-200' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <Cog className={`w-10 h-10 ${selectedPriceType === 'AFTERMARKET' ? 'text-brand-600' : 'text-slate-300'}`} />
                                        {selectedPriceType === 'AFTERMARKET' && <CheckCircle size={24} className="text-brand-600" />}
                                    </div>
                                    <h3 className={`font-bold text-xl mb-2 ${selectedPriceType === 'AFTERMARKET' ? 'text-brand-800' : 'text-slate-700'}`}>تجاري فقط</h3>
                                    <p className="text-sm text-slate-500 font-medium">تسعير البدائل التجارية ذات الجودة العالية.</p>
                                </button>

                                <button
                                    onClick={() => setSelectedPriceType('BOTH')}
                                    disabled={isProcessing}
                                    className={`p-8 rounded-2xl border-2 transition-all text-right group ${selectedPriceType === 'BOTH' ? 'border-brand-600 bg-brand-50 shadow-md ring-2 ring-brand-200' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <Layers className={`w-10 h-10 ${selectedPriceType === 'BOTH' ? 'text-brand-600' : 'text-slate-300'}`} />
                                        {selectedPriceType === 'BOTH' && <CheckCircle size={24} className="text-brand-600" />}
                                    </div>
                                    <h3 className={`font-bold text-xl mb-2 ${selectedPriceType === 'BOTH' ? 'text-brand-800' : 'text-slate-700'}`}>الجميع (أصلي وتجاري)</h3>
                                    <p className="text-sm text-slate-500 font-medium">الحصول على أفضل سعر متاح من النوعين.</p>
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Dropzone */}
                        <div className="relative">
                            <label className="block text-base font-bold text-slate-700 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">2</span>
                                رفع ملف الطلبات:
                            </label>

                            {!isProcessing ? (
                                <div
                                    onClick={() => selectedPriceType ? fileInputRef.current?.click() : addToast('الرجاء اختيار نوع السعر أولاً', 'error')}
                                    className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all group ${selectedPriceType ? 'border-slate-300 hover:border-brand-500 hover:bg-slate-50 cursor-pointer' : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'}`}
                                >
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-600 mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                                        <Upload size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">اضغط لرفع ملف Excel أو اسحب الملف هنا</h3>
                                    <p className="text-base text-slate-500 font-medium">يجب أن يحتوي الملف على: رقم الصنف، اسم الصنف، الكمية</p>
                                    <p className="text-sm text-slate-400 mt-6 font-mono font-bold">.xlsx, .xls • Max 5MB</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={!selectedPriceType} />
                                </div>
                            ) : (
                                <div className="border-2 border-slate-100 rounded-3xl p-16 text-center bg-slate-50/50">
                                    <div className="max-w-md mx-auto">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                            <span>جاري الرفع...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden mb-8">
                                            <div
                                                className="h-full bg-brand-600 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex flex-col items-center gap-4 animate-pulse">
                                            <Loader2 className="animate-spin text-brand-600" size={40} />
                                            <p className="text-slate-700 font-bold text-lg">جاري إرسال الملف للمعالجة...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Success State
                <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-16 text-center animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 shadow-sm border border-green-100 animate-bounce">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">تم استلام طلب الشراء</h2>
                    <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto mb-10">
                        سيتم مراجعة الطلب ومطابقة الأصناف من قبل إدارة صيني كار. ستصلك النتيجة فور الاعتماد.
                    </p>

                    <button
                        onClick={resetForm}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-10 py-4 rounded-xl font-bold transition-colors flex items-center gap-3 mx-auto text-lg"
                    >
                        <ArrowRight size={20} /> رفع طلب جديد
                    </button>
                </div>
            )}

            {/* Recent Quotes & Results */}
            <div className="space-y-6">
                <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-3 px-2">
                    <FileText size={24} className="text-slate-400" /> آخر الطلبات والنتائج
                </h3>

                {paginatedQuotes.map(quote => (
                    <div key={quote.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 flex-1 w-full">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${quote.resultReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {quote.items.length}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="font-mono font-bold text-slate-800 text-lg">{quote.id}</span>
                                    {quote.resultReady ? (
                                        <span className="bg-green-50 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-green-200">جاهز للتحميل</span>
                                    ) : (
                                        <span className="bg-yellow-50 text-yellow-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-yellow-200 flex items-center gap-1">
                                            <Clock size={12} /> تحت المراجعة
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    {formatDateTime(quote.date)} • {quote.priceType === 'OEM' ? 'أصلي فقط' : quote.priceType === 'AFTERMARKET' ? 'تجاري فقط' : 'الجميع'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-8 w-full lg:w-auto justify-around lg:justify-start">
                            {quote.resultReady ? (
                                <>
                                    <div className="text-center px-4 lg:border-l border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">متوفر</p>
                                        <p className="text-2xl font-black text-green-600">
                                            {quote.approvedItemsCount ?? quote.items.filter(i => i.approvalStatus === 'APPROVED' || i.status === 'MATCHED').length}
                                        </p>
                                    </div>
                                    <div className="text-center px-4 lg:border-l border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">غير متوفر</p>
                                        <p className="text-2xl font-black text-slate-500">
                                            {quote.missingItemsCount ?? quote.items.filter(i => i.approvalStatus === 'MISSING' || i.status === 'NOT_FOUND').length}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center px-8 lg:border-l border-slate-100 text-slate-400 italic font-bold">
                                    جاري المعالجة...
                                </div>
                            )}
                        </div>

                        {quote.resultReady && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-[200px]">
                                <button
                                    onClick={() => handleDownloadQuotePDF(quote)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                >
                                    <Printer size={16} /> طباعة عرض السعر
                                </button>
                                {(quote.missingItemsCount || 0) > 0 && (
                                    <button
                                        onClick={() => generateExcel(quote)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 px-5 rounded-xl text-xs font-bold transition-colors"
                                    >
                                        <Download size={16} /> النواقص (Excel)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <span className="text-sm font-bold text-slate-600">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                )}

                {recentQuotes.length === 0 && (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-lg font-bold opacity-50">لا توجد طلبات تسعير سابقة</p>
                    </div>
                )}
            </div>

            {/* Hidden Print Template for PDF Generation */}
            {quoteForPdf && (
                <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
                    <div ref={printRef} className="bg-white p-10 w-[210mm] min-h-[297mm] text-slate-900 font-sans" dir="rtl">

                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 mb-2">فاتورة مبدئية / Pro-forma Invoice</h1>
                                <p className="text-slate-500 font-bold">رقم العرض: <span className="font-mono text-slate-900">{quoteForPdf.id}</span></p>
                                <p className="text-slate-500 font-bold">التاريخ: <span className="font-mono text-slate-900">{formatDate(quoteForPdf.processedDate || quoteForPdf.date)}</span></p>
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl font-black text-brand-700">Sini Car Wholesale</h2>
                                <p className="text-sm text-slate-500">الرياض، المملكة العربية السعودية</p>
                                <p className="text-sm text-slate-500 font-mono">CR: 1010xxxxxx</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
                            <h3 className="font-bold text-lg mb-2 border-b border-slate-200 pb-1">بيانات العميل</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <p><span className="text-slate-500 font-bold ml-2">الاسم:</span> {quoteForPdf.userName}</p>
                                <p><span className="text-slate-500 font-bold ml-2">المنشأة:</span> {quoteForPdf.companyName}</p>
                                <p><span className="text-slate-500 font-bold ml-2">نوع السعر:</span> {quoteForPdf.priceType}</p>
                            </div>
                        </div>

                        {/* Table - Only Approved Items */}
                        <table className="w-full text-right text-sm border-collapse mb-8">
                            <thead>
                                <tr className="bg-slate-800 text-white">
                                    <th className="p-3 border border-slate-800">#</th>
                                    <th className="p-3 border border-slate-800">رقم القطعة</th>
                                    <th className="p-3 border border-slate-800">اسم الصنف</th>
                                    <th className="p-3 border border-slate-800 text-center">الكمية</th>
                                    <th className="p-3 border border-slate-800 text-center">سعر الوحدة</th>
                                    <th className="p-3 border border-slate-800 text-center">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quoteForPdf.items
                                    .filter(i => i.approvalStatus === 'APPROVED' || i.status === 'MATCHED')
                                    .map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td className="p-3 border border-slate-200 text-center">{index + 1}</td>
                                            <td className="p-3 border border-slate-200 font-mono font-bold">{item.partNumber}</td>
                                            <td className="p-3 border border-slate-200 font-bold">{item.matchedProductName || item.partName}</td>
                                            <td className="p-3 border border-slate-200 text-center">{item.requestedQty}</td>
                                            <td className="p-3 border border-slate-200 text-center">{item.matchedPrice?.toLocaleString()}</td>
                                            <td className="p-3 border border-slate-200 text-center font-bold">{(item.matchedPrice! * item.requestedQty).toLocaleString()}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 bg-slate-100 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-slate-600">المجموع:</span>
                                    <span className="font-bold font-mono">{quoteForPdf.totalQuotedAmount?.toLocaleString()} SAR</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-300 pt-2">
                                    <span className="font-black text-slate-900 text-lg">الإجمالي:</span>
                                    <span className="font-black text-slate-900 text-lg font-mono">{quoteForPdf.totalQuotedAmount?.toLocaleString()} SAR</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
                            <p>عرض السعر صالح لمدة 7 أيام من تاريخه. الأسعار تشمل ضريبة القيمة المضافة.</p>
                            <p>تم استخراج هذه الوثيقة إلكترونياً من نظام صيني كار.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};