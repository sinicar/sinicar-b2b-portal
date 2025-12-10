// ==========================================
// FEEDBACK SYSTEM TYPES
// ==========================================

export type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'COMPLAINT' | 'QUESTION' | 'OTHER';
export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FeedbackStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type FeedbackSenderType = 'CUSTOMER' | 'SUPPLIER' | 'MARKETER' | 'EMPLOYEE' | 'ADMIN' | 'GUEST';

export interface Feedback {
  id: string;
  senderUserId: string | null;        // null if guest
  senderName: string;
  senderContact: string;              // phone, WhatsApp, or email
  senderType: FeedbackSenderType;
  pageContext?: string;               // which page they were on (e.g. "/product-search")
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  attachments?: string[];             // list of file URLs
  status: FeedbackStatus;
  adminAssignedId?: string | null;    // who will handle this feedback
  adminNotes?: string;                // internal notes from admins
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackReply {
  id: string;
  feedbackId: string;
  senderUserId: string;               // admin replying
  senderName: string;
  message: string;
  createdAt: string;
}

export interface FeedbackCreateInput {
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  pageContext?: string;
  senderContact?: string;
}

export interface FeedbackPublicCreateInput {
  senderName: string;
  senderContact: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  pageContext?: string;
}

export interface FeedbackUpdateInput {
  status?: FeedbackStatus;
  adminAssignedId?: string | null;
  adminNotes?: string;
  priority?: FeedbackPriority;
  category?: FeedbackCategory;
}

export interface FeedbackListFilters {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  senderType?: FeedbackSenderType;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface FeedbackListResponse {
  items: Feedback[];
  page: number;
  pageSize: number;
  total: number;
}

export interface FeedbackSettings {
  enabled: boolean;
  showForRoles: FeedbackSenderType[];
  defaultCategory: FeedbackCategory;
  defaultPriority: FeedbackPriority;
  assignedDefaultAdminId?: string;
  allowGuestFeedback: boolean;
}
