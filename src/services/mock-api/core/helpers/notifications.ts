import { STORAGE_KEYS } from '../storage-keys';
import { Notification, NotificationType, User } from '../../../../types';

export interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedType?: 'ORDER' | 'REQUEST' | 'ACCOUNT' | 'QUOTE' | 'IMPORT' | 'PRODUCT' | 'USER' | 'CART';
    relatedId?: string;
    link?: string;
}

export const internalCreateNotification = (
    userId: string, 
    type: NotificationType, 
    title: string, 
    message: string,
    relatedType?: CreateNotificationParams['relatedType'],
    relatedId?: string,
    link?: string
): Notification => {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const newNotif: Notification = {
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId,
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
        isRead: false,
        relatedType,
        relatedId,
        link
    };
    notifications.unshift(newNotif);
    if(notifications.length > 500) notifications.length = 500; 
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotif;
};

export const createEventNotification = (params: CreateNotificationParams): Notification => {
    return internalCreateNotification(
        params.userId,
        params.type,
        params.title,
        params.message,
        params.relatedType,
        params.relatedId,
        params.link
    );
};

export const getAdminUserIds = (): string[] => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users
        .filter((u: User) => {
            const role = u.role as string;
            return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EMPLOYEE';
        })
        .map((u: User) => u.id);
};
