/**
 * Products API Module
 * وحدة API للمنتجات
 * 
 * NOTE: ApiClient doesn't have a dedicated 'products' namespace yet.
 * Using ApiClient.orders.searchProducts for search, and stubs for rest.
 */

import { ApiClient } from '../../apiClient';

// ============================================
// Products Functions - وظائف المنتجات
// ============================================

/**
 * Search Products
 */
export async function searchProducts(query: string, limit?: number) {
  try {
    const result = await ApiClient.orders.searchProducts(query, limit || 50);
    // Handle different response shapes
    if (Array.isArray(result)) return result;
    if (result && 'products' in result) return (result as { products: unknown[] }).products || [];
    return [];
  } catch (error) {
    console.error('[ProductsModule] searchProducts failed:', error);
    return [];
  }
}

/**
 * Get Product By ID
 * NOTE: Stub - full implementation pending backend products endpoint
 */
export async function getProductById(productId: string) {
  try {
    // TODO: Replace with ApiClient.products.getById when available
    console.warn(`[ProductsModule] getProductById(${productId}) - using search fallback`);
    const results = await searchProducts(productId, 1);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('[ProductsModule] getProductById failed:', error);
    return null;
  }
}

/**
 * Get All Products
 * NOTE: Stub - returns empty array until backend endpoint exists
 */
export async function getAllProducts(_params?: { page?: number; limit?: number }) {
  console.warn('[ProductsModule] getAllProducts - not implemented yet');
  return [];
}

/**
 * Create Product
 * NOTE: Stub - throws until backend endpoint exists
 */
export async function createProduct(_productData: unknown) {
  console.warn('[ProductsModule] createProduct - not implemented yet');
  throw new Error('createProduct not implemented');
}

/**
 * Update Product
 * NOTE: Stub - throws until backend endpoint exists
 */
export async function updateProduct(_productId: string, _updates: unknown) {
  console.warn('[ProductsModule] updateProduct - not implemented yet');
  throw new Error('updateProduct not implemented');
}

/**
 * Delete Product
 * NOTE: Stub - returns failure until backend endpoint exists
 */
export async function deleteProduct(_productId: string) {
  console.warn('[ProductsModule] deleteProduct - not implemented yet');
  return { success: false, message: 'deleteProduct not implemented' };
}

/**
 * Get Product Alternatives
 * NOTE: Stub - returns empty array until backend endpoint exists
 */
export async function getProductAlternatives(_partNumber: string) {
  console.warn('[ProductsModule] getProductAlternatives - not implemented yet');
  return [];
}

