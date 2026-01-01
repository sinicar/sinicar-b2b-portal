/**
 * Quotes API Module
 * وحدة API لعروض الأسعار
 */

import { ApiClient } from '../../apiClient';
import { normalizeListResponse } from '../../normalize';

// ============================================
// Quotes Functions
// ============================================

/**
 * Get All Quote Requests
 */
export async function getAllQuoteRequests() {
  const result = await ApiClient.quotes.getAll();
  return result.quotes;
}

/**
 * Get My Quote Requests
 */
export async function getMyQuoteRequests(params?: { page?: number; limit?: number }) {
  const result = await ApiClient.quotes.getMyQuotes(params);
  return result.quotes;
}

/**
 * Create Quote Request
 */
export async function createQuoteRequest(data: any) {
  const result = await ApiClient.quotes.create(data);
  return result.quote;
}

/**
 * Get Quote By ID
 */
export async function getQuoteById(quoteId: string) {
  try {
    const result = await ApiClient.quotes.getById(quoteId);
    return result.quote;
  } catch {
    const quotes = await getAllQuoteRequests();
    return quotes.find((q: any) => q.id === quoteId) || null;
  }
}

/**
 * Update Quote Status
 */
export async function updateQuoteStatus(quoteId: string, status: string) {
  try {
    const result = await ApiClient.quotes.updateStatus(quoteId, status);
    return result.quote;
  } catch {
    const quotes = await getAllQuoteRequests();
    const quote = quotes.find((q: any) => q.id === quoteId);
    if (quote) {
      quote.status = status as any;
    }
    return quote || null;
  }
}

/**
 * Get Quotes (normalized response)
 */
export async function getQuotes(params?: { page?: number; limit?: number }) {
  const result = await ApiClient.quotes.getAll(params);
  return normalizeListResponse(result);
}
