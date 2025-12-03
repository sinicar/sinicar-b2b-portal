import React, { useState, useEffect } from 'react';
import { MockApi } from '../services/mockApi';
import { 
    AdminUser, Role, Permission, PermissionResource, PermissionAction,
    PERMISSION_RESOURCE_LABELS, PERMISSION_ACTION_LABELS, RESOURCE_AVAILABLE_ACTIONS
} from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { usePermission } from '../services/PermissionContext';
import { Modal } from './Modal';
import { 
    Users, Plus, Edit2, Trash2, UserCheck, UserX, Search, 
    Phone, Mail, Clock, Download, X, Check, AlertTriangle, Key,
    Shield, Settings, ChevronDown, ChevronUp, Save, Lock
} from 'lucide-react';

interface AdminUsersPageProps {
    onRefresh?: () => void;
}

type TabType = 'users' | 'roles';

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onRefresh }) => {
    const [activeTab, setActiveTab] = useState<TabType>('users');
    
    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Users className="text-[#C8A04F]" size={28} />
                        إدارة المستخدمين والأدوار
                    </h1>
                    <p className="text-slate-500 mt-1">إدارة حسابات المستخدمين الإداريين والأدوار والصلاحيات</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors ${
                                activeTab === 'users' 
                                    ? 'text-[#0B1B3A] border-b-2 border-[#C8A04F] bg-slate-50' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            data-testid="tab-users"
                        >
                            <Users size={20} />
                            المستخدمون
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors ${
                                activeTab === 'roles' 
                                    ? 'text-[#0B1B3A] border-b-2 border-[#C8A04F] bg-slate-50' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            data-testid="tab-roles"
                        >
                            <Shield size={20} />
                            الأدوار والصلاحيات
                        </button>
                    </div>
                </div>

                {activeTab === 'users' ? (
                    <UsersTab onRefresh={onRefresh} />
                ) : (
                    <RolesTab onRefresh={onRefresh} />
                )}
            </div>
        </div>
    );
};

interface UsersTabProps {
    onRefresh?: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ onRefresh }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Permission checks
    const { hasPermission } = usePermission();
    const canCreate = hasPermission('users', 'create');
    const canEdit = hasPermission('users', 'edit');
    const canDelete = hasPermission('users', 'delete');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showToggleConfirm, setShowToggleConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        roleId: '',
        isActive: true
    });
    
    const [newPassword, setNewPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const { addToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                MockApi.getAdminUsers(),
                MockApi.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
            if (rolesData.length > 0 && !formData.roleId) {
                setFormData(prev => ({ ...prev, roleId: rolesData[0].id }));
            }
        } catch (e) {
            console.error('Failed to load data', e);
            addToast('فشل في تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getRoleName = (roleId: string): string => {
        const role = roles.find(r => r.id === roleId);
        return role?.name || 'غير محدد';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);
        
        const matchesRole = roleFilter === 'ALL' || user.roleId === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || 
            (statusFilter === 'ACTIVE' && user.isActive) || 
            (statusFilter === 'INACTIVE' && !user.isActive);
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const resetForm = () => {
        setFormData({
            fullName: '',
            username: '',
            phone: '',
            email: '',
            password: '',
            roleId: roles.length > 0 ? roles[0].id : '',
            isActive: true
        });
        setFormError('');
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEdit = (user: AdminUser) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName,
            username: user.username,
            phone: user.phone,
            email: user.email || '',
            password: '',
            roleId: user.roleId,
            isActive: user.isActive
        });
        setFormError('');
        setShowEditModal(true);
    };

    const handleOpenDelete = (user: AdminUser) => {
        setSelectedUser(user);
        setShowDeleteConfirm(true);
    };

    const handleOpenToggle = (user: AdminUser) => {
        setSelectedUser(user);
        setShowToggleConfirm(true);
    };

    const handleOpenResetPassword = (user: AdminUser) => {
        setSelectedUser(user);
        setNewPassword('');
        setFormError('');
        setShowResetPasswordModal(true);
    };

    const validateForm = (isEdit: boolean = false): boolean => {
        if (!formData.fullName.trim()) {
            setFormError('الاسم الكامل مطلوب');
            return false;
        }
        if (!formData.username.trim()) {
            setFormError('اسم المستخدم مطلوب');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setFormError('اسم المستخدم يجب أن يحتوي على حروف إنجليزية وأرقام فقط');
            return false;
        }
        if (!formData.phone.trim()) {
            setFormError('رقم الجوال مطلوب');
            return false;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setFormError('البريد الإلكتروني غير صالح');
            return false;
        }
        if (!isEdit && !formData.password.trim()) {
            setFormError('كلمة المرور مطلوبة');
            return false;
        }
        if (!formData.roleId) {
            setFormError('الدور مطلوب');
            return false;
        }
        return true;
    };

    const handleAddUser = async () => {
        if (!validateForm(false)) return;
        
        setSubmitting(true);
        try {
            await MockApi.createAdminUser({
                fullName: formData.fullName,
                username: formData.username,
                phone: formData.phone,
                email: formData.email || undefined,
                password: formData.password,
                roleId: formData.roleId,
                isActive: formData.isActive
            });
            addToast('تم إضافة المستخدم بنجاح', 'success');
            setShowAddModal(false);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            setFormError(e.message || 'فشل في إضافة المستخدم');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser || !validateForm(true)) return;
        
        setSubmitting(true);
        try {
            await MockApi.updateAdminUser(selectedUser.id, {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email || undefined,
                roleId: formData.roleId,
                isActive: formData.isActive
            });
            addToast('تم تحديث بيانات المستخدم بنجاح', 'success');
            setShowEditModal(false);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            setFormError(e.message || 'فشل في تحديث المستخدم');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedUser) return;
        
        setSubmitting(true);
        try {
            await MockApi.toggleAdminUserStatus(selectedUser.id);
            const action = selectedUser.isActive ? 'إيقاف' : 'تفعيل';
            addToast(`تم ${action} المستخدم بنجاح`, 'success');
            setShowToggleConfirm(false);
            setSelectedUser(null);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            addToast(e.message || 'فشل في تغيير حالة المستخدم', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        
        if (!newPassword.trim()) {
            setFormError('كلمة المرور الجديدة مطلوبة');
            return;
        }
        
        setSubmitting(true);
        try {
            await MockApi.resetAdminUserPassword(selectedUser.id, newPassword);
            addToast('تم إعادة تعيين كلمة المرور بنجاح', 'success');
            setShowResetPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (e: any) {
            setFormError(e.message || 'فشل في إعادة تعيين كلمة المرور');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        
        setSubmitting(true);
        try {
            await MockApi.deleteAdminUser(selectedUser.id);
            addToast('تم حذف المستخدم بنجاح', 'success');
            setShowDeleteConfirm(false);
            setSelectedUser(null);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            addToast(e.message || 'فشل في حذف المستخدم', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportUsers = () => {
        const headers = ['الاسم الكامل', 'اسم المستخدم', 'رقم الجوال', 'البريد الإلكتروني', 'الدور', 'الحالة', 'آخر تسجيل دخول'];
        const rows = users.map(u => [
            u.fullName,
            u.username,
            u.phone,
            u.email || '-',
            getRoleName(u.roleId),
            u.isActive ? 'نشط' : 'موقوف',
            u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '-'
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        addToast('تم تصدير قائمة المستخدمين', 'success');
    };

    const getRoleBadge = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        const roleName = role?.name || 'غير محدد';
        const colors: Record<string, string> = {
            'مشرف عام': 'bg-purple-100 text-purple-800 border-purple-200',
            'مدير النظام': 'bg-blue-100 text-blue-800 border-blue-200',
            'مدير المبيعات': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'موظف مبيعات': 'bg-amber-100 text-amber-800 border-amber-200',
            'مشاهد فقط': 'bg-slate-100 text-slate-800 border-slate-200'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colors[roleName] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                {roleName}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                <Check size={12} /> نشط
            </span>
        ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                <X size={12} /> موقوف
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">جاري تحميل المستخدمين...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col lg:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم، اسم المستخدم، أو رقم الجوال..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            data-testid="input-search-users"
                        />
                    </div>
                    
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        data-testid="select-role-filter"
                    >
                        <option value="ALL">جميع الأدوار</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        data-testid="select-status-filter"
                    >
                        <option value="ALL">جميع الحالات</option>
                        <option value="ACTIVE">نشط</option>
                        <option value="INACTIVE">موقوف</option>
                    </select>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={handleExportUsers}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        data-testid="button-export-users"
                    >
                        <Download size={18} />
                        تصدير
                    </button>
                    {canCreate ? (
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] transition-colors"
                            data-testid="button-add-user"
                        >
                            <Plus size={18} />
                            إضافة مستخدم
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                            <Lock size={18} />
                            لا صلاحية للإضافة
                        </div>
                    )}
                </div>
            </div>

            {users.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold">لا يوجد مستخدمون حتى الآن</p>
                    <p className="text-sm mt-2">ابدأ بإضافة مستخدم جديد</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-sm">
                                <th className="text-right py-4 px-6 font-bold">الاسم الكامل</th>
                                <th className="text-right py-4 px-4 font-bold">اسم المستخدم</th>
                                <th className="text-right py-4 px-4 font-bold">رقم الجوال</th>
                                <th className="text-right py-4 px-4 font-bold">الدور</th>
                                <th className="text-center py-4 px-4 font-bold">الحالة</th>
                                <th className="text-right py-4 px-4 font-bold">آخر تسجيل دخول</th>
                                <th className="text-center py-4 px-4 font-bold">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        لا توجد نتائج مطابقة للبحث
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-user-${user.id}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#0B1B3A] flex items-center justify-center text-white font-bold">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{user.fullName}</p>
                                                    {user.email && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Mail size={12} /> {user.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{user.username}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="flex items-center gap-1 text-slate-600">
                                                <Phone size={14} className="text-slate-400" /> {user.phone}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">{getRoleBadge(user.roleId)}</td>
                                        <td className="py-4 px-4 text-center">{getStatusBadge(user.isActive)}</td>
                                        <td className="py-4 px-4">
                                            {user.lastLoginAt ? (
                                                <span className="flex items-center gap-1 text-slate-500 text-sm">
                                                    <Clock size={14} /> {formatDateTime(user.lastLoginAt)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">لم يسجل دخول</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {canEdit ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenEdit(user)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="تعديل"
                                                            data-testid={`button-edit-user-${user.id}`}
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenResetPassword(user)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="إعادة تعيين كلمة المرور"
                                                            data-testid={`button-reset-password-${user.id}`}
                                                        >
                                                            <Key size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenToggle(user)}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                user.isActive 
                                                                    ? 'text-amber-600 hover:bg-amber-50' 
                                                                    : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                            title={user.isActive ? 'إيقاف' : 'تفعيل'}
                                                            data-testid={`button-toggle-user-${user.id}`}
                                                        >
                                                            {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="p-2 text-slate-300" title="لا صلاحية للتعديل">
                                                        <Lock size={18} />
                                                    </span>
                                                )}
                                                {canDelete ? (
                                                    <button
                                                        onClick={() => handleOpenDelete(user)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="حذف"
                                                        data-testid={`button-delete-user-${user.id}`}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                ) : (
                                                    <span className="p-2 text-slate-300" title="لا صلاحية للحذف">
                                                        <Trash2 size={18} />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    إجمالي المستخدمين: <span className="font-bold text-slate-700">{users.length}</span>
                    {filteredUsers.length !== users.length && (
                        <span className="mr-2">• نتائج البحث: <span className="font-bold text-slate-700">{filteredUsers.length}</span></span>
                    )}
                </p>
                <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        نشط: {users.filter(u => u.isActive).length}
                    </span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                        موقوف: {users.filter(u => !u.isActive).length}
                    </span>
                </div>
            </div>

            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                    <div className="p-6 max-w-lg w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Plus className="text-[#C8A04F]" size={24} />
                            إضافة مستخدم جديد
                        </h2>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الاسم الكامل *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="أدخل الاسم الكامل"
                                    data-testid="input-user-fullname"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">رقم الجوال *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="05xxxxxxxx"
                                        dir="ltr"
                                        data-testid="input-user-phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="email@example.com"
                                        dir="ltr"
                                        data-testid="input-user-email"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">اسم المستخدم *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                                        placeholder="username"
                                        dir="ltr"
                                        data-testid="input-user-username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="أدخل كلمة المرور"
                                        dir="ltr"
                                        data-testid="input-user-password"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">الدور *</label>
                                    <select
                                        value={formData.roleId}
                                        onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        data-testid="select-user-role"
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">الحالة *</label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        data-testid="select-user-status"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">موقوف</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-add"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] transition-colors disabled:opacity-50"
                                data-testid="button-confirm-add"
                            >
                                {submitting ? 'جاري الإضافة...' : 'إضافة المستخدم'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showEditModal && selectedUser && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div className="p-6 max-w-lg w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Edit2 className="text-[#C8A04F]" size={24} />
                            تعديل بيانات المستخدم
                        </h2>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الاسم الكامل *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    data-testid="input-edit-user-fullname"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">رقم الجوال *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        dir="ltr"
                                        data-testid="input-edit-user-phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        dir="ltr"
                                        data-testid="input-edit-user-email"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">الدور *</label>
                                    <select
                                        value={formData.roleId}
                                        onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        data-testid="select-edit-user-role"
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">الحالة *</label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        data-testid="select-edit-user-status"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">موقوف</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        handleOpenResetPassword(selectedUser);
                                    }}
                                    className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-bold text-sm"
                                    data-testid="button-reset-password-in-edit"
                                >
                                    <Key size={16} />
                                    إعادة تعيين كلمة المرور
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-edit"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleEditUser}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                data-testid="button-confirm-edit"
                            >
                                {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showResetPasswordModal && selectedUser && (
                <Modal isOpen={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)}>
                    <div className="p-6 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Key className="text-purple-600" size={24} />
                            إعادة تعيين كلمة المرور
                        </h2>
                        
                        <p className="text-slate-600 mb-4">
                            إعادة تعيين كلمة المرور للمستخدم: <span className="font-bold">{selectedUser.fullName}</span>
                        </p>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور الجديدة *</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                placeholder="أدخل كلمة المرور الجديدة"
                                dir="ltr"
                                data-testid="input-new-password"
                            />
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowResetPasswordModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-reset-password"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                                data-testid="button-confirm-reset-password"
                            >
                                {submitting ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showToggleConfirm && selectedUser && (
                <Modal isOpen={showToggleConfirm} onClose={() => setShowToggleConfirm(false)}>
                    <div className="p-6 max-w-md w-full text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            selectedUser.isActive ? 'bg-amber-100' : 'bg-green-100'
                        }`}>
                            {selectedUser.isActive ? (
                                <UserX className="text-amber-600" size={32} />
                            ) : (
                                <UserCheck className="text-green-600" size={32} />
                            )}
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">
                            {selectedUser.isActive ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}
                        </h2>
                        <p className="text-slate-600 mb-6">
                            هل تريد تغيير حالة هذا المستخدم؟
                            <br />
                            <span className="font-bold text-slate-800">{selectedUser.fullName}</span>
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowToggleConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-toggle"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                disabled={submitting}
                                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold transition-colors disabled:opacity-50 ${
                                    selectedUser.isActive 
                                        ? 'bg-amber-600 hover:bg-amber-700' 
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                                data-testid="button-confirm-toggle"
                            >
                                {submitting ? 'جاري التنفيذ...' : (selectedUser.isActive ? 'إيقاف' : 'تفعيل')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteConfirm && selectedUser && (
                <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                    <div className="p-6 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-600" size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">حذف المستخدم</h2>
                        <p className="text-slate-600 mb-6">
                            هل أنت متأكد أنك تريد حذف هذا المستخدم؟
                            <br />
                            <span className="font-bold text-slate-800">{selectedUser.fullName}</span>
                            <br />
                            <span className="text-sm text-red-600">هذا الإجراء لا يمكن التراجع عنه</span>
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-delete"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                data-testid="button-confirm-delete"
                            >
                                {submitting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

interface RolesTabProps {
    onRefresh?: () => void;
}

const RolesTab: React.FC<RolesTabProps> = ({ onRefresh }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPermissionsEditor, setShowPermissionsEditor] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const { addToast } = useToast();
    
    // Permission checks for roles management
    const { hasPermission } = usePermission();
    const canCreateRole = hasPermission('roles', 'create');
    const canEditRole = hasPermission('roles', 'edit');
    const canDeleteRole = hasPermission('roles', 'delete');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const rolesData = await MockApi.getRoles();
            setRoles(rolesData);
            
            const counts: Record<string, number> = {};
            for (const role of rolesData) {
                counts[role.id] = await MockApi.getUserCountByRole(role.id);
            }
            setUserCounts(counts);
        } catch (e) {
            console.error('Failed to load roles', e);
            addToast('فشل في تحميل الأدوار', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setFormError('');
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEdit = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || ''
        });
        setFormError('');
        setShowEditModal(true);
    };

    const handleOpenPermissions = (role: Role) => {
        setSelectedRole(role);
        setEditPermissions(JSON.parse(JSON.stringify(role.permissions)));
        setShowPermissionsEditor(true);
    };

    const handleOpenDelete = (role: Role) => {
        setSelectedRole(role);
        setShowDeleteConfirm(true);
    };

    const handleAddRole = async () => {
        if (!formData.name.trim()) {
            setFormError('اسم الدور مطلوب');
            return;
        }
        
        setSubmitting(true);
        try {
            await MockApi.createRole({
                name: formData.name,
                description: formData.description || undefined,
                permissions: [],
                isSystem: false
            });
            addToast('تم إضافة الدور بنجاح', 'success');
            setShowAddModal(false);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            setFormError(e.message || 'فشل في إضافة الدور');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditRole = async () => {
        if (!selectedRole) return;
        
        if (!formData.name.trim()) {
            setFormError('اسم الدور مطلوب');
            return;
        }
        
        setSubmitting(true);
        try {
            await MockApi.updateRole(selectedRole.id, {
                name: formData.name,
                description: formData.description || undefined
            });
            addToast('تم تحديث الدور بنجاح', 'success');
            setShowEditModal(false);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            setFormError(e.message || 'فشل في تحديث الدور');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        
        setSubmitting(true);
        try {
            await MockApi.updateRole(selectedRole.id, {
                permissions: editPermissions
            });
            addToast('تم حفظ الصلاحيات بنجاح', 'success');
            setShowPermissionsEditor(false);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            addToast(e.message || 'فشل في حفظ الصلاحيات', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        
        setSubmitting(true);
        try {
            await MockApi.deleteRole(selectedRole.id);
            addToast('تم حذف الدور بنجاح', 'success');
            setShowDeleteConfirm(false);
            setSelectedRole(null);
            loadData();
            onRefresh?.();
        } catch (e: any) {
            addToast(e.message || 'فشل في حذف الدور', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const togglePermissionAction = (resource: PermissionResource, action: PermissionAction) => {
        setEditPermissions(prev => {
            const existing = prev.find(p => p.resource === resource);
            if (existing) {
                if (existing.actions.includes(action)) {
                    const newActions = existing.actions.filter(a => a !== action);
                    if (newActions.length === 0) {
                        return prev.filter(p => p.resource !== resource);
                    }
                    return prev.map(p => p.resource === resource ? { ...p, actions: newActions } : p);
                } else {
                    return prev.map(p => p.resource === resource ? { ...p, actions: [...p.actions, action] } : p);
                }
            } else {
                return [...prev, { resource, actions: [action] }];
            }
        });
    };

    const hasPermissionAction = (resource: PermissionResource, action: PermissionAction): boolean => {
        const permission = editPermissions.find(p => p.resource === resource);
        return permission?.actions.includes(action) || false;
    };

    const toggleAllActionsForResource = (resource: PermissionResource) => {
        const availableActions = RESOURCE_AVAILABLE_ACTIONS[resource];
        const currentPermission = editPermissions.find(p => p.resource === resource);
        const hasAllActions = currentPermission?.actions.length === availableActions.length;
        
        setEditPermissions(prev => {
            if (hasAllActions) {
                return prev.filter(p => p.resource !== resource);
            } else {
                const filtered = prev.filter(p => p.resource !== resource);
                return [...filtered, { resource, actions: [...availableActions] }];
            }
        });
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">جاري تحميل الأدوار...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <p className="text-slate-600">إدارة الأدوار وتحديد صلاحيات كل دور</p>
                {canCreateRole ? (
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] transition-colors"
                        data-testid="button-add-role"
                    >
                        <Plus size={18} />
                        إضافة دور جديد
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                        <Lock size={18} />
                        لا صلاحية للإضافة
                    </div>
                )}
            </div>

            {roles.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                    <Shield size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold">لا توجد أدوار حتى الآن</p>
                    <p className="text-sm mt-2">ابدأ بإضافة دور جديد</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {roles.map(role => (
                        <div key={role.id} className="p-4 hover:bg-slate-50 transition-colors" data-testid={`row-role-${role.id}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-slate-800 text-lg">{role.name}</h3>
                                        {role.isSystem && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                دور نظامي
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                            {userCounts[role.id] || 0} مستخدم
                                        </span>
                                    </div>
                                    {role.description && (
                                        <p className="text-sm text-slate-500">{role.description}</p>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {role.permissions.slice(0, 5).map(p => (
                                            <span key={p.resource} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                {PERMISSION_RESOURCE_LABELS[p.resource]}
                                            </span>
                                        ))}
                                        {role.permissions.length > 5 && (
                                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                                +{role.permissions.length - 5} أخرى
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {canEditRole ? (
                                        <>
                                            <button
                                                onClick={() => handleOpenPermissions(role)}
                                                className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-bold text-sm"
                                                data-testid={`button-permissions-role-${role.id}`}
                                            >
                                                <Settings size={16} />
                                                الصلاحيات
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(role)}
                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="تعديل"
                                                data-testid={`button-edit-role-${role.id}`}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="p-2 text-slate-300" title="لا صلاحية للتعديل">
                                            <Lock size={18} />
                                        </span>
                                    )}
                                    {!role.isSystem && canDeleteRole && (
                                        <button
                                            onClick={() => handleOpenDelete(role)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف"
                                            data-testid={`button-delete-role-${role.id}`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {!role.isSystem && !canDeleteRole && (
                                        <span className="p-2 text-slate-300" title="لا صلاحية للحذف">
                                            <Trash2 size={18} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <p className="text-sm text-slate-500">
                    إجمالي الأدوار: <span className="font-bold text-slate-700">{roles.length}</span>
                    <span className="mr-2">• أدوار نظامية: <span className="font-bold text-slate-700">{roles.filter(r => r.isSystem).length}</span></span>
                </p>
            </div>

            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                    <div className="p-6 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Plus className="text-[#C8A04F]" size={24} />
                            إضافة دور جديد
                        </h2>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم الدور *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="أدخل اسم الدور بالعربية"
                                    data-testid="input-role-name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">وصف الدور</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="أدخل وصف مختصر للدور"
                                    rows={3}
                                    data-testid="input-role-description"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-add-role"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddRole}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] transition-colors disabled:opacity-50"
                                data-testid="button-confirm-add-role"
                            >
                                {submitting ? 'جاري الإضافة...' : 'إضافة الدور'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showEditModal && selectedRole && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div className="p-6 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Edit2 className="text-[#C8A04F]" size={24} />
                            تعديل الدور
                        </h2>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم الدور *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    data-testid="input-edit-role-name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">وصف الدور</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                    data-testid="input-edit-role-description"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-edit-role"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleEditRole}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                data-testid="button-confirm-edit-role"
                            >
                                {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showPermissionsEditor && selectedRole && (
                <Modal isOpen={showPermissionsEditor} onClose={() => setShowPermissionsEditor(false)}>
                    <div className="p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Shield className="text-[#C8A04F]" size={24} />
                                صلاحيات: {selectedRole.name}
                            </h2>
                            {selectedRole.isSystem && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                                    دور نظامي
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
                            <table className="w-full">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600 border-b">المورد</th>
                                        {(['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'] as PermissionAction[]).map(action => (
                                            <th key={action} className="text-center py-3 px-2 font-bold text-slate-600 border-b text-xs">
                                                {PERMISSION_ACTION_LABELS[action]}
                                            </th>
                                        ))}
                                        <th className="text-center py-3 px-2 font-bold text-slate-600 border-b text-xs">أخرى</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(Object.keys(PERMISSION_RESOURCE_LABELS) as PermissionResource[]).map(resource => {
                                        const availableActions = RESOURCE_AVAILABLE_ACTIONS[resource];
                                        const currentPermission = editPermissions.find(p => p.resource === resource);
                                        const hasAllActions = currentPermission?.actions.length === availableActions.length;
                                        
                                        return (
                                            <tr key={resource} className="hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={hasAllActions}
                                                            onChange={() => toggleAllActionsForResource(resource)}
                                                            className="w-4 h-4 rounded border-slate-300"
                                                            data-testid={`checkbox-all-${resource}`}
                                                        />
                                                        <span className="font-medium text-slate-700">
                                                            {PERMISSION_RESOURCE_LABELS[resource]}
                                                        </span>
                                                    </div>
                                                </td>
                                                {(['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'] as PermissionAction[]).map(action => (
                                                    <td key={action} className="text-center py-3 px-2">
                                                        {availableActions.includes(action) ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={hasPermissionAction(resource, action)}
                                                                onChange={() => togglePermissionAction(resource, action)}
                                                                className="w-4 h-4 rounded border-slate-300"
                                                                data-testid={`checkbox-${resource}-${action}`}
                                                            />
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="text-center py-3 px-2">
                                                    {availableActions.filter(a => !['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'].includes(a)).length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            {availableActions.filter(a => !['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'].includes(a)).map(action => (
                                                                <label key={action} className="flex items-center gap-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={hasPermissionAction(resource, action)}
                                                                        onChange={() => togglePermissionAction(resource, action)}
                                                                        className="w-3 h-3 rounded border-slate-300"
                                                                    />
                                                                    {PERMISSION_ACTION_LABELS[action]}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowPermissionsEditor(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-permissions"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSavePermissions}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                data-testid="button-save-permissions"
                            >
                                <Save size={18} />
                                {submitting ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteConfirm && selectedRole && (
                <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                    <div className="p-6 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-600" size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">حذف الدور</h2>
                        <p className="text-slate-600 mb-6">
                            هل أنت متأكد أنك تريد حذف هذا الدور؟
                            <br />
                            <span className="font-bold text-slate-800">{selectedRole.name}</span>
                            <br />
                            <span className="text-sm text-red-600">هذا الإجراء لا يمكن التراجع عنه</span>
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                data-testid="button-cancel-delete-role"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteRole}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                data-testid="button-confirm-delete-role"
                            >
                                {submitting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};
