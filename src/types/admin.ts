import type { MultilingualText, NotificationChannel } from './common';
import type { NotificationType } from './notification';

// ===========================================
// SECURITY & AUTHENTICATION SETTINGS
// ===========================================

// Two-Factor Authentication Settings
export interface TwoFactorSettings {
  enabled: boolean;
  method: 'sms' | 'email' | 'authenticator' | 'all';
  requiredForAdmins: boolean;
  requiredForFinancial: boolean;
  graceLoginCount: number;  // Number of logins before enforcing
}

// Login Tracking Entry
export interface LoginRecord {
  id: string;
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  success: boolean;
  failureReason?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browserName?: string;
  osName?: string;
  is2FAUsed: boolean;
  riskScore?: number;
}

// Session Management
export interface ActiveSession {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  isCurrentSession: boolean;
}

// Security Settings
export interface SecuritySettings {
  id: string;
  
  // Password Policy
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordExpiryDays: number;
  passwordHistoryCount: number;
  
  // Login Security
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  allowMultipleSessions: boolean;
  
  // 2FA Settings
  twoFactor: TwoFactorSettings;
  
  // IP & Access Control
  enableIPWhitelist: boolean;
  ipWhitelist: string[];
  enableGeoBlocking: boolean;
  blockedCountries: string[];
  
  // Risk Detection
  enableRiskDetection: boolean;
  riskThreshold: number;
  notifyOnSuspiciousLogin: boolean;
  
  // Audit
  enableAuditLog: boolean;
  auditRetentionDays: number;
  
  lastModifiedAt: string;
  lastModifiedBy?: string;
}

// ===========================================
// REPORTING & ANALYTICS TYPES
// ===========================================

// Report Template
export interface ReportTemplate {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  type: 'sales' | 'inventory' | 'customers' | 'orders' | 'financial' | 'custom';
  columns: {
    key: string;
    label: MultilingualText;
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage';
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }[];
  filters: {
    key: string;
    label: MultilingualText;
    type: 'select' | 'date-range' | 'number-range' | 'text';
    options?: { value: string; label: MultilingualText }[];
  }[];
  defaultSortBy: string;
  defaultSortOrder: 'asc' | 'desc';
  createdBy?: string;
  createdAt: string;
  isSystem: boolean;
}

// Scheduled Report
export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];  // Email addresses
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, any>;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdBy: string;
  createdAt: string;
}

// Dashboard Widget
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map';
  title: MultilingualText;
  dataSource: string;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut';
    metric?: 'sum' | 'count' | 'avg';
    groupBy?: string;
    timeRange?: 'today' | 'week' | 'month' | 'year' | 'custom';
    colors?: string[];
    showLegend?: boolean;
    showTrend?: boolean;
  };
  position: { x: number; y: number; w: number; h: number };
  refreshInterval: number;  // seconds
}

// ===========================================
// NOTIFICATION SETTINGS TYPES
// ===========================================

// Extended Notification Channel (adds whatsapp, push to existing)
export type ExtendedNotificationChannel = NotificationChannel | 'whatsapp' | 'push' | 'in_app';

// Notification Preference
export interface NotificationPreference {
  eventType: NotificationType;
  channels: ExtendedNotificationChannel[];
  enabled: boolean;
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Extended Notification Template for Settings
export interface ExtendedNotificationTemplate {
  id: string;
  eventType: NotificationType;
  channel: ExtendedNotificationChannel;
  subject: MultilingualText;
  body: MultilingualText;
  variables: string[];  // Available template variables
  isSystemTemplate: boolean;
  lastModifiedAt: string;
}

// Advanced Notification Settings for Channels
export interface AdvancedNotificationSettings {
  id: string;
  
  // Global Settings
  enabled: boolean;
  defaultChannels: ExtendedNotificationChannel[];
  
  // Channel Configurations
  emailConfig: {
    enabled: boolean;
    senderName: string;
    senderEmail: string;
    replyToEmail?: string;
    smtpHost?: string;
    smtpPort?: number;
  };
  smsConfig: {
    enabled: boolean;
    provider: string;
    senderId?: string;
  };
  whatsappConfig: {
    enabled: boolean;
    provider: string;
    phoneNumber?: string;
  };
  pushConfig: {
    enabled: boolean;
    vapidPublicKey?: string;
  };
  
  // Templates
  templates: ExtendedNotificationTemplate[];
  
  // Default Preferences
  defaultPreferences: NotificationPreference[];
  
  lastModifiedAt: string;
  lastModifiedBy?: string;
}

// =====================================================
// PERMISSION SYSTEM TYPES
// =====================================================

export interface Role {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  module: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  permission?: Permission;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy?: string;
  isActive: boolean;
  createdAt: string;
  role?: Role;
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: {
    code: string;
    module: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }[];
  modules: string[];
}

export interface ModuleAccess {
  id: string;
  moduleKey: string;
  moduleName: string;
  moduleNameAr?: string;
  isEnabled: boolean;
  requiredRole?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

// =====================================================
// GLOBAL SETTINGS & FEATURE FLAGS
// =====================================================

export type SettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

export interface GlobalSetting {
  id: string;
  key: string;
  value: string;
  valueType: SettingValueType;
  category?: string;
  label?: string;
  labelAr?: string;
  description?: string;
  isEditable: boolean;
  isVisible: boolean;
  sortOrder: number;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  nameAr?: string;
  description?: string;
  isEnabled: boolean;
  enabledFor: string[];
  createdAt: string;
  updatedAt?: string;
}

// =====================================================
// EXCEL IMPORT TEMPLATE TYPES
// =====================================================

export interface ExcelTemplateColumn {
  id: string;
  templateId: string;
  columnIndex: number;
  headerName: string;
  headerNameAr?: string;
  headerNameEn?: string;
  mapToField: string;
  isRequired: boolean;
  defaultValue?: string;
  validationRegex?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExcelImportTemplate {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  templateType: string;
  languageHint?: string;
  instructionsText?: string;
  instructionsTextAr?: string;
  isActive: boolean;
  columns: ExcelTemplateColumn[];
  createdAt: string;
  updatedAt?: string;
}
