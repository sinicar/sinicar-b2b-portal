/**
 * AI API Module
 * وحدة API للذكاء الاصطناعي
 */

import { post } from '../../apiClient';

// ============================================
// AI Functions
// ============================================

/**
 * Get AI Suggestions
 */
export async function getAiSuggestions(context: any) {
  try {
    return await post('/ai/suggestions', context);
  } catch {
    return { suggestions: [] };
  }
}

/**
 * Process AI Query
 */
export async function processAiQuery(query: string) {
  try {
    return await post('/ai/query', { query });
  } catch {
    return { response: null };
  }
}
