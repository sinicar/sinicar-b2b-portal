import { Prisma } from '@prisma/client';
import { OrgStatus, OrganizationType, OrgUserRole, InviteStatus } from '../../types/enums';
import { PaginationParams } from '../../utils/pagination';
export interface OrganizationFilters {
    type?: OrganizationType;
    status?: OrgStatus;
    search?: string;
}
export declare class OrganizationRepository {
    findMany(filters: OrganizationFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            users: number;
            invitations: number;
        };
        users: ({
            user: {
                id: string;
                clientId: string;
                name: string;
                email: string | null;
                phone: string | null;
                password: string | null;
                role: string;
                employeeRole: string | null;
                status: string;
                isActive: boolean;
                parentId: string | null;
                businessId: string | null;
                activationCode: string | null;
                passwordResetToken: string | null;
                passwordResetExpiry: Date | null;
                searchLimit: number;
                searchUsed: number;
                failedLoginAttempts: number;
                lastLoginAt: Date | null;
                lastActiveAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            role: string;
            status: string;
            lastActiveAt: Date | null;
            userId: string;
            organizationId: string;
            permissions: string | null;
            jobTitle: string | null;
            department: string | null;
            invitedBy: string | null;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerUserId: string;
        maxEmployees: number;
        allowCustomPermissions: boolean;
    }>>;
    findById(id: string): Promise<({
        activityLogs: {
            id: string;
            createdAt: Date;
            userName: string | null;
            description: string;
            metadata: string | null;
            userId: string;
            organizationId: string;
            action: string;
        }[];
        users: ({
            user: {
                id: string;
                clientId: string;
                name: string;
                email: string | null;
                phone: string | null;
                password: string | null;
                role: string;
                employeeRole: string | null;
                status: string;
                isActive: boolean;
                parentId: string | null;
                businessId: string | null;
                activationCode: string | null;
                passwordResetToken: string | null;
                passwordResetExpiry: Date | null;
                searchLimit: number;
                searchUsed: number;
                failedLoginAttempts: number;
                lastLoginAt: Date | null;
                lastActiveAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            role: string;
            status: string;
            lastActiveAt: Date | null;
            userId: string;
            organizationId: string;
            permissions: string | null;
            jobTitle: string | null;
            department: string | null;
            invitedBy: string | null;
            joinedAt: Date;
        })[];
        invitations: {
            id: string;
            email: string;
            phone: string | null;
            role: string;
            status: string;
            createdAt: Date;
            organizationId: string;
            expiresAt: Date;
            inviteCode: string;
            createdBy: string;
            acceptedAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerUserId: string;
        maxEmployees: number;
        allowCustomPermissions: boolean;
    }) | null>;
    findByOwner(ownerUserId: string): Promise<({
        users: ({
            user: {
                id: string;
                clientId: string;
                name: string;
                email: string | null;
                phone: string | null;
                password: string | null;
                role: string;
                employeeRole: string | null;
                status: string;
                isActive: boolean;
                parentId: string | null;
                businessId: string | null;
                activationCode: string | null;
                passwordResetToken: string | null;
                passwordResetExpiry: Date | null;
                searchLimit: number;
                searchUsed: number;
                failedLoginAttempts: number;
                lastLoginAt: Date | null;
                lastActiveAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            role: string;
            status: string;
            lastActiveAt: Date | null;
            userId: string;
            organizationId: string;
            permissions: string | null;
            jobTitle: string | null;
            department: string | null;
            invitedBy: string | null;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerUserId: string;
        maxEmployees: number;
        allowCustomPermissions: boolean;
    }) | null>;
    create(data: Prisma.OrganizationCreateInput): Promise<{
        users: {
            id: string;
            role: string;
            status: string;
            lastActiveAt: Date | null;
            userId: string;
            organizationId: string;
            permissions: string | null;
            jobTitle: string | null;
            department: string | null;
            invitedBy: string | null;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerUserId: string;
        maxEmployees: number;
        allowCustomPermissions: boolean;
    }>;
    update(id: string, data: Prisma.OrganizationUpdateInput): Promise<{
        users: {
            id: string;
            role: string;
            status: string;
            lastActiveAt: Date | null;
            userId: string;
            organizationId: string;
            permissions: string | null;
            jobTitle: string | null;
            department: string | null;
            invitedBy: string | null;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerUserId: string;
        maxEmployees: number;
        allowCustomPermissions: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerUserId: string;
        maxEmployees: number;
        allowCustomPermissions: boolean;
    }>;
    addMember(data: {
        organizationId: string;
        userId: string;
        role: OrgUserRole;
        permissions?: string;
        jobTitle?: string;
        department?: string;
        invitedBy?: string;
    }): Promise<{
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            password: string | null;
            role: string;
            employeeRole: string | null;
            status: string;
            isActive: boolean;
            parentId: string | null;
            businessId: string | null;
            activationCode: string | null;
            passwordResetToken: string | null;
            passwordResetExpiry: Date | null;
            searchLimit: number;
            searchUsed: number;
            failedLoginAttempts: number;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        organization: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            ownerUserId: string;
            maxEmployees: number;
            allowCustomPermissions: boolean;
        };
    } & {
        id: string;
        role: string;
        status: string;
        lastActiveAt: Date | null;
        userId: string;
        organizationId: string;
        permissions: string | null;
        jobTitle: string | null;
        department: string | null;
        invitedBy: string | null;
        joinedAt: Date;
    }>;
    updateMember(id: string, data: Prisma.OrganizationUserUpdateInput): Promise<{
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            password: string | null;
            role: string;
            employeeRole: string | null;
            status: string;
            isActive: boolean;
            parentId: string | null;
            businessId: string | null;
            activationCode: string | null;
            passwordResetToken: string | null;
            passwordResetExpiry: Date | null;
            searchLimit: number;
            searchUsed: number;
            failedLoginAttempts: number;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        role: string;
        status: string;
        lastActiveAt: Date | null;
        userId: string;
        organizationId: string;
        permissions: string | null;
        jobTitle: string | null;
        department: string | null;
        invitedBy: string | null;
        joinedAt: Date;
    }>;
    removeMember(id: string): Promise<{
        id: string;
        role: string;
        status: string;
        lastActiveAt: Date | null;
        userId: string;
        organizationId: string;
        permissions: string | null;
        jobTitle: string | null;
        department: string | null;
        invitedBy: string | null;
        joinedAt: Date;
    }>;
    findMember(organizationId: string, userId: string): Promise<({
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            password: string | null;
            role: string;
            employeeRole: string | null;
            status: string;
            isActive: boolean;
            parentId: string | null;
            businessId: string | null;
            activationCode: string | null;
            passwordResetToken: string | null;
            passwordResetExpiry: Date | null;
            searchLimit: number;
            searchUsed: number;
            failedLoginAttempts: number;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        organization: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            ownerUserId: string;
            maxEmployees: number;
            allowCustomPermissions: boolean;
        };
    } & {
        id: string;
        role: string;
        status: string;
        lastActiveAt: Date | null;
        userId: string;
        organizationId: string;
        permissions: string | null;
        jobTitle: string | null;
        department: string | null;
        invitedBy: string | null;
        joinedAt: Date;
    }) | null>;
    getMembers(organizationId: string): Promise<({
        user: {
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            password: string | null;
            role: string;
            employeeRole: string | null;
            status: string;
            isActive: boolean;
            parentId: string | null;
            businessId: string | null;
            activationCode: string | null;
            passwordResetToken: string | null;
            passwordResetExpiry: Date | null;
            searchLimit: number;
            searchUsed: number;
            failedLoginAttempts: number;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        role: string;
        status: string;
        lastActiveAt: Date | null;
        userId: string;
        organizationId: string;
        permissions: string | null;
        jobTitle: string | null;
        department: string | null;
        invitedBy: string | null;
        joinedAt: Date;
    })[]>;
    createInvitation(data: {
        organizationId: string;
        email: string;
        phone?: string;
        role: OrgUserRole;
        inviteCode: string;
        expiresAt: Date;
        createdBy: string;
    }): Promise<{
        id: string;
        email: string;
        phone: string | null;
        role: string;
        status: string;
        createdAt: Date;
        organizationId: string;
        expiresAt: Date;
        inviteCode: string;
        createdBy: string;
        acceptedAt: Date | null;
    }>;
    findInvitationByCode(inviteCode: string): Promise<({
        organization: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            ownerUserId: string;
            maxEmployees: number;
            allowCustomPermissions: boolean;
        };
    } & {
        id: string;
        email: string;
        phone: string | null;
        role: string;
        status: string;
        createdAt: Date;
        organizationId: string;
        expiresAt: Date;
        inviteCode: string;
        createdBy: string;
        acceptedAt: Date | null;
    }) | null>;
    updateInvitation(id: string, data: Prisma.TeamInvitationUpdateInput): Promise<{
        id: string;
        email: string;
        phone: string | null;
        role: string;
        status: string;
        createdAt: Date;
        organizationId: string;
        expiresAt: Date;
        inviteCode: string;
        createdBy: string;
        acceptedAt: Date | null;
    }>;
    getInvitations(organizationId: string, status?: InviteStatus): Promise<{
        id: string;
        email: string;
        phone: string | null;
        role: string;
        status: string;
        createdAt: Date;
        organizationId: string;
        expiresAt: Date;
        inviteCode: string;
        createdBy: string;
        acceptedAt: Date | null;
    }[]>;
    logActivity(data: {
        organizationId: string;
        userId: string;
        userName?: string;
        action: string;
        description: string;
        metadata?: object;
    }): Promise<{
        id: string;
        createdAt: Date;
        userName: string | null;
        description: string;
        metadata: string | null;
        userId: string;
        organizationId: string;
        action: string;
    }>;
}
export declare const organizationRepository: OrganizationRepository;
//# sourceMappingURL=organization.repository.d.ts.map