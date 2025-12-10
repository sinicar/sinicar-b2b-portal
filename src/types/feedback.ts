// ============================================
// FEEDBACK SYSTEM TYPES
// ============================================

// Feedback Category
export type FeedbackCategory =
  | 'complaint'
  | 'suggestion'
  | 'question'
  | 'compliment'
  | 'technical'
  | 'other';

// Feedback Priority
export type FeedbackPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

// Feedback Status
export type FeedbackStatus =
  | 'new'
  | 'in_progress'
  | 'waiting_response'
  | 'resolved'
  | 'closed';

// Feedback Sender Type
export type FeedbackSenderType =
  | 'customer'
  | 'supplier'
  | 'marketer'
  | 'employee'
  | 'guest';

// Feedback Reply
export interface FeedbackReply {
  id: string;
  feedbackId: string;
  senderUserId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

// Main Feedback Entry
export interface Feedback {
  id: string;
  senderType: FeedbackSenderType;
  senderUserId?: string;
  senderName: string;
  senderContact?: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  attachmentUrls?: string[];
  pageContext?: string;
  status: FeedbackStatus;
  adminAssignedId?: string;
  adminAssignedName?: string;
  adminNotes?: string;
  replies: FeedbackReply[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Feedback Create Input
export interface FeedbackCreateInput {
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  pageContext?: string;
  senderContact?: string;
}

// Feedback Public Create Input (for guests)
export interface FeedbackPublicCreateInput {
  senderName: string;
  senderContact: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  pageContext?: string;
}

// Feedback Update Input
export interface FeedbackUpdateInput {
  status?: FeedbackStatus;
  adminAssignedId?: string | null;
  adminNotes?: string;
  priority?: FeedbackPriority;
  category?: FeedbackCategory;
}

// Feedback List Filters
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

// Feedback List Response
export interface FeedbackListResponse {
  items: Feedback[];
  page: number;
  pageSize: number;
  total: number;
}

// Feedback Settings
export interface FeedbackSettings {
  enabled: boolean;
  showForRoles: FeedbackSenderType[];
  defaultCategory: FeedbackCategory;
  defaultPriority: FeedbackPriority;
  assignedDefaultAdminId?: string;
  allowGuestFeedback: boolean;
}

// Feedback Stats
export interface FeedbackStats {
  totalFeedback: number;
  newFeedback: number;
  inProgressFeedback: number;
  resolvedFeedback: number;
  byCategory: { category: FeedbackCategory; count: number }[];
  byPriority: { priority: FeedbackPriority; count: number }[];
  avgResolutionTime: number; // hours
}
