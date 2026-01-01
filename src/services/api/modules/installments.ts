/**
 * Installments API Module
 * وحدة API للأقساط والتقسيط
 */

import { get, post, put, del } from '../../apiClient';

// ============================================
// Installments Requests
// ============================================

/**
 * Get Installment Requests
 */
export async function getInstallmentRequests(_filters?: any) {
  const result = await get('/installments/requests');
  return (result as any)?.data?.requests || (result as any)?.requests || [];
}

/**
 * Create Installment Request
 */
export async function createInstallmentRequest(data: any) {
  return post('/installments/requests', data);
}

/**
 * Update Installment Request
 */
export async function updateInstallmentRequest(id: string, data: any) {
  return put(`/installments/requests/${id}`, data);
}

/**
 * Delete Installment Request
 */
export async function deleteInstallmentRequest(id: string) {
  return del(`/installments/requests/${id}`);
}

/**
 * Get Installment Request By ID
 */
export async function getInstallmentRequestById(id: string) {
  const result = await get(`/installments/requests/${id}`);
  return (result as any)?.data?.request || (result as any)?.request || null;
}

/**
 * Get Installment Requests For Supplier
 */
export async function getInstallmentRequestsForSupplier(supplierId: string) {
  const result = await get(`/installments/supplier/${supplierId}/requests`);
  return (result as any)?.data?.requests || (result as any)?.requests || [];
}

/**
 * Close Installment Request
 */
export async function closeInstallmentRequest(requestId: string, reason: string) {
  return post(`/installments/requests/${requestId}/close`, { reason });
}

/**
 * Cancel Installment Request
 */
export async function cancelInstallmentRequest(requestId: string) {
  return post(`/installments/requests/${requestId}/cancel`);
}

// ============================================
// Installments Offers
// ============================================

/**
 * Create Installment Offer
 */
export async function createInstallmentOffer(requestId: string, offerData: any) {
  return post(`/installments/requests/${requestId}/offers`, offerData);
}

/**
 * Get Installment Offers
 */
export async function getInstallmentOffers() {
  const result = await get('/installments/offers');
  return (result as any)?.data?.offers || (result as any)?.offers || [];
}

/**
 * Get Installment Offer By ID
 */
export async function getInstallmentOfferById(id: string) {
  const result = await get(`/installments/offers/${id}`);
  return (result as any)?.data?.offer || (result as any)?.offer || null;
}

/**
 * Get Offers By Request ID
 */
export async function getOffersByRequestId(requestId: string) {
  const result = await get(`/installments/requests/${requestId}/offers`);
  return (result as any)?.data?.offers || (result as any)?.offers || [];
}

/**
 * Update Installment Offer
 */
export async function updateInstallmentOffer(id: string, data: any) {
  return put(`/installments/offers/${id}`, data);
}

/**
 * Customer Respond To Offer
 */
export async function customerRespondToOffer(offerId: string, decision: 'accept' | 'reject') {
  return post(`/installments/offers/${offerId}/respond`, { decision });
}

// ============================================
// Sinicar & Supplier Actions
// ============================================

/**
 * Record Sinicar Decision
 */
export async function recordSinicarDecision(requestId: string, payload: any) {
  return post(`/installments/requests/${requestId}/sinicar-decision`, payload);
}

/**
 * Forward Request To Suppliers
 */
export async function forwardRequestToSuppliers(requestId: string, supplierIds: string[]) {
  return post(`/installments/requests/${requestId}/forward`, { supplierIds });
}

/**
 * Supplier Submit Offer
 */
export async function supplierSubmitOffer(requestId: string, supplierId: string, supplierName: string, offerData: any) {
  return post(`/installments/requests/${requestId}/supplier-offer`, { supplierId, supplierName, ...offerData });
}

// ============================================
// Payment & Stats
// ============================================

/**
 * Mark Installment As Paid
 */
export async function markInstallmentAsPaid(offerId: string, installmentId: string, paymentDetails?: any) {
  return post(`/installments/offers/${offerId}/installments/${installmentId}/pay`, paymentDetails);
}

/**
 * Get Installment Stats
 */
export async function getInstallmentStats() {
  const result = await get('/installments/stats');
  return (result as any)?.data || result || {};
}

/**
 * Generate Payment Schedule
 */
export async function generatePaymentSchedule(totalAmount: number, frequency: string, numberOfInstallments: number, startDate?: string) {
  return post('/installments/generate-schedule', { totalAmount, frequency, numberOfInstallments, startDate });
}

/**
 * Get Customer Credit Profile
 */
export async function getCustomerCreditProfile(customerId: string) {
  const result = await get(`/customers/${customerId}/credit-profile`);
  return (result as any)?.data || result || {};
}
