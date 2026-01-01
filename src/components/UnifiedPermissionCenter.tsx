/**
 * UnifiedPermissionCenter - مركز الصلاحيات الموحد
 * يدمج: AdminUsersPage + AdminPermissionCenter + AdminOrganizationSettings
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Api from '../services/api';
import { useToast } from '../services/ToastContext';
import { usePermission } from '../services/PermissionContext';
import { Modal } from './Modal';
import {
    AdminUser, Role, Permission, PermissionResource, PermissionAction,
    PERMISSION_RESOURCE_LABELS, PERMISSION_ACTION_LABELS, RESOURCE_AVAILABLE_ACTIONS,
    ExtendedUserRole, UserAccountStatus, OrganizationSettings, Organization, ScopedPermissionKey
} from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { PermissionHeader, PermissionTabs } from '../features/permissions/components';
import { TabType as PermTabType } from '../features/permissions/types';
import {
    Shield, Users, Key, Settings, Eye, Building2, Search, Plus, Trash2, Edit2,
    Check, X, ChevronDown, ChevronRight, RefreshCw, Lock, Unlock, UserCheck,
    UserX, Filter, Save, AlertTriangle, Layers, ToggleLeft, ToggleRight,
    Phone, Mail, Clock, Download, Ban, CheckCircle, XCircle, MessageCircle,
    Store, Megaphone, UserPlus, Activity, Info
} from 'lucide-react';

// ========== TYPES ==========

type TabType = 'staff' | 'customers' | 'suppliers' | 'overrides' | 'organizations';

interface TabConfig {
    id: TabType;
    icon: React.ReactNode;
    labelKey: string;
    labelAr: string;
    color: string;
}

const TAB_CONFIG: TabConfig[] = [
    { id: 'staff', icon: <Users size={20} />, labelKey: 'permissions.staff', labelAr: 'موظفي المنصة', color: 'blue' },
    { id: 'customers', icon: <UserCheck size={20} />, labelKey: 'permissions.customers', labelAr: 'صلاحيات العملاء', color: 'emerald' },
    { id: 'suppliers', icon: <Store size={20} />, labelKey: 'permissions.suppliers', labelAr: 'صلاحيات الموردين', color: 'purple' },
    { id: 'overrides', icon: <UserPlus size={20} />, labelKey: 'permissions.overrides', labelAr: 'استثناءات فردية', color: 'amber' },
    { id: 'organizations', icon: <Building2 size={20} />, labelKey: 'organizations.settings', labelAr: 'إعدادات المنظمات', color: 'slate' }
];

// ========== MAIN COMPONENT ==========

export const UnifiedPermissionCenter: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('staff');
    const [loading, setLoading] = useState(true);

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <PermissionHeader
                title={t('unifiedPermissions.title', 'مركز الصلاحيات المتقدم')}
                subtitle={t('unifiedPermissions.subtitle', 'إدارة صلاحيات الموظفين والعملاء والموردين')}
            />

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <PermissionTabs
                    tabs={TAB_CONFIG}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    translate={t}
                />

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'staff' && <StaffPermissionsTab />}
                    {activeTab === 'customers' && <CustomerPermissionsTab />}
                    {activeTab === 'suppliers' && <SupplierPermissionsTab />}
                    {activeTab === 'overrides' && <OverridesTab />}
                    {activeTab === 'organizations' && <OrganizationsTabContent />}
                </div>
            </div>
        </div>
    );
};

// ========== PLATFORM STAFF PERMISSIONS ==========

const STAFF_PERMISSIONS = [
    { id: 'approve_accounts', name: 'الموافقة على الحسابات', description: 'الموافقة/رفض طلبات فتح الحسابات الجديدة', category: 'accounts' },
    { id: 'edit_order_status', name: 'تعديل حالة الطلبات', description: 'تغيير حالة طلبات العملاء', category: 'orders' },
    { id: 'view_all_orders', name: 'عرض جميع الطلبات', description: 'رؤية طلبات كل العملاء', category: 'orders' },
    { id: 'export_excel', name: 'تصدير Excel', description: 'تحميل بيانات بصيغة Excel', category: 'data' },
    { id: 'export_database', name: 'تصدير قاعدة البيانات', description: 'تحميل نسخة من البيانات الكاملة', category: 'data' },
    { id: 'manage_products', name: 'إدارة المنتجات', description: 'إضافة/تعديل/حذف المنتجات', category: 'products' },
    { id: 'manage_prices', name: 'إدارة الأسعار', description: 'تعديل أسعار المنتجات', category: 'products' },
    { id: 'manage_customers', name: 'إدارة العملاء', description: 'إضافة/تعديل/حذف العملاء', category: 'customers' },
    { id: 'manage_suppliers', name: 'إدارة الموردين', description: 'إضافة/تعديل/حذف الموردين', category: 'suppliers' },
    { id: 'view_reports', name: 'عرض التقارير', description: 'الوصول لصفحة التقارير', category: 'reports' },
    { id: 'manage_settings', name: 'إدارة الإعدادات', description: 'تعديل إعدادات النظام', category: 'system' },
    { id: 'manage_permissions', name: 'إدارة الصلاحيات', description: 'تعديل صلاحيات المستخدمين', category: 'system' },
];

const STORAGE_KEY_STAFF_PERMS = 'sini_staff_permissions';
const STORAGE_KEY_STAFF_USERS = 'sini_staff_users';

interface StaffRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem?: boolean;
}

interface StaffUser {
    id: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    roleId: string;
    isActive: boolean;
    createdAt: string;
}

const StaffPermissionsTab: React.FC = () => {
    const { addToast } = useToast();
    const [subTab, setSubTab] = useState<'users' | 'roles'>('users');
    const [roles, setRoles] = useState<StaffRole[]>([]);
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', phone: '', roleId: '' });
    const [editPermissions, setEditPermissions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        setLoading(true);
        try {
            // Load roles
            const storedRoles = localStorage.getItem(STORAGE_KEY_STAFF_PERMS);
            const rolesData = storedRoles ? JSON.parse(storedRoles) : [
                { id: 'super_admin', name: 'المدير العام', description: 'صلاحيات كاملة', permissions: STAFF_PERMISSIONS.map(p => p.id), isSystem: true },
                { id: 'order_manager', name: 'مدير الطلبات', description: 'إدارة الطلبات فقط', permissions: ['view_all_orders', 'edit_order_status'] },
                { id: 'data_entry', name: 'مدخل بيانات', description: 'إدخال بيانات المنتجات', permissions: ['manage_products'] },
            ];
            setRoles(rolesData);

            // Load users
            const storedUsers = localStorage.getItem(STORAGE_KEY_STAFF_USERS);
            const usersData = storedUsers ? JSON.parse(storedUsers) : [];
            setUsers(usersData);
        } catch (e) {
            console.error('Failed to load staff data', e);
        } finally {
            setLoading(false);
        }
    };

    const saveRoles = (newRoles: StaffRole[]) => {
        localStorage.setItem(STORAGE_KEY_STAFF_PERMS, JSON.stringify(newRoles));
        setRoles(newRoles);
    };

    const saveUsers = (newUsers: StaffUser[]) => {
        localStorage.setItem(STORAGE_KEY_STAFF_USERS, JSON.stringify(newUsers));
        setUsers(newUsers);
    };

    // Role handlers
    const handleAddRole = () => {
        if (!formData.name.trim()) return;
        const newRole: StaffRole = {
            id: `role_${Date.now()}`,
            name: formData.name.trim(),
            description: formData.description.trim(),
            permissions: editPermissions
        };
        saveRoles([...roles, newRole]);
        addToast('تم إضافة الدور بنجاح', 'success');
        setShowAddModal(false);
        setFormData({ name: '', description: '' });
        setEditPermissions([]);
    };

    const handleEditRole = () => {
        if (!selectedRole || !formData.name.trim()) return;
        const updated = roles.map(r => r.id === selectedRole.id ? {
            ...r,
            name: formData.name.trim(),
            description: formData.description.trim(),
            permissions: editPermissions
        } : r);
        saveRoles(updated);
        addToast('تم تحديث الدور بنجاح', 'success');
        setShowEditModal(false);
    };

    const handleDeleteRole = (role: StaffRole) => {
        if (role.isSystem) { addToast('لا يمكن حذف دور النظام', 'error'); return; }
        if (users.some(u => u.roleId === role.id)) { addToast('لا يمكن حذف دور مرتبط بموظفين', 'error'); return; }
        if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
        saveRoles(roles.filter(r => r.id !== role.id));
        addToast('تم حذف الدور', 'success');
    };

    // User handlers
    const handleAddUser = () => {
        if (!userFormData.name.trim() || !userFormData.email.trim() || !userFormData.password.trim() || !userFormData.phone.trim() || !userFormData.roleId) {
            addToast('يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور، الهاتف، الدور)', 'error');
            return;
        }
        const newUser: StaffUser = {
            id: `staff_${Date.now()}`,
            name: userFormData.name.trim(),
            email: userFormData.email.trim(),
            password: userFormData.password.trim(),
            phone: userFormData.phone.trim() || undefined,
            roleId: userFormData.roleId,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        saveUsers([...users, newUser]);
        addToast(`تمت إضافة الموظف "${newUser.name}" بنجاح - كلمة المرور: ${userFormData.password}`, 'success');
        setShowAddUserModal(false);
        setUserFormData({ name: '', email: '', password: '', phone: '', roleId: '' });
    };

    const handleDeleteUser = (user: StaffUser) => {
        if (!confirm(`هل أنت متأكد من حذف "${user.name}"؟`)) return;
        saveUsers(users.filter(u => u.id !== user.id));
        addToast('تم حذف الموظف', 'success');
    };

    const toggleUserStatus = (userId: string) => {
        const updated = users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u);
        saveUsers(updated);
        addToast('تم تحديث حالة الموظف', 'success');
    };

    const openEdit = (role: StaffRole) => {
        setSelectedRole(role);
        setFormData({ name: role.name, description: role.description });
        setEditPermissions([...role.permissions]);
        setShowEditModal(true);
    };

    const togglePermission = (permId: string) => {
        setEditPermissions(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
    };

    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'غير محدد';
    const getRolePermissions = (roleId: string) => roles.find(r => r.id === roleId)?.permissions || [];

    const categories = [...new Set(STAFF_PERMISSIONS.map(p => p.category))];

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>;
    }

    return (
        <>
            {/* Sub-tabs */}
            <div className="border-b border-slate-200 flex">
                <button
                    onClick={() => setSubTab('users')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold ${subTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                    <Users size={18} /> الموظفون ({users.length})
                </button>
                <button
                    onClick={() => setSubTab('roles')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold ${subTab === 'roles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                    <Shield size={18} /> الأدوار ({roles.length})
                </button>
            </div>

            {subTab === 'users' ? (
                <>
                    {/* Users Header */}
                    <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-700">موظفي المنصة</h3>
                            <p className="text-sm text-slate-500">إضافة موظفين جدد وربطهم بالأدوار</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="بحث..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>
                            <button onClick={() => { setUserFormData({ name: '', email: '', password: '', phone: '', roleId: roles[0]?.id || '' }); setShowAddUserModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                                <Plus size={18} /> إضافة موظف
                            </button>
                        </div>
                    </div>

                    {/* Users List */}
                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Users size={48} className="mx-auto mb-4" />
                            <p className="font-bold mb-2">لا يوجد موظفين</p>
                            <p className="text-sm">اضغط "إضافة موظف" لإضافة موظف جديد</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-right py-3 px-4 font-bold text-slate-600">الاسم</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600">البريد الإلكتروني</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600">الدور</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600">الحالة</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{user.name}</p>
                                                        {user.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                                    {getRoleName(user.roleId)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => toggleUserStatus(user.id)}
                                                    className={`px-3 py-1 rounded-full text-sm font-bold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {user.isActive ? 'فعال' : 'معطل'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Roles Header */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-700">أدوار الموظفين</h3>
                            <p className="text-sm text-slate-500">تحديد صلاحيات كل دور بشكل دقيق</p>
                        </div>
                        <button onClick={() => { setFormData({ name: '', description: '' }); setEditPermissions([]); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                            <Plus size={18} /> إضافة دور
                        </button>
                    </div>

                    {/* Roles Grid */}
                    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roles.map(role => (
                            <div key={role.id} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-blue-900 flex items-center gap-2">
                                            <Shield size={16} className="text-blue-600" />
                                            {role.name}
                                            {role.isSystem && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">نظام</span>}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-blue-700 mb-3">
                                    <span>{role.permissions.length} صلاحية</span>
                                    <span>{users.filter(u => u.roleId === role.id).length} موظف</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(role)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 text-sm">
                                        <Edit2 size={14} /> تعديل
                                    </button>
                                    {!role.isSystem && (
                                        <button onClick={() => handleDeleteRole(role)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)}>
                    <div className="p-6 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <UserPlus className="text-blue-600" size={24} /> إضافة موظف جديد
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم الموظف *</label>
                                <input type="text" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="مثال: أحمد محمد" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">البريد الإلكتروني *</label>
                                <input type="email" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="example@company.com" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور *</label>
                                <input type="password" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="كلمة مرور الدخول" dir="ltr" />
                                <p className="text-xs text-slate-400 mt-1">سيستخدمها الموظف لتسجيل الدخول</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">رقم الهاتف *</label>
                                <input type="tel" value={userFormData.phone} onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="05xxxxxxxx" dir="ltr" />
                                <p className="text-xs text-emerald-600 mt-1">✓ يمكن للموظف الدخول برقم الهاتف أو البريد الإلكتروني</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الدور *</label>
                                <select value={userFormData.roleId} onChange={e => setUserFormData({ ...userFormData, roleId: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
                                    <option value="">اختر دور...</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {userFormData.roleId && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                    <p className="text-sm font-bold text-blue-700 mb-2">صلاحيات هذا الدور:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {getRolePermissions(userFormData.roleId).slice(0, 5).map(p => (
                                            <span key={p} className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                                {STAFF_PERMISSIONS.find(sp => sp.id === p)?.name || p}
                                            </span>
                                        ))}
                                        {getRolePermissions(userFormData.roleId).length > 5 && (
                                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                +{getRolePermissions(userFormData.roleId).length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                                <Save size={18} /> إضافة الموظف
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Add/Edit Role Modal */}
            {(showAddModal || showEditModal) && (
                <Modal isOpen={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); }}>
                    <div className="p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Shield className="text-blue-600" size={24} />
                            {showAddModal ? 'إضافة دور جديد' : 'تعديل الدور'}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم الدور *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="مثال: مدير المبيعات" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الوصف</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="وصف اختياري" />
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Key size={16} className="text-blue-600" /> الصلاحيات
                                    <span className="text-sm font-normal text-slate-500">({editPermissions.length} محددة)</span>
                                </h4>
                            </div>
                            <div className="p-4 space-y-4">
                                {categories.map(cat => (
                                    <div key={cat}>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">{cat}</p>
                                        <div className="grid md:grid-cols-2 gap-2">
                                            {STAFF_PERMISSIONS.filter(p => p.category === cat).map(perm => (
                                                <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${editPermissions.includes(perm.id) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'} border`}>
                                                    <input type="checkbox" checked={editPermissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="mt-1 w-4 h-4 rounded text-blue-600" />
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-700">{perm.name}</p>
                                                        <p className="text-xs text-slate-500">{perm.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={showAddModal ? handleAddRole : handleEditRole} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                                <Save size={18} /> حفظ
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

// ========== CUSTOMER PERMISSIONS TAB ==========

const CUSTOMER_FEATURES = [
    { id: 'view_products', name: 'عرض المنتجات', defaultEnabled: true },
    { id: 'place_orders', name: 'إنشاء الطلبات', defaultEnabled: true },
    { id: 'view_orders', name: 'عرض سجل الطلبات', defaultEnabled: true },
    { id: 'request_quotes', name: 'طلب عروض أسعار', defaultEnabled: true },
    { id: 'trader_tools', name: 'أدوات التاجر', defaultEnabled: false },
    { id: 'import_china', name: 'الاستيراد من الصين', defaultEnabled: true },
    { id: 'manage_team', name: 'إدارة الفريق', defaultEnabled: false },
    { id: 'view_reports', name: 'عرض التقارير', defaultEnabled: false },
    { id: 'bulk_orders', name: 'الطلبات الجماعية', defaultEnabled: false },
    { id: 'credit_limit', name: 'الشراء بالآجل', defaultEnabled: false },
];

const STORAGE_KEY_CUSTOMER_DEFAULTS = 'sini_customer_defaults';

const CustomerPermissionsTab: React.FC = () => {
    const { addToast } = useToast();
    const [features, setFeatures] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => { loadDefaults(); }, []);

    const loadDefaults = () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY_CUSTOMER_DEFAULTS);
            if (stored) {
                setFeatures(JSON.parse(stored));
            } else {
                const defaults: Record<string, boolean> = {};
                CUSTOMER_FEATURES.forEach(f => defaults[f.id] = f.defaultEnabled);
                setFeatures(defaults);
            }
        } catch (e) {
            console.error('Failed to load customer defaults', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeature = (id: string) => {
        setFeatures(prev => ({ ...prev, [id]: !prev[id] }));
        setHasChanges(true);
    };

    const saveDefaults = () => {
        localStorage.setItem(STORAGE_KEY_CUSTOMER_DEFAULTS, JSON.stringify(features));
        addToast('تم حفظ الإعدادات الافتراضية للعملاء', 'success');
        setHasChanges(false);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-emerald-500" size={32} /></div>;
    }

    return (
        <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-700">الصلاحيات الافتراضية للعملاء</h3>
                    <p className="text-sm text-slate-500">هذه الميزات ستكون متاحة لكل العملاء الجدد افتراضياً</p>
                </div>
                <button onClick={saveDefaults} disabled={!hasChanges} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
                    <Save size={18} /> حفظ الإعدادات
                </button>
            </div>

            <div className="p-4 grid gap-3 md:grid-cols-2">
                {CUSTOMER_FEATURES.map(feature => (
                    <div key={feature.id} className={`flex items-center justify-between p-4 rounded-xl border ${features[feature.id] ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${features[feature.id] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {features[feature.id] ? <Check size={20} /> : <X size={20} />}
                            </div>
                            <span className="font-bold text-slate-700">{feature.name}</span>
                        </div>
                        <button
                            onClick={() => toggleFeature(feature.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${features[feature.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${features[feature.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Info size={16} />
                    <span>لإعطاء صلاحيات خاصة لعميل معين، استخدم تبويب "استثناءات فردية"</span>
                </div>
            </div>
        </>
    );
};

// ========== SUPPLIER PERMISSIONS TAB ==========

const SUPPLIER_FEATURES = [
    { id: 'view_catalog', name: 'عرض الكتالوج', defaultEnabled: true },
    { id: 'manage_products', name: 'إدارة منتجاتهم', defaultEnabled: true },
    { id: 'view_orders', name: 'عرض الطلبات الموردة', defaultEnabled: true },
    { id: 'view_reports', name: 'عرض تقارير المبيعات', defaultEnabled: true },
    { id: 'manage_prices', name: 'تعديل الأسعار', defaultEnabled: false },
    { id: 'manage_inventory', name: 'إدارة المخزون', defaultEnabled: true },
    { id: 'receive_notifications', name: 'استلام الإشعارات', defaultEnabled: true },
    { id: 'api_access', name: 'الوصول عبر API', defaultEnabled: false },
];

const STORAGE_KEY_SUPPLIER_DEFAULTS = 'sini_supplier_defaults';

const SupplierPermissionsTab: React.FC = () => {
    const { addToast } = useToast();
    const [features, setFeatures] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => { loadDefaults(); }, []);

    const loadDefaults = () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY_SUPPLIER_DEFAULTS);
            if (stored) {
                setFeatures(JSON.parse(stored));
            } else {
                const defaults: Record<string, boolean> = {};
                SUPPLIER_FEATURES.forEach(f => defaults[f.id] = f.defaultEnabled);
                setFeatures(defaults);
            }
        } catch (e) {
            console.error('Failed to load supplier defaults', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeature = (id: string) => {
        setFeatures(prev => ({ ...prev, [id]: !prev[id] }));
        setHasChanges(true);
    };

    const saveDefaults = () => {
        localStorage.setItem(STORAGE_KEY_SUPPLIER_DEFAULTS, JSON.stringify(features));
        addToast('تم حفظ الإعدادات الافتراضية للموردين', 'success');
        setHasChanges(false);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-purple-500" size={32} /></div>;
    }

    return (
        <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-700">الصلاحيات الافتراضية للموردين</h3>
                    <p className="text-sm text-slate-500">هذه الميزات ستكون متاحة لكل الموردين الجدد افتراضياً</p>
                </div>
                <button onClick={saveDefaults} disabled={!hasChanges} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                    <Save size={18} /> حفظ الإعدادات
                </button>
            </div>

            <div className="p-4 grid gap-3 md:grid-cols-2">
                {SUPPLIER_FEATURES.map(feature => (
                    <div key={feature.id} className={`flex items-center justify-between p-4 rounded-xl border ${features[feature.id] ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${features[feature.id] ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                {features[feature.id] ? <Check size={20} /> : <X size={20} />}
                            </div>
                            <span className="font-bold text-slate-700">{feature.name}</span>
                        </div>
                        <button
                            onClick={() => toggleFeature(feature.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${features[feature.id] ? 'bg-purple-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${features[feature.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};

// ========== INDIVIDUAL OVERRIDES TAB ==========

interface PermissionOverride {
    id: string;
    userId: string;
    userName: string;
    userType: 'customer' | 'supplier';
    overrides: Record<string, boolean>;
    createdAt: string;
}

const STORAGE_KEY_OVERRIDES = 'sini_permission_overrides';

const OverridesTab: React.FC = () => {
    const { addToast } = useToast();
    const [overrides, setOverrides] = useState<PermissionOverride[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<'customer' | 'supplier'>('customer');
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
    const [editOverrides, setEditOverrides] = useState<Record<string, boolean>>({});

    useEffect(() => { loadOverrides(); }, []);

    const loadOverrides = () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY_OVERRIDES);
            setOverrides(stored ? JSON.parse(stored) : []);
        } catch (e) {
            console.error('Failed to load overrides', e);
        } finally {
            setLoading(false);
        }
    };

    const saveOverrides = (newOverrides: PermissionOverride[]) => {
        localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(newOverrides));
        setOverrides(newOverrides);
    };

    const handleAddOverride = () => {
        if (!selectedUser) return;
        const existingIndex = overrides.findIndex(o => o.userId === selectedUser.id);
        if (existingIndex >= 0) {
            const updated = [...overrides];
            updated[existingIndex].overrides = editOverrides;
            saveOverrides(updated);
        } else {
            const newOverride: PermissionOverride = {
                id: `override_${Date.now()}`,
                userId: selectedUser.id,
                userName: selectedUser.name,
                userType: selectedType,
                overrides: editOverrides,
                createdAt: new Date().toISOString()
            };
            saveOverrides([...overrides, newOverride]);
        }
        addToast(`تم حفظ الاستثناءات لـ ${selectedUser.name}`, 'success');
        setShowAddModal(false);
        setSelectedUser(null);
        setEditOverrides({});
    };

    const handleDeleteOverride = (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الاستثناء؟')) return;
        saveOverrides(overrides.filter(o => o.id !== id));
        addToast('تم حذف الاستثناء', 'success');
    };

    const features = selectedType === 'customer' ? CUSTOMER_FEATURES : SUPPLIER_FEATURES;

    const filteredOverrides = overrides.filter(o =>
        o.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-amber-500" size={32} /></div>;
    }

    return (
        <>
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-700">استثناءات الصلاحيات الفردية</h3>
                    <p className="text-sm text-slate-500">إعطاء صلاحيات خاصة لعميل أو مورد محدد</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600">
                        <Plus size={18} /> إضافة استثناء
                    </button>
                </div>
            </div>

            {filteredOverrides.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                    <UserPlus size={48} className="mx-auto mb-4" />
                    <p className="font-bold mb-2">لا توجد استثناءات</p>
                    <p className="text-sm">اضغط "إضافة استثناء" لإعطاء صلاحيات خاصة لمستخدم معين</p>
                </div>
            ) : (
                <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOverrides.map(override => (
                        <div key={override.id} className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        {override.userType === 'customer' ? <UserCheck className="text-amber-600" size={20} /> : <Store className="text-amber-600" size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{override.userName}</h4>
                                        <p className="text-xs text-slate-500">{override.userType === 'customer' ? 'عميل' : 'مورد'}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteOverride(override.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(override.overrides).filter(([_, v]) => v).slice(0, 3).map(([key]) => (
                                    <span key={key} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">{key}</span>
                                ))}
                                {Object.values(override.overrides).filter(v => v).length > 3 && (
                                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">+{Object.values(override.overrides).filter(v => v).length - 3}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Override Modal */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setSelectedUser(null); }}>
                    <div className="p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <UserPlus className="text-amber-500" size={24} /> إضافة استثناء صلاحيات
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-600 mb-2">نوع المستخدم</label>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedType('customer')} className={`flex-1 py-3 rounded-xl font-bold ${selectedType === 'customer' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
                                    <UserCheck size={20} className="inline mr-2" /> عميل
                                </button>
                                <button onClick={() => setSelectedType('supplier')} className={`flex-1 py-3 rounded-xl font-bold ${selectedType === 'supplier' ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-slate-100 text-slate-600'}`}>
                                    <Store size={20} className="inline mr-2" /> مورد
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-600 mb-2">اسم المستخدم</label>
                            <input
                                type="text"
                                placeholder="أدخل اسم العميل أو المورد..."
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                                onChange={e => setSelectedUser(e.target.value ? { id: `user_${Date.now()}`, name: e.target.value } : null)}
                            />
                        </div>

                        {selectedUser && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                    <h4 className="font-bold text-slate-700">الصلاحيات الإضافية لـ {selectedUser.name}</h4>
                                </div>
                                <div className="p-4 grid gap-2">
                                    {features.map(feature => (
                                        <label key={feature.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${editOverrides[feature.id] ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'} border`}>
                                            <span className="font-bold text-slate-700">{feature.name}</span>
                                            <input type="checkbox" checked={editOverrides[feature.id] || false} onChange={() => setEditOverrides(prev => ({ ...prev, [feature.id]: !prev[feature.id] }))} className="w-5 h-5 rounded text-amber-500" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowAddModal(false); setSelectedUser(null); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleAddOverride} disabled={!selectedUser} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
                                <Save size={18} /> حفظ الاستثناء
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

// ========== TAB 1: USERS (kept for backward compatibility) ==========

const UsersTabContent: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { hasPermission } = usePermission();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const [formData, setFormData] = useState({
        fullName: '', username: '', phone: '', email: '', password: '', roleId: '', isActive: true
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const canCreate = hasPermission('users', 'create');
    const canEdit = hasPermission('users', 'edit');
    const canDelete = hasPermission('users', 'delete');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                Api.getAdminUsers(),
                Api.getRoles()
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

    const getRoleName = (roleId: string): string => {
        const role = roles.find(r => r.id === roleId);
        return role?.name || 'غير محدد';
    };

    const resetForm = () => {
        setFormData({
            fullName: '', username: '', phone: '', email: '', password: '',
            roleId: roles.length > 0 ? roles[0].id : '', isActive: true
        });
        setFormError('');
    };

    const handleOpenAdd = () => { resetForm(); setShowAddModal(true); };

    const handleOpenEdit = (user: AdminUser) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName, username: user.username, phone: user.phone,
            email: user.email || '', password: '', roleId: user.roleId, isActive: user.isActive
        });
        setFormError('');
        setShowEditModal(true);
    };

    const validateForm = (isEdit = false): boolean => {
        if (!formData.fullName.trim()) { setFormError('الاسم الكامل مطلوب'); return false; }
        if (!formData.username.trim()) { setFormError('اسم المستخدم مطلوب'); return false; }
        if (!formData.phone.trim()) { setFormError('رقم الجوال مطلوب'); return false; }
        if (!isEdit && !formData.password.trim()) { setFormError('كلمة المرور مطلوبة'); return false; }
        if (!formData.roleId) { setFormError('الدور مطلوب'); return false; }
        return true;
    };

    const handleAddUser = async () => {
        if (!validateForm(false)) return;
        setSubmitting(true);
        try {
            await Api.createAdminUser({
                fullName: formData.fullName, username: formData.username, phone: formData.phone,
                email: formData.email || undefined, password: formData.password,
                roleId: formData.roleId, isActive: formData.isActive
            });
            addToast('تم إضافة المستخدم بنجاح', 'success');
            setShowAddModal(false);
            loadData();
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
            await Api.updateAdminUser(selectedUser.id, {
                fullName: formData.fullName, phone: formData.phone, email: formData.email || undefined,
                roleId: formData.roleId, isActive: formData.isActive
            });
            addToast('تم تحديث بيانات المستخدم بنجاح', 'success');
            setShowEditModal(false);
            loadData();
        } catch (e: any) {
            setFormError(e.message || 'فشل في تحديث المستخدم');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setSubmitting(true);
        try {
            await Api.deleteAdminUser(selectedUser.id);
            addToast('تم حذف المستخدم بنجاح', 'success');
            setShowDeleteConfirm(false);
            setSelectedUser(null);
            loadData();
        } catch (e: any) {
            addToast(e.message || 'فشل في حذف المستخدم', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportUsers = () => {
        const headers = ['الاسم الكامل', 'اسم المستخدم', 'رقم الجوال', 'البريد الإلكتروني', 'الدور', 'الحالة'];
        const rows = users.map(u => [
            u.fullName, u.username, u.phone, u.email || '-', getRoleName(u.roleId), u.isActive ? 'نشط' : 'موقوف'
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

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">جاري تحميل المستخدمين...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toolbar */}
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
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                        <option value="ALL">جميع الأدوار</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                        <option value="ALL">جميع الحالات</option>
                        <option value="ACTIVE">نشط</option>
                        <option value="INACTIVE">موقوف</option>
                    </select>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportUsers} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
                        <Download size={18} /> تصدير
                    </button>
                    {canCreate && (
                        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56]">
                            <Plus size={18} /> إضافة مستخدم
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm">
                            <th className="text-right py-4 px-4 font-bold">الاسم الكامل</th>
                            <th className="text-right py-4 px-3 font-bold">رقم الجوال</th>
                            <th className="text-right py-4 px-3 font-bold">الدور</th>
                            <th className="text-center py-4 px-3 font-bold">الحالة</th>
                            <th className="text-center py-4 px-3 font-bold">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا توجد نتائج</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#0B1B3A] flex items-center justify-center text-white font-bold">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.fullName}</p>
                                                <p className="text-xs text-slate-500">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-3 text-slate-600">{user.phone}</td>
                                    <td className="py-4 px-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                            {getRoleName(user.roleId)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 text-center">
                                        {user.isActive ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 inline-flex items-center gap-1">
                                                <Check size={12} /> نشط
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                                                <X size={12} /> موقوف
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {canEdit && (
                                                <button onClick={() => handleOpenEdit(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="تعديل">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="حذف">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    إجمالي المستخدمين: <span className="font-bold text-slate-700">{users.length}</span>
                </p>
                <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">نشط: {users.filter(u => u.isActive).length}</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">موقوف: {users.filter(u => !u.isActive).length}</span>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                    <div className="p-6 max-w-lg w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Plus className="text-[#C8A04F]" size={24} /> إضافة مستخدم جديد
                        </h2>
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الاسم الكامل *</label>
                                <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="أدخل الاسم الكامل" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم المستخدم *</label>
                                <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="admin123" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">رقم الجوال *</label>
                                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="05xxxxxxxx" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="email@example.com" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور *</label>
                                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="********" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الدور *</label>
                                <select value={formData.roleId} onChange={e => setFormData({ ...formData, roleId: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl">
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleAddUser} disabled={submitting} className="px-4 py-2 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50">
                                {submitting ? 'جاري الإضافة...' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div className="p-6 max-w-lg w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Edit2 className="text-[#C8A04F]" size={24} /> تعديل المستخدم
                        </h2>
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الاسم الكامل *</label>
                                <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">رقم الجوال *</label>
                                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الدور *</label>
                                <select value={formData.roleId} onChange={e => setFormData({ ...formData, roleId: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl">
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-600">الحساب نشط</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleEditUser} disabled={submitting} className="px-4 py-2 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50">
                                {submitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirm */}
            {showDeleteConfirm && selectedUser && (
                <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}>
                    <div className="p-6 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-500 mb-6">هل أنت متأكد من حذف المستخدم <span className="font-bold">{selectedUser.fullName}</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleDeleteUser} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50">
                                {submitting ? 'جاري الحذف...' : 'حذف'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

// ========== TAB 2: ROLES ==========

// Types for permission groups (matching GroupsTabContent)
interface PermissionGroupRef {
    id: string;
    name: string;
    permissions: Permission[];
}

// Uses STORAGE_KEY_GROUPS from GroupsTabContent above

const RolesTabContent: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { hasPermission } = usePermission();

    const [roles, setRoles] = useState<Role[]>([]);
    const [groups, setGroups] = useState<PermissionGroupRef[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPermissionsEditor, setShowPermissionsEditor] = useState(false);
    const [showApplyGroupModal, setShowApplyGroupModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const canCreateRole = hasPermission('roles', 'create');
    const canEditRole = hasPermission('roles', 'edit');
    const canDeleteRole = hasPermission('roles', 'delete');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const rolesData = await Api.getRoles();
            setRoles(rolesData);

            // Load permission groups from localStorage
            try {
                const stored = localStorage.getItem(STORAGE_KEY_GROUPS);
                const groupsData = stored ? JSON.parse(stored) : [];
                setGroups(groupsData);
            } catch (e) {
                console.error('Failed to load groups', e);
            }
        } catch (e) {
            console.error('Failed to load roles', e);
            addToast('فشل في تحميل الأدوار', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Apply a group's permissions to the selected role
    const applyGroupToRole = async () => {
        if (!selectedRole || !selectedGroupId) return;
        const group = groups.find(g => g.id === selectedGroupId);
        if (!group) { addToast('المجموعة غير موجودة', 'error'); return; }

        setSubmitting(true);
        try {
            // Merge group permissions with existing role permissions
            const existingPermissions = selectedRole.permissions || [];
            const mergedPermissions: Permission[] = [...existingPermissions];

            for (const groupPerm of group.permissions) {
                const existing = mergedPermissions.find(p => p.resource === groupPerm.resource);
                if (existing) {
                    // Merge actions
                    const newActions = [...new Set([...existing.actions, ...groupPerm.actions])];
                    existing.actions = newActions as any;
                } else {
                    mergedPermissions.push({ ...groupPerm });
                }
            }

            await Api.updateRole(selectedRole.id, { permissions: mergedPermissions });
            addToast(`تم تطبيق مجموعة "${group.name}" على الدور "${selectedRole.name}" بنجاح`, 'success');
            setShowApplyGroupModal(false);
            setSelectedGroupId('');
            setSelectedRole(null);
            loadData();
        } catch (e: any) {
            addToast(e.message || 'فشل في تطبيق المجموعة', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openApplyGroupModal = (role: Role) => {
        setSelectedRole(role);
        setSelectedGroupId(groups.length > 0 ? groups[0].id : '');
        setShowApplyGroupModal(true);
    };

    const handleOpenPermissions = (role: Role) => {
        setSelectedRole(role);
        setEditPermissions(JSON.parse(JSON.stringify(role.permissions)));
        setShowPermissionsEditor(true);
    };

    const handleAddRole = async () => {
        if (!formData.name.trim()) { setFormError('اسم الدور مطلوب'); return; }
        setSubmitting(true);
        try {
            await Api.createRole({ name: formData.name, description: formData.description || undefined, permissions: [], isSystem: false });
            addToast('تم إضافة الدور بنجاح', 'success');
            setShowAddModal(false);
            loadData();
        } catch (e: any) {
            setFormError(e.message || 'فشل في إضافة الدور');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setSubmitting(true);
        try {
            await Api.updateRole(selectedRole.id, { permissions: editPermissions });
            addToast('تم حفظ الصلاحيات بنجاح', 'success');
            setShowPermissionsEditor(false);
            loadData();
        } catch (e: any) {
            addToast(e.message || 'فشل في حفظ الصلاحيات', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (role.isSystem) { addToast('لا يمكن حذف دور النظام', 'error'); return; }
        if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
        try {
            await Api.deleteRole(role.id);
            addToast('تم حذف الدور بنجاح', 'success');
            loadData();
        } catch (e: any) {
            addToast(e.message || 'فشل في حذف الدور', 'error');
        }
    };

    const togglePermissionAction = (resource: PermissionResource, action: PermissionAction) => {
        setEditPermissions(prev => {
            const existing = prev.find(p => p.resource === resource);
            if (existing) {
                if (existing.actions.includes(action)) {
                    const newActions = existing.actions.filter(a => a !== action);
                    if (newActions.length === 0) return prev.filter(p => p.resource !== resource);
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

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">جاري تحميل الأدوار...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <p className="text-slate-600">إدارة الأدوار وتحديد صلاحيات كل دور</p>
                {canCreateRole && (
                    <button onClick={() => { setFormData({ name: '', description: '' }); setFormError(''); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56]">
                        <Plus size={18} /> إضافة دور جديد
                    </button>
                )}
            </div>

            <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map(role => (
                    <div key={role.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Shield size={18} className="text-[#C8A04F]" />
                                    {role.name}
                                </h3>
                                {role.description && <p className="text-sm text-slate-500 mt-1">{role.description}</p>}
                            </div>
                            {role.isSystem && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">نظام</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                            <span>{role.permissions?.length || 0} صلاحية</span>
                        </div>
                        <div className="flex gap-2">
                            {canEditRole && (
                                <button onClick={() => handleOpenPermissions(role)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 text-sm">
                                    <Key size={14} /> الصلاحيات
                                </button>
                            )}
                            {canEditRole && groups.length > 0 && (
                                <button onClick={() => openApplyGroupModal(role)} className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 text-sm" title="تطبيق مجموعة">
                                    <Layers size={14} />
                                </button>
                            )}
                            {canDeleteRole && !role.isSystem && (
                                <button onClick={() => handleDeleteRole(role)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Role Modal */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                    <div className="p-6 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Plus className="text-[#C8A04F]" size={24} /> إضافة دور جديد
                        </h2>
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم الدور *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="مثال: مدير المبيعات" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الوصف</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" rows={3} placeholder="وصف اختياري للدور" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleAddRole} disabled={submitting} className="px-4 py-2 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50">
                                {submitting ? 'جاري الإضافة...' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Permissions Editor Modal */}
            {showPermissionsEditor && selectedRole && (
                <Modal isOpen={showPermissionsEditor} onClose={() => setShowPermissionsEditor(false)}>
                    <div className="p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Key className="text-[#C8A04F]" size={24} /> صلاحيات: {selectedRole.name}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="text-right py-3 px-4 font-bold text-slate-700 border-b">المورد</th>
                                        {Object.entries(PERMISSION_ACTION_LABELS).slice(0, 6).map(([action, label]) => (
                                            <th key={action} className="py-3 px-2 font-bold text-slate-700 border-b text-center text-xs">{label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(PERMISSION_RESOURCE_LABELS).map(([resource, label]) => (
                                        <tr key={resource} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 font-medium text-slate-700">{label}</td>
                                            {Object.entries(PERMISSION_ACTION_LABELS).slice(0, 6).map(([action]) => {
                                                const availableActions = RESOURCE_AVAILABLE_ACTIONS[resource as PermissionResource] || [];
                                                const isAvailable = availableActions.includes(action as PermissionAction);
                                                const isChecked = hasPermissionAction(resource as PermissionResource, action as PermissionAction);
                                                return (
                                                    <td key={action} className="py-3 px-2 text-center">
                                                        {isAvailable ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => togglePermissionAction(resource as PermissionResource, action as PermissionAction)}
                                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowPermissionsEditor(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleSavePermissions} disabled={submitting} className="px-4 py-2 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50 flex items-center gap-2">
                                <Save size={18} /> {submitting ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Apply Group Modal */}
            {showApplyGroupModal && selectedRole && (
                <Modal isOpen={showApplyGroupModal} onClose={() => { setShowApplyGroupModal(false); setSelectedRole(null); }}>
                    <div className="p-6 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Layers className="text-[#C8A04F]" size={24} /> تطبيق مجموعة صلاحيات
                        </h2>
                        <p className="text-slate-500 mb-4">
                            تطبيق صلاحيات المجموعة على الدور <span className="font-bold text-slate-700">"{selectedRole.name}"</span>
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-600 mb-2">اختر المجموعة</label>
                            <select
                                value={selectedGroupId}
                                onChange={e => setSelectedGroupId(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50"
                            >
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} ({group.permissions.reduce((acc, p) => acc + p.actions.length, 0)} صلاحية)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                            <div className="flex items-start gap-2 text-sm text-amber-700">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <span>سيتم دمج صلاحيات المجموعة مع صلاحيات الدور الحالية. لن يتم حذف أي صلاحيات موجودة.</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowApplyGroupModal(false); setSelectedRole(null); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={applyGroupToRole} disabled={submitting || !selectedGroupId} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                                <Layers size={18} /> {submitting ? 'جاري التطبيق...' : 'تطبيق المجموعة'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

// ========== TAB 3: GROUPS ==========

interface PermissionGroup {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY_GROUPS = 'sini_permission_groups';

const GroupsTabContent: React.FC = () => {
    const { addToast } = useToast();
    const { hasPermission } = usePermission();

    const [groups, setGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const canCreate = hasPermission('roles', 'create');
    const canEdit = hasPermission('roles', 'edit');
    const canDelete = hasPermission('roles', 'delete');

    useEffect(() => { loadGroups(); }, []);

    const loadGroups = () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY_GROUPS);
            const data = stored ? JSON.parse(stored) : [];
            setGroups(data);
        } catch (e) {
            console.error('Failed to load groups', e);
        } finally {
            setLoading(false);
        }
    };

    const saveGroups = (newGroups: PermissionGroup[]) => {
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(newGroups));
        setGroups(newGroups);
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddGroup = () => {
        if (!formData.name.trim()) { setFormError('اسم المجموعة مطلوب'); return; }
        setSubmitting(true);
        try {
            const newGroup: PermissionGroup = {
                id: `grp_${Date.now()}`,
                name: formData.name.trim(),
                description: formData.description.trim(),
                permissions: editPermissions,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            saveGroups([...groups, newGroup]);
            addToast('تم إنشاء المجموعة بنجاح', 'success');
            setShowAddModal(false);
            resetForm();
        } catch (e: any) {
            setFormError(e.message || 'فشل في إنشاء المجموعة');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditGroup = () => {
        if (!selectedGroup || !formData.name.trim()) { setFormError('اسم المجموعة مطلوب'); return; }
        setSubmitting(true);
        try {
            const updated = groups.map(g => g.id === selectedGroup.id ? {
                ...g,
                name: formData.name.trim(),
                description: formData.description.trim(),
                permissions: editPermissions,
                updatedAt: new Date().toISOString()
            } : g);
            saveGroups(updated);
            addToast('تم تحديث المجموعة بنجاح', 'success');
            setShowEditModal(false);
            resetForm();
        } catch (e: any) {
            setFormError(e.message || 'فشل في تحديث المجموعة');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteGroup = () => {
        if (!selectedGroup) return;
        setSubmitting(true);
        try {
            saveGroups(groups.filter(g => g.id !== selectedGroup.id));
            addToast('تم حذف المجموعة بنجاح', 'success');
            setShowDeleteConfirm(false);
            setSelectedGroup(null);
        } catch (e: any) {
            addToast(e.message || 'فشل في حذف المجموعة', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditPermissions([]);
        setFormError('');
        setSelectedGroup(null);
    };

    const openEdit = (group: PermissionGroup) => {
        setSelectedGroup(group);
        setFormData({ name: group.name, description: group.description });
        setEditPermissions(JSON.parse(JSON.stringify(group.permissions)));
        setFormError('');
        setShowEditModal(true);
    };

    const togglePermission = (resource: PermissionResource, action: PermissionAction) => {
        setEditPermissions(prev => {
            const existing = prev.find(p => p.resource === resource);
            if (existing) {
                if (existing.actions.includes(action)) {
                    const newActions = existing.actions.filter(a => a !== action);
                    if (newActions.length === 0) return prev.filter(p => p.resource !== resource);
                    return prev.map(p => p.resource === resource ? { ...p, actions: newActions } : p);
                } else {
                    return prev.map(p => p.resource === resource ? { ...p, actions: [...p.actions, action] } : p);
                }
            } else {
                return [...prev, { resource, actions: [action] }];
            }
        });
    };

    const hasAction = (resource: PermissionResource, action: PermissionAction): boolean => {
        return editPermissions.find(p => p.resource === resource)?.actions.includes(action) || false;
    };

    const countPermissions = (perms: Permission[]): number => {
        return perms.reduce((acc, p) => acc + p.actions.length, 0);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    return (
        <>
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث في المجموعات..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <span className="text-sm text-slate-500">{groups.length} مجموعة</span>
                </div>
                {canCreate && (
                    <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56]">
                        <Plus size={18} /> إنشاء مجموعة جديدة
                    </button>
                )}
            </div>

            {/* Groups Grid */}
            {filteredGroups.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                    <Layers size={48} className="mx-auto mb-4" />
                    <p className="font-bold mb-2">لا توجد مجموعات صلاحيات</p>
                    <p className="text-sm">قم بإنشاء مجموعة لتجميع الصلاحيات المتكررة</p>
                </div>
            ) : (
                <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGroups.map(group => (
                        <div key={group.id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Layers className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{group.name}</h3>
                                        <p className="text-xs text-slate-500">{countPermissions(group.permissions)} صلاحية</p>
                                    </div>
                                </div>
                            </div>
                            {group.description && (
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{group.description}</p>
                            )}
                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                {canEdit && (
                                    <button onClick={() => openEdit(group)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 text-sm">
                                        <Edit2 size={14} /> تعديل
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={() => { setSelectedGroup(group); setShowDeleteConfirm(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <Modal isOpen={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
                    <div className="p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Layers className="text-[#C8A04F]" size={24} />
                            {showAddModal ? 'إنشاء مجموعة صلاحيات جديدة' : 'تعديل مجموعة الصلاحيات'}
                        </h2>
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={18} /> {formError}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">اسم المجموعة *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="مثال: صلاحيات المبيعات" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الوصف</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" placeholder="وصف اختياري للمجموعة" />
                            </div>
                        </div>

                        {/* Permissions Matrix */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Key size={16} className="text-[#C8A04F]" /> صلاحيات المجموعة
                                </h4>
                            </div>
                            <div className="overflow-x-auto max-h-[40vh]">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-white">
                                        <tr>
                                            <th className="text-right py-2 px-4 font-bold text-slate-600 text-sm border-b">المورد</th>
                                            {Object.entries(PERMISSION_ACTION_LABELS).slice(0, 6).map(([action, label]) => (
                                                <th key={action} className="py-2 px-2 font-bold text-slate-600 text-xs border-b text-center">{label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Object.entries(PERMISSION_RESOURCE_LABELS).map(([resource, label]) => (
                                            <tr key={resource} className="hover:bg-slate-50">
                                                <td className="py-2 px-4 font-medium text-slate-700 text-sm">{label}</td>
                                                {Object.entries(PERMISSION_ACTION_LABELS).slice(0, 6).map(([action]) => {
                                                    const available = RESOURCE_AVAILABLE_ACTIONS[resource as PermissionResource]?.includes(action as PermissionAction);
                                                    return (
                                                        <td key={action} className="py-2 px-2 text-center">
                                                            {available ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasAction(resource as PermissionResource, action as PermissionAction)}
                                                                    onChange={() => togglePermission(resource as PermissionResource, action as PermissionAction)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                                />
                                                            ) : <span className="text-slate-200">—</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <span className="text-sm text-slate-500">
                                {countPermissions(editPermissions)} صلاحية محددة
                            </span>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                                <button onClick={showAddModal ? handleAddGroup : handleEditGroup} disabled={submitting} className="px-4 py-2 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50 flex items-center gap-2">
                                    <Save size={18} /> {submitting ? 'جاري الحفظ...' : 'حفظ المجموعة'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirm */}
            {showDeleteConfirm && selectedGroup && (
                <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedGroup(null); }}>
                    <div className="p-6 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">حذف المجموعة</h3>
                        <p className="text-slate-500 mb-6">هل أنت متأكد من حذف مجموعة <span className="font-bold">"{selectedGroup.name}"</span>؟</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => { setShowDeleteConfirm(false); setSelectedGroup(null); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">إلغاء</button>
                            <button onClick={handleDeleteGroup} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50">
                                {submitting ? 'جاري الحذف...' : 'حذف'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

// ========== TAB 4: VISIBILITY ==========

interface FeatureVisibility {
    id: string;
    name: string;
    description: string;
    icon: string;
    customers: boolean;
    suppliers: boolean;
    advertisers: boolean;
    affiliates: boolean;
}

const STORAGE_KEY_VISIBILITY = 'sini_feature_visibility';

const DEFAULT_FEATURES: FeatureVisibility[] = [
    { id: 'orders', name: 'الطلبات', description: 'إنشاء ومتابعة الطلبات', icon: 'ShoppingBag', customers: true, suppliers: false, advertisers: false, affiliates: false },
    { id: 'quotes', name: 'عروض الأسعار', description: 'طلب عروض أسعار مخصصة', icon: 'FileText', customers: true, suppliers: true, advertisers: false, affiliates: false },
    { id: 'products', name: 'كتالوج المنتجات', description: 'تصفح وبحث المنتجات', icon: 'Package', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'cart', name: 'سلة التسوق', description: 'إضافة منتجات للسلة', icon: 'ShoppingCart', customers: true, suppliers: false, advertisers: false, affiliates: false },
    { id: 'missing', name: 'طلب قطع مفقودة', description: 'طلب قطع غير متوفرة', icon: 'Search', customers: true, suppliers: false, advertisers: false, affiliates: false },
    { id: 'imports', name: 'طلبات الاستيراد', description: 'طلب استيراد منتجات', icon: 'Globe', customers: true, suppliers: true, advertisers: false, affiliates: false },
    { id: 'invoices', name: 'الفواتير', description: 'عرض وتحميل الفواتير', icon: 'Receipt', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'statements', name: 'كشف الحساب', description: 'عرض كشف الحساب المالي', icon: 'BarChart', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'support', name: 'الدعم الفني', description: 'التواصل مع الدعم', icon: 'MessageCircle', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'notifications', name: 'الإشعارات', description: 'استلام الإشعارات', icon: 'Bell', customers: true, suppliers: true, advertisers: true, affiliates: true },
    { id: 'team', name: 'إدارة الفريق', description: 'إضافة أعضاء للفريق', icon: 'Users', customers: true, suppliers: true, advertisers: false, affiliates: false },
    { id: 'analytics', name: 'التحليلات', description: 'عرض الإحصائيات والتقارير', icon: 'TrendingUp', customers: false, suppliers: true, advertisers: true, affiliates: true },
    { id: 'commissions', name: 'العمولات', description: 'عرض العمولات المستحقة', icon: 'DollarSign', customers: false, suppliers: false, advertisers: false, affiliates: true },
    { id: 'campaigns', name: 'الحملات الإعلانية', description: 'إدارة الحملات الإعلانية', icon: 'Megaphone', customers: false, suppliers: false, advertisers: true, affiliates: false },
    { id: 'links', name: 'روابط التسويق', description: 'إنشاء روابط تسويقية', icon: 'Link', customers: false, suppliers: false, advertisers: false, affiliates: true },
];

const VisibilityTabContent: React.FC = () => {
    const { addToast } = useToast();
    const { hasPermission } = usePermission();

    const [features, setFeatures] = useState<FeatureVisibility[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const canEdit = hasPermission('settings_general', 'edit');

    useEffect(() => { loadFeatures(); }, []);

    const loadFeatures = () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY_VISIBILITY);
            const data = stored ? JSON.parse(stored) : DEFAULT_FEATURES;
            setFeatures(data);
        } catch (e) {
            console.error('Failed to load visibility settings', e);
            setFeatures(DEFAULT_FEATURES);
        } finally {
            setLoading(false);
        }
    };

    const saveFeatures = async () => {
        setSaving(true);
        try {
            localStorage.setItem(STORAGE_KEY_VISIBILITY, JSON.stringify(features));
            addToast('تم حفظ إعدادات الظهور بنجاح', 'success');
            setHasChanges(false);
        } catch (e) {
            addToast('فشل في حفظ الإعدادات', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleVisibility = (featureId: string, ownerType: 'customers' | 'suppliers' | 'advertisers' | 'affiliates') => {
        setFeatures(prev => prev.map(f => f.id === featureId ? { ...f, [ownerType]: !f[ownerType] } : f));
        setHasChanges(true);
    };

    const toggleAllForOwner = (ownerType: 'customers' | 'suppliers' | 'advertisers' | 'affiliates', value: boolean) => {
        setFeatures(prev => prev.map(f => ({ ...f, [ownerType]: value })));
        setHasChanges(true);
    };

    const resetToDefaults = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية؟')) {
            setFeatures(DEFAULT_FEATURES);
            setHasChanges(true);
        }
    };

    const filteredFeatures = features.filter(f =>
        f.name.includes(searchQuery) || f.description.includes(searchQuery)
    );

    const ownerTypes = [
        { key: 'customers' as const, label: 'العملاء', icon: <Users size={16} />, color: 'blue' },
        { key: 'suppliers' as const, label: 'الموردون', icon: <Store size={16} />, color: 'emerald' },
        { key: 'advertisers' as const, label: 'المعلنون', icon: <Megaphone size={16} />, color: 'purple' },
        { key: 'affiliates' as const, label: 'المسوقون', icon: <UserCheck size={16} />, color: 'amber' }
    ];

    const getEnabledCount = (ownerType: 'customers' | 'suppliers' | 'advertisers' | 'affiliates') => {
        return features.filter(f => f[ownerType]).length;
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    return (
        <>
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث في الميزات..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {hasChanges && (
                        <span className="text-sm text-amber-600 font-bold flex items-center gap-1">
                            <AlertTriangle size={14} /> تغييرات غير محفوظة
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={resetToDefaults} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
                        <RefreshCw size={18} /> استعادة الافتراضي
                    </button>
                    {canEdit && (
                        <button onClick={saveFeatures} disabled={saving || !hasChanges} className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50">
                            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            حفظ الإعدادات
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-100">
                {ownerTypes.map(owner => (
                    <div key={owner.key} className={`bg-${owner.color}-50 border border-${owner.color}-200 rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`flex items-center gap-2 text-${owner.color}-700 font-bold`}>
                                {owner.icon}
                                {owner.label}
                            </div>
                            <span className={`text-xs px-2 py-0.5 bg-${owner.color}-100 text-${owner.color}-800 rounded-full font-bold`}>
                                {getEnabledCount(owner.key)}/{features.length}
                            </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => toggleAllForOwner(owner.key, true)}
                                className={`flex-1 text-xs px-2 py-1 bg-${owner.color}-100 text-${owner.color}-700 rounded font-bold hover:bg-${owner.color}-200`}
                            >
                                تفعيل الكل
                            </button>
                            <button
                                onClick={() => toggleAllForOwner(owner.key, false)}
                                className="flex-1 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded font-bold hover:bg-slate-200"
                            >
                                إلغاء الكل
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Features Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="text-right py-4 px-4 font-bold text-slate-600">الميزة</th>
                            {ownerTypes.map(owner => (
                                <th key={owner.key} className="py-4 px-3 font-bold text-slate-600 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {owner.icon}
                                        <span className="text-sm">{owner.label}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredFeatures.map(feature => (
                            <tr key={feature.id} className="hover:bg-slate-50">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                            <Eye className="text-slate-500" size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{feature.name}</p>
                                            <p className="text-xs text-slate-500">{feature.description}</p>
                                        </div>
                                    </div>
                                </td>
                                {ownerTypes.map(owner => (
                                    <td key={owner.key} className="py-4 px-3 text-center">
                                        <button
                                            onClick={() => toggleVisibility(feature.id, owner.key)}
                                            disabled={!canEdit}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${feature[owner.key] ? 'bg-emerald-500' : 'bg-slate-300'
                                                } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${feature[owner.key] ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Info size={16} />
                    <span>هذه الإعدادات تتحكم في ظهور الميزات لكل نوع من أنواع الحسابات في بوابتهم الخاصة.</span>
                </div>
            </div>
        </>
    );
};

// ========== TAB 5: ORGANIZATIONS ==========

const OrganizationsTabContent: React.FC = () => {
    const { addToast } = useToast();
    const [settings, setSettings] = useState<OrganizationSettings | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchOrg, setSearchOrg] = useState('');
    const [selectedOrgType, setSelectedOrgType] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsData, orgsData] = await Promise.all([
                Api.getOrganizationSettings(),
                Api.getOrganizations()
            ]);
            setSettings(settingsData);
            setOrganizations(orgsData);
        } catch (error) {
            console.error('Failed to load organization settings:', error);
            addToast('فشل في تحميل الإعدادات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await Api.updateOrganizationSettings(settings);
            addToast('تم حفظ الإعدادات بنجاح', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            addToast('فشل في حفظ الإعدادات', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = <K extends keyof OrganizationSettings>(key: K, value: OrganizationSettings[K]) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
    };

    const filteredOrgs = organizations.filter(org => {
        const matchesSearch = org.name.toLowerCase().includes(searchOrg.toLowerCase());
        const matchesType = selectedOrgType === 'all' || org.type === selectedOrgType;
        return matchesSearch && matchesType;
    });

    const orgTypeLabels: Record<string, string> = {
        customer: 'عميل', supplier: 'مورد', advertiser: 'معلن', affiliate: 'مسوق'
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertTriangle size={48} className="mx-auto mb-4" />
                <p>فشل في تحميل الإعدادات</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="text-[#C8A04F]" size={20} />
                        إعدادات المنظمات والفرق
                    </h3>
                    <p className="text-sm text-slate-500">إدارة إعدادات الفرق والصلاحيات لجميع أنواع الحسابات</p>
                </div>
                <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] disabled:opacity-50">
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    حفظ الإعدادات
                </button>
            </div>

            {/* Settings */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-[#C8A04F]" />
                        تفعيل الفرق
                    </h4>
                    <div className="space-y-3">
                        {[
                            { key: 'enableTeamsForCustomers', label: 'فرق العملاء' },
                            { key: 'enableTeamsForSuppliers', label: 'فرق الموردين' },
                            { key: 'enableTeamsForAdvertisers', label: 'فرق المعلنين' },
                            { key: 'enableTeamsForAffiliates', label: 'فرق المسوقين' }
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{item.label}</span>
                                <button
                                    onClick={() => updateSetting(item.key as any, !(settings as any)[item.key])}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(settings as any)[item.key] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${(settings as any)[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-[#C8A04F]" />
                        حدود أعضاء الفريق
                    </h4>
                    <div className="space-y-3">
                        {[
                            { key: 'maxCustomerEmployees', label: 'موظفي العميل' },
                            { key: 'maxSupplierEmployees', label: 'موظفي المورد' },
                            { key: 'maxAdvertiserEmployees', label: 'موظفي المعلن' },
                            { key: 'maxAffiliateEmployees', label: 'موظفي المسوق' }
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{item.label}</span>
                                <input
                                    type="number"
                                    value={(settings as any)[item.key] || 5}
                                    onChange={e => updateSetting(item.key as any, parseInt(e.target.value) || 5)}
                                    className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-center text-sm"
                                    min={1}
                                    max={50}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Organizations List */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="font-bold text-slate-700">المنظمات المسجلة ({organizations.length})</h4>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchOrg}
                                onChange={e => setSearchOrg(e.target.value)}
                                placeholder="بحث..."
                                className="pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-sm w-40"
                            />
                        </div>
                        <select
                            value={selectedOrgType}
                            onChange={e => setSelectedOrgType(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        >
                            <option value="all">الكل</option>
                            <option value="customer">عملاء</option>
                            <option value="supplier">موردين</option>
                            <option value="advertiser">معلنين</option>
                            <option value="affiliate">مسوقين</option>
                        </select>
                    </div>
                </div>

                {filteredOrgs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Info size={32} className="mx-auto mb-2" />
                        <p>لا توجد منظمات مسجلة</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="text-right py-3 px-4 text-xs font-bold text-slate-600">المنظمة</th>
                                <th className="text-right py-3 px-4 text-xs font-bold text-slate-600">النوع</th>
                                <th className="text-right py-3 px-4 text-xs font-bold text-slate-600">الحالة</th>
                                <th className="text-right py-3 px-4 text-xs font-bold text-slate-600">تاريخ الإنشاء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrgs.map(org => (
                                <tr key={org.id} className="hover:bg-white">
                                    <td className="py-3 px-4 font-medium text-slate-700">{org.name}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded">{orgTypeLabels[org.type] || org.type}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {org.isActive ? 'نشط' : 'معطل'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-slate-500">
                                        {new Date(org.createdAt).toLocaleDateString('ar-SA')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UnifiedPermissionCenter;
