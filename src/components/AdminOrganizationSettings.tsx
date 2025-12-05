
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { OrganizationSettings, Organization, OrganizationUser, ScopedPermissionKey } from '../types';
import { 
    Building2, Users, Shield, Settings, Save, RefreshCw, 
    Eye, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
    Clock, Activity, AlertTriangle, Info, Check, X, Search,
    UserCog, Building, Store, Megaphone, UserPlus, Mail
} from 'lucide-react';
import { useToast } from '../services/ToastContext';

export const AdminOrganizationSettings: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [settings, setSettings] = useState<OrganizationSettings | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        general: true,
        limits: false,
        permissions: false,
        activity: false
    });
    const [searchOrg, setSearchOrg] = useState('');
    const [selectedOrgType, setSelectedOrgType] = useState<string>('all');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [settingsData, orgsData] = await Promise.all([
                MockApi.getOrganizationSettings(),
                MockApi.getOrganizations()
            ]);
            setSettings(settingsData);
            setOrganizations(orgsData);
        } catch (error) {
            console.error('Failed to load organization settings:', error);
            addToast('فشل في تحميل الإعدادات', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await MockApi.updateOrganizationSettings(settings);
            addToast('تم حفظ الإعدادات بنجاح', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            addToast('فشل في حفظ الإعدادات', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateSetting = <K extends keyof OrganizationSettings>(key: K, value: OrganizationSettings[K]) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
    };

    const permissionLabels: Record<ScopedPermissionKey, string> = {
        'adv_view_campaigns': 'عرض الحملات الإعلانية',
        'adv_manage_campaigns': 'إدارة الحملات الإعلانية',
        'adv_manage_slots': 'إدارة فتحات الإعلانات',
        'adv_view_reports': 'عرض التقارير الإعلانية',
        'sup_view_forwarded_requests': 'عرض الطلبات المحولة',
        'sup_submit_offers': 'تقديم عروض',
        'sup_view_team_activity': 'عرض نشاط الفريق',
        'sup_manage_products': 'إدارة المنتجات',
        'sup_view_analytics': 'عرض الإحصائيات',
        'cust_create_orders': 'إنشاء طلبات',
        'cust_view_orders': 'عرض الطلبات',
        'cust_create_installment_requests': 'إنشاء طلبات تقسيط',
        'cust_manage_installment_requests': 'إدارة طلبات التقسيط',
        'cust_use_trader_tools': 'استخدام أدوات التاجر',
        'cust_view_team_activity': 'عرض نشاط الفريق',
        'cust_view_prices': 'عرض الأسعار',
        'cust_manage_cart': 'إدارة السلة',
        'aff_view_links': 'عرض روابط الإحالة',
        'aff_manage_links': 'إدارة روابط الإحالة',
        'aff_view_commissions': 'عرض العمولات',
        'aff_withdraw_commissions': 'سحب العمولات',
        'aff_view_analytics': 'عرض الإحصائيات',
        'org_manage_team': 'إدارة الفريق',
        'org_view_logs': 'عرض سجل النشاط',
        'org_view_settings': 'عرض الإعدادات',
        'org_edit_profile': 'تعديل الملف الشخصي'
    };

    const renderToggle = (value: boolean, onChange: (val: boolean) => void, label: string) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-slate-300 text-sm">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-amber-500' : 'bg-slate-600'
                }`}
                data-testid={`toggle-${label.replace(/\s+/g, '-')}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );

    const renderNumberInput = (value: number, onChange: (val: number) => void, label: string, min = 1, max = 100) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-slate-300 text-sm">{label}</span>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
                className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-center text-sm"
                min={min}
                max={max}
                data-testid={`input-${label.replace(/\s+/g, '-')}`}
            />
        </div>
    );

    const renderPermissionCheckboxes = (
        selectedPermissions: ScopedPermissionKey[],
        onChange: (perms: ScopedPermissionKey[]) => void,
        availablePermissions: ScopedPermissionKey[]
    ) => (
        <div className="grid grid-cols-2 gap-2 mt-2">
            {availablePermissions.map(perm => (
                <label
                    key={perm}
                    className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300"
                >
                    <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                onChange([...selectedPermissions, perm]);
                            } else {
                                onChange(selectedPermissions.filter(p => p !== perm));
                            }
                        }}
                        className="rounded border-slate-600 bg-slate-700 text-amber-500"
                    />
                    {permissionLabels[perm]}
                </label>
            ))}
        </div>
    );

    const filteredOrgs = organizations.filter(org => {
        const matchesSearch = org.name.toLowerCase().includes(searchOrg.toLowerCase());
        const matchesType = selectedOrgType === 'all' || org.type === selectedOrgType;
        return matchesSearch && matchesType;
    });

    const orgTypeLabels = {
        customer: 'عميل',
        supplier: 'مورد',
        advertiser: 'معلن',
        affiliate: 'مسوق'
    };

    const orgTypeIcons = {
        customer: <Building2 size={16} />,
        supplier: <Store size={16} />,
        advertiser: <Megaphone size={16} />,
        affiliate: <UserPlus size={16} />
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center text-red-500 py-8">
                <AlertTriangle size={48} className="mx-auto mb-4" />
                <p>فشل في تحميل الإعدادات</p>
            </div>
        );
    }

    const customerPerms: ScopedPermissionKey[] = ['cust_create_orders', 'cust_view_orders', 'cust_create_installment_requests', 'cust_manage_installment_requests', 'cust_use_trader_tools', 'cust_view_team_activity', 'cust_view_prices', 'cust_manage_cart', 'org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'];
    const supplierPerms: ScopedPermissionKey[] = ['sup_view_forwarded_requests', 'sup_submit_offers', 'sup_view_team_activity', 'sup_manage_products', 'sup_view_analytics', 'org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'];
    const advertiserPerms: ScopedPermissionKey[] = ['adv_view_campaigns', 'adv_manage_campaigns', 'adv_manage_slots', 'adv_view_reports', 'org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'];
    const affiliatePerms: ScopedPermissionKey[] = ['aff_view_links', 'aff_manage_links', 'aff_view_commissions', 'aff_withdraw_commissions', 'aff_view_analytics', 'org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'];

    return (
        <div className="p-6 bg-slate-900 min-h-screen" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-amber-500" size={28} />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">إعدادات المنظمات والفرق</h1>
                            <p className="text-sm text-slate-400">إدارة إعدادات الفرق والصلاحيات لجميع أنواع الحسابات</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        data-testid="button-save-org-settings"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        حفظ الإعدادات
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('general')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-750 transition-colors"
                            data-testid="section-general-toggle"
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="text-amber-500" size={20} />
                                <span className="font-semibold text-slate-100">الإعدادات العامة</span>
                            </div>
                            {expandedSections.general ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>
                        
                        {expandedSections.general && (
                            <div className="p-4 border-t border-slate-700 space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-3">تفعيل الفرق حسب النوع</h3>
                                        {renderToggle(settings.enableTeamsForCustomers, (v) => updateSetting('enableTeamsForCustomers', v), 'فرق العملاء')}
                                        {renderToggle(settings.enableTeamsForSuppliers, (v) => updateSetting('enableTeamsForSuppliers', v), 'فرق الموردين')}
                                        {renderToggle(settings.enableTeamsForAdvertisers, (v) => updateSetting('enableTeamsForAdvertisers', v), 'فرق المعلنين')}
                                        {renderToggle(settings.enableTeamsForAffiliates, (v) => updateSetting('enableTeamsForAffiliates', v), 'فرق المسوقين')}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-3">السماح بصلاحيات مخصصة</h3>
                                        {renderToggle(settings.allowCustomPermissionsForCustomers, (v) => updateSetting('allowCustomPermissionsForCustomers', v), 'للعملاء')}
                                        {renderToggle(settings.allowCustomPermissionsForSuppliers, (v) => updateSetting('allowCustomPermissionsForSuppliers', v), 'للموردين')}
                                        {renderToggle(settings.allowCustomPermissionsForAdvertisers, (v) => updateSetting('allowCustomPermissionsForAdvertisers', v), 'للمعلنين')}
                                        {renderToggle(settings.allowCustomPermissionsForAffiliates, (v) => updateSetting('allowCustomPermissionsForAffiliates', v), 'للمسوقين')}
                                    </div>
                                </div>
                                <div className="border-t border-slate-600 pt-4 mt-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-3">إعدادات الدعوات</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderToggle(settings.requireEmailVerification, (v) => updateSetting('requireEmailVerification', v), 'طلب تحقق البريد الإلكتروني')}
                                        {renderNumberInput(settings.invitationExpiryHours, (v) => updateSetting('invitationExpiryHours', v), 'مدة صلاحية الدعوة (ساعات)', 1, 168)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('limits')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-750 transition-colors"
                            data-testid="section-limits-toggle"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="text-amber-500" size={20} />
                                <span className="font-semibold text-slate-100">حدود أعضاء الفريق</span>
                            </div>
                            {expandedSections.limits ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>
                        
                        {expandedSections.limits && (
                            <div className="p-4 border-t border-slate-700">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        {renderNumberInput(settings.maxCustomerEmployees, (v) => updateSetting('maxCustomerEmployees', v), 'الحد الأقصى لموظفي العميل', 1, 50)}
                                        {renderNumberInput(settings.maxSupplierEmployees, (v) => updateSetting('maxSupplierEmployees', v), 'الحد الأقصى لموظفي المورد', 1, 50)}
                                    </div>
                                    <div className="space-y-2">
                                        {renderNumberInput(settings.maxAdvertiserEmployees, (v) => updateSetting('maxAdvertiserEmployees', v), 'الحد الأقصى لموظفي المعلن', 1, 50)}
                                        {renderNumberInput(settings.maxAffiliateEmployees, (v) => updateSetting('maxAffiliateEmployees', v), 'الحد الأقصى لموظفي المسوق', 1, 50)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('permissions')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-750 transition-colors"
                            data-testid="section-permissions-toggle"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="text-amber-500" size={20} />
                                <span className="font-semibold text-slate-100">الصلاحيات الافتراضية</span>
                            </div>
                            {expandedSections.permissions ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>
                        
                        {expandedSections.permissions && (
                            <div className="p-4 border-t border-slate-700 space-y-6">
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                                        <Building2 size={16} /> صلاحيات العملاء
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">المدير:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultCustomerManagerPermissions,
                                                (v) => updateSetting('defaultCustomerManagerPermissions', v),
                                                customerPerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">الموظف:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultCustomerStaffPermissions,
                                                (v) => updateSetting('defaultCustomerStaffPermissions', v),
                                                customerPerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">قراءة فقط:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultCustomerReadonlyPermissions,
                                                (v) => updateSetting('defaultCustomerReadonlyPermissions', v),
                                                customerPerms
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                                        <Store size={16} /> صلاحيات الموردين
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">المدير:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultSupplierManagerPermissions,
                                                (v) => updateSetting('defaultSupplierManagerPermissions', v),
                                                supplierPerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">الموظف:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultSupplierStaffPermissions,
                                                (v) => updateSetting('defaultSupplierStaffPermissions', v),
                                                supplierPerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">قراءة فقط:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultSupplierReadonlyPermissions,
                                                (v) => updateSetting('defaultSupplierReadonlyPermissions', v),
                                                supplierPerms
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                                        <Megaphone size={16} /> صلاحيات المعلنين
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">المدير:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultAdvertiserManagerPermissions,
                                                (v) => updateSetting('defaultAdvertiserManagerPermissions', v),
                                                advertiserPerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">الموظف:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultAdvertiserStaffPermissions,
                                                (v) => updateSetting('defaultAdvertiserStaffPermissions', v),
                                                advertiserPerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">قراءة فقط:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultAdvertiserReadonlyPermissions,
                                                (v) => updateSetting('defaultAdvertiserReadonlyPermissions', v),
                                                advertiserPerms
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                                        <UserPlus size={16} /> صلاحيات المسوقين
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">المدير:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultAffiliateManagerPermissions,
                                                (v) => updateSetting('defaultAffiliateManagerPermissions', v),
                                                affiliatePerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">الموظف:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultAffiliateStaffPermissions,
                                                (v) => updateSetting('defaultAffiliateStaffPermissions', v),
                                                affiliatePerms
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-medium">قراءة فقط:</span>
                                            {renderPermissionCheckboxes(
                                                settings.defaultAffiliateReadonlyPermissions,
                                                (v) => updateSetting('defaultAffiliateReadonlyPermissions', v),
                                                affiliatePerms
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('activity')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-750 transition-colors"
                            data-testid="section-activity-toggle"
                        >
                            <div className="flex items-center gap-3">
                                <Activity className="text-amber-500" size={20} />
                                <span className="font-semibold text-slate-100">سجل النشاط</span>
                            </div>
                            {expandedSections.activity ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>
                        
                        {expandedSections.activity && (
                            <div className="p-4 border-t border-slate-700 space-y-4">
                                {renderToggle(settings.trackTeamActivityPerOrganization, (v) => updateSetting('trackTeamActivityPerOrganization', v), 'تتبع نشاط الفريق لكل منظمة')}
                                {renderNumberInput(settings.activityLogRetentionDays, (v) => updateSetting('activityLogRetentionDays', v), 'مدة الاحتفاظ بالسجلات (أيام)', 7, 365)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                            <Building2 size={20} className="text-amber-500" />
                            المنظمات المسجلة ({organizations.length})
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchOrg}
                                    onChange={(e) => setSearchOrg(e.target.value)}
                                    placeholder="بحث..."
                                    className="pr-9 pl-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-400 w-48"
                                    data-testid="input-search-orgs"
                                />
                            </div>
                            <select
                                value={selectedOrgType}
                                onChange={(e) => setSelectedOrgType(e.target.value)}
                                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100"
                                data-testid="select-org-type"
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
                        <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                            <Info size={48} className="mx-auto mb-4 text-slate-500" />
                            <p className="text-slate-400">لا توجد منظمات مسجلة بعد</p>
                        </div>
                    ) : (
                        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-750">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">المنظمة</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">النوع</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">الحالة</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">تاريخ الإنشاء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredOrgs.map(org => (
                                        <tr key={org.id} className="hover:bg-slate-750/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-100 font-medium">{org.name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                                                    {orgTypeIcons[org.type]}
                                                    {orgTypeLabels[org.type]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                                    org.isActive ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                                                }`}>
                                                    {org.isActive ? <Check size={12} /> : <X size={12} />}
                                                    {org.isActive ? 'نشط' : 'معطل'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">
                                                {new Date(org.createdAt).toLocaleDateString('ar-SA')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
