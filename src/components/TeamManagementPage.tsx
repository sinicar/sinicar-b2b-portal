import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../services/ToastContext';
import { MockApi } from '../services/mockApi';
import {
    Organization,
    OrganizationType,
    OrganizationUser,
    OrganizationUserRole,
    OrganizationStats,
    ScopedPermissionKey,
    TeamInvitation
} from '../types';
import {
    Users, UserPlus, Mail, Shield, Activity, Settings, Trash2, Edit2,
    Check, X, Clock, Search, Filter, Eye, EyeOff, Building2, ChevronDown,
    Send, Copy, AlertCircle, UserCheck, UserX, Ban, MoreVertical, RefreshCw
} from 'lucide-react';
import { Modal } from './Modal';

interface TeamManagementPageProps {
    organizationType: OrganizationType;
    entityId: string;
    entityName: string;
    currentUserId: string;
}

const ROLE_LABELS: Record<OrganizationUserRole, { ar: string; en: string; color: string }> = {
    owner: { ar: 'المالك', en: 'Owner', color: 'bg-amber-500' },
    manager: { ar: 'مدير', en: 'Manager', color: 'bg-blue-500' },
    staff: { ar: 'موظف', en: 'Staff', color: 'bg-green-500' },
    readonly: { ar: 'للقراءة فقط', en: 'Read Only', color: 'bg-gray-500' }
};

const PERMISSION_LABELS: Record<ScopedPermissionKey, { ar: string; en: string; category: string }> = {
    'adv_view_campaigns': { ar: 'عرض الحملات', en: 'View Campaigns', category: 'advertising' },
    'adv_manage_campaigns': { ar: 'إدارة الحملات', en: 'Manage Campaigns', category: 'advertising' },
    'adv_manage_slots': { ar: 'إدارة المساحات الإعلانية', en: 'Manage Ad Slots', category: 'advertising' },
    'adv_view_reports': { ar: 'عرض التقارير', en: 'View Reports', category: 'advertising' },
    'sup_view_forwarded_requests': { ar: 'عرض الطلبات المحولة', en: 'View Forwarded Requests', category: 'supplier' },
    'sup_submit_offers': { ar: 'تقديم العروض', en: 'Submit Offers', category: 'supplier' },
    'sup_view_team_activity': { ar: 'عرض نشاط الفريق', en: 'View Team Activity', category: 'supplier' },
    'sup_manage_products': { ar: 'إدارة المنتجات', en: 'Manage Products', category: 'supplier' },
    'sup_view_analytics': { ar: 'عرض التحليلات', en: 'View Analytics', category: 'supplier' },
    'cust_create_orders': { ar: 'إنشاء الطلبات', en: 'Create Orders', category: 'customer' },
    'cust_view_orders': { ar: 'عرض الطلبات', en: 'View Orders', category: 'customer' },
    'cust_create_installment_requests': { ar: 'إنشاء طلبات التقسيط', en: 'Create Installment Requests', category: 'customer' },
    'cust_manage_installment_requests': { ar: 'إدارة طلبات التقسيط', en: 'Manage Installment Requests', category: 'customer' },
    'cust_use_trader_tools': { ar: 'استخدام أدوات التاجر', en: 'Use Trader Tools', category: 'customer' },
    'cust_view_team_activity': { ar: 'عرض نشاط الفريق', en: 'View Team Activity', category: 'customer' },
    'cust_view_prices': { ar: 'عرض الأسعار', en: 'View Prices', category: 'customer' },
    'cust_manage_cart': { ar: 'إدارة السلة', en: 'Manage Cart', category: 'customer' },
    'aff_view_links': { ar: 'عرض الروابط', en: 'View Links', category: 'affiliate' },
    'aff_manage_links': { ar: 'إدارة الروابط', en: 'Manage Links', category: 'affiliate' },
    'aff_view_commissions': { ar: 'عرض العمولات', en: 'View Commissions', category: 'affiliate' },
    'aff_withdraw_commissions': { ar: 'سحب العمولات', en: 'Withdraw Commissions', category: 'affiliate' },
    'aff_view_analytics': { ar: 'عرض التحليلات', en: 'View Analytics', category: 'affiliate' },
    'org_manage_team': { ar: 'إدارة الفريق', en: 'Manage Team', category: 'organization' },
    'org_view_logs': { ar: 'عرض السجلات', en: 'View Logs', category: 'organization' },
    'org_view_settings': { ar: 'عرض الإعدادات', en: 'View Settings', category: 'organization' },
    'org_edit_profile': { ar: 'تعديل الملف', en: 'Edit Profile', category: 'organization' }
};

