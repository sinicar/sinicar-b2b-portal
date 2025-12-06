import { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Users, Key, Settings, Search, Plus, Trash2, Edit2,
  Check, X, ChevronDown, ChevronRight, RefreshCw, Eye, EyeOff,
  Lock, Unlock, UserCheck, UserX, Filter, Save, AlertTriangle,
  Layers, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { useToast } from '../services/ToastContext';

interface Role {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  module: string;
  category?: string;
  isActive: boolean;
}

interface PermissionGroup {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  description?: string;
  isSystemDefault: boolean;
  isActive: boolean;
  permissions: { permission: Permission }[];
  _count?: { roles: number; users: number };
}

interface CustomerFeatureVisibility {
  id: string;
  customerId: string;
  featureCode: string;
  visibility: string;
  conditionProfilePercent?: number;
  reason?: string;
}

interface ModuleAccess {
  moduleKey: string;
  moduleName: string;
  moduleNameAr: string;
}

const translations: Record<string, Record<string, string>> = {
  ar: {
    permissionCenter: 'مركز الصلاحيات',
    roles: 'الأدوار',
    permissions: 'الصلاحيات',
    permissionGroups: 'مجموعات الصلاحيات',
    customerVisibility: 'ظهور الميزات للعملاء',
    search: 'بحث...',
    addNew: 'إضافة جديد',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    name: 'الاسم',
    code: 'الكود',
    description: 'الوصف',
    module: 'الوحدة',
    category: 'الفئة',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    system: 'نظام',
    custom: 'مخصص',
    allow: 'السماح',
    deny: 'الرفض',
    show: 'إظهار',
    hide: 'إخفاء',
    restricted: 'مقيد',
    assignPermissions: 'تعيين الصلاحيات',
    selectedPermissions: 'الصلاحيات المختارة',
    noResults: 'لا توجد نتائج',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    cannotDeleteSystem: 'لا يمكن حذف عناصر النظام',
    saving: 'جاري الحفظ...',
    loading: 'جاري التحميل...',
    featureCode: 'كود الميزة',
    visibility: 'الظهور',
    profileRequirement: 'نسبة الملف الشخصي المطلوبة',
    reason: 'السبب',
    user: 'المستخدم',
    customer: 'العميل',
    allPermissions: 'كل الصلاحيات',
    filterByModule: 'تصفية حسب الوحدة',
    filterByCategory: 'تصفية حسب الفئة',
    nameAr: 'الاسم بالعربية',
    managePermissions: 'إدارة الأدوار والصلاحيات ومجموعات الصلاحيات',
    usersCount: 'المستخدمين',
    permissionsCount: 'الصلاحيات'
  },
  en: {
    permissionCenter: 'Permission Center',
    roles: 'Roles',
    permissions: 'Permissions',
    permissionGroups: 'Permission Groups',
    customerVisibility: 'Customer Feature Visibility',
    search: 'Search...',
    addNew: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    code: 'Code',
    description: 'Description',
    module: 'Module',
    category: 'Category',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    system: 'System',
    custom: 'Custom',
    allow: 'Allow',
    deny: 'Deny',
    show: 'Show',
    hide: 'Hide',
    restricted: 'Restricted',
    assignPermissions: 'Assign Permissions',
    selectedPermissions: 'Selected Permissions',
    noResults: 'No results found',
    confirmDelete: 'Are you sure you want to delete?',
    cannotDeleteSystem: 'Cannot delete system items',
    saving: 'Saving...',
    loading: 'Loading...',
    featureCode: 'Feature Code',
    visibility: 'Visibility',
    profileRequirement: 'Profile Completion Required',
    reason: 'Reason',
    user: 'User',
    customer: 'Customer',
    allPermissions: 'All Permissions',
    filterByModule: 'Filter by Module',
    filterByCategory: 'Filter by Category',
    nameAr: 'Arabic Name',
    managePermissions: 'Manage roles, permissions, and permission groups',
    usersCount: 'Users',
    permissionsCount: 'Permissions'
  },
  hi: {
    permissionCenter: 'अनुमति केंद्र',
    roles: 'भूमिकाएं',
    permissions: 'अनुमतियां',
    permissionGroups: 'अनुमति समूह',
    customerVisibility: 'ग्राहक सुविधा दृश्यता',
    search: 'खोजें...',
    addNew: 'नया जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    name: 'नाम',
    code: 'कोड',
    description: 'विवरण',
    module: 'मॉड्यूल',
    category: 'श्रेणी',
    status: 'स्थिति',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    system: 'सिस्टम',
    custom: 'कस्टम',
    allow: 'अनुमति दें',
    deny: 'अस्वीकार करें',
    show: 'दिखाएं',
    hide: 'छिपाएं',
    restricted: 'प्रतिबंधित',
    assignPermissions: 'अनुमतियां असाइन करें',
    selectedPermissions: 'चयनित अनुमतियां',
    noResults: 'कोई परिणाम नहीं',
    confirmDelete: 'क्या आप हटाना चाहते हैं?',
    cannotDeleteSystem: 'सिस्टम आइटम नहीं हटा सकते',
    saving: 'सहेज रहा है...',
    loading: 'लोड हो रहा है...',
    featureCode: 'सुविधा कोड',
    visibility: 'दृश्यता',
    profileRequirement: 'प्रोफ़ाइल पूर्णता आवश्यक',
    reason: 'कारण',
    user: 'उपयोगकर्ता',
    customer: 'ग्राहक',
    allPermissions: 'सभी अनुमतियां',
    filterByModule: 'मॉड्यूल द्वारा फ़िल्टर',
    filterByCategory: 'श्रेणी द्वारा फ़िल्टर',
    nameAr: 'अरबी नाम',
    managePermissions: 'भूमिकाएं, अनुमतियां और समूह प्रबंधित करें',
    usersCount: 'उपयोगकर्ता',
    permissionsCount: 'अनुमतियां'
  },
  zh: {
    permissionCenter: '权限中心',
    roles: '角色',
    permissions: '权限',
    permissionGroups: '权限组',
    customerVisibility: '客户功能可见性',
    search: '搜索...',
    addNew: '添加新',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    name: '名称',
    code: '代码',
    description: '描述',
    module: '模块',
    category: '类别',
    status: '状态',
    active: '活动',
    inactive: '非活动',
    system: '系统',
    custom: '自定义',
    allow: '允许',
    deny: '拒绝',
    show: '显示',
    hide: '隐藏',
    restricted: '受限',
    assignPermissions: '分配权限',
    selectedPermissions: '已选权限',
    noResults: '无结果',
    confirmDelete: '确定要删除吗？',
    cannotDeleteSystem: '无法删除系统项',
    saving: '保存中...',
    loading: '加载中...',
    featureCode: '功能代码',
    visibility: '可见性',
    profileRequirement: '所需档案完成度',
    reason: '原因',
    user: '用户',
    customer: '客户',
    allPermissions: '所有权限',
    filterByModule: '按模块筛选',
    filterByCategory: '按类别筛选',
    nameAr: '阿拉伯语名称',
    managePermissions: '管理角色、权限和权限组',
    usersCount: '用户',
    permissionsCount: '权限'
  }
};

type TabType = 'roles' | 'permissions' | 'groups' | 'visibility';

export function AdminPermissionCenter() {
  const { i18n } = useTranslation();
  const { showToast } = useToast();
  const lang = i18n.language?.substring(0, 2) || 'ar';
  const t = translations[lang] || translations.ar;
  const isRTL = lang === 'ar';

  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [modules, setModules] = useState<ModuleAccess[]>([]);
  const [visibilityList, setVisibilityList] = useState<CustomerFeatureVisibility[]>([]);
  
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [editingGroup, setEditingGroup] = useState<Partial<PermissionGroup> | null>(null);
  const [editingPermission, setEditingPermission] = useState<Partial<Permission> | null>(null);
  const [editingVisibility, setEditingVisibility] = useState<Partial<CustomerFeatureVisibility> | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showPermissionAssignModal, setShowPermissionAssignModal] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingPermission, setSavingPermission] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(permissions.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [permissions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, groupsRes, modulesRes, visRes] = await Promise.all([
        fetch('/api/v1/permissions/roles').then(r => r.json()),
        fetch('/api/v1/permissions/permissions').then(r => r.json()),
        fetch('/api/v1/permissions/groups').then(r => r.json()),
        fetch('/api/v1/permissions/modules').then(r => r.json()),
        fetch('/api/v1/permissions/customer-visibility').then(r => r.json())
      ]);
      if (rolesRes.data) setRoles(rolesRes.data);
      if (permsRes.data) setPermissions(permsRes.data);
      if (groupsRes.data) setGroups(groupsRes.data);
      if (modulesRes.data) setModules(modulesRes.data);
      if (visRes.data) setVisibilityList(visRes.data);
    } catch (e) {
      console.error('Error fetching permission data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.code.toLowerCase().includes(q) ||
      r.nameAr?.includes(q)
    );
  }, [roles, searchQuery]);

  const filteredPermissions = useMemo(() => {
    let result = permissions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) ||
        p.nameAr?.includes(q)
      );
    }
    if (moduleFilter !== 'all') {
      result = result.filter(p => p.module === moduleFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    return result;
  }, [permissions, searchQuery, moduleFilter, categoryFilter]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.code.toLowerCase().includes(q) ||
      g.nameAr?.includes(q)
    );
  }, [groups, searchQuery]);

  const handleSaveRole = async () => {
    if (!editingRole) return;
    setSavingRole(true);
    try {
      const method = editingRole.id ? 'PUT' : 'POST';
      const url = editingRole.id ? `/api/v1/permissions/roles/${editingRole.id}` : '/api/v1/permissions/roles';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRole)
      });
      if (res.ok) {
        showToast(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully', 'success');
        setShowRoleModal(false);
        setEditingRole(null);
        fetchData();
      } else {
        showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      showToast(t.cannotDeleteSystem, 'error');
      return;
    }
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/v1/permissions/roles/${role.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
        fetchData();
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحذف' : 'Error deleting', 'error');
    }
  };

  const handleSaveGroup = async () => {
    if (!editingGroup) return;
    setSavingGroup(true);
    try {
      const method = editingGroup.id ? 'PUT' : 'POST';
      const url = editingGroup.id ? `/api/v1/permissions/groups/${editingGroup.id}` : '/api/v1/permissions/groups';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup)
      });
      if (res.ok) {
        showToast(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully', 'success');
        setShowGroupModal(false);
        setEditingGroup(null);
        fetchData();
      } else {
        showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (group: PermissionGroup) => {
    if (group.isSystemDefault) {
      showToast(t.cannotDeleteSystem, 'error');
      return;
    }
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/v1/permissions/groups/${group.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
        fetchData();
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحذف' : 'Error deleting', 'error');
    }
  };

  const openAssignPermissions = (group: PermissionGroup) => {
    setEditingGroup(group);
    setSelectedPermissionIds(group.permissions?.map(p => p.permission.id) || []);
    setShowPermissionAssignModal(true);
  };

  const togglePermissionSelection = (permId: string) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  const handleSavePermissionAssignment = async () => {
    if (!editingGroup?.id) return;
    try {
      const res = await fetch(`/api/v1/permissions/groups/${editingGroup.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selectedPermissionIds })
      });
      if (res.ok) {
        showToast(isRTL ? 'تم تعيين الصلاحيات' : 'Permissions assigned', 'success');
        setShowPermissionAssignModal(false);
        fetchData();
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في التعيين' : 'Error assigning', 'error');
    }
  };

  const handleSavePermission = async () => {
    if (!editingPermission) return;
    setSavingPermission(true);
    try {
      const method = editingPermission.id ? 'PUT' : 'POST';
      const url = editingPermission.id ? `/api/v1/permissions/permissions/${editingPermission.id}` : '/api/v1/permissions/permissions';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPermission)
      });
      if (res.ok) {
        showToast(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully', 'success');
        setShowPermissionModal(false);
        setEditingPermission(null);
        fetchData();
      } else {
        showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
    } finally {
      setSavingPermission(false);
    }
  };

  const handleDeletePermission = async (perm: Permission) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/v1/permissions/permissions/${perm.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
        fetchData();
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحذف' : 'Error deleting', 'error');
    }
  };

  const handleSaveVisibility = async () => {
    if (!editingVisibility) return;
    setSavingVisibility(true);
    try {
      const method = editingVisibility.id ? 'PUT' : 'POST';
      const url = editingVisibility.id ? `/api/v1/permissions/customer-visibility/${editingVisibility.id}` : '/api/v1/permissions/customer-visibility';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVisibility)
      });
      if (res.ok) {
        showToast(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully', 'success');
        setShowVisibilityModal(false);
        setEditingVisibility(null);
        fetchData();
      } else {
        showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleDeleteVisibility = async (item: CustomerFeatureVisibility) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/v1/permissions/customer-visibility/${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
        fetchData();
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحذف' : 'Error deleting', 'error');
    }
  };

  const tabButtonClass = (tab: TabType) => 
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`;

  const cardClass = "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4";

  return (
    <div className={`min-h-screen p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.permissionCenter}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.managePermissions}</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          data-testid="button-refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{loading ? t.loading : 'Refresh'}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={tabButtonClass('roles')} onClick={() => setActiveTab('roles')} data-testid="tab-roles">
          <Shield className="h-4 w-4" />
          {t.roles}
        </button>
        <button className={tabButtonClass('permissions')} onClick={() => setActiveTab('permissions')} data-testid="tab-permissions">
          <Key className="h-4 w-4" />
          {t.permissions}
        </button>
        <button className={tabButtonClass('groups')} onClick={() => setActiveTab('groups')} data-testid="tab-groups">
          <Layers className="h-4 w-4" />
          {t.permissionGroups}
        </button>
        <button className={tabButtonClass('visibility')} onClick={() => setActiveTab('visibility')} data-testid="tab-visibility">
          <Eye className="h-4 w-4" />
          {t.customerVisibility}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="input-search"
          />
        </div>
        {activeTab === 'permissions' && (
          <>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="select-module-filter"
            >
              <option value="all">{t.allPermissions}</option>
              {modules.map(m => (
                <option key={m.moduleKey} value={m.moduleKey}>{isRTL ? m.moduleNameAr : m.moduleName}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="select-category-filter"
            >
              <option value="all">{t.allPermissions}</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </>
        )}
        {(activeTab === 'roles' || activeTab === 'groups' || activeTab === 'permissions' || activeTab === 'visibility') && (
          <button
            onClick={() => {
              if (activeTab === 'roles') {
                setEditingRole({ code: '', name: '', isSystem: false, isActive: true, sortOrder: 0 });
                setShowRoleModal(true);
              } else if (activeTab === 'groups') {
                setEditingGroup({ code: '', name: '', isSystemDefault: false, isActive: true, permissions: [] });
                setShowGroupModal(true);
              } else if (activeTab === 'permissions') {
                setEditingPermission({ code: '', name: '', module: '', isActive: true });
                setShowPermissionModal(true);
              } else if (activeTab === 'visibility') {
                setEditingVisibility({ customerId: '', featureCode: '', visibility: 'SHOW' });
                setShowVisibilityModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="button-add-new"
          >
            <Plus className="h-4 w-4" />
            {t.addNew}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">{t.loading}</span>
        </div>
      ) : (
        <>
          {activeTab === 'roles' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoles.map((role) => (
                <div key={role.id} className={cardClass} data-testid={`card-role-${role.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{isRTL ? (role.nameAr || role.name) : role.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${role.isSystem ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {role.isSystem ? t.system : t.custom}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">{role.code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{role.description || '-'}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${role.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {role.isActive ? t.active : t.inactive}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingRole(role); setShowRoleModal(true); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        data-testid={`button-edit-role-${role.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          data-testid={`button-delete-role-${role.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredRoles.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">{t.noResults}</div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.code}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.name}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.module}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.category}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.status}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPermissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-permission-${perm.id}`}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{perm.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{isRTL ? (perm.nameAr || perm.name) : perm.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{perm.module}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{perm.category || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${perm.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                          {perm.isActive ? t.active : t.inactive}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingPermission(perm); setShowPermissionModal(true); }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            data-testid={`button-edit-permission-${perm.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermission(perm)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            data-testid={`button-delete-permission-${perm.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPermissions.length === 0 && (
                <div className="text-center py-12 text-gray-500">{t.noResults}</div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group) => (
                <div key={group.id} className={cardClass} data-testid={`card-group-${group.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{isRTL ? (group.nameAr || group.name) : group.name}</h3>
                    </div>
                    {group.isSystemDefault && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {t.system}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">{group.code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{group.description || '-'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {group.permissions?.length || 0} {t.permissionsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {group._count?.users || 0} {t.usersCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${group.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {group.isActive ? t.active : t.inactive}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAssignPermissions(group)}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                        title={t.assignPermissions}
                        data-testid={`button-assign-permissions-${group.id}`}
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setEditingGroup(group); setShowGroupModal(true); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        data-testid={`button-edit-group-${group.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {!group.isSystemDefault && (
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          data-testid={`button-delete-group-${group.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">{t.noResults}</div>
              )}
            </div>
          )}

          {activeTab === 'visibility' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.customer}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.featureCode}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.visibility}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.profileRequirement}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t.reason}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visibilityList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-visibility-${item.id}`}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{item.customerId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.featureCode}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.visibility === 'SHOW' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                          item.visibility === 'HIDE' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {item.visibility === 'SHOW' ? t.show : item.visibility === 'HIDE' ? t.hide : t.restricted}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.conditionProfilePercent ? `${item.conditionProfilePercent}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.reason || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingVisibility(item); setShowVisibilityModal(true); }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            data-testid={`button-edit-visibility-${item.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVisibility(item)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            data-testid={`button-delete-visibility-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibilityList.length === 0 && (
                <div className="text-center py-12 text-gray-500">{t.noResults}</div>
              )}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showRoleModal} onClose={() => { setShowRoleModal(false); setEditingRole(null); }} title={editingRole?.id ? `${t.edit} ${t.roles}` : `${t.addNew} ${t.roles}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.code}</label>
            <input
              type="text"
              value={editingRole?.code || ''}
              onChange={(e) => setEditingRole(prev => prev ? { ...prev, code: e.target.value } : null)}
              disabled={!!editingRole?.id}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              data-testid="input-role-code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
            <input
              type="text"
              value={editingRole?.name || ''}
              onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-role-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.nameAr}</label>
            <input
              type="text"
              value={editingRole?.nameAr || ''}
              onChange={(e) => setEditingRole(prev => prev ? { ...prev, nameAr: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-role-name-ar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
            <input
              type="text"
              value={editingRole?.description || ''}
              onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-role-description"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="role-active"
              checked={editingRole?.isActive ?? true}
              onChange={(e) => setEditingRole(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              data-testid="checkbox-role-active"
            />
            <label htmlFor="role-active" className="text-sm text-gray-700 dark:text-gray-300">{t.active}</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowRoleModal(false); setEditingRole(null); }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            data-testid="button-cancel-role"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSaveRole}
            disabled={savingRole}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="button-save-role"
          >
            {savingRole ? t.saving : t.save}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showGroupModal} onClose={() => { setShowGroupModal(false); setEditingGroup(null); }} title={editingGroup?.id ? `${t.edit} ${t.permissionGroups}` : `${t.addNew} ${t.permissionGroups}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.code}</label>
            <input
              type="text"
              value={editingGroup?.code || ''}
              onChange={(e) => setEditingGroup(prev => prev ? { ...prev, code: e.target.value } : null)}
              disabled={!!editingGroup?.id}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              data-testid="input-group-code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
            <input
              type="text"
              value={editingGroup?.name || ''}
              onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-group-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.nameAr}</label>
            <input
              type="text"
              value={editingGroup?.nameAr || ''}
              onChange={(e) => setEditingGroup(prev => prev ? { ...prev, nameAr: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-group-name-ar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
            <input
              type="text"
              value={editingGroup?.description || ''}
              onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-group-description"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowGroupModal(false); setEditingGroup(null); }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            data-testid="button-cancel-group"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSaveGroup}
            disabled={savingGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="button-save-group"
          >
            {savingGroup ? t.saving : t.save}
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={showPermissionAssignModal} 
        onClose={() => { setShowPermissionAssignModal(false); setEditingGroup(null); }} 
        title={`${t.assignPermissions} - ${isRTL ? (editingGroup?.nameAr || editingGroup?.name) : editingGroup?.name}`}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {filteredPermissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => togglePermissionSelection(perm.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissionIds.includes(perm.id)}
                  onChange={() => togglePermissionSelection(perm.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{isRTL ? (perm.nameAr || perm.name) : perm.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{perm.code}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{perm.module}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {t.selectedPermissions}: {selectedPermissionIds.length}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowPermissionAssignModal(false); setEditingGroup(null); }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSavePermissionAssignment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.save}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showPermissionModal} onClose={() => { setShowPermissionModal(false); setEditingPermission(null); }} title={editingPermission?.id ? `${t.edit} ${t.permissions}` : `${t.addNew} ${t.permissions}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.code}</label>
            <input
              type="text"
              value={editingPermission?.code || ''}
              onChange={(e) => setEditingPermission(prev => prev ? { ...prev, code: e.target.value } : null)}
              disabled={!!editingPermission?.id}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              data-testid="input-permission-code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
            <input
              type="text"
              value={editingPermission?.name || ''}
              onChange={(e) => setEditingPermission(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-permission-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.nameAr}</label>
            <input
              type="text"
              value={editingPermission?.nameAr || ''}
              onChange={(e) => setEditingPermission(prev => prev ? { ...prev, nameAr: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-permission-name-ar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.module}</label>
            <select
              value={editingPermission?.module || ''}
              onChange={(e) => setEditingPermission(prev => prev ? { ...prev, module: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="select-permission-module"
            >
              <option value="">{isRTL ? 'اختر الوحدة' : 'Select Module'}</option>
              {modules.map(m => (
                <option key={m.moduleKey} value={m.moduleKey}>{isRTL ? m.moduleNameAr : m.moduleName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
            <input
              type="text"
              value={editingPermission?.category || ''}
              onChange={(e) => setEditingPermission(prev => prev ? { ...prev, category: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-permission-category"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="permission-active"
              checked={editingPermission?.isActive ?? true}
              onChange={(e) => setEditingPermission(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              data-testid="checkbox-permission-active"
            />
            <label htmlFor="permission-active" className="text-sm text-gray-700 dark:text-gray-300">{t.active}</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowPermissionModal(false); setEditingPermission(null); }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            data-testid="button-cancel-permission"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSavePermission}
            disabled={savingPermission}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="button-save-permission"
          >
            {savingPermission ? t.saving : t.save}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showVisibilityModal} onClose={() => { setShowVisibilityModal(false); setEditingVisibility(null); }} title={editingVisibility?.id ? `${t.edit} ${t.customerVisibility}` : `${t.addNew} ${t.customerVisibility}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.customer} ID</label>
            <input
              type="text"
              value={editingVisibility?.customerId || ''}
              onChange={(e) => setEditingVisibility(prev => prev ? { ...prev, customerId: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-visibility-customer-id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.featureCode}</label>
            <input
              type="text"
              value={editingVisibility?.featureCode || ''}
              onChange={(e) => setEditingVisibility(prev => prev ? { ...prev, featureCode: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-visibility-feature-code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.visibility}</label>
            <select
              value={editingVisibility?.visibility || 'SHOW'}
              onChange={(e) => setEditingVisibility(prev => prev ? { ...prev, visibility: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="select-visibility-type"
            >
              <option value="SHOW">{t.show}</option>
              <option value="HIDE">{t.hide}</option>
              <option value="RESTRICTED">{t.restricted}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.profileRequirement} (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editingVisibility?.conditionProfilePercent || ''}
              onChange={(e) => setEditingVisibility(prev => prev ? { ...prev, conditionProfilePercent: e.target.value ? parseInt(e.target.value) : undefined } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-visibility-profile-percent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.reason}</label>
            <input
              type="text"
              value={editingVisibility?.reason || ''}
              onChange={(e) => setEditingVisibility(prev => prev ? { ...prev, reason: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="input-visibility-reason"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowVisibilityModal(false); setEditingVisibility(null); }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            data-testid="button-cancel-visibility"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSaveVisibility}
            disabled={savingVisibility}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="button-save-visibility"
          >
            {savingVisibility ? t.saving : t.save}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminPermissionCenter;
