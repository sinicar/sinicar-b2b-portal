/**
 * Admin AI Training - Shared Types
 * الأنواع المشتركة لصفحة تدريب الذكاء الاصطناعي
 */

export type TabType = 'knowledge' | 'conversations' | 'prompts' | 'testing' | 'analytics';

export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: number;
  enabled: boolean;
  usageCount: number;
  lastUsed: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingConversation {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  category: string;
  rating: number;
  enabled: boolean;
  createdAt: string;
}

export interface SystemPrompt {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  content: string;
  contentAr: string;
  type: 'system' | 'persona' | 'context' | 'instruction';
  enabled: boolean;
  order: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  score?: number;
  category: string;
  lastTested?: string;
}

export interface AIAnalytics {
  totalQueries: number;
  successRate: number;
  avgResponseTime: number;
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: Array<{ date: string; queries: number; success: number }>;
}

export interface CategoryOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

// ========== CARD COMPONENT PROPS ==========

/**
 * Props for KnowledgeEntryCard component
 */
export interface KnowledgeEntryCardProps {
  entry: KnowledgeEntry;
  isRTL?: boolean;
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
  onToggleEnabled?: (id: string) => void;
  getCategoryLabel?: (category: string) => string;
}

/**
 * Props for ConversationCard component
 */
export interface ConversationCardProps {
  conversation: TrainingConversation;
  isRTL?: boolean;
  onEdit: (conversation: TrainingConversation) => void;
  onDelete: (id: string) => void;
  getCategoryLabel?: (category: string) => string;
}

/**
 * Props for PromptCard component
 */
export interface PromptCardProps {
  prompt: SystemPrompt;
  isRTL?: boolean;
  onEdit: (prompt: SystemPrompt) => void;
  onDelete: (id: string) => void;
  onToggleEnabled?: (id: string) => void;
}

/**
 * Props for TestCaseCard component
 */
export interface TestCaseCardProps {
  testCase: TestCase;
  isRTL?: boolean;
  onRun?: (testCase: TestCase) => void;
  getCategoryLabel?: (category: string) => string;
}
