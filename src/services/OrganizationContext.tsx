import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MockApi } from './mockApi';
import { Organization, OrganizationType, OrganizationUser, OrganizationUserRole, ScopedPermissionKey, OrganizationActivityLog, OrganizationStats, TeamInvitation } from '../types';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentOrgUser: OrganizationUser | null;
  organizations: Organization[];
  isLoading: boolean;
  isOwner: boolean;
  canManageTeam: boolean;
  
  loadOrganization: (userId: string, orgType?: OrganizationType) => Promise<void>;
  loadOrganizations: (userId: string) => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshCurrentOrganization: () => Promise<void>;
  
  hasPermission: (permissionKey: ScopedPermissionKey) => boolean;
  getPermissions: () => ScopedPermissionKey[];
  
  getTeamMembers: () => Promise<OrganizationUser[]>;
  addTeamMember: (data: { userId: string; role: OrganizationUserRole; permissions: ScopedPermissionKey[]; jobTitle?: string; department?: string }) => Promise<OrganizationUser | null>;
  updateTeamMember: (memberId: string, data: Partial<OrganizationUser>) => Promise<OrganizationUser | null>;
  deactivateTeamMember: (memberId: string) => Promise<boolean>;
  reactivateTeamMember: (memberId: string) => Promise<boolean>;
  removeTeamMember: (memberId: string) => Promise<boolean>;
  
  getInvitations: () => Promise<TeamInvitation[]>;
  createInvitation: (data: { email: string; phone?: string; name?: string; role: OrganizationUserRole; permissions: ScopedPermissionKey[] }) => Promise<TeamInvitation | null>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  
  getActivityLogs: (limit?: number) => Promise<OrganizationActivityLog[]>;
  logActivity: (actionType: string, category: OrganizationActivityLog['actionCategory'], metadata?: Record<string, any>) => Promise<void>;
  
  getStats: () => Promise<OrganizationStats | null>;
  canAddMember: () => Promise<{ allowed: boolean; reason?: string }>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<Props> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentOrgUser, setCurrentOrgUser] = useState<OrganizationUser | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isOwner = currentOrganization?.ownerUserId === currentUserId || currentOrgUser?.role === 'owner';
  const canManageTeam = isOwner || (currentOrgUser?.permissions.includes('org_manage_team') ?? false);

  const loadOrganization = useCallback(async (userId: string, orgType?: OrganizationType) => {
    setIsLoading(true);
    setCurrentUserId(userId);
    
    try {
      let org: Organization | null = null;
      
      if (orgType) {
        const orgs = await MockApi.getOrganizations();
        org = orgs.find(o => o.type === orgType && o.ownerUserId === userId) || null;
      } else {
        org = await MockApi.getOrganizationByOwnerUserId(userId);
      }
      
      if (org) {
        setCurrentOrganization(org);
        const orgUser = await MockApi.getOrganizationUser(org.id, userId);
        setCurrentOrgUser(orgUser);
      } else {
        setCurrentOrganization(null);
        setCurrentOrgUser(null);
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOrganizations = useCallback(async (userId: string) => {
    setIsLoading(true);
    setCurrentUserId(userId);
    
    try {
      const orgs = await MockApi.getOrganizationsByUserId(userId);
      setOrganizations(orgs);
      
      if (orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0]);
        const orgUser = await MockApi.getOrganizationUser(orgs[0].id, userId);
        setCurrentOrgUser(orgUser);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  const switchOrganization = useCallback(async (orgId: string) => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const org = await MockApi.getOrganizationById(orgId);
      if (org) {
        setCurrentOrganization(org);
        const orgUser = await MockApi.getOrganizationUser(orgId, currentUserId);
        setCurrentOrgUser(orgUser);
      }
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const refreshCurrentOrganization = useCallback(async () => {
    if (!currentOrganization?.id) return;
    
    try {
      const org = await MockApi.getOrganizationById(currentOrganization.id);
      if (org) {
        setCurrentOrganization(org);
      }
      
      if (currentUserId) {
        const orgUser = await MockApi.getOrganizationUser(currentOrganization.id, currentUserId);
        setCurrentOrgUser(orgUser);
      }
    } catch (error) {
      console.error('Failed to refresh organization:', error);
    }
  }, [currentOrganization?.id, currentUserId]);

  const hasPermission = useCallback((permissionKey: ScopedPermissionKey): boolean => {
    if (!currentOrganization || !currentUserId) return false;
    
    if (currentOrganization.ownerUserId === currentUserId) return true;
    if (currentOrgUser?.role === 'owner') return true;
    
    return currentOrgUser?.permissions.includes(permissionKey) ?? false;
  }, [currentOrganization, currentOrgUser, currentUserId]);

  const getPermissions = useCallback((): ScopedPermissionKey[] => {
    if (!currentOrganization || !currentUserId) return [];
    
    if (currentOrganization.ownerUserId === currentUserId || currentOrgUser?.role === 'owner') {
      return MockApi.getPermissionsByOrganizationType(currentOrganization.type);
    }
    
    return currentOrgUser?.permissions ?? [];
  }, [currentOrganization, currentOrgUser, currentUserId]);

  const getTeamMembers = useCallback(async (): Promise<OrganizationUser[]> => {
    if (!currentOrganization?.id) return [];
    return await MockApi.getOrganizationUsers(currentOrganization.id);
  }, [currentOrganization?.id]);

  const addTeamMember = useCallback(async (data: { userId: string; role: OrganizationUserRole; permissions: ScopedPermissionKey[]; jobTitle?: string; department?: string }): Promise<OrganizationUser | null> => {
    if (!currentOrganization?.id) return null;
    
    try {
      const member = await MockApi.createOrganizationUser(currentOrganization.id, data);
      return member;
    } catch (error) {
      console.error('Failed to add team member:', error);
      return null;
    }
  }, [currentOrganization?.id]);

  const updateTeamMember = useCallback(async (memberId: string, data: Partial<OrganizationUser>): Promise<OrganizationUser | null> => {
    try {
      return await MockApi.updateOrganizationUser(memberId, data);
    } catch (error) {
      console.error('Failed to update team member:', error);
      return null;
    }
  }, []);

  const deactivateTeamMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const result = await MockApi.deactivateOrganizationUser(memberId);
      return result !== null;
    } catch (error) {
      console.error('Failed to deactivate team member:', error);
      return false;
    }
  }, []);

  const reactivateTeamMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const result = await MockApi.reactivateOrganizationUser(memberId);
      return result !== null;
    } catch (error) {
      console.error('Failed to reactivate team member:', error);
      return false;
    }
  }, []);

  const removeTeamMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      return await MockApi.removeOrganizationUser(memberId);
    } catch (error) {
      console.error('Failed to remove team member:', error);
      return false;
    }
  }, []);

  const getInvitations = useCallback(async (): Promise<TeamInvitation[]> => {
    if (!currentOrganization?.id) return [];
    return await MockApi.getTeamInvitations(currentOrganization.id);
  }, [currentOrganization?.id]);

  const createInvitation = useCallback(async (data: { email: string; phone?: string; name?: string; role: OrganizationUserRole; permissions: ScopedPermissionKey[] }): Promise<TeamInvitation | null> => {
    if (!currentOrganization?.id || !currentUserId) return null;
    
    try {
      return await MockApi.createTeamInvitation(currentOrganization.id, currentUserId, data);
    } catch (error) {
      console.error('Failed to create invitation:', error);
      return null;
    }
  }, [currentOrganization?.id, currentUserId]);

  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      return await MockApi.cancelTeamInvitation(invitationId);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      return false;
    }
  }, []);

  const getActivityLogs = useCallback(async (limit: number = 100): Promise<OrganizationActivityLog[]> => {
    if (!currentOrganization?.id) return [];
    return await MockApi.getOrganizationActivityLogs(currentOrganization.id, limit);
  }, [currentOrganization?.id]);

  const logActivity = useCallback(async (actionType: string, category: OrganizationActivityLog['actionCategory'], metadata?: Record<string, any>): Promise<void> => {
    if (!currentOrganization?.id || !currentUserId) return;
    
    try {
      await MockApi.logOrganizationActivity(currentOrganization.id, currentUserId, actionType, category, metadata);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [currentOrganization?.id, currentUserId]);

  const getStats = useCallback(async (): Promise<OrganizationStats | null> => {
    if (!currentOrganization?.id) return null;
    return await MockApi.getOrganizationStats(currentOrganization.id);
  }, [currentOrganization?.id]);

  const canAddMember = useCallback(async (): Promise<{ allowed: boolean; reason?: string }> => {
    if (!currentOrganization?.id) return { allowed: false, reason: 'لا توجد منظمة نشطة' };
    return await MockApi.canAddTeamMember(currentOrganization.id);
  }, [currentOrganization?.id]);

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      currentOrgUser,
      organizations,
      isLoading,
      isOwner,
      canManageTeam,
      
      loadOrganization,
      loadOrganizations,
      switchOrganization,
      refreshCurrentOrganization,
      
      hasPermission,
      getPermissions,
      
      getTeamMembers,
      addTeamMember,
      updateTeamMember,
      deactivateTeamMember,
      reactivateTeamMember,
      removeTeamMember,
      
      getInvitations,
      createInvitation,
      cancelInvitation,
      
      getActivityLogs,
      logActivity,
      
      getStats,
      canAddMember
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const useOrganizationPermissions = () => {
  const { hasPermission, getPermissions, isOwner, canManageTeam } = useOrganization();
  
  return {
    hasPermission,
    getPermissions,
    isOwner,
    canManageTeam,
    
    canViewOrders: hasPermission('cust_view_orders'),
    canCreateOrders: hasPermission('cust_create_orders'),
    canViewPrices: hasPermission('cust_view_prices'),
    canManageCart: hasPermission('cust_manage_cart'),
    canUseTraderTools: hasPermission('cust_use_trader_tools'),
    canCreateInstallmentRequests: hasPermission('cust_create_installment_requests'),
    canManageInstallmentRequests: hasPermission('cust_manage_installment_requests'),
    canViewTeamActivity: hasPermission('cust_view_team_activity') || hasPermission('sup_view_team_activity'),
    
    canViewForwardedRequests: hasPermission('sup_view_forwarded_requests'),
    canSubmitOffers: hasPermission('sup_submit_offers'),
    canManageProducts: hasPermission('sup_manage_products'),
    canViewSupplierAnalytics: hasPermission('sup_view_analytics'),
    
    canViewCampaigns: hasPermission('adv_view_campaigns'),
    canManageCampaigns: hasPermission('adv_manage_campaigns'),
    canManageAdSlots: hasPermission('adv_manage_slots'),
    canViewAdReports: hasPermission('adv_view_reports'),
    
    canViewAffiliateLinks: hasPermission('aff_view_links'),
    canManageAffiliateLinks: hasPermission('aff_manage_links'),
    canViewCommissions: hasPermission('aff_view_commissions'),
    canWithdrawCommissions: hasPermission('aff_withdraw_commissions'),
    canViewAffiliateAnalytics: hasPermission('aff_view_analytics'),
    
    canManageTeamMembers: hasPermission('org_manage_team') || isOwner,
    canViewActivityLogs: hasPermission('org_view_logs') || isOwner,
    canViewSettings: hasPermission('org_view_settings') || isOwner,
    canEditProfile: hasPermission('org_edit_profile') || isOwner
  };
};

export const useCurrentOrganization = () => {
  const { currentOrganization, currentOrgUser, isLoading, isOwner } = useOrganization();
  
  return {
    organization: currentOrganization,
    orgUser: currentOrgUser,
    isLoading,
    isOwner,
    organizationType: currentOrganization?.type,
    organizationName: currentOrganization?.name,
    organizationId: currentOrganization?.id,
    userRole: currentOrgUser?.role ?? (isOwner ? 'owner' : null)
  };
};

export const useOrganizationTeam = () => {
  const {
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    deactivateTeamMember,
    reactivateTeamMember,
    removeTeamMember,
    getInvitations,
    createInvitation,
    cancelInvitation,
    getStats,
    canAddMember,
    canManageTeam
  } = useOrganization();

  return {
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    deactivateTeamMember,
    reactivateTeamMember,
    removeTeamMember,
    getInvitations,
    createInvitation,
    cancelInvitation,
    getStats,
    canAddMember,
    canManageTeam
  };
};

export const useOrganizationActivityLogs = () => {
  const { getActivityLogs, logActivity } = useOrganization();
  return { getActivityLogs, logActivity };
};