const PERMISSION_CATEGORIES: Record<string, { ar: string; en: string }> = {
    customer: { ar: 'العميل', en: 'Customer' },
    supplier: { ar: 'المورد', en: 'Supplier' },
    advertising: { ar: 'الإعلانات', en: 'Advertising' },
    affiliate: { ar: 'المسوق', en: 'Affiliate' },
    organization: { ar: 'المنظمة', en: 'Organization' }
};

function getOrganizationTypeLabel(type: OrganizationType): { ar: string; en: string } {
    switch (type) {
        case 'customer': return { ar: 'عميل', en: 'Customer' };
        case 'supplier': return { ar: 'مورد', en: 'Supplier' };
        case 'advertiser': return { ar: 'معلن', en: 'Advertiser' };
        case 'affiliate': return { ar: 'مسوق', en: 'Affiliate' };
        case 'platform': return { ar: 'المنصة', en: 'Platform' };
        default: return { ar: type, en: type };
    }
}

function getPermissionsForType(type: OrganizationType): ScopedPermissionKey[] {
    const common: ScopedPermissionKey[] = ['org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'];
    
    switch (type) {
        case 'customer':
            return [
                ...common,
                'cust_create_orders', 'cust_view_orders',
                'cust_create_installment_requests', 'cust_manage_installment_requests',
                'cust_use_trader_tools', 'cust_view_team_activity',
                'cust_view_prices', 'cust_manage_cart'
            ];
        case 'supplier':
            return [
                ...common,
                'sup_view_forwarded_requests', 'sup_submit_offers',
                'sup_view_team_activity', 'sup_manage_products',
                'sup_view_analytics'
            ];
        case 'advertiser':
            return [
                ...common,
                'adv_view_campaigns', 'adv_manage_campaigns',
                'adv_manage_slots', 'adv_view_reports'
            ];
        case 'affiliate':
            return [
                ...common,
                'aff_view_links', 'aff_manage_links',
                'aff_view_commissions', 'aff_withdraw_commissions',
                'aff_view_analytics'
            ];
        default:
            return common;
    }
}

function groupPermissionsByCategory(permissions: ScopedPermissionKey[]): Record<string, ScopedPermissionKey[]> {
    const grouped: Record<string, ScopedPermissionKey[]> = {};
    permissions.forEach(p => {
        const meta = PERMISSION_LABELS[p];
        const category = meta?.category || 'other';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(p);
    });
    return grouped;
}

