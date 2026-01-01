/**
 * Staff Authentication Service
 * Handles staff login verification and permission loading
 */

const STORAGE_KEY_STAFF_USERS = 'sini_staff_users';
const STORAGE_KEY_STAFF_PERMS = 'sini_staff_permissions';

export interface StaffUser {
    id: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    roleId: string;
    isActive: boolean;
    createdAt: string;
}

export interface StaffRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem?: boolean;
}

export interface StaffLoginResult {
    success: boolean;
    user?: StaffUser;
    role?: StaffRole;
    permissions?: string[];
    error?: string;
}

/**
 * Get all staff users from localStorage
 */
export const getStaffUsers = (): StaffUser[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_STAFF_USERS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

/**
 * Get all staff roles from localStorage
 */
export const getStaffRoles = (): StaffRole[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_STAFF_PERMS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

/**
 * Verify staff credentials and return user with role/permissions
 */
export const verifyStaffLogin = (email: string, password: string): StaffLoginResult => {
    const users = getStaffUsers();
    const roles = getStaffRoles();

    // Find user by email (case insensitive)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, error: 'لم يتم العثور على هذا البريد الإلكتروني' };
    }

    // Check password
    if (user.password !== password) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    // Check if active
    if (!user.isActive) {
        return { success: false, error: 'هذا الحساب معطل، تواصل مع المدير' };
    }

    // Get role
    const role = roles.find(r => r.id === user.roleId);

    if (!role) {
        return { success: false, error: 'لم يتم العثور على دور المستخدم' };
    }

    return {
        success: true,
        user,
        role,
        permissions: role.permissions
    };
};

/**
 * Check if a staff user has a specific permission
 */
export const staffHasPermission = (userId: string, permissionId: string): boolean => {
    const users = getStaffUsers();
    const roles = getStaffRoles();

    const user = users.find(u => u.id === userId);
    if (!user || !user.isActive) return false;

    const role = roles.find(r => r.id === user.roleId);
    if (!role) return false;

    return role.permissions.includes(permissionId);
};

/**
 * Get all permissions for a staff user
 */
export const getStaffPermissions = (userId: string): string[] => {
    const users = getStaffUsers();
    const roles = getStaffRoles();

    const user = users.find(u => u.id === userId);
    if (!user || !user.isActive) return [];

    const role = roles.find(r => r.id === user.roleId);
    return role?.permissions || [];
};

export default {
    verifyStaffLogin,
    staffHasPermission,
    getStaffPermissions,
    getStaffUsers,
    getStaffRoles
};
