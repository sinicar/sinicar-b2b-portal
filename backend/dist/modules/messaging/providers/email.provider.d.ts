export interface EmailMessage {
    email: string;
    subject: string;
    body: string;
    fromName?: string;
    fromEmail?: string;
    isHtml?: boolean;
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
}
export interface SendResult {
    success: boolean;
    externalId?: string;
    error?: string;
}
declare class EmailProvider {
    private provider;
    private smtpHost;
    private smtpPort;
    private smtpUser;
    private smtpPassword;
    private fromAddress;
    private fromName;
    private isConfigured;
    configure(config: {
        provider?: string;
        smtpHost?: string;
        smtpPort?: number;
        smtpUser?: string;
        smtpPassword?: string;
        fromAddress?: string;
        fromName?: string;
    }): void;
    send(message: EmailMessage): Promise<SendResult>;
    private buildEmailContent;
    getStatus(): {
        isConfigured: boolean;
        provider: string;
    };
}
export declare const emailProvider: EmailProvider;
export {};
//# sourceMappingURL=email.provider.d.ts.map