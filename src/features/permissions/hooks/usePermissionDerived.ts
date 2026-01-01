/**
 * usePermissionDerived - Derived selectors for permission data
 * Calculations and filtering without mutation logic
 */

import { useMemo } from 'react';
import { StaffRole, StaffUser, StaffPermission } from '../types';

interface UsePermissionDerivedProps {
  roles: StaffRole[];
  users: StaffUser[];
  permissions: StaffPermission[];
  searchQuery?: string;
}

interface UsePermissionDerivedResult {
  // Filtered lists
  filteredUsers: StaffUser[];
  
  // Role utilities
  getRoleName: (roleId: string) => string;
  getRolePermissions: (roleId: string) => string[];
  
  // Permission categories
  categories: string[];
  
  // Counts
  totalUsers: number;
  totalRoles: number;
  activeUsers: number;
}

export function usePermissionDerived({
  roles,
  users,
  permissions,
  searchQuery = ''
}: UsePermissionDerivedProps): UsePermissionDerivedResult {
  
  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Get role name by ID
  const getRoleName = (roleId: string): string => {
    return roles.find(r => r.id === roleId)?.name || 'غير محدد';
  };

  // Get role permissions by ID
  const getRolePermissions = (roleId: string): string[] => {
    return roles.find(r => r.id === roleId)?.permissions || [];
  };

  // Extract unique categories from permissions
  const categories = useMemo(() => {
    return [...new Set(permissions.map(p => p.category))];
  }, [permissions]);

  // Counts
  const totalUsers = users.length;
  const totalRoles = roles.length;
  const activeUsers = users.filter(u => u.isActive).length;

  return {
    filteredUsers,
    getRoleName,
    getRolePermissions,
    categories,
    totalUsers,
    totalRoles,
    activeUsers
  };
}

export default usePermissionDerived;
