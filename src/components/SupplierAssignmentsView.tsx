import React, { useState, memo } from 'react';
import { FileText, Clock, CheckCircle, Truck, XCircle, History, Loader2, X } from 'lucide-react';
import { Api } from '../services/api';
import { Modal } from './Modal';

// Assignment Status Labels
const ASSIGNMENT_STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NEW: { label: 'جديد', color: 'bg-red-100 text-red-700 border-red-200', icon: <Clock className="w-4 h-4" /> },
  ACCEPTED: { label: 'مقبول', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle className="w-4 h-4" /> },
  IN_PROGRESS: { label: 'قيد التنفيذ', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  SHIPPED: { label: 'تم الشحن', color: 'bg-green-100 text-green-700 border-green-200', icon: <Truck className="w-4 h-4" /> },
  REJECTED: { label: 'مرفوض', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <XCircle className="w-4 h-4" /> },
  CANCELLED: { label: 'ملغي', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <X className="w-4 h-4" /> },
};

// Allowed next statuses for each current status
const ALLOWED_TRANSITIONS: Record<string, { status: string; label: string; color: string }[]> = {
  NEW: [
    { status: 'ACCEPTED', label: '✅ قبول', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { status: 'REJECTED', label: '❌ رفض', color: 'bg-red-500 hover:bg-red-600' }
  ],
  ACCEPTED: [
    { status: 'IN_PROGRESS', label: '⏳ بدء التنفيذ', color: 'bg-yellow-500 hover:bg-yellow-600' }
  ],
  IN_PROGRESS: [
    { status: 'SHIPPED', label: '🚚 تم الشحن', color: 'bg-blue-500 hover:bg-blue-600' }
  ],
  SHIPPED: [],
  REJECTED: [],
  CANCELLED: [],
};

// Request Type Labels
const REQUEST_TYPE_LABELS: Record<string, string> = {
  QUOTE: 'طلب عرض سعر',
  ORDER: 'طلب شراء',
  INSTALLMENT: 'طلب تقسيط',
  IMPORT: 'طلب استيراد',
  MISSING: 'طلب قطع مفقودة'
};

// Priority Labels
const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'منخفض', color: 'text-slate-500' },
  NORMAL: { label: 'عادي', color: 'text-blue-600' },
  HIGH: { label: 'عالي', color: 'text-orange-600' },
  URGENT: { label: 'عاجل', color: 'text-red-600 font-bold' }
};

interface AuditEntry {
  id: string;
  oldStatus: string;
  newStatus: string;
  changedByRole: string;
  notes?: string;
  changedAt: string;
}

interface SupplierAssignmentsViewProps {
  assignments: any[];
  onRefresh: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  t: (key: string) => string;
}

