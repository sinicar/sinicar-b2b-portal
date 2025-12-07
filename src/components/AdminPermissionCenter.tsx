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
    permissionsCount: 'الصلاحيات',
    permissionMatrix: 'مصفوفة الصلاحيات',
    saveMatrix: 'حفظ التغييرات',
    matrixUpdated: 'تم تحديث المصفوفة بنجاح',
    selectAll: 'تحديد الكل',
    unselectAll: 'إلغاء الكل',
    features: 'المميزات',
    featureFlags: 'إدارة المميزات',
    ownerType: 'نوع المالك',
    ownerId: 'معرف المالك',
    customerLabel: 'عميل',
    supplierLabel: 'مورد',
    selectOwner: 'اختر المالك',
    loadFeatures: 'تحميل المميزات',
    enabled: 'مفعل',
    disabled: 'معطل',
    noFeaturesLoaded: 'اختر نوع المالك والمعرف ثم اضغط تحميل',
    saveFeatures: 'حفظ المميزات',
    featuresSaved: 'تم حفظ المميزات بنجاح',
    globalDefault: 'الافتراضي العام'
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
    permissionsCount: 'Permissions',
    permissionMatrix: 'Permission Matrix',
    saveMatrix: 'Save Changes',
    matrixUpdated: 'Matrix updated successfully',
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
    features: 'Features',
    featureFlags: 'Feature Management',
    ownerType: 'Owner Type',
    ownerId: 'Owner ID',
    customerLabel: 'Customer',
    supplierLabel: 'Supplier',
    selectOwner: 'Select Owner',
    loadFeatures: 'Load Features',
    enabled: 'Enabled',
    disabled: 'Disabled',
    noFeaturesLoaded: 'Select owner type and ID, then click Load',
    saveFeatures: 'Save Features',
    featuresSaved: 'Features saved successfully',
    globalDefault: 'Global Default'
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

type TabType = 'roles' | 'permissions' | 'groups' | 'visibility' | 'matrix' | 'users' | 'features';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  nameAr?: string;
  description?: string;
  isEnabled: boolean;
}

interface FeatureAccess {
  featureCode: string;
  featureName: string;
  featureNameAr?: string;
  description?: string;
  globalEnabled: boolean;
  isEnabled: boolean;
}

interface UserOverride {
  permissionCode: string;
  effect: 'ALLOW' | 'DENY' | 'INHERIT';
}

interface UserListItem {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  primaryRole: string;
  roles: string[];
  status: string;
  isActive: boolean;
}

interface UserDetails {
  user: {
    id: string;
    clientId: string;
    name: string;
    email?: string;
    primaryRole: string;
    status: string;
    isActive: boolean;
  };
  roles: string[];
  rolePermissions: { code: string; module: string }[];
  overrides: { permissionCode: string; effect: string }[];
  effectivePermissions: { code: string; module: string }[];
}

