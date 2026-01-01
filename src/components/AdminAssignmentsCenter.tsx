import React, { useState, useEffect, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Api } from '../services/api';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';
import {
  FileText, Plus, Search, Filter, RefreshCw, Loader2, 
  CheckCircle, Clock, Truck, XCircle, X, AlertTriangle,
  Users, ChevronLeft, ChevronRight
} from 'lucide-react';

// Status Labels
const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NEW: { label: 'جديد', color: 'bg-red-100 text-red-700 border-red-200', icon: <Clock className="w-4 h-4" /> },
  ACCEPTED: { label: 'مقبول', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle className="w-4 h-4" /> },
  IN_PROGRESS: { label: 'قيد التنفيذ', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Loader2 className="w-4 h-4" /> },
  SHIPPED: { label: 'تم الشحن', color: 'bg-green-100 text-green-700 border-green-200', icon: <Truck className="w-4 h-4" /> },
  REJECTED: { label: 'مرفوض', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <XCircle className="w-4 h-4" /> },
  CANCELLED: { label: 'ملغي', color: 'bg-slate-200 text-slate-500 border-slate-300', icon: <X className="w-4 h-4" /> },
};

// Type Labels
const TYPE_LABELS: Record<string, string> = {
  QUOTE: 'طلب عرض سعر',
  ORDER: 'طلب شراء',
  INSTALLMENT: 'طلب تقسيط',
  IMPORT: 'طلب استيراد',
  MISSING: 'طلب قطع مفقودة'
};

// Priority Labels
const PRIORITY_OPTIONS = [
  { value: 0, label: 'منخفض', color: 'text-slate-500' },
  { value: 1, label: 'عادي', color: 'text-blue-600' },
  { value: 2, label: 'عالي', color: 'text-orange-600' },
  { value: 3, label: 'عاجل', color: 'text-red-600' },
];

interface Assignment {
  id: string;
  supplierId: string;
  requestType: string;
  requestId: string;
  status: string;
  priority: number;
  supplierNotes?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: { companyName?: string };
}

interface Supplier {
  id: string;
  companyName?: string;
  contactName?: string;
}

export const AdminAssignmentsCenter = memo(() => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    supplierId: '',
    requestType: 'QUOTE',
    requestId: '',
    priority: 1,
    supplierNotes: ''
  });
  const [creating, setCreating] = useState(false);

  // Status Update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      const data = await Api.adminGetAssignments({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: perPage
      });
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
    }
  }, [statusFilter, typeFilter, page, perPage]);

  // Load suppliers
  const loadSuppliers = useCallback(async () => {
    try {
      const data = await Api.adminGetSuppliersList();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setSuppliers([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadAssignments(), loadSuppliers()]);
      setLoading(false);
    };
    init();
  }, [loadAssignments, loadSuppliers]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  };

  // Create assignment
  const handleCreate = async () => {
    if (!createForm.supplierId || !createForm.requestId) {
      addToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    setCreating(true);
    try {
      await Api.adminCreateAssignment({
        supplierId: createForm.supplierId,
        requestType: createForm.requestType,
        requestId: createForm.requestId,
        priority: createForm.priority,
        supplierNotes: createForm.supplierNotes || undefined
      });
      addToast('تم إنشاء التخصيص بنجاح', 'success');
      setShowCreateModal(false);
      setCreateForm({
        supplierId: '',
        requestType: 'QUOTE',
        requestId: '',
        priority: 1,
        supplierNotes: ''
      });
      loadAssignments();
    } catch (error: any) {
      addToast(error?.message || 'فشل إنشاء التخصيص', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Update status
  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    setUpdatingId(assignmentId);
    try {
      await Api.adminUpdateAssignmentStatus(assignmentId, newStatus);
      addToast('تم تحديث الحالة بنجاح', 'success');
      loadAssignments();
    } catch (error: any) {
      addToast(error?.message || 'فشل تحديث الحالة', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter assignments locally by search
  const filteredAssignments = assignments.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.id.toLowerCase().includes(q) ||
      a.requestId.toLowerCase().includes(q) ||
      a.supplierId.toLowerCase().includes(q)
    );
  });

  // Stats
  const stats = {
    total: assignments.length,
    new: assignments.filter(a => a.status === 'NEW').length,
    accepted: assignments.filter(a => a.status === 'ACCEPTED').length,
    inProgress: assignments.filter(a => a.status === 'IN_PROGRESS').length,
    shipped: assignments.filter(a => a.status === 'SHIPPED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">مركز التخصيصات</h2>
            <p className="text-sm text-slate-500">إدارة تخصيص الطلبات للموردين</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            <Plus size={18} />
            تخصيص جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">الإجمالي</p>
          <p className="text-2xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm text-red-600">جديد</p>
          <p className="text-2xl font-black text-red-700">{stats.new}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-600">مقبول</p>
          <p className="text-2xl font-black text-blue-700">{stats.accepted}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
          <p className="text-sm text-yellow-600">قيد التنفيذ</p>
          <p className="text-2xl font-black text-yellow-700">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-green-600">مشحون</p>
          <p className="text-2xl font-black text-green-700">{stats.shipped}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم التخصيص أو الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        >
          <option value="">جميع الحالات</option>
          {Object.entries(STATUS_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        >
          <option value="">جميع الأنواع</option>
          {Object.entries(TYPE_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">ID</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">النوع</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">المورد</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">الأولوية</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-50" />
                    <p>لا توجد تخصيصات</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const statusInfo = STATUS_LABELS[a.status] || STATUS_LABELS.NEW;
                  const priorityInfo = PRIORITY_OPTIONS.find(p => p.value === a.priority) || PRIORITY_OPTIONS[1];
                  const isUpdating = updatingId === a.id;

                  return (
                    <tr key={a.id} className="hover:bg-slate-25 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-600" dir="ltr">
                          {a.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {TYPE_LABELS[a.requestType] || a.requestType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-700">
                          {a.supplier?.companyName || a.supplierId.slice(0, 8) + '...'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">
                          {new Date(a.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusUpdate(a.id, e.target.value)}
                          disabled={isUpdating}
                          className="text-xs px-2 py-1 border border-slate-200 rounded-lg bg-white disabled:opacity-50"
                        >
                          {Object.entries(STATUS_LABELS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAssignments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              عرض {filteredAssignments.length} من {stats.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-sm font-bold text-slate-700">{page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={filteredAssignments.length < perPage}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">تخصيص جديد</h3>
            
            <div className="space-y-4">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  المورد <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.supplierId}
                  onChange={(e) => setCreateForm({ ...createForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="">اختر المورد...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.contactName || s.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Request Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  نوع الطلب <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.requestType}
                  onChange={(e) => setCreateForm({ ...createForm, requestType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  {Object.entries(TYPE_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
              </div>

              {/* Request ID */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  معرف الطلب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.requestId}
                  onChange={(e) => setCreateForm({ ...createForm, requestId: e.target.value })}
                  placeholder="UUID الخاص بالطلب..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الأولوية</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ملاحظات للمورد</label>
                <textarea
                  value={createForm.supplierNotes}
                  onChange={(e) => setCreateForm({ ...createForm, supplierNotes: e.target.value })}
                  placeholder="ملاحظات اختيارية..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
});

AdminAssignmentsCenter.displayName = 'AdminAssignmentsCenter';

export default AdminAssignmentsCenter;
