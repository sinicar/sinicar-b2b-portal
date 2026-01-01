/**
 * Permission Center - Shared Types
 * الأنواع المشتركة لمركز الصلاحيات
 */

import React from 'react';

export type TabType = 'staff' | 'customers' | 'suppliers' | 'overrides' | 'organizations';

export interface TabConfig {
  id: TabType;
  icon: React.ReactNode;
  labelKey: string;
  labelAr: string;
  color: string;
}

export interface StaffPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface StaffRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
}

export interface FeatureToggle {
  id: string;
  name: string;
  defaultEnabled: boolean;
}

export interface PermissionOverride {
  id: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'supplier';
  overrides: Record<string, boolean>;
  createdAt: string;
}
