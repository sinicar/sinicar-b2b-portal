/**
 * usePermissionActions - Mutation handlers for permissions
 * Toggle, save, and CRUD operations
 */

import { useCallback } from 'react';
import { StaffRole, StaffUser } from '../types';

interface UsePermissionActionsProps {
  // State setters
  setRoles: (roles: StaffRole[]) => void;
  setUsers: (users: StaffUser[]) => void;
  
  // Current state
  roles: StaffRole[];
  users: StaffUser[];
  
  // Toast function
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  
  // Storage keys
  rolesStorageKey: string;
  usersStorageKey: string;
}

interface UsePermissionActionsResult {
  // Role actions
  saveRoles: (newRoles: StaffRole[]) => void;
  addRole: (role: Omit<StaffRole, 'id'>) => void;
  updateRole: (roleId: string, updates: Partial<StaffRole>) => void;
  deleteRole: (roleId: string) => boolean;
  
  // User actions
  saveUsers: (newUsers: StaffUser[]) => void;
  addUser: (user: Omit<StaffUser, 'id' | 'createdAt'>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  
  // Permission toggle
  togglePermission: (currentPermissions: string[], permId: string) => string[];
}

export function usePermissionActions({
  setRoles,
  setUsers,
  roles,
  users,
  addToast,
  rolesStorageKey,
  usersStorageKey
}: UsePermissionActionsProps): UsePermissionActionsResult {

  // Save roles to storage and state
  const saveRoles = useCallback((newRoles: StaffRole[]) => {
    localStorage.setItem(rolesStorageKey, JSON.stringify(newRoles));
    setRoles(newRoles);
  }, [rolesStorageKey, setRoles]);

  // Save users to storage and state
  const saveUsers = useCallback((newUsers: StaffUser[]) => {
    localStorage.setItem(usersStorageKey, JSON.stringify(newUsers));
    setUsers(newUsers);
  }, [usersStorageKey, setUsers]);

  // Add new role
  const addRole = useCallback((roleData: Omit<StaffRole, 'id'>) => {
    const newRole: StaffRole = {
      ...roleData,
      id: `role_${Date.now()}`
    };
    saveRoles([...roles, newRole]);
    addToast('تم إضافة الدور بنجاح', 'success');
  }, [roles, saveRoles, addToast]);

  // Update existing role
  const updateRole = useCallback((roleId: string, updates: Partial<StaffRole>) => {
    const updated = roles.map(r => 
      r.id === roleId ? { ...r, ...updates } : r
    );
    saveRoles(updated);
    addToast('تم تحديث الدور بنجاح', 'success');
  }, [roles, saveRoles, addToast]);

  // Delete role (returns false if blocked)
  const deleteRole = useCallback((roleId: string): boolean => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return false;
    
    if (role.isSystem) {
      addToast('لا يمكن حذف دور النظام', 'error');
      return false;
    }
    
    if (users.some(u => u.roleId === roleId)) {
      addToast('لا يمكن حذف دور مرتبط بموظفين', 'error');
      return false;
    }
    
    saveRoles(roles.filter(r => r.id !== roleId));
    addToast('تم حذف الدور', 'success');
    return true;
  }, [roles, users, saveRoles, addToast]);

  // Add new user
  const addUser = useCallback((userData: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const newUser: StaffUser = {
      ...userData,
      id: `staff_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    saveUsers([...users, newUser]);
    addToast(`تمت إضافة الموظف "${newUser.name}" بنجاح`, 'success');
  }, [users, saveUsers, addToast]);

  // Delete user
  const deleteUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    saveUsers(users.filter(u => u.id !== userId));
    if (user) {
      addToast('تم حذف الموظف', 'success');
    }
  }, [users, saveUsers, addToast]);

  // Toggle user active status
  const toggleUserStatus = useCallback((userId: string) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    saveUsers(updated);
    addToast('تم تحديث حالة الموظف', 'success');
  }, [users, saveUsers, addToast]);

  // Toggle permission in array (pure function)
  const togglePermission = useCallback((currentPermissions: string[], permId: string): string[] => {
    return currentPermissions.includes(permId)
      ? currentPermissions.filter(p => p !== permId)
      : [...currentPermissions, permId];
  }, []);

  return {
    saveRoles,
    addRole,
    updateRole,
    deleteRole,
    saveUsers,
    addUser,
    deleteUser,
    toggleUserStatus,
    togglePermission
  };
}

export default usePermissionActions;
