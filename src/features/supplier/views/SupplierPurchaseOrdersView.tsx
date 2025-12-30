/**
 * SupplierPurchaseOrdersView - Purchase Orders View for Supplier Portal
 * عرض أوامر الشراء للتنفيذ - بوابة المورد
 * 
 * Extracted from SupplierPortal.tsx - NO LOGIC CHANGES
 */

import React, { useState, memo } from 'react';
import { FileText, Package, ChevronRight } from 'lucide-react';

// Status labels for purchase orders
export const PO_STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  NEW: { label: 'جديد', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' },
  PREPARING: { label: 'قيد التحضير', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡' },
  READY: { label: 'جاهز للاستلام', color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢' },
  SHIPPED: { label: 'تم الشحن', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🚚' },
  RECEIVED: { label: 'تم الاستلام', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '✅' },
  PARTIAL_STOCK: { label: 'كمية غير كافية', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '⚠️' },
};

export interface SupplierPurchaseOrdersViewProps {
  orders: any[];
  onUpdateStatus: (orderId: string, status: string) => void;
  t: (key: string) => string;
}

export const SupplierPurchaseOrdersView = memo(({
  orders,
  onUpdateStatus,
  t
}: SupplierPurchaseOrdersViewProps) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Mock orders for demo if empty
  const displayOrders = orders.length > 0 ? orders : [
    {
      id: 'po-001',
      orderNumber: 'PO-2024-001',
      customerOrderNumber: 'ORD-5678',
      status: 'NEW',
      createdAt: new Date().toISOString(),
      totalItems: 3,
      totalQuantity: 15,
      totalAmount: 1500,
      items: [
        { id: '1', partNumber: 'ABC-001', productName: 'فلتر زيت تويوتا', quantityRequested: 5, supplierPrice: 50, totalPrice: 250, isAvailable: true },
        { id: '2', partNumber: 'DEF-002', productName: 'فلتر هواء كامري', quantityRequested: 3, supplierPrice: 80, totalPrice: 240, isAvailable: true },
        { id: '3', partNumber: 'GHI-003', productName: 'شمعات إشعال', quantityRequested: 7, supplierPrice: 144, totalPrice: 1008, isAvailable: true },
      ]
    },
    {
      id: 'po-002',
      orderNumber: 'PO-2024-002',
      customerOrderNumber: 'ORD-5679',
      status: 'PREPARING',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      totalItems: 2,
      totalQuantity: 8,
      totalAmount: 720,
      items: [
        { id: '4', partNumber: 'JKL-004', productName: 'طقم فرامل أمامي', quantityRequested: 2, supplierPrice: 200, totalPrice: 400, isAvailable: true },
        { id: '5', partNumber: 'MNO-005', productName: 'زيت محرك 5W-30', quantityRequested: 6, supplierPrice: 53, totalPrice: 320, isAvailable: true },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">أوامر الشراء للتنفيذ</h2>
            <p className="text-sm text-slate-500">قم بتحضير الطلبات وتحديث حالتها</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
            {displayOrders.filter(o => o.status === 'NEW').length} جديد
          </span>
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
            {displayOrders.filter(o => o.status === 'PREPARING').length} قيد التحضير
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayOrders.map(order => {
          const statusInfo = PO_STATUS_LABELS[order.status] || PO_STATUS_LABELS.NEW;
          const isExpanded = expandedOrder === order.id;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
            >
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{statusInfo.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {order.totalItems} أصناف • {order.totalQuantity} قطعة • {order.totalAmount.toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                    <ChevronRight
                      size={20}
                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  {/* Items Table */}
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th className="text-right p-2 rounded-r-lg">رقم الصنف</th>
                          <th className="text-right p-2">اسم المنتج</th>
                          <th className="text-center p-2">الكمية</th>
                          <th className="text-center p-2">السعر</th>
                          <th className="text-center p-2 rounded-l-lg">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item: any) => (
                          <tr key={item.id} className="border-b border-slate-50">
                            <td className="p-2 font-mono text-xs text-slate-600">{item.partNumber}</td>
                            <td className="p-2 font-bold text-slate-800">{item.productName}</td>
                            <td className="p-2 text-center font-bold text-blue-600">{item.quantityRequested}</td>
                            <td className="p-2 text-center text-slate-600">{item.supplierPrice} ر.س</td>
                            <td className="p-2 text-center font-bold text-emerald-600">{item.totalPrice} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">
                      إجمالي المبلغ: <span className="font-black text-slate-800">{order.totalAmount.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'NEW' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(order.id, 'PARTIAL_STOCK')}
                            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-200 transition-colors"
                          >
                            ⚠️ كمية غير كافية
                          </button>
                          <button
                            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                          >
                            🟡 بدء التحضير
                          </button>
                        </>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'READY')}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                        >
                          🟢 جاهز للاستلام
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'SHIPPED')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                        >
                          🚚 تم الشحن
                        </button>
                      )}
                      {(order.status === 'SHIPPED' || order.status === 'RECEIVED') && (
                        <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">
                          ✅ مكتمل
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">لا توجد أوامر شراء</h3>
          <p className="text-slate-400">سيظهر هنا أي أمر شراء جديد من صيني كار</p>
        </div>
      )}
    </div>
  );
});

SupplierPurchaseOrdersView.displayName = 'SupplierPurchaseOrdersView';

export default SupplierPurchaseOrdersView;
