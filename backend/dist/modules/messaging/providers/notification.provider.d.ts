export interface NotificationMessage {
    userId: string;
    title: string;
    body: string;
    type?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    data?: Record<string, any>;
    link?: string;
    imageUrl?: string;
}
export interface SendResult {
    success: boolean;
    externalId?: string;
    error?: string;
}
declare class NotificationProvider {
    private isConfigured;
    configure(config?: {
        pushEnabled?: boolean;
    }): void;
    send(message: NotificationMessage): Promise<SendResult>;
    sendToMultiple(userIds: string[], message: Omit<NotificationMessage, 'userId'>): Promise<SendResult[]>;
    sendBroadcast(message: Omit<NotificationMessage, 'userId'>, filters?: {
        roles?: string[];
        customerTypes?: string[];
    }): Promise<{
        sent: number;
        failed: number;
    }>;
    getStatus(): {
        isConfigured: boolean;
        provider: string;
    };
}
export declare const notificationProvider: NotificationProvider;
export {};
//# sourceMappingURL=notification.provider.d.ts.map