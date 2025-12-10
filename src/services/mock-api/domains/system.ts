import { STORAGE_KEYS } from '../core/storage-keys';
import { internalRecordActivity } from '../core/helpers/activity';
import { ActivityLogEntry, User, Order, OrderStatus } from '../../../types';

export const systemApi = {
  async checkHealth(): Promise<{ status: 'ok' | 'error', latency: number }> {
    const start = performance.now();
    await new Promise(r => setTimeout(r, Math.random() * 50));
    const end = performance.now();
    return { status: 'ok', latency: Math.round(end - start) };
  },

  async recordActivity(entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<void> {
    internalRecordActivity(entry);
  },

  async getActivityLogs(): Promise<ActivityLogEntry[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
  },

  async getCustomerActivityLogs(customerId: string): Promise<ActivityLogEntry[]> {
    const logs = await systemApi.getActivityLogs();
    return logs.filter(l => l.userId === customerId || l.metadata?.targetUserId === customerId);
  },

  async recordHeartbeat(userId: string): Promise<void> {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const idx = users.findIndex((u: User) => u.id === userId);
    if (idx !== -1) {
      users[idx].lastActiveAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  async getOnlineUsers(minutesThreshold: number = 5): Promise<User[]> {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const now = new Date().getTime();
    const thresholdMs = minutesThreshold * 60 * 1000;

    return users.filter((u: User) => {
      if (!u.lastActiveAt || u.role === 'SUPER_ADMIN') return false;
      const lastActive = new Date(u.lastActiveAt).getTime();
      return (now - lastActive) <= thresholdMs;
    });
  },

  async getAdminStats() {
    const { MockApi } = await import('../../mockApi');
    const orders = await MockApi.getAllOrders();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const products = await MockApi.searchProducts('');
    const quotes = await MockApi.getAllQuoteRequests();
    const accountRequests = await MockApi.getAccountOpeningRequests();

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: Order) => o.status === OrderStatus.PENDING).length,
      totalRevenue: orders.reduce((acc: number, o: Order) => acc + o.totalAmount, 0),
      totalUsers: users.length,
      totalProducts: products.length,
      pendingQuotes: quotes.filter(q => q.status === 'NEW' || q.status === 'UNDER_REVIEW').length,
      newAccountRequests: accountRequests.filter(r => r.status === 'NEW').length
    };
  }
};