export function TeamManagementPage({
    organizationType,
    entityId,
    entityName,
    currentUserId
}: TeamManagementPageProps) {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();
    const isRTL = i18n.language === 'ar';

    const [organization, setOrganization] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationUser[]>([]);
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [stats, setStats] = useState<OrganizationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<OrganizationUserRole | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'activity'>('members');

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditMemberModal, setShowEditMemberModal] = useState(false);
    const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<OrganizationUser | null>(null);

    const [inviteForm, setInviteForm] = useState({
        email: '',
        name: '',
        role: 'staff' as OrganizationUserRole,
        permissions: [] as ScopedPermissionKey[]
    });

    const [editForm, setEditForm] = useState({
        role: 'staff' as OrganizationUserRole,
        permissions: [] as ScopedPermissionKey[],
        jobTitle: '',
        department: ''
    });

    const isOwner = organization?.ownerUserId === currentUserId;
    const currentMember = members.find(m => m.userId === currentUserId);
    const canManageTeam = isOwner || (currentMember?.permissions.includes('org_manage_team') ?? false);
    const availablePermissions = useMemo(() => getPermissionsForType(organizationType), [organizationType]);
    const groupedPermissions = useMemo(() => groupPermissionsByCategory(availablePermissions), [availablePermissions]);

    useEffect(() => {
        loadData();
    }, [organizationType, entityId]);

    async function loadData() {
        setLoading(true);
        try {
            let org = await MockApi.getOrCreateOrganizationForEntity(organizationType, entityId, entityName, currentUserId);
            setOrganization(org);

            if (org) {
                const [orgMembers, orgInvitations, orgStats] = await Promise.all([
                    MockApi.getOrganizationUsers(org.id),
                    MockApi.getTeamInvitations(org.id),
                    MockApi.getOrganizationStats(org.id)
                ]);
                setMembers(orgMembers);
                setInvitations(orgInvitations);
                setStats(orgStats);
            }
        } catch (error) {
            console.error('Error loading team data:', error);
            addToast('حدث خطأ في تحميل بيانات الفريق', 'error');
        } finally {
            setLoading(false);
        }
    }

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = searchQuery === '' || 
                member.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.department?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || member.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [members, searchQuery, roleFilter]);

    async function handleInviteMember() {
        if (!organization || !inviteForm.email) {
            addToast('يرجى إدخال البريد الإلكتروني', 'error');
            return;
        }

        try {
            const settings = await MockApi.getOrganizationSettings();
            const currentMembers = await MockApi.getOrganizationUsers(organization.id);
            const maxLimit = organization.type === 'customer' ? settings.maxCustomerEmployees :
                            organization.type === 'supplier' ? settings.maxSupplierEmployees :
                            organization.type === 'advertiser' ? settings.maxAdvertiserEmployees :
                            settings.maxAffiliateEmployees;
            
            if (currentMembers.length >= maxLimit) {
                addToast('تم الوصول للحد الأقصى من الأعضاء', 'error');
                return;
            }

            const invitation = await MockApi.createTeamInvitation(
                organization.id,
                currentUserId,
                {
                    email: inviteForm.email,
                    name: inviteForm.name,
                    role: inviteForm.role,
                    permissions: inviteForm.permissions
                }
            );

            setInvitations(prev => [...prev, invitation]);
            setShowInviteModal(false);
            setInviteForm({ email: '', name: '', role: 'staff', permissions: [] });
            addToast('تم إرسال الدعوة بنجاح', 'success');
            await loadData();
        } catch (error) {
            console.error('Error inviting member:', error);
            addToast('حدث خطأ في إرسال الدعوة', 'error');
        }
    }

    async function handleUpdateMember() {
        if (!organization || !selectedMember) return;

        try {
            await MockApi.updateOrganizationUser(selectedMember.id, {
                role: editForm.role,
                permissions: editForm.permissions,
                jobTitle: editForm.jobTitle,
                department: editForm.department
            });

            setShowEditMemberModal(false);
            setSelectedMember(null);
            addToast('تم تحديث العضو بنجاح', 'success');
            await loadData();
        } catch (error) {
            console.error('Error updating member:', error);
            addToast('حدث خطأ في تحديث العضو', 'error');
        }
    }

    async function handleRemoveMember() {
        if (!organization || !selectedMember) return;

        try {
            await MockApi.removeOrganizationUser(selectedMember.id);
            setShowRemoveMemberModal(false);
            setSelectedMember(null);
            addToast('تم إزالة العضو بنجاح', 'success');
            await loadData();
        } catch (error) {
            console.error('Error removing member:', error);
            addToast('حدث خطأ في إزالة العضو', 'error');
        }
    }

    async function handleCancelInvitation(invitationId: string) {
        try {
            await MockApi.cancelTeamInvitation(invitationId);
            addToast('تم إلغاء الدعوة', 'success');
            await loadData();
        } catch (error) {
            console.error('Error cancelling invitation:', error);
            addToast('حدث خطأ في إلغاء الدعوة', 'error');
        }
    }

    async function handleToggleMemberStatus(member: OrganizationUser) {
        if (!organization) return;
        try {
            await MockApi.updateOrganizationUser(member.id, {
                isActive: !member.isActive
            });
            addToast(member.isActive ? 'تم تعطيل العضو' : 'تم تفعيل العضو', 'success');
            await loadData();
        } catch (error) {
            addToast('حدث خطأ', 'error');
        }
    }

    function openEditModal(member: OrganizationUser) {
        setSelectedMember(member);
        setEditForm({
            role: member.role,
            permissions: [...member.permissions],
            jobTitle: member.jobTitle || '',
            department: member.department || ''
        });
        setShowEditMemberModal(true);
    }

    function openRemoveModal(member: OrganizationUser) {
        setSelectedMember(member);
        setShowRemoveMemberModal(true);
    }

    function togglePermission(permission: ScopedPermissionKey, form: 'invite' | 'edit') {
        if (form === 'invite') {
            setInviteForm(prev => ({
                ...prev,
                permissions: prev.permissions.includes(permission)
                    ? prev.permissions.filter(p => p !== permission)
                    : [...prev.permissions, permission]
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                permissions: prev.permissions.includes(permission)
                    ? prev.permissions.filter(p => p !== permission)
                    : [...prev.permissions, permission]
            }));
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white" data-testid="text-team-title">
                                {isRTL ? 'إدارة الفريق' : 'Team Management'}
                            </h1>
                            <p className="text-slate-400">
                                {entityName} - {isRTL ? getOrganizationTypeLabel(organizationType).ar : getOrganizationTypeLabel(organizationType).en}
                            </p>
                        </div>
                    </div>
                    
                    {canManageTeam && (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
                            data-testid="button-invite-member"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>{isRTL ? 'دعوة عضو' : 'Invite Member'}</span>
                        </button>
                    )}
                </div>

                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-slate-700/50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-white" data-testid="text-total-members">{stats.totalMembers}</div>
                            <div className="text-sm text-slate-400">{isRTL ? 'إجمالي الأعضاء' : 'Total Members'}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-400" data-testid="text-active-members">{stats.activeMembers}</div>
                            <div className="text-sm text-slate-400">{isRTL ? 'أعضاء نشطين' : 'Active Members'}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-amber-400" data-testid="text-pending-invites">{stats.pendingInvitations}</div>
                            <div className="text-sm text-slate-400">{isRTL ? 'دعوات معلقة' : 'Pending Invites'}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-400" data-testid="text-recent-activities">{stats.recentActivities}</div>
                            <div className="text-sm text-slate-400">{isRTL ? 'نشاطات حديثة' : 'Recent Activities'}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-3 font-medium transition-colors ${
                        activeTab === 'members'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-white'
                    }`}
                    data-testid="tab-members"
                >
                    <Users className="w-4 h-4 inline-block mr-2" />
                    {isRTL ? 'الأعضاء' : 'Members'} ({members.length})
                </button>
                <button
                    onClick={() => setActiveTab('invitations')}
                    className={`px-4 py-3 font-medium transition-colors ${
                        activeTab === 'invitations'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-white'
                    }`}
                    data-testid="tab-invitations"
                >
                    <Mail className="w-4 h-4 inline-block mr-2" />
                    {isRTL ? 'الدعوات' : 'Invitations'} ({invitations.filter(i => i.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-4 py-3 font-medium transition-colors ${
                        activeTab === 'activity'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-white'
                    }`}
                    data-testid="tab-activity"
                >
                    <Activity className="w-4 h-4 inline-block mr-2" />
                    {isRTL ? 'النشاط' : 'Activity'}
                </button>
            </div>

            {activeTab === 'members' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isRTL ? 'بحث في الأعضاء...' : 'Search members...'}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                data-testid="input-search-members"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as OrganizationUserRole | 'all')}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            data-testid="select-role-filter"
                        >
                            <option value="all">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
                            {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                <option key={role} value={role}>
                                    {isRTL ? label.ar : label.en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                        {filteredMembers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>{isRTL ? 'لا يوجد أعضاء' : 'No members found'}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="p-4 hover:bg-slate-700/50 transition-colors"
                                        data-testid={`member-row-${member.userId}`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                                    <span className="text-white font-medium">
                                                        {member.userId.slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white">
                                                            {member.jobTitle || `User ${member.userId}`}
                                                        </span>
                                                        {organization?.ownerUserId === member.userId && (
                                                            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                                                                {isRTL ? 'المالك' : 'Owner'}
                                                            </span>
                                                        )}
                                                        {!member.isActive && (
                                                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                                                                {isRTL ? 'معطل' : 'Inactive'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-slate-400 flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs text-white ${ROLE_LABELS[member.role].color}`}>
                                                            {isRTL ? ROLE_LABELS[member.role].ar : ROLE_LABELS[member.role].en}
                                                        </span>
                                                        {member.department && (
                                                            <span>• {member.department}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {canManageTeam && member.role !== 'owner' && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleMemberStatus(member)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            member.isActive
                                                                ? 'text-green-400 hover:bg-green-500/20'
                                                                : 'text-red-400 hover:bg-red-500/20'
                                                        }`}
                                                        title={member.isActive ? 'Deactivate' : 'Activate'}
                                                        data-testid={`button-toggle-status-${member.userId}`}
                                                    >
                                                        {member.isActive ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(member)}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                        title="Edit"
                                                        data-testid={`button-edit-member-${member.userId}`}
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openRemoveModal(member)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Remove"
                                                        data-testid={`button-remove-member-${member.userId}`}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {member.permissions.length > 0 && member.role !== 'owner' && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {member.permissions.slice(0, 5).map((perm) => (
                                                    <span
                                                        key={perm}
                                                        className="px-2 py-0.5 text-xs bg-slate-600/50 text-slate-300 rounded"
                                                    >
                                                        {isRTL ? PERMISSION_LABELS[perm]?.ar || perm : PERMISSION_LABELS[perm]?.en || perm}
                                                    </span>
                                                ))}
                                                {member.permissions.length > 5 && (
                                                    <span className="px-2 py-0.5 text-xs bg-slate-600/50 text-slate-300 rounded">
                                                        +{member.permissions.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'invitations' && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    {invitations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{isRTL ? 'لا توجد دعوات' : 'No invitations'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="p-4 flex items-center justify-between"
                                    data-testid={`invitation-row-${invitation.id}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{invitation.email}</div>
                                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs text-white ${ROLE_LABELS[invitation.role].color}`}>
                                                    {isRTL ? ROLE_LABELS[invitation.role].ar : ROLE_LABELS[invitation.role].en}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${
                                                    invitation.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                    invitation.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                    invitation.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                    {invitation.status === 'pending' ? (isRTL ? 'معلقة' : 'Pending') :
                                                     invitation.status === 'accepted' ? (isRTL ? 'مقبولة' : 'Accepted') :
                                                     invitation.status === 'expired' ? (isRTL ? 'منتهية' : 'Expired') :
                                                     (isRTL ? 'ملغاة' : 'Cancelled')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {canManageTeam && invitation.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelInvitation(invitation.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            data-testid={`button-cancel-invitation-${invitation.id}`}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'سجل النشاط قريباً' : 'Activity log coming soon'}</p>
                </div>
            )}

            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title={isRTL ? 'دعوة عضو جديد' : 'Invite New Member'}
            >
                <div className="space-y-4" data-testid="modal-invite-member">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <input
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="email@example.com"
                            data-testid="input-invite-email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            {isRTL ? 'الدور' : 'Role'}
                        </label>
                        <select
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as OrganizationUserRole }))}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            data-testid="select-invite-role"
                        >
                            <option value="manager">{isRTL ? 'مدير' : 'Manager'}</option>
                            <option value="staff">{isRTL ? 'موظف' : 'Staff'}</option>
                            <option value="readonly">{isRTL ? 'للقراءة فقط' : 'Read Only'}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {isRTL ? 'الصلاحيات' : 'Permissions'}
                        </label>
                        <div className="max-h-60 overflow-y-auto space-y-4 bg-slate-700/50 rounded-lg p-4">
                            {(Object.entries(groupedPermissions) as [string, ScopedPermissionKey[]][]).map(([category, perms]) => (
                                <div key={category}>
                                    <div className="text-sm font-medium text-amber-400 mb-2">
                                        {isRTL ? PERMISSION_CATEGORIES[category]?.ar || category : PERMISSION_CATEGORIES[category]?.en || category}
                                    </div>
                                    <div className="space-y-1">
                                        {perms.map((perm) => (
                                            <label key={perm} className="flex items-center gap-2 cursor-pointer hover:bg-slate-600/50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={inviteForm.permissions.includes(perm)}
                                                    onChange={() => togglePermission(perm, 'invite')}
                                                    className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500"
                                                    data-testid={`checkbox-invite-perm-${perm}`}
                                                />
                                                <span className="text-sm text-slate-300">
                                                    {isRTL ? PERMISSION_LABELS[perm]?.ar || perm : PERMISSION_LABELS[perm]?.en || perm}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            data-testid="button-cancel-invite"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleInviteMember}
                            className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
                            data-testid="button-confirm-invite"
                        >
                            <Send className="w-4 h-4 inline-block mr-2" />
                            {isRTL ? 'إرسال الدعوة' : 'Send Invitation'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showEditMemberModal}
                onClose={() => setShowEditMemberModal(false)}
                title={isRTL ? 'تعديل العضو' : 'Edit Member'}
            >
                <div className="space-y-4" data-testid="modal-edit-member">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            {isRTL ? 'المسمى الوظيفي' : 'Job Title'}
                        </label>
                        <input
                            type="text"
                            value={editForm.jobTitle}
                            onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            data-testid="input-edit-job-title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            {isRTL ? 'القسم' : 'Department'}
                        </label>
                        <input
                            type="text"
                            value={editForm.department}
                            onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            data-testid="input-edit-department"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            {isRTL ? 'الدور' : 'Role'}
                        </label>
                        <select
                            value={editForm.role}
                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as OrganizationUserRole }))}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            data-testid="select-edit-role"
                        >
                            <option value="manager">{isRTL ? 'مدير' : 'Manager'}</option>
                            <option value="staff">{isRTL ? 'موظف' : 'Staff'}</option>
                            <option value="readonly">{isRTL ? 'للقراءة فقط' : 'Read Only'}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {isRTL ? 'الصلاحيات' : 'Permissions'}
                        </label>
                        <div className="max-h-60 overflow-y-auto space-y-4 bg-slate-700/50 rounded-lg p-4">
                            {(Object.entries(groupedPermissions) as [string, ScopedPermissionKey[]][]).map(([category, perms]) => (
                                <div key={category}>
                                    <div className="text-sm font-medium text-amber-400 mb-2">
                                        {isRTL ? PERMISSION_CATEGORIES[category]?.ar || category : PERMISSION_CATEGORIES[category]?.en || category}
                                    </div>
                                    <div className="space-y-1">
                                        {perms.map((perm) => (
                                            <label key={perm} className="flex items-center gap-2 cursor-pointer hover:bg-slate-600/50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.permissions.includes(perm)}
                                                    onChange={() => togglePermission(perm, 'edit')}
                                                    className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500"
                                                    data-testid={`checkbox-edit-perm-${perm}`}
                                                />
                                                <span className="text-sm text-slate-300">
                                                    {isRTL ? PERMISSION_LABELS[perm]?.ar || perm : PERMISSION_LABELS[perm]?.en || perm}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setShowEditMemberModal(false)}
                            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            data-testid="button-cancel-edit"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleUpdateMember}
                            className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
                            data-testid="button-confirm-edit"
                        >
                            <Check className="w-4 h-4 inline-block mr-2" />
                            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showRemoveMemberModal}
                onClose={() => setShowRemoveMemberModal(false)}
                title={isRTL ? 'إزالة العضو' : 'Remove Member'}
            >
                <div className="space-y-4" data-testid="modal-remove-member">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-white">
                            {isRTL
                                ? 'هل أنت متأكد من إزالة هذا العضو من الفريق؟'
                                : 'Are you sure you want to remove this member from the team?'}
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                            {isRTL ? 'لن يتمكن من الوصول إلى أي موارد المنظمة.' : 'They will lose access to all organization resources.'}
                        </p>
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                        <button
                            onClick={() => setShowRemoveMemberModal(false)}
                            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            data-testid="button-cancel-remove"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleRemoveMember}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-400 transition-colors"
                            data-testid="button-confirm-remove"
                        >
                            <Trash2 className="w-4 h-4 inline-block mr-2" />
                            {isRTL ? 'إزالة العضو' : 'Remove Member'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
