// ============================================
// ADVERTISING SYSTEM TYPES
// ============================================

export type AdvertiserCompanyType = 'supplier' | 'shipping' | 'workshop' | 'other';
export type AdvertiserStatus = 'active' | 'pending_verification' | 'suspended' | 'blacklisted';

export interface Advertiser {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  companyType?: AdvertiserCompanyType;
  source?: string;
  status: AdvertiserStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdCampaignType = 'banner_top' | 'banner_sidebar' | 'card_in_tools' | 'card_in_products' | 'popup';
export type AdCampaignStatus = 'draft' | 'pending_approval' | 'running' | 'paused' | 'rejected' | 'ended';
export type AdBudgetType = 'fixed' | 'per_view' | 'per_click';

export interface AdCampaign {
  id: string;
  advertiserId: string;
  name: string;
  type: AdCampaignType;
  targetPages: string[];
  priority: number;
  startDate: string;
  endDate?: string;
  budgetType?: AdBudgetType;
  maxViews?: number;
  maxClicks?: number;
  currentViews?: number;
  currentClicks?: number;
  landingUrl?: string;
  imageUrl?: string;
  status: AdCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export type AdSlotSelectionMode = 'by_priority' | 'rotate' | 'random';

export interface AdSlot {
  id: string;
  slotKey: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isEnabled: boolean;
  maxAds: number;
  selectionMode: AdSlotSelectionMode;
  visibleForCustomerGroups?: string[];
  visibleForSpecificCustomers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdSlotRotationState {
  slotKey: string;
  currentIndex: number;
  lastRotatedAt: string;
}

// Ad Campaign Filters
export interface AdCampaignFilters {
  advertiserId?: string;
  type?: AdCampaignType | 'ALL';
  status?: AdCampaignStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Ad Campaign List Response
export interface AdCampaignListResponse {
  items: AdCampaign[];
  page: number;
  pageSize: number;
  total: number;
}

// Ad Stats
export interface AdStats {
  totalCampaigns: number;
  runningCampaigns: number;
  totalViews: number;
  totalClicks: number;
  avgCtr: number; // Click-through rate
  topCampaigns: { campaignId: string; name: string; views: number; clicks: number }[];
}
