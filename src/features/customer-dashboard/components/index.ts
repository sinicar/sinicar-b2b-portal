/**
 * Customer Dashboard Components
 * مكونات لوحة تحكم العميل
 */

// Re-export existing customer components
// These are already extracted and can be imported directly from features/customer/components
export { KPIStatCard, type KPIStatCardProps } from '../../customer/components';
export { QuickActionsGrid, type QuickAction } from '../../customer/components';

// Note: DashboardHeader, DashboardSidebar, CartIconButton are in components/dashboard/
// They can be imported directly from there: import { DashboardHeader } from './dashboard';
