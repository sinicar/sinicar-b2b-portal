export declare function generateResetCode(): string;
export declare function getResetCodeExpiry(minutes?: number): Date;
export declare function storeResetCode(userId: string, resetCode: string, expiresAt: Date): Promise<void>;
export declare function findUserByWhatsappOrEmail(identifier: string): Promise<{
    id: string;
    name: string;
} | null>;
export declare function validateResetCode(identifier: string, resetCode: string): Promise<{
    valid: boolean;
    userId?: string;
    error?: string;
}>;
export declare function updatePassword(userId: string, newPassword: string): Promise<void>;
export declare function clearResetCode(userId: string): Promise<void>;
//# sourceMappingURL=password-reset.service.d.ts.map