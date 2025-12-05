import { LoginInput, RegisterInput } from '../../schemas/auth.schema';
export declare class AuthService {
    private generateTokens;
    login(input: LoginInput): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            role: string;
            profile: {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                companyName: string | null;
                region: string | null;
                city: string | null;
                crNumber: string | null;
                taxNumber: string | null;
                nationalAddress: string | null;
                customerType: string;
                businessCustomerType: string | null;
                assignedPriceLevel: string;
                priceVisibility: string;
                isApproved: boolean;
                searchPointsTotal: number;
                searchPointsRemaining: number;
                suspendedUntil: Date | null;
                internalNotes: string | null;
            } | null;
            employeeRole?: undefined;
        };
    } | {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            role: string;
            employeeRole: string | null;
            profile?: undefined;
        };
    }>;
    register(input: RegisterInput): Promise<{
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            role: string;
            status: string;
        };
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        clientId: string;
        name: string;
        email: string | null;
        phone: string | null;
        role: string;
        employeeRole: string | null;
        isActive: boolean;
        status: string;
        profile: {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            companyName: string | null;
            region: string | null;
            city: string | null;
            crNumber: string | null;
            taxNumber: string | null;
            nationalAddress: string | null;
            customerType: string;
            businessCustomerType: string | null;
            assignedPriceLevel: string;
            priceVisibility: string;
            isApproved: boolean;
            searchPointsTotal: number;
            searchPointsRemaining: number;
            suspendedUntil: Date | null;
            internalNotes: string | null;
        } | null;
        searchLimit: number;
        searchUsed: number;
        lastLoginAt: Date | null;
        organizations: {
            id: string;
            name: string;
            type: string;
            role: string;
        }[];
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(identifier: string): Promise<{
        message: string;
        success: boolean;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map