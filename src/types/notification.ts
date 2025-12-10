export type NotificationType =
  | 'ORDER_STATUS_CHANGED'
  | 'SEARCH_POINTS_ADDED'
  | 'QUOTE_PROCESSED'
  | 'GENERAL'
  | 'ACCOUNT_UPDATE'
  | 'IMPORT_UPDATE'
  | 'SYSTEM'
  | 'MARKETING'
  | 'ACCOUNT_APPROVED'
  | 'ACCOUNT_REJECTED'
  | 'NEW_PURCHASE_REQUEST'
  | 'NEW_MESSAGE'
  | 'NEW_CUSTOMER_REGISTERED'
  | 'CUSTOMER_ORDER'
  | 'SUPPLIER_REQUEST_ASSIGNED'
  | 'NEW_ACCOUNT_REQUEST'
  | 'NEW_QUOTE_REQUEST'
  | 'NEW_IMPORT_REQUEST'
  | 'ABANDONED_CART_ALERT';

export type NotificationRelatedType = 
  | 'ORDER'
  | 'REQUEST'
  | 'ACCOUNT'
  | 'QUOTE'
  | 'IMPORT'
  | 'PRODUCT'
  | 'USER'
  | 'CART';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  relatedType?: NotificationRelatedType;
  relatedId?: string;
  readAt?: string;
}

export interface NotificationsResponse {
  items: Notification[];
  unreadCount: number;
  total: number;
}
