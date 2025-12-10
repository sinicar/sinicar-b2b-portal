// ============================================
// ORGANIZATION & TEAM MANAGEMENT TYPES
// ============================================

// Organization Type - represents account types that can have teams
export type OrganizationType =
  | 'customer'    // Wholesale Customer
  | 'supplier'    // Supplier in marketplace
  | 'advertiser'  // Advertiser in ads system
  | 'affiliate'   // Affiliate/Marketer
  | 'platform';   // SINI CAR itself (for admin team if needed)

// Organization - represents any business account that can have a team
export interface Organization {
  id: string;
  type: OrganizationType;
  
  // Link to existing entities (only one will be set based on type)
  customerId?: string;    // if type === 'customer'
  supplierId?: string;    // if type === 'supplier'
  advertiserId?: string;  // if type === 'advertiser'
  affiliateId?: string;   // if type === 'affiliate'
  
  name: string;           // Display name for the organization
  ownerUserId: string;    // Main account owner (already exists as a user)
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization User Role - defines role within an organization
export type OrganizationUserRole =
  | 'owner'     // Main account owner (full control within org scope)
  | 'manager'   // Can manage most operations
  | 'staff'     // Limited operations based on permissions
  | 'readonly'; // View only

// Scoped Permission Keys - feature-specific permissions for sub-users
export type ScopedPermissionKey =
  // Advertising module (Advertiser org):
  | 'adv_view_campaigns'
  | 'adv_manage_campaigns'
  | 'adv_manage_slots'
  | 'adv_view_reports'
  
  // Supplier module:
  | 'sup_view_forwarded_requests'
  | 'sup_submit_offers'
  | 'sup_view_team_activity'
  | 'sup_manage_products'
  | 'sup_view_analytics'
  
  // Customer (wholesale) module:
  | 'cust_create_orders'
  | 'cust_view_orders'
  | 'cust_create_installment_requests'
  | 'cust_manage_installment_requests'
  | 'cust_use_trader_tools'
  | 'cust_view_team_activity'
  | 'cust_view_prices'
  | 'cust_manage_cart'
  
  // Affiliate/Marketer module:
  | 'aff_view_links'
  | 'aff_manage_links'
  | 'aff_view_commissions'
  | 'aff_withdraw_commissions'
  | 'aff_view_analytics'
  
  // General/Organization-level:
  | 'org_manage_team'
  | 'org_view_logs'
  | 'org_view_settings'
  | 'org_edit_profile';

// Organization User - represents an employee/sub-user under an Organization
export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;          // Reference to the main User model
  
  role: OrganizationUserRole;
  permissions: ScopedPermissionKey[];
  
  // Optional metadata
  jobTitle?: string;       // Job title/position
  department?: string;     // Department name
  
  isActive: boolean;
  invitedAt?: string;      // When the invitation was sent
  joinedAt?: string;       // When the user accepted and joined
  lastActiveAt?: string;   // Last activity timestamp
  createdAt: string;
  updatedAt: string;
}

// Organization Activity Log - tracks team member actions
export interface OrganizationActivityLog {
  id: string;
  organizationId: string;
  userId: string;
  userName?: string;       // Cached for display
  
  actionType: string;      // e.g., 'order_created', 'offer_submitted', 'team_member_added'
  actionCategory: 'order' | 'installment' | 'advertising' | 'team' | 'supplier' | 'affiliate' | 'other';
  
  description: string;     // Human-readable description
  metadata?: Record<string, any>;  // Additional action data
  
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
}

// Organization Settings - controls team behavior (admin configurable)
export interface OrganizationSettings {
  // Global toggles per organization type
  enableTeamsForCustomers: boolean;
  enableTeamsForSuppliers: boolean;
  enableTeamsForAdvertisers: boolean;
  enableTeamsForAffiliates: boolean;
  
  // Maximum team members per organization type
  maxCustomerEmployees: number;
  maxSupplierEmployees: number;
  maxAdvertiserEmployees: number;
  maxAffiliateEmployees: number;
  
  // Default permissions templates for Customer organizations
  defaultCustomerManagerPermissions: ScopedPermissionKey[];
  defaultCustomerStaffPermissions: ScopedPermissionKey[];
  defaultCustomerReadonlyPermissions: ScopedPermissionKey[];
  
  // Default permissions templates for Supplier organizations
  defaultSupplierManagerPermissions: ScopedPermissionKey[];
  defaultSupplierStaffPermissions: ScopedPermissionKey[];
  defaultSupplierReadonlyPermissions: ScopedPermissionKey[];
  
  // Default permissions templates for Advertiser organizations
  defaultAdvertiserManagerPermissions: ScopedPermissionKey[];
  defaultAdvertiserStaffPermissions: ScopedPermissionKey[];
  defaultAdvertiserReadonlyPermissions: ScopedPermissionKey[];
  
  // Default permissions templates for Affiliate organizations
  defaultAffiliateManagerPermissions: ScopedPermissionKey[];
  defaultAffiliateStaffPermissions: ScopedPermissionKey[];
  defaultAffiliateReadonlyPermissions: ScopedPermissionKey[];
  
  // Control if owners can customize permissions manually
  allowCustomPermissionsForCustomers: boolean;
  allowCustomPermissionsForSuppliers: boolean;
  allowCustomPermissionsForAdvertisers: boolean;
  allowCustomPermissionsForAffiliates: boolean;
  
  // Audit / Logs settings
  trackTeamActivityPerOrganization: boolean;
  activityLogRetentionDays: number;
  
  // Invitation settings
  requireEmailVerification: boolean;
  invitationExpiryHours: number;
  
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

// Team Member Invitation - for inviting new members
export interface TeamInvitation {
  id: string;
  organizationId: string;
  invitedByUserId: string;
  
  email: string;
  phone?: string;
  name?: string;
  
  role: OrganizationUserRole;
  permissions: ScopedPermissionKey[];
  
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitationCode: string;
  
  expiresAt: string;
  acceptedAt?: string;
  
  createdAt: string;
}

// Helper type for permission groups display
export interface PermissionGroup {
  key: string;
  labelAr: string;
  labelEn: string;
  permissions: {
    key: ScopedPermissionKey;
    labelAr: string;
    labelEn: string;
    description?: string;
  }[];
}

// Organization stats for dashboard
export interface OrganizationStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  recentActivities: number;
  membersByRole: { role: OrganizationUserRole; count: number }[];
}
