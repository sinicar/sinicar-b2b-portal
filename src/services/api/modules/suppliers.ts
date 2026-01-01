/**
 * Suppliers API Module
 * وحدة API للموردين
 */

import { ApiClient, get, put, post } from '../../apiClient';

// ============================================
// Suppliers Functions - وظائف الموردين
// ============================================

/**
 * Get Supplier Products
 */
export async function getSupplierProducts(supplierId: string) {
  try {
    const result = await ApiClient.suppliers?.getProducts?.(supplierId);
    return result?.products || [];
  } catch (error) {
    console.error('[SuppliersModule] getSupplierProducts failed:', error);
    return [];
  }
}

/**
 * Get Supplier Stats
 */
export async function getSupplierStats(supplierId: string) {
  try {
    const result = await get(`/suppliers/${supplierId}/stats`);
    const data = result as any;
    return data?.data || data || { totalProducts: 0, totalOrders: 0 };
  } catch (error) {
    return { totalProducts: 0, totalOrders: 0 };
  }
}

/**
 * Get Supplier By ID
 */
export async function getSupplierById(supplierId: string) {
  try {
    const result = await ApiClient.suppliers?.getById?.(supplierId);
    return result?.supplier || null;
  } catch (error) {
    console.error('[SuppliersModule] getSupplierById failed:', error);
    return null;
  }
}

/**
 * Update Supplier Profile
 */
export async function updateSupplierProfile(supplierId: string, updates: any) {
  try {
    const result = await put(`/suppliers/${supplierId}`, updates);
    const data = result as any;
    return data?.data?.supplier || data?.supplier || data;
  } catch (error) {
    throw error;
  }
}

/**
 * Add Supplier Product
 */
export async function addSupplierProduct(supplierId: string, productData: any) {
  try {
    const result = await post(`/suppliers/${supplierId}/products`, productData);
    const data = result as any;
    return data?.data?.product || data?.product || data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update Supplier Product
 */
export async function updateSupplierProduct(supplierId: string, productId: string, updates: any) {
  try {
    const result = await put(`/suppliers/${supplierId}/products/${productId}`, updates);
    const data = result as any;
    return data?.data?.product || data?.product || data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get All Suppliers
 */
export async function getAllSuppliers(_params?: { page?: number; limit?: number }) {
  try {
    const result = await get('/suppliers');
    const data = result as any;
    return data?.data?.suppliers || data?.suppliers || [];
  } catch (error) {
    return [];
  }
}