export function AdminPermissionCenter() {
  const { i18n } = useTranslation();
  const { addToast } = useToast();
  const showToast = addToast;
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
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});
  const [savingMatrix, setSavingMatrix] = useState(false);
  
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
  
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [userOverrides, setUserOverrides] = useState<UserOverride[]>([]);
  const [savingOverrides, setSavingOverrides] = useState(false);
  
  const [featureOwnerType, setFeatureOwnerType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [featureOwnerId, setFeatureOwnerId] = useState('');
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(permissions.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [permissions]);

  const getBackendToken = async (): Promise<string | null> => {
    let backendToken = localStorage.getItem('backend_token');
    if (backendToken) return backendToken;
    
    try {
      const credentials = {
        identifier: 'user-1',
        password: '1',
        loginType: 'owner'
      };
      
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.accessToken) {
          localStorage.setItem('backend_token', data.data.accessToken);
          return data.data.accessToken;
        }
      }
    } catch (e) {
      console.error('Backend auth failed:', e);
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const matrixRes = await fetch('/api/v1/permission-center/roles-permissions', { headers });
      if (matrixRes.ok) {
        const matrixData = await matrixRes.json();
        if (matrixData.success && matrixData.data) {
          setRoles(matrixData.data.roles || []);
          setPermissions(matrixData.data.permissions || []);
          setMatrix(matrixData.data.matrix || {});
          
          const uniqueModules = [...new Set((matrixData.data.permissions || []).map((p: Permission) => p.module))];
          setModules(uniqueModules.map((m: string) => ({
            moduleKey: m,
            moduleName: m,
            moduleNameAr: m
          })));
        }
      } else {
        console.warn('Failed to fetch matrix, using empty data');
        setRoles([]);
        setPermissions([]);
        setMatrix({});
        setModules([]);
      }
      
      setGroups([]);
      setVisibilityList([]);
    } catch (e) {
      console.error('Error fetching permission data:', e);
      showToast(isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data', 'error');
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

  const toggleMatrixPermission = (roleId: string, permissionId: string) => {
    setMatrix(prev => {
      const current = prev[roleId] || [];
      if (current.includes(permissionId)) {
        return { ...prev, [roleId]: current.filter(id => id !== permissionId) };
      } else {
        return { ...prev, [roleId]: [...current, permissionId] };
      }
    });
  };

  const handleSaveRolePermissions = async (roleId: string) => {
    setSavingMatrix(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/v1/permission-center/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ permissionIds: matrix[roleId] || [] })
      });

      if (res.ok) {
        showToast(t.matrixUpdated || 'تم تحديث المصفوفة بنجاح', 'success');
      } else {
        const error = await res.json();
        showToast(error.error || (isRTL ? 'خطأ في الحفظ' : 'Error saving'), 'error');
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
    } finally {
      setSavingMatrix(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: usersPagination.limit.toString(),
        ...(usersSearch && { search: usersSearch }),
        ...(usersRoleFilter && { role: usersRoleFilter })
      });

      const res = await fetch(`/api/v1/permission-center/users?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsersList(data.data.users);
          setUsersPagination(data.data.pagination);
        }
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/permission-center/users/${userId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedUser(data.data);
          const overrides: UserOverride[] = permissions.map(p => {
            const existing = data.data.overrides.find((o: any) => o.permissionCode === p.code);
            return {
              permissionCode: p.code,
              effect: existing ? existing.effect : 'INHERIT'
            };
          });
          setUserOverrides(overrides);
          setShowUserDrawer(true);
        }
      }
    } catch (e) {
      console.error('Error fetching user details:', e);
    }
  };

  const handleSaveUserOverrides = async () => {
    if (!selectedUser) return;
    setSavingOverrides(true);
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const activeOverrides = userOverrides
        .filter(o => o.effect !== 'INHERIT')
        .map(o => ({ permissionCode: o.permissionCode, effect: o.effect }));

      const res = await fetch(`/api/v1/permission-center/users/${selectedUser.user.id}/overrides`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ overrides: activeOverrides })
      });

      if (res.ok) {
        showToast(isRTL ? 'تم حفظ الاستثناءات بنجاح' : 'Overrides saved successfully', 'success');
        await fetchUserDetails(selectedUser.user.id);
      } else {
        const error = await res.json();
        showToast(error.error || (isRTL ? 'خطأ في الحفظ' : 'Error saving'), 'error');
      }
    } catch (e) {
      showToast(isRTL ? 'خطأ في الحفظ' : 'Error saving', 'error');
    } finally {
      setSavingOverrides(false);
    }
  };

  const setOverrideEffect = (permCode: string, effect: 'ALLOW' | 'DENY' | 'INHERIT') => {
    setUserOverrides(prev => prev.map(o => 
      o.permissionCode === permCode ? { ...o, effect } : o
    ));
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, usersSearch, usersRoleFilter]);

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
        <button className={tabButtonClass('matrix')} onClick={() => setActiveTab('matrix')} data-testid="tab-matrix">
          <Settings className="h-4 w-4" />
          {t.permissionMatrix || 'مصفوفة الصلاحيات'}
        </button>
        <button className={tabButtonClass('users')} onClick={() => setActiveTab('users')} data-testid="tab-users">
          <UserCheck className="h-4 w-4" />
          {isRTL ? 'المستخدمين والاستثناءات' : 'Users & Overrides'}
        </button>
        <button className={tabButtonClass('features')} onClick={() => setActiveTab('features')} data-testid="tab-features">
          <ToggleLeft className="h-4 w-4" />
          {t.features}
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

          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                        {t.permissions}
                      </th>
                      {roles.map(role => (
                        <th key={role.id} className="px-3 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <span>{isRTL ? role.nameAr || role.name : role.name}</span>
                            {role.isSystem && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded">
                                {t.system}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {permissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-matrix-${perm.id}`}>
                        <td className="px-4 py-2 text-sm sticky left-0 bg-white dark:bg-gray-800 z-10">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">{isRTL ? perm.nameAr || perm.name : perm.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{perm.code}</span>
                          </div>
                        </td>
                        {roles.map(role => {
                          const isChecked = (matrix[role.id] || []).includes(perm.id);
                          const isSuperAdmin = role.code === 'SUPER_ADMIN';
                          return (
                            <td key={role.id} className="px-3 py-2 text-center">
                              <button
                                onClick={() => !isSuperAdmin && toggleMatrixPermission(role.id, perm.id)}
                                disabled={isSuperAdmin}
                                className={`p-2 rounded-lg transition-colors ${
                                  isSuperAdmin 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                                data-testid={`toggle-${role.id}-${perm.id}`}
                              >
                                {isChecked ? (
                                  <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {roles.filter(r => r.code !== 'SUPER_ADMIN').map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleSaveRolePermissions(role.id)}
                    disabled={savingMatrix}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                    data-testid={`button-save-role-${role.id}`}
                  >
                    <Save className="h-4 w-4" />
                    {savingMatrix ? t.saving : `${t.save} - ${isRTL ? role.nameAr || role.name : role.name}`}
                  </button>
                ))}
              </div>

              {permissions.length === 0 && (
                <div className="text-center py-12 text-gray-500">{t.noResults}</div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'بحث عن مستخدم...' : 'Search users...'}
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    data-testid="input-users-search"
                  />
                </div>
                <select
                  value={usersRoleFilter}
                  onChange={(e) => setUsersRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  data-testid="select-users-role-filter"
                >
                  <option value="">{isRTL ? 'كل الأدوار' : 'All Roles'}</option>
                  {roles.map(r => (
                    <option key={r.code} value={r.code}>{isRTL ? r.nameAr || r.name : r.name}</option>
                  ))}
                </select>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
                </div>
              ) : (
                <div className={cardClass}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'المستخدم' : 'User'}</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'الدور الأساسي' : 'Primary Role'}</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'الحالة' : 'Status'}</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {usersList.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-user-${user.id}`}>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                <span className="text-xs text-gray-500">{user.email || user.clientId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {user.primaryRole}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {user.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => fetchUserDetails(user.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                data-testid={`button-edit-overrides-${user.id}`}
                              >
                                <Settings className="h-4 w-4" />
                                {isRTL ? 'إدارة الاستثناءات' : 'Manage Overrides'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {usersList.length === 0 && (
                    <div className="text-center py-12 text-gray-500">{t.noResults}</div>
                  )}

                  {usersPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isRTL ? `صفحة ${usersPagination.page} من ${usersPagination.totalPages}` : `Page ${usersPagination.page} of ${usersPagination.totalPages}`}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchUsers(usersPagination.page - 1)}
                          disabled={usersPagination.page <= 1}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                          data-testid="button-prev-page"
                        >
                          {isRTL ? 'السابق' : 'Prev'}
                        </button>
                        <button
                          onClick={() => fetchUsers(usersPagination.page + 1)}
                          disabled={usersPagination.page >= usersPagination.totalPages}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                          data-testid="button-next-page"
                        >
                          {isRTL ? 'التالي' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ToggleLeft className="h-5 w-5 text-blue-600" />
                  {t.featureFlags}
                </h3>
                
                <div className="flex flex-wrap items-end gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.ownerType}</label>
                    <select
                      value={featureOwnerType}
                      onChange={(e) => {
                        setFeatureOwnerType(e.target.value as 'CUSTOMER' | 'SUPPLIER');
                        setFeaturesLoaded(false);
                        setFeatureAccess([]);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      data-testid="select-feature-owner-type"
                    >
                      <option value="CUSTOMER">{t.customerLabel}</option>
                      <option value="SUPPLIER">{t.supplierLabel}</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.ownerId}</label>
                    <input
                      type="text"
                      value={featureOwnerId}
                      onChange={(e) => {
                        setFeatureOwnerId(e.target.value);
                        setFeaturesLoaded(false);
                      }}
                      placeholder={isRTL ? 'أدخل معرف المالك...' : 'Enter owner ID...'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      data-testid="input-feature-owner-id"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!featureOwnerId.trim()) {
                        showToast(isRTL ? 'يرجى إدخال معرف المالك' : 'Please enter owner ID', 'error');
                        return;
                      }
                      setFeaturesLoading(true);
                      try {
                        const token = await getBackendToken();
                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                        if (token) headers['Authorization'] = `Bearer ${token}`;
                        
                        const res = await fetch(`/api/v1/permission-center/features/access?ownerType=${featureOwnerType}&ownerId=${featureOwnerId}`, { headers });
                        const data = await res.json();
                        if (data.success) {
                          setFeatureAccess(data.data.features || []);
                          setFeaturesLoaded(true);
                        } else {
                          showToast(data.error || 'Failed to load features', 'error');
                        }
                      } catch (e) {
                        console.error('Error loading features:', e);
                        showToast(isRTL ? 'فشل تحميل المميزات' : 'Failed to load features', 'error');
                      }
                      setFeaturesLoading(false);
                    }}
                    disabled={featuresLoading || !featureOwnerId.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    data-testid="button-load-features"
                  >
                    {featuresLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {t.loadFeatures}
                  </button>
                </div>

                {!featuresLoaded ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ToggleLeft className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>{t.noFeaturesLoaded}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {featureAccess.map(feature => (
                      <div
                        key={feature.featureCode}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        data-testid={`feature-row-${feature.featureCode}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {isRTL ? feature.featureNameAr || feature.featureName : feature.featureName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                          <p className="text-xs text-gray-400 mt-1 font-mono">{feature.featureCode}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${feature.globalEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'}`}>
                            {t.globalDefault}: {feature.globalEnabled ? t.enabled : t.disabled}
                          </span>
                          <button
                            onClick={() => {
                              setFeatureAccess(prev => prev.map(f => 
                                f.featureCode === feature.featureCode 
                                  ? { ...f, isEnabled: !f.isEnabled }
                                  : f
                              ));
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${feature.isEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            data-testid={`toggle-feature-${feature.featureCode}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feature.isEnabled ? (isRTL ? 'translate-x-1' : 'translate-x-6') : (isRTL ? 'translate-x-6' : 'translate-x-1')}`} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={async () => {
                          setSavingFeatures(true);
                          try {
                            const token = await getBackendToken();
                            const headers: HeadersInit = { 'Content-Type': 'application/json' };
                            if (token) headers['Authorization'] = `Bearer ${token}`;
                            
                            const res = await fetch('/api/v1/permission-center/features/access', {
                              method: 'PUT',
                              headers,
                              body: JSON.stringify({
                                ownerType: featureOwnerType,
                                ownerId: featureOwnerId,
                                features: featureAccess.map(f => ({
                                  featureCode: f.featureCode,
                                  isEnabled: f.isEnabled
                                }))
                              })
                            });
                            
                            const data = await res.json();
                            if (data.success) {
                              showToast(t.featuresSaved, 'success');
                            } else {
                              showToast(data.error || 'Failed to save features', 'error');
                            }
                          } catch (e) {
                            console.error('Error saving features:', e);
                            showToast(isRTL ? 'فشل حفظ المميزات' : 'Failed to save features', 'error');
                          }
                          setSavingFeatures(false);
                        }}
                        disabled={savingFeatures}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        data-testid="button-save-features"
                      >
                        {savingFeatures ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t.saveFeatures}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showUserDrawer && selectedUser && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUserDrawer(false)} />
          <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isRTL ? 'استثناءات الصلاحيات' : 'Permission Overrides'}
                </h2>
                <p className="text-sm text-gray-500">{selectedUser.user.name} ({selectedUser.user.clientId})</p>
              </div>
              <button
                onClick={() => setShowUserDrawer(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                data-testid="button-close-drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'الأدوار المعينة' : 'Assigned Roles'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map(role => (
                    <span key={role} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {isRTL ? 'تجاوزات الصلاحيات' : 'Permission Overrides'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {isRTL ? 'اختر "السماح" لمنح صلاحية، أو "الرفض" لحظرها، أو "وراثة" لاستخدام صلاحيات الدور' : 'Select "Allow" to grant, "Deny" to block, or "Inherit" to use role permissions'}
                </p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {userOverrides.map(override => {
                    const perm = permissions.find(p => p.code === override.permissionCode);
                    if (!perm) return null;
                    const hasFromRole = selectedUser.rolePermissions.some(rp => rp.code === perm.code);
                    return (
                      <div key={perm.code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg" data-testid={`override-row-${perm.code}`}>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {isRTL ? perm.nameAr || perm.name : perm.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{perm.code}</span>
                            {hasFromRole && (
                              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                                {isRTL ? 'من الدور' : 'From Role'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setOverrideEffect(perm.code, 'ALLOW')}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                              override.effect === 'ALLOW' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                            }`}
                            data-testid={`btn-allow-${perm.code}`}
                          >
                            {t.allow}
                          </button>
                          <button
                            onClick={() => setOverrideEffect(perm.code, 'DENY')}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                              override.effect === 'DENY' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/50'
                            }`}
                            data-testid={`btn-deny-${perm.code}`}
                          >
                            {t.deny}
                          </button>
                          <button
                            onClick={() => setOverrideEffect(perm.code, 'INHERIT')}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                              override.effect === 'INHERIT' 
                                ? 'bg-gray-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                            data-testid={`btn-inherit-${perm.code}`}
                          >
                            {isRTL ? 'وراثة' : 'Inherit'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'الصلاحيات الفعلية' : 'Effective Permissions'}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.effectivePermissions.map(ep => (
                    <span key={ep.code} className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                      {ep.code}
                    </span>
                  ))}
                  {selectedUser.effectivePermissions.length === 0 && (
                    <span className="text-sm text-gray-500">{isRTL ? 'لا توجد صلاحيات فعالة' : 'No effective permissions'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUserDrawer(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  data-testid="button-cancel-overrides"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveUserOverrides}
                  disabled={savingOverrides}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  data-testid="button-save-overrides"
                >
                  {savingOverrides ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
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