export const SupplierAssignmentsView = memo(({
  assignments,
  onRefresh,
  addToast,
  t
}: SupplierAssignmentsViewProps) => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ assignmentId: string; status: string } | null>(null);
  const [notes, setNotes] = useState('');

  // Handle status update
  const handleStatusUpdate = async (assignmentId: string, status: string, notes?: string) => {
    setUpdating(assignmentId);
    try {
      await Api.updateMyAssignmentStatus(assignmentId, { status, notes });
      addToast('تم تحديث حالة التخصيص بنجاح', 'success');
      onRefresh();
    } catch (error: any) {
      if (error?.status === 401) {
        addToast('يرجى تسجيل الدخول', 'error');
      } else if (error?.status === 403) {
        addToast('غير مصرح لك بهذا الإجراء', 'error');
      } else {
        addToast(error?.message || 'فشل تحديث الحالة', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  // Open notes modal before action
  const openNotesModal = (assignmentId: string, status: string) => {
    setPendingAction({ assignmentId, status });
    setNotes('');
    setNotesModalOpen(true);
  };

  // Confirm action with notes
  const confirmAction = () => {
    if (pendingAction) {
      handleStatusUpdate(pendingAction.assignmentId, pendingAction.status, notes || undefined);
      setNotesModalOpen(false);
      setPendingAction(null);
      setNotes('');
    }
  };

  // View audit logs
  const handleViewAudit = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setLoadingAudit(true);
    setAuditModalOpen(true);
    try {
      const logs = await Api.getMyAssignmentAudit(assignment.assignmentId || assignment.requestId);
      setAuditLogs(logs || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      addToast('فشل تحميل سجل التغييرات', 'error');
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Count by status
  const countByStatus = (status: string) => assignments.filter(a => a.status === status).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">الطلبات المخصصة لي</h2>
            <p className="text-sm text-slate-500">قم بمعالجة الطلبات وتحديث حالتها</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
            {countByStatus('NEW')} جديد
          </span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
            {countByStatus('ACCEPTED')} مقبول
          </span>
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
            {countByStatus('IN_PROGRESS')} قيد التنفيذ
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">
            {countByStatus('SHIPPED')} تم الشحن
          </span>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-600">لا توجد طلبات مخصصة</h3>
            <p className="text-slate-400">سيظهر هنا أي طلب جديد مخصص لك</p>
          </div>
        ) : (
          assignments.map(assignment => {
            const statusInfo = ASSIGNMENT_STATUS_LABELS[assignment.status] || ASSIGNMENT_STATUS_LABELS.NEW;
            const priorityInfo = PRIORITY_LABELS[assignment.priority] || PRIORITY_LABELS.NORMAL;
            const allowedActions = ALLOWED_TRANSITIONS[assignment.status] || [];
            const isUpdating = updating === (assignment.assignmentId || assignment.requestId);

            return (
              <div
                key={assignment.assignmentId || assignment.requestId}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Right side - Info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {REQUEST_TYPE_LABELS[assignment.type] || assignment.type}
                      </span>
                      <span className={`text-xs ${priorityInfo.color}`}>
                        ● {priorityInfo.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">رقم الطلب:</span>
                        <span className="font-bold text-slate-700 mr-1" dir="ltr">
                          {(assignment.requestId || assignment.assignmentId || '').slice(0, 8)}...
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">عدد الأصناف:</span>
                        <span className="font-bold text-slate-700 mr-1">
                          {assignment.linesCount || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">التاريخ:</span>
                        <span className="font-bold text-slate-700 mr-1">
                          {new Date(assignment.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      {assignment.totalValue && (
                        <div>
                          <span className="text-slate-400">القيمة:</span>
                          <span className="font-bold text-emerald-600 mr-1">
                            {assignment.totalValue.toLocaleString()} ر.س
                          </span>
                        </div>
                      )}
                    </div>

                    {assignment.notesForSupplier && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                        <strong>ملاحظات:</strong> {assignment.notesForSupplier}
                      </div>
                    )}
                  </div>

                  {/* Left side - Actions */}
                  <div className="flex flex-col gap-2 items-end">
                    {/* Status Actions */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      {allowedActions.map(action => (
                        <button
                          key={action.status}
                          onClick={() => openNotesModal(assignment.assignmentId || assignment.requestId, action.status)}
                          disabled={isUpdating}
                          className={`px-4 py-2 text-white rounded-xl font-bold text-sm transition-all ${action.color} disabled:opacity-50`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            action.label
                          )}
                        </button>
                      ))}
                      {allowedActions.length === 0 && (
                        <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm">
                          ✅ مكتمل
                        </span>
                      )}
                    </div>

                    {/* View Audit Button */}
                    <button
                      onClick={() => handleViewAudit(assignment)}
                      className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm"
                    >
                      <History size={16} />
                      سجل التغييرات
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notes Modal */}
      {notesModalOpen && (
        <Modal isOpen={true} onClose={() => { setNotesModalOpen(false); setPendingAction(null); }}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {pendingAction?.status === 'REJECTED' ? 'سبب الرفض' : 'ملاحظات (اختياري)'}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={pendingAction?.status === 'REJECTED' ? 'يرجى ذكر سبب الرفض...' : 'أضف ملاحظات إن وجدت...'}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setNotesModalOpen(false); setPendingAction(null); }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600"
              >
                تأكيد
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Audit Modal */}
      {auditModalOpen && (
        <Modal isOpen={true} onClose={() => { setAuditModalOpen(false); setSelectedAssignment(null); }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <History className="text-emerald-500" size={24} />
              <h3 className="text-lg font-bold text-slate-800">سجل التغييرات</h3>
            </div>

            {loadingAudit ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                لا توجد تغييرات مسجلة
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {auditLogs.map((log) => {
                  const oldStatusInfo = ASSIGNMENT_STATUS_LABELS[log.oldStatus] || { label: log.oldStatus, color: 'bg-slate-100 text-slate-600' };
                  const newStatusInfo = ASSIGNMENT_STATUS_LABELS[log.newStatus] || { label: log.newStatus, color: 'bg-slate-100 text-slate-600' };
                  
                  return (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${oldStatusInfo.color}`}>
                          {oldStatusInfo.label}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${newStatusInfo.color}`}>
                          {newStatusInfo.label}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>
                          بواسطة: {log.changedByRole === 'SUPPLIER' ? 'المورد' : 'المدير'}
                        </span>
                        <span>
                          {new Date(log.changedAt).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      {log.notes && (
                        <div className="mt-2 text-sm text-slate-600 bg-white p-2 rounded">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setAuditModalOpen(false); setSelectedAssignment(null); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
});

SupplierAssignmentsView.displayName = 'SupplierAssignmentsView';

export default SupplierAssignmentsView;
