// ============================================
// NOTIFICATION TYPES
// ============================================

import type { MultilingualText } from './common';

// Notification Types - Matches the backend Notification module
export type NotificationType =
  | 'ORDER_STATUS_UPDATED'    // When order status changes
  | 'ORDER_CONFIRMED'         // When admin confirms an order
  | 'ORDER_SHIPPED'           // When order is shipped
  | 'ORDER_DELIVERED'         // When order is delivered
  | 'ORDER_CANCELLED'         // When order is cancelled
  | 'QUOTE_READY'             // Quote request has been priced
  | 'QUOTE_APPROVED'          // Quote was approved
  | 'QUOTE_REJECTED'          // Quote was rejected
  | 'ACCOUNT_APPROVED'        // Account opening request approved
  | 'ACCOUNT_REJECTED'        // Account opening request rejected
  | 'ACCOUNT_MORE_INFO'       // More info requested for account
  | 'IMPORT_STATUS_UPDATED'   // Import request status change
  | 'SEARCH_POINTS_LOW'       // Search points running low
  | 'SEARCH_POINTS_ADDED'     // Search points were added
  | 'NEW_PRODUCT_ALERT'       // New products added matching interests
  | 'PRICE_DROP_ALERT'        // Price drop on watched products
  | 'SYSTEM_ANNOUNCEMENT'     // System-wide announcement
  | 'CUSTOM';                 // Custom notification

export type NotificationChannel = 'toast' | 'popup' | 'banner' | 'bell' | 'email' | 'sms';
export type ExtendedNotificationChannel = NotificationChannel | 'whatsapp' | 'push' | 'in_app';

export type NotificationCategory =
  | 'order'
  | 'quote'
  | 'account'
  | 'import'
  | 'search'
  | 'system'
  | 'marketing'
  | 'alert';

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  
  // Linked entity
  entityType?: 'ORDER' | 'QUOTE' | 'IMPORT' | 'ACCOUNT' | 'PRODUCT' | 'SYSTEM';
  entityId?: string;
  
  // Action URL
  actionUrl?: string;
  actionLabel?: string;
  
  // Status
  isRead: boolean;
  readAt?: string;
  
  // Styling
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  iconColor?: string;
  
  createdAt: string;
  expiresAt?: string;
}

// Notification Style
export interface NotificationStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  icon?: string;
  animation?: 'slide' | 'fade' | 'bounce' | 'none';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number;
  showProgress?: boolean;
  showCloseButton?: boolean;
}

// Notification Template
export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  nameEn?: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  channels?: NotificationChannel[];
  type?: string;
  isActive: boolean;
  enabled?: boolean;
  
  // Localized content
  content: {
    ar: { title: string; message: string };
    en: { title: string; message: string };
    hi: { title: string; message: string };
    zh: { title: string; message: string };
  };
  
  // Legacy message format for backward compatibility
  message?: {
    ar: string;
    en: string;
    hi: string;
    zh: string;
  };
  
  // Styling
  style: NotificationStyle | {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  
  // Metadata
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Notification Settings
export interface NotificationSettings {
  globalEnabled: boolean;
  defaultDuration: number;
  defaultPosition: NotificationStyle['position'];
  maxVisible: number;
  soundEnabled: boolean;
  templates: NotificationTemplate[];
}

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

// Notification Filters
export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// Notification List Response
export interface NotificationListResponse {
  items: Notification[];
  page: number;
  pageSize: number;
  total: number;
  unreadCount: number;
}
