

import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, QuoteRequest } from '../types';
import { 
  FileText, Download, Printer, Filter, 
  CheckCircle, Ban, Clock, Package, Layers, Eye, XCircle, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';
import { formatDateTime, formatDate } from '../utils/dateUtils';
import Api from '../services/api';

interface OrdersPageProps {
  orders: Order[];
  quoteRequests?: QuoteRequest[]; 
}

// Helper: Status Badge Component
const StatusBadge = ({ status, type = 'ORDER' }: { status: string, type?: 'ORDER' | 'QUOTE' }) => {
  const styles: any = {
    // Order Statuses
    [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
    [OrderStatus.APPROVED]: 'bg-blue-50 text-blue-700 border-blue-200',
    [OrderStatus.SHIPPED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-300',
    [OrderStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-500 border-gray-300', // Gray style for cancelled
    // Quote Statuses
    'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'NEW': 'bg-blue-50 text-blue-700 border-blue-200',
    'UNDER_REVIEW': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'QUOTED': 'bg-blue-50 text-blue-700 border-blue-200',
    'PROCESSED': 'bg-green-50 text-green-700 border-green-200',
    'PARTIALLY_APPROVED': 'bg-purple-100 text-purple-700 border-purple-200',
    // Item Statuses
    'MATCHED': 'bg-green-50 text-green-700 border-green-200',
    'NOT_FOUND': 'bg-slate-50 text-slate-500 border-slate-200',
  };

  const labels: any = {
      [OrderStatus.PENDING]: 'بانتظار الموافقة',
      [OrderStatus.APPROVED]: 'تم الاعتماد',
      [OrderStatus.SHIPPED]: 'تم الشحن',
      [OrderStatus.DELIVERED]: 'تم التسليم',
      [OrderStatus.REJECTED]: 'مرفوض',
      [OrderStatus.CANCELLED]: 'ملغي',
      'PENDING': 'قيد المراجعة',
      'NEW': 'جديد',
      'UNDER_REVIEW': 'قيد المراجعة',
      'QUOTED': 'تم التسعير',
      'PROCESSED': 'تمت المعالجة',
      'PARTIALLY_APPROVED': 'معتمد جزئياً',
      'MATCHED': 'مطابق في النظام',
      'NOT_FOUND': 'غير موجود'
  };

  const defaultStyle = 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${styles[status] || defaultStyle}`}>
      {status === OrderStatus.PENDING && <Clock size={14} />}
      {(status === OrderStatus.APPROVED || status === OrderStatus.DELIVERED || status === 'PROCESSED' || status === 'QUOTED' || status === 'MATCHED' || status === 'PARTIALLY_APPROVED') && <CheckCircle size={14} />}
      {status === OrderStatus.SHIPPED && <Package size={14} />}
      {(status === OrderStatus.REJECTED || status === 'NOT_FOUND') && <Ban size={14} />}
      {status === OrderStatus.CANCELLED && <XCircle size={14} />}
      {(status === 'NEW' || status === 'UNDER_REVIEW' || status === 'PENDING') && <Clock size={14} />}
      {labels[status] || status}
    </span>
  );
};

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders: initialOrders, quoteRequests = [] }) => {
  // View State
  const [viewMode, setViewMode] = useState<'ORDERS' | 'QUOTES'>('ORDERS');
  
  // Data State - تأكد من أن الـ array موجود
  const [localOrders, setLocalOrders] = useState<Order[]>(initialOrders ?? []);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  // Hover & Modal State
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    setLocalOrders(initialOrders ?? []);
  }, [initialOrders]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  // --- Filtering Logic (Memoized) ---
  const filteredOrders = useMemo(() => {
    // تأكد من أن localOrders هو Array
    const safeOrders = Array.isArray(localOrders) ? localOrders : [];
    let result = [...safeOrders];
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(o => o.id.toLowerCase().includes(lowerTerm));
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }
    // Sort by date desc
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localOrders, searchTerm, statusFilter]);

  const filteredQuotes = useMemo(() => {
     // Sort quotes by date desc
     return [...quoteRequests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quoteRequests]);

  // --- Pagination Logic (Memoized) ---
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    if (viewMode === 'ORDERS') {
        return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    } else {
        return filteredQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
  }, [viewMode, filteredOrders, filteredQuotes, currentPage]);

  const totalPages = useMemo(() => {
    const total = viewMode === 'ORDERS' ? filteredOrders.length : filteredQuotes.length;
    return Math.ceil(total / ITEMS_PER_PAGE);
  }, [viewMode, filteredOrders.length, filteredQuotes.length]);

  // --- Stats Calculation ---
  const stats = useMemo(() => {
      return {
          total: localOrders.length,
          pending: localOrders.filter(o => o.status === OrderStatus.PENDING).length,
          approved: localOrders.filter(o => o.status === OrderStatus.APPROVED || o.status === OrderStatus.SHIPPED).length
      };
  }, [localOrders]);

  // --- Handlers ---
  const handleQuoteClick = (quote: QuoteRequest) => {
      if (quote.status === 'NEW' || quote.status === 'UNDER_REVIEW') {
          addToast('هذا الطلب لا يزال قيد المراجعة من قبل الإدارة', 'info');
      } else {
          setSelectedQuote(quote);
      }
  };

  const handleCancelOrder = async (order: Order) => {
      const isCancellable = order.status === OrderStatus.PENDING || order.status === OrderStatus.APPROVED;
      
      if (!isCancellable) {
          if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
              addToast('لا يمكن إلغاء الطلب بعد الشحن أو التسليم، يرجى التواصل مع مدير النظام.', 'error');
          } else {
              addToast('لا يمكن إلغاء هذا الطلب في هذه المرحلة.', 'error');
          }
          return;
      }

      if (window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
          try {
              await Api.cancelOrder(order.id, 'CUSTOMER');
              // Update local state locally to reflect change immediately
              const updated = localOrders.map(o => o.id === order.id ? {...o, status: OrderStatus.CANCELLED, cancelledBy: 'CUSTOMER' as const, cancelledAt: new Date().toISOString()} : o);
              setLocalOrders(updated);
              
              // Also update selected order if modal is open
              if (selectedOrder && selectedOrder.id === order.id) {
                  setSelectedOrder({...selectedOrder, status: OrderStatus.CANCELLED, cancelledBy: 'CUSTOMER', cancelledAt: new Date().toISOString()});
              }
              
              addToast('تم إلغاء الطلب بنجاح', 'success');
          } catch (e: any) {
              if (e.message === 'CANNOT_CANCEL_SENSITIVE_STATUS') {
                  addToast('لا يمكن إلغاء هذا الطلب بعد الشحن أو التسليم.', 'error');
              } else {
                  addToast(e.message || 'حدث خطأ أثناء الإلغاء', 'error');
              }
          }
      }
  };

  const handleDeleteOrder = async (order: Order) => {
      // Allow deleting ONLY cancelled or rejected orders to clean up history
      if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REJECTED) {
          addToast('لا يمكن حذف الطلبات النشطة من السجل. يمكنك إلغاؤها فقط.', 'error');
          return;
      }
      
      if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائيًا من السجل؟')) {
          try {
              await Api.deleteOrder(order.id);
              // Update local state locally to reflect change immediately
              const updated = localOrders.filter(o => o.id !== order.id);
              setLocalOrders(updated);
              if (selectedOrder?.id === order.id) setSelectedOrder(null);
              addToast('تم حذف الطلب بنجاح', 'success');
          } catch (e: any) {
              addToast('حدث خطأ أثناء الحذف', 'error');
          }
      }
  };

  // --- PDF & Print Logic (Lazy Loading) ---

  const handleDownloadOrderPDF = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text(`Order Invoice #${order.id}`, 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Date: ${formatDate(order.date)}`, 14, 30);
        doc.text(`Total Amount: ${order.totalAmount.toLocaleString()} SAR`, 14, 35);
        doc.text(`Status: ${order.status}`, 14, 40);

        // Table
        const tableBody = order.items.map(item => [
            item.partNumber,
            item.name, // Note: Arabic might not render correctly without custom font in jsPDF
            item.quantity,
            item.price,
            (item.price * item.quantity).toFixed(2)
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Part No', 'Item Name', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            foot: [['', '', '', 'Grand Total', `${order.totalAmount.toLocaleString()} SAR`]],
        });

        doc.save(`order-${order.id}.pdf`);
        addToast('تم تحميل الفاتورة بنجاح', 'success');
    } catch (err) {
        console.error(err);
        addToast('حدث خطأ أثناء إنشاء PDF', 'error');
    }
  };

  const handlePrintOrder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.partNumber}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('');

        const content = `
            <html dir="rtl" lang="ar">
            <head>
                <title>طباعة الطلب #${order.id}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .details { margin-bottom: 20px; }
                    table { w-full; width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                    th { background-color: #f8f9fa; padding: 10px; border-bottom: 2px solid #ddd; text-align: right; }
                    .totals { margin-top: 20px; text-align: left; font-size: 16px; font-weight: bold; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Sini Car Wholesale</h1>
                    <h2>فاتورة طلب رقم #${order.id}</h2>
                </div>
                <div class="details">
                    <p><strong>التاريخ:</strong> ${formatDateTime(order.date)}</p>
                    <p><strong>الحالة:</strong> ${order.status}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>رقم القطعة</th>
                            <th>اسم الصنف</th>
                            <th style="text-align: center;">الكمية</th>
                            <th style="text-align: center;">سعر الوحدة</th>
                            <th style="text-align: center;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="totals">
                    <p>الإجمالي (شامل الضريبة): ${order.totalAmount.toLocaleString()} ر.س</p>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
    }
  };

  const handlePrintFromModal = (order: Order) => {
      // Wrapper to reuse the logic
      handlePrintOrder({ stopPropagation: () => {} } as React.MouseEvent, order);
  };

  const generateQuoteExcel = async (quote: QuoteRequest) => {
      const rejectedItems = quote.items
          .filter(i => i.status === 'REJECTED' || i.status === 'NOT_FOUND')
          .map(i => ({
              "Part Number": i.partNumber,
              "Part Name": i.partName,
              "Quantity": i.requestedQty,
              "Reason": i.notes || 'N/A'
          }));

      if (rejectedItems.length === 0) {
          addToast('لا توجد أصناف مرفوضة في هذا الطلب', 'info');
          return;
      }

      try {
        const { utils, writeFile } = await import('xlsx');
        const ws = utils.json_to_sheet(rejectedItems);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Rejected Items");
        writeFile(wb, `Quote_${quote.id}_NotFound.xlsx`);
        addToast('تم تحميل ملف Excel للأصناف المرفوضة', 'success');
      } catch (err) {
        addToast('حدث خطأ أثناء تحميل الملف', 'error');
      }
  };

  // Pagination Controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
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
    );
  };

  return (
    <div className="w-full animate-fade-in pb-20 space-y-8">
        
        {/* Main Wrapper */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        {viewMode === 'ORDERS' ? <FileText className="text-brand-600" size={28} /> : <Clock className="text-brand-600" size={28} />}
                        {viewMode === 'ORDERS' ? 'سجل طلبات الشراء' : 'سجل طلبات التسعير'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        {viewMode === 'ORDERS' 
                            ? 'استعرض جميع طلبات الشراء وحالاتها التفصيلية.' 
                            : 'متابعة حالة ملفات التسعير التي قمت برفعها.'}
                    </p>
                </div>

                {/* Toggle View Switch */}
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center">
                    <button 
                        onClick={() => setViewMode('ORDERS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'ORDERS' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                        <Layers size={18} /> الطلبات المباشرة
                    </button>
                    <button 
                        onClick={() => setViewMode('QUOTES')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'QUOTES' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
                    >
                        <FileText size={18} /> طلبات التسعير
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-8">
                
                {/* --- ORDERS VIEW --- */}
                {viewMode === 'ORDERS' && (
                    <div className="space-y-8 animate-slide-up">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="p-4 bg-slate-100 text-slate-600 rounded-full"><Layers size={28} /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">إجمالي الطلبات</p>
                                    <p className="text-3xl font-black text-slate-800 mt-1">{stats.total}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-full"><Clock size={28} /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">قيد الانتظار</p>
                                    <p className="text-3xl font-black text-slate-800 mt-1">{stats.pending}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle size={28} /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">تم الاعتماد</p>
                                    <p className="text-3xl font-black text-slate-800 mt-1">{stats.approved}</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-bold text-slate-500 ml-2 flex items-center gap-2"><Filter size={16}/> تصفية:</span>
                            {['ALL', OrderStatus.PENDING, OrderStatus.APPROVED, OrderStatus.SHIPPED, OrderStatus.CANCELLED].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold border transition-colors ${
                                        statusFilter === status 
                                        ? 'bg-brand-600 text-white border-brand-600' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                                    }`}
                                >
                                    {status === 'ALL' ? 'الكل' : status === OrderStatus.CANCELLED ? 'الملغاة' : status}
                                </button>
                            ))}
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-visible">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-5">رقم الطلب</th>
                                        <th className="p-5">التاريخ</th>
                                        <th className="p-5">إجمالي المبلغ</th>
                                        <th className="p-5">الحالة</th>
                                        <th className="p-5">الأصناف</th>
                                        <th className="p-5 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.length > 0 ? currentItems.map((order, i) => (
                                        <tr 
                                            key={order.id} 
                                            className={`hover:bg-blue-50/50 transition-colors group ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                            onClick={() => setSelectedOrder(order)} // Row click for full modal
                                        >
                                            <td className="p-5 font-mono font-bold text-brand-700 text-base">{order.id}</td>
                                            <td className="p-5 text-slate-600 font-medium">
                                                {formatDateTime(order.date)}
                                            </td>
                                            <td className="p-5 font-black text-slate-900">{order.totalAmount.toLocaleString()} ر.س</td>
                                            <td className="p-5"><StatusBadge status={order.status} /></td>
                                            
                                            {/* Hover Popover Column */}
                                            <td className="p-5 relative" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                   className="text-slate-400 hover:text-brand-600 p-2 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-bold"
                                                   onMouseEnter={() => setHoveredOrderId(order.id)}
                                                   onMouseLeave={() => setHoveredOrderId(null)}
                                                   onClick={() => setHoveredOrderId(hoveredOrderId === order.id ? null : order.id)} // Mobile toggle
                                                >
                                                   <Eye size={18} /> عرض
                                                </button>
                                                
                                                {/* Tooltip / Popover */}
                                                {hoveredOrderId === order.id && (
                                                    <div className="absolute z-50 top-full mt-2 -right-4 w-72 md:w-80 rounded-xl bg-white shadow-xl border border-slate-200 p-4 text-xs animate-fade-in pointer-events-none md:pointer-events-auto">
                                                        <div className="absolute top-0 right-8 -mt-2 w-4 h-4 bg-white border-t border-r border-slate-200 transform -rotate-45"></div>
                                                        <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">محتويات الطلب ({order.items.length})</h4>
                                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between items-start gap-2">
                                                                    <div className="flex-1">
                                                                        <span className="block font-bold text-slate-700 truncate">{item.name}</span>
                                                                        <span className="text-[10px] text-slate-500 font-mono">{item.partNumber}</span>
                                                                    </div>
                                                                    <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">x{item.quantity}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={(e) => handlePrintOrder(e, order)}
                                                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                                                        title="طباعة"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDownloadOrderPDF(e, order)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="تحميل PDF"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    
                                                    {/* Cancel Button (Instead of Delete for Active Orders) */}
                                                    {(order.status === OrderStatus.PENDING || order.status === OrderStatus.APPROVED || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) ? (
                                                        <div className="relative group/cancel">
                                                            <button 
                                                                onClick={() => handleCancelOrder(order)}
                                                                disabled={order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    (order.status === OrderStatus.PENDING || order.status === OrderStatus.APPROVED)
                                                                    ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                                                                    : 'text-slate-200 cursor-not-allowed'
                                                                }`}
                                                                title={order.status === OrderStatus.SHIPPED ? "لا يمكن إلغاء الطلب بعد الشحن" : "إلغاء الطلب"}
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        // Show Delete Button only for CANCELLED or REJECTED (Cleanup)
                                                        <button 
                                                            onClick={() => handleDeleteOrder(order)}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="حذف من السجل"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="p-16 text-center text-slate-400 font-bold">لا توجد طلبات لعرضها</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls />
                    </div>
                )}

                {/* --- QUOTES VIEW --- */}
                {viewMode === 'QUOTES' && (
                    <div className="space-y-8 animate-slide-up">
                         {/* Info Box */}
                         <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                             <div className="bg-white p-3 rounded-full text-brand-600 shadow-sm shrink-0"><FileText size={24}/></div>
                             <div>
                                 <h4 className="font-bold text-brand-900 text-base">كيف تعمل طلبات التسعير؟</h4>
                                 <p className="text-sm font-medium text-brand-700 mt-2 leading-relaxed">
                                     عند رفع ملف Excel، يتم مراجعته من قبل النظام وموظفي المبيعات. الطلبات التي تظهر بحالة 
                                     <span className="font-bold mx-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md">تمت المعالجة</span>
                                     يمكنك الضغط عليها لتحميل عروض الأسعار الموافق عليها.
                                 </p>
                             </div>
                         </div>

                         {/* Quotes Table */}
                         <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-5">رقم الطلب</th>
                                        <th className="p-5">تاريخ الرفع</th>
                                        <th className="p-5">عدد الأصناف</th>
                                        <th className="p-5">نوع السعر</th>
                                        <th className="p-5">الحالة</th>
                                        <th className="p-5 text-center">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.length > 0 ? (currentItems as QuoteRequest[]).map((quote, i) => (
                                        <tr 
                                            key={quote.id} 
                                            className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                            onClick={() => handleQuoteClick(quote)}
                                        >
                                            <td className="p-5 font-mono font-bold text-brand-700 text-base">{quote.id}</td>
                                            <td className="p-5 text-slate-600 font-medium">
                                                {formatDateTime(quote.date)}
                                            </td>
                                            <td className="p-5 font-bold text-slate-800">{quote.items.length}</td>
                                            <td className="p-5 text-slate-600 font-medium">
                                                {quote.priceType === 'OEM' ? 'أصلي فقط' : quote.priceType === 'AFTERMARKET' ? 'تجاري فقط' : 'الجميع'}
                                            </td>
                                            <td className="p-5"><StatusBadge status={quote.status} type="QUOTE" /></td>
                                            <td className="p-5 text-center">
                                                {(quote.status === 'NEW' || quote.status === 'UNDER_REVIEW') ? (
                                                    <span className="text-xs font-bold text-slate-400 italic">قيد المراجعة</span>
                                                ) : (
                                                    <button className="text-brand-600 hover:text-brand-800 font-bold text-xs flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                                                        <Download size={14} /> عرض النتائج
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="p-16 text-center text-slate-400 font-bold">لا توجد طلبات تسعير سابقة</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls />
                    </div>
                )}
            </div>
        </div>

        {/* --- REGULAR ORDER MODAL --- */}
        <Modal 
            isOpen={!!selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            title={selectedOrder ? `تفاصيل الطلب #${selectedOrder.id}` : ''}
            maxWidth="max-w-2xl"
        >
            {selectedOrder && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">حالة الطلب</p>
                            <div><StatusBadge status={selectedOrder.status} /></div>
                            {selectedOrder.status === OrderStatus.CANCELLED && selectedOrder.cancelledBy && (
                                <p className="text-xs text-red-500 mt-1 font-bold">
                                    بواسطة: {selectedOrder.cancelledBy === 'CUSTOMER' ? 'العميل' : 'الإدارة'}
                                </p>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">الإجمالي</p>
                            <p className="text-2xl font-black text-slate-900">{selectedOrder.totalAmount.toLocaleString()} ر.س</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                            <Package size={20} className="text-brand-500" /> المنتجات ({selectedOrder.items.length})
                        </h4>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">المنتج</th>
                                        <th className="p-4 text-center">الكمية</th>
                                        <th className="p-4 text-center">السعر</th>
                                        <th className="p-4 text-center">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800 text-base">{item.name}</p>
                                                <p className="font-mono text-xs text-slate-400 font-bold mt-0.5">{item.partNumber}</p>
                                            </td>
                                            <td className="p-4 text-center font-bold text-base">{item.quantity}</td>
                                            <td className="p-4 text-center text-slate-600 font-medium">{item.price}</td>
                                            <td className="p-4 text-center font-bold text-brand-600 text-base">{(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Modal Footer with Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                        <div className="flex gap-3">
                             <button 
                                onClick={() => handlePrintFromModal(selectedOrder)}
                                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2 text-sm shadow-md transition-all"
                            >
                                <Printer size={18} /> طباعة
                            </button>
                             
                             {(selectedOrder.status === OrderStatus.PENDING || selectedOrder.status === OrderStatus.APPROVED) && (
                                 <button
                                    onClick={() => {
                                        if(selectedOrder) {
                                            handleCancelOrder(selectedOrder);
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 flex items-center gap-2 text-sm transition-all"
                                 >
                                     <XCircle size={18} /> إلغاء الطلب
                                 </button>
                             )}

                             {/* Delete from Modal - Only for cancelled/rejected */}
                             {(selectedOrder.status === OrderStatus.CANCELLED || selectedOrder.status === OrderStatus.REJECTED) && (
                                <button
                                    onClick={() => {
                                        if(selectedOrder) {
                                            handleDeleteOrder(selectedOrder);
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-100 flex items-center gap-2 text-sm transition-all"
                                >
                                    <Trash2 size={18} /> حذف
                                </button>
                             )}
                        </div>
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </Modal>

        {/* --- QUOTE DETAILS MODAL --- */}
        <Modal 
            isOpen={!!selectedQuote} 
            onClose={() => setSelectedQuote(null)} 
            title={selectedQuote ? `تفاصيل عرض السعر #${selectedQuote.id}` : ''}
            maxWidth="max-w-3xl"
        >
            {selectedQuote && (
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">التاريخ</p>
                            <p className="font-bold text-slate-800">{formatDate(selectedQuote.date)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">نوع السعر</p>
                            <p className="font-bold text-slate-800">{selectedQuote.priceType}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">عدد الأصناف</p>
                            <p className="font-bold text-slate-800">{selectedQuote.items.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">القيمة الموافق عليها</p>
                            <p className="font-black text-brand-600 text-lg">{selectedQuote.totalQuotedAmount?.toLocaleString() || 0} ر.س</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                        <table className="w-full text-sm text-right relative">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4">رقم الصنف</th>
                                    <th className="p-4">الوصف</th>
                                    <th className="p-4 text-center">الكمية</th>
                                    <th className="p-4 text-center">السعر</th>
                                    <th className="p-4 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedQuote.items.map((item, idx) => (
                                    <tr key={idx} className={item.status === 'NOT_FOUND' || item.status === 'REJECTED' ? 'bg-red-50/30' : 'bg-white'}>
                                        <td className="p-4 font-mono text-slate-600 font-bold">{item.partNumber}</td>
                                        <td className="p-4">
                                            <span className="font-bold text-slate-800 block text-base">{item.matchedProductName || item.partName}</span>
                                            {item.notes && <span className="text-xs text-red-500 font-bold block mt-1 bg-red-50 px-2 py-0.5 rounded w-fit">{item.notes}</span>}
                                        </td>
                                        <td className="p-4 text-center font-bold text-base">{item.requestedQty}</td>
                                        <td className="p-4 text-center font-bold text-brand-600 text-base">
                                            {item.matchedPrice ? item.matchedPrice.toLocaleString() : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={item.status || 'PENDING'} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => {
                                    const printWindow = window.open('', '_blank');
                                    printWindow?.document.write('<h1>يرجى الطباعة من صفحة طلبات التسعير للحصول على النسخة الرسمية</h1>');
                                }}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-brand-700 shadow-md transition-colors text-sm opacity-50 cursor-not-allowed"
                                title="يرجى استخدام زر التحميل في صفحة طلبات التسعير"
                            >
                                <Download size={18} /> تحميل عرض السعر (PDF)
                            </button>
                            {selectedQuote.items.some(i => i.status === 'NOT_FOUND' || i.status === 'REJECTED') && (
                                <button 
                                    onClick={() => generateQuoteExcel(selectedQuote)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 px-5 rounded-xl text-xs font-bold transition-colors"
                                >
                                    <Download size={16} /> الأصناف غير الموجودة (Excel)
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={() => setSelectedQuote(null)}
                            className="text-slate-500 font-bold hover:text-slate-800 transition-colors px-4"
                        >
                            إغلاق النافذة
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  );
};
