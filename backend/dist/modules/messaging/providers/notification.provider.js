"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationProvider = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationProvider {
    isConfigured = true;
    configure(config) {
        this.isConfigured = true;
    }
    async send(message) {
        console.log('[Notification Provider] Creating notification:', {
            userId: message.userId,
            title: message.title,
            bodyLength: message.body.length,
            type: message.type,
            priority: message.priority,
            timestamp: new Date().toISOString(),
        });
        try {
            const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('[Notification Provider] Notification created:', {
                id: notificationId,
                userId: message.userId,
                title: message.title,
                body: message.body.substring(0, 100) + (message.body.length > 100 ? '...' : ''),
            });
            return {
                success: true,
                externalId: notificationId,
            };
        }
        catch (error) {
            console.error('[Notification Provider] Send error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendToMultiple(userIds, message) {
        console.log('[Notification Provider] Sending to multiple users:', {
            userCount: userIds.length,
            title: message.title,
            timestamp: new Date().toISOString(),
        });
        const results = [];
        for (const userId of userIds) {
            const result = await this.send({ ...message, userId });
            results.push(result);
        }
        return results;
    }
    async sendBroadcast(message, filters) {
        console.log('[Notification Provider] Broadcasting notification:', {
            title: message.title,
            filters,
            timestamp: new Date().toISOString(),
        });
        return { sent: 0, failed: 0 };
    }
    getStatus() {
        return {
            isConfigured: this.isConfigured,
            provider: 'Internal Notifications',
        };
    }
}
exports.notificationProvider = new NotificationProvider();
//# sourceMappingURL=notification.provider.js.map