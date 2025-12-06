export interface WhatsAppMessage {
    phone: string;
    body: string;
    templateName?: string;
    mediaUrl?: string;
}
export interface SendResult {
    success: boolean;
    externalId?: string;
    error?: string;
}
declare class WhatsAppProvider {
    private apiUrl;
    private apiKey;
    private phoneNumberId;
    private isConfigured;
    configure(config: {
        apiUrl: string;
        apiKey: string;
        phoneNumberId: string;
    }): void;
    send(message: WhatsAppMessage): Promise<SendResult>;
    sendTemplate(params: {
        phone: string;
        templateName: string;
        languageCode: string;
        components?: any[];
    }): Promise<SendResult>;
    getStatus(): {
        isConfigured: boolean;
        provider: string;
    };
}
export declare const whatsappProvider: WhatsAppProvider;
export {};
//# sourceMappingURL=whatsapp.provider.d.ts.map