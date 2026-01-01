/**
 * Customers API Module
 * وحدة API للعملاء - الجزء الكامل (20 وظيفة)
 */

import { ApiClient, get, post, put, del } from '../../apiClient';

// ============================================
// Customers Functions - وظائف العملاء
// ============================================

/**
 * Get All Users
 */
export async function getAllUsers() {
  const result = await ApiClient.customers.getAll();
  return result.customers.map((c: any) => ({ user: c, profile: c.profile }));
}

/**
 * Get Customers Database
 */
export async function getCustomersDatabase() {
  const result = await ApiClient.customers.getAll();
  return result.customers;
}

/**
 * Create Customer From Admin
 */
export async function createCustomerFromAdmin(data: any) {
  const result = await ApiClient.customers.create(data);
  return result.customer;
}

/**
 * Update Customer Status
 */
export async function updateCustomerStatus(customerId: string, status: string, _suspendedUntil?: string) {
  const result = await ApiClient.customers.updateStatus(customerId, status);
  return result.customer;
}

/**
 * Get Customer By ID
 */
export async function getCustomerById(customerId: string) {
  const result = await ApiClient.customers.getById(customerId);
  return result.customer;
}

/**
 * Update Customer Profile (Admin)
 */
export async function updateCustomerProfileAdmin(customerId: string, updates: any) {
  const result = await ApiClient.customers.update(customerId, updates);
  return result.customer;
}

/**
 * Add Customer Search Points
 */
export async function addCustomerSearchPoints(customerId: string, points: number) {
  return ApiClient.customers.addSearchPoints(customerId, points);
}

/**
 * Deduct Customer Search Points
 */
export async function deductCustomerSearchPoints(customerId: string, points: number) {
  return ApiClient.customers.deductSearchPoints(customerId, points);
}

/**
 * Update Customer Price Visibility
 */
export async function updateCustomerPriceVisibility(customerId: string, visibility: 'VISIBLE' | 'HIDDEN') {
  return put(`/customers/${customerId}/price-visibility`, { visibility });
}

/**
 * Get Customer Stats
 */
export async function getCustomerStats() {
  const result = await get('/customers/stats');
  const data = result as any;
  return data?.data?.stats || data?.stats || data || {};
}

// ============================================
// Part 2: Notes, Branches, Employees
// ============================================

/**
 * Add Customer Note
 */
export async function addCustomerNote(customerId: string, text: string, createdBy: string, createdByName: string) {
  const result = await post(`/customers/${customerId}/notes`, { text, createdBy, createdByName });
  const data = result as any;
  return data?.data?.note || data?.note || data || {};
}

/**
 * Get Customer Notes
 */
export async function getCustomerNotes(customerId: string, page: number = 1, pageSize: number = 10) {
  const result = await get(`/customers/${customerId}/notes?page=${page}&limit=${pageSize}`);
  const data = result as any;
  return data?.data || data || { notes: [], total: 0 };
}

/**
 * Get Customer Orders Summary
 */
export async function getCustomerOrdersSummary(customerId: string) {
  const result = await ApiClient.customers.getOrders(customerId);
  const data = result as any;
  return data?.data || data || { orders: [], summary: {} };
}

/**
 * Add Branch
 */
export async function addBranch(customerId: string, branch: any) {
  const result = await post(`/customers/${customerId}/branches`, branch);
  const data = result as any;
  return data?.data?.branch || data?.branch || data;
}

/**
 * Delete Branch
 */
export async function deleteBranch(customerId: string, branchId: string) {
  return del(`/customers/${customerId}/branches/${branchId}`);
}

/**
 * Add Employee
 */
export async function addEmployee(customerId: string, empData: any) {
  const result = await post(`/customers/${customerId}/staff`, empData);
  const data = result as any;
  return data?.data?.staff || data?.staff || data;
}

/**
 * Toggle Employee Status
 */
export async function toggleEmployeeStatus(employeeId: string) {
  return put(`/users/${employeeId}/toggle-status`);
}

/**
 * Delete Employee
 */
export async function deleteEmployee(customerId: string, employeeId: string) {
  return del(`/customers/${customerId}/staff/${employeeId}`);
}

/**
 * Update Staff Status
 */
export async function updateStaffStatus(staffId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED') {
  return put(`/users/${staffId}/status`, { status });
}

/**
 * Reset Failed Login
 */
export async function resetFailedLogin(userId: string) {
  return put(`/users/${userId}/reset-failed-login`);
}

/**
 * Get Admin Customers (CRM)
 */
export async function getAdminCustomers(filters: any) {
  const result = await ApiClient.customers.getAll(filters);
  return result;
}
