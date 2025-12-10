import type { MultilingualText } from './common';
export type { MultilingualText } from './common';

export interface CouponCode {
  id: string;
  code: string;
  name: MultilingualText;
  description?: MultilingualText;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  applicableCategories?: string[];
  applicableBrands?: string[];
  excludedProducts?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface LoyaltyLevel {
  id: string;
  name: MultilingualText;
  minPoints: number;
  maxPoints?: number;
  benefits: {
    type: 'discount' | 'free_shipping' | 'priority_support' | 'exclusive_access';
    value?: number;
    description: MultilingualText;
  }[];
  iconUrl?: string;
  color: string;
}

export interface LoyaltySettings {
  id: string;
  enabled: boolean;
  programName: MultilingualText;
  pointsPerCurrency: number;
  pointsRedemptionRate: number;
  levels: LoyaltyLevel[];
  pointsExpiryDays?: number;
  allowPartialRedemption: boolean;
  minimumRedemptionPoints: number;
  lastModifiedAt: string;
}

export interface CustomerLoyalty {
  id: string;
  userId: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentPoints: number;
  currentLevel: string;
  transactions: {
    id: string;
    type: 'earn' | 'redeem' | 'expire' | 'bonus';
    points: number;
    description: string;
    orderId?: string;
    createdAt: string;
  }[];
  memberSince: string;
  lastActivityAt: string;
}

export interface PromotionalCampaign {
  id: string;
  name: MultilingualText;
  type: 'flash_sale' | 'bundle' | 'buy_x_get_y' | 'seasonal' | 'clearance';
  description: MultilingualText;
  startDate: string;
  endDate: string;
  rules: {
    minQuantity?: number;
    bundleProducts?: string[];
    discountPercentage?: number;
    freeProduct?: string;
    applicableCategories?: string[];
  };
  bannerImageUrl?: string;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
}
