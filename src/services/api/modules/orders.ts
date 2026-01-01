/**
 * Orders API Module
 * وحدة API للطلبات - جميع الوظائف المتعلقة بالطلبات
 */

import { ApiClient } from '../../apiClient';
import { normalizeListResponse } from '../../normalize';


// ============================================
// Orders Functions - وظائف الطلبات
// ============================================

/**
 * Get All Orders - موحّد لإرجاع {items, total}
 */
export async function getAllOrders() {
  try {
    const result = await ApiClient.orders.getAll();
    // Handle different response shapes safely
    const res = result as Record<string, unknown>;
    const rawData = res?.orders || ('data' in res ? res.data : res);
    return normalizeListResponse(rawData);
  } catch (error) {
    throw error;
  }
}

/**
 * Get Order By ID
 */
export async function getOrderById(orderId: string) {
  try {
    const result = await ApiClient.orders.getById(orderId);
    return result.order;
  } catch (error) {
    // Fallback to get all and filter
    const orders = await getAllOrders();
    return orders.items?.find((o: any) => o.id === orderId) || null;
  }
}

/**
 * Create Order
 */
export async function createOrder(orderData: any) {
  try {
    const result = await ApiClient.orders.create(orderData);
    return result.order;
  } catch (error) {
    throw error;
  }
}

/**
 * Update Order Status
 */
export async function updateOrderStatus(orderId: string, status: string, _notes?: string) {
  try {
    const result = await ApiClient.orders.updateStatus(orderId, status);
    return result.order;
  } catch (error) {
    throw error;
  }
}

/**
 * Cancel Order
 */
export async function cancelOrder(orderId: string, reason?: string) {
  try {
    const result = await ApiClient.orders.cancel(orderId, reason);
    return result.order;
  } catch (error) {
    throw error;
  }
}

/**
 * Get My Orders (current user's orders)
 */
export async function getMyOrders(params?: { page?: number; limit?: number }) {
  try {
    const result = await ApiClient.orders.getMyOrders(params);
    return result.orders;
  } catch (error) {
    throw error;
  }
}

/**
 * Get Orders (Customer Portal) - uses /orders/my-orders endpoint
 * ترجع { items, total } موحّد لجميع الاستخدامات
 */
export async function getOrders(_userId: string, params?: { page?: number; limit?: number }) {
  try {
    const result = await ApiClient.orders.getMyOrders(params);
    return normalizeListResponse(result);
  } catch (error) {
    console.error('[OrdersModule] getOrders failed:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Get Order Statistics
 */
export async function getOrderStats(_userId?: string) {
  try {
    const result = await ApiClient.orders.getStats();
    return result;
  } catch (error) {
    return { totalOrders: 0, pendingOrders: 0, approvedOrders: 0 };
  }
}

/**
 * Delete Order
 */
export async function deleteOrder(orderId: string) {
  try {
    const result = await ApiClient.orders.delete(orderId);
    return result;
  } catch (error) {
    return { success: false, message: 'Failed to delete order' };
  }
}

/**
 * Get Order History
 */
export async function getOrderHistory(orderId: string) {
  try {
    const result = await ApiClient.orders.getHistory(orderId);
    return result;
  } catch (error) {
    return [];
  }
}
