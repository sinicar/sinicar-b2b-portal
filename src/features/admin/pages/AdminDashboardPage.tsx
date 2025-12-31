/**
 * AdminDashboardPage - غلاف صفحة لوحة الإدارة
 * 
 * هذا الملف يغلف AdminDashboard الموجود بدون تغيير سلوكه
 * يسمح بإضافة منطق على مستوى الصفحة لاحقاً
 */

import React from 'react';
import { AdminDashboard } from '../../../components/AdminDashboard';

export interface AdminDashboardPageProps {
  onLogout: () => void;
}

/**
 * صفحة لوحة الإدارة
 * تغلف AdminDashboard component بدون تغيير سلوكه
 */
export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
}) => {
  return (
    <AdminDashboard
      onLogout={onLogout}
    />
  );
};

AdminDashboardPage.displayName = 'AdminDashboardPage';

export default AdminDashboardPage;
