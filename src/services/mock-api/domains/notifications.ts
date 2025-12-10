import { STORAGE_KEYS } from '../core/storage-keys';
import { 
    internalCreateNotification, 
    getAdminUserIds,
    CreateNotificationParams 
} from '../core/helpers/notifications';
import { Notification, NotificationType, User } from '../../../types';

const updateLocalUser = (updatedUser: User) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
        if(session.id === updatedUser.id) {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
        }
    }
};

export const notificationsApi = {
    async getNotificationsForUser(userId: string, options?: { 
        isRead?: boolean; 
        limit?: number; 
        page?: number;
        type?: NotificationType;
        types?: NotificationType[];
    }): Promise<{ items: Notification[]; unreadCount: number; total: number }> {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        let userNotifs = all.filter((n: Notification) => n.userId === userId);
        
        if (options?.isRead !== undefined) {
            userNotifs = userNotifs.filter((n: Notification) => n.isRead === options.isRead);
        }
        if (options?.types && options.types.length > 0) {
            userNotifs = userNotifs.filter((n: Notification) => options.types!.includes(n.type));
        } else if (options?.type) {
            userNotifs = userNotifs.filter((n: Notification) => n.type === options.type);
        }
        
        userNotifs.sort((a: Notification, b: Notification) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const total = userNotifs.length;
        const unreadCount = all.filter((n: Notification) => n.userId === userId && !n.isRead).length;
        
        const limit = options?.limit || 20;
        const page = options?.page || 1;
        const startIndex = (page - 1) * limit;
        const items = userNotifs.slice(startIndex, startIndex + limit);
        
        return { items, unreadCount, total };
    },

    async getAllNotifications(): Promise<Notification[]> {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    },

    async markNotificationAsRead(userId: string, notificationId: string): Promise<Notification | null> {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        const idx = all.findIndex((n: Notification) => n.id === notificationId && n.userId === userId);
        if (idx === -1) return null;
        
        all[idx] = { ...all[idx], isRead: true, readAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
        return all[idx];
    },

    async markAllNotificationsAsRead(userId: string): Promise<number> {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        const now = new Date().toISOString();
        let count = 0;
        
        const updated = all.map((n: Notification) => {
            if (n.userId === userId && !n.isRead) {
                count++;
                return { ...n, isRead: true, readAt: now };
            }
            return n;
        });
        
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
        return count;
    },

    async markNotificationsAsRead(userId: string): Promise<void> {
        await this.markAllNotificationsAsRead(userId);
    },

    async clearNotificationsForUser(userId: string): Promise<void> {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        const filtered = all.filter((n: Notification) => n.userId !== userId);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    },

    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        const filtered = all.filter((n: Notification) => !(n.id === notificationId && n.userId === userId));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    },

    async createNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'>): Promise<Notification> {
        return internalCreateNotification(
            notifData.userId, 
            notifData.type, 
            notifData.title, 
            notifData.message,
            notifData.relatedType,
            notifData.relatedId,
            notifData.link
        );
    },

    async notifyAdmins(type: NotificationType, title: string, message: string, relatedType?: CreateNotificationParams['relatedType'], relatedId?: string): Promise<void> {
        const adminIds = getAdminUserIds();
        adminIds.forEach(adminId => {
            internalCreateNotification(adminId, type, title, message, relatedType, relatedId);
        });
    },

    async getUnreadNotificationCount(userId: string): Promise<number> {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        return all.filter((n: Notification) => n.userId === userId && !n.isRead).length;
    },

    async markOrdersAsReadForUser(userId: string): Promise<void> {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const idx = users.findIndex((u: User) => u.id === userId);
        if (idx !== -1) {
            const user = users[idx];
            if (user.hasUnreadOrders) {
                user.hasUnreadOrders = false;
                user.lastOrdersViewedAt = new Date().toISOString();
                updateLocalUser(user);
            }
        }
    },

    async markQuotesAsReadForUser(userId: string): Promise<void> {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const idx = users.findIndex((u: User) => u.id === userId);
        if (idx !== -1) {
            const user = users[idx];
            if (user.hasUnreadQuotes) {
                user.hasUnreadQuotes = false;
                user.lastQuotesViewedAt = new Date().toISOString();
                updateLocalUser(user);
            }
        }
    }
};
