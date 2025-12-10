// ============================================
// REPORTING & ANALYTICS TYPES
// ============================================

import type { MultilingualText } from './common';

// Report Template
export interface ReportTemplate {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  type: 'sales' | 'inventory' | 'customers' | 'orders' | 'financial' | 'custom';
  columns: {
    key: string;
    label: MultilingualText;
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage';
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }[];
  filters: {
    key: string;
    label: MultilingualText;
    type: 'select' | 'date-range' | 'number-range' | 'text';
    options?: { value: string; label: MultilingualText }[];
  }[];
  defaultSortBy: string;
  defaultSortOrder: 'asc' | 'desc';
  createdBy?: string;
  createdAt: string;
  isSystem: boolean;
}

// Scheduled Report
export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];  // Email addresses
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, any>;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdBy: string;
  createdAt: string;
}

// Dashboard Widget
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map';
  title: MultilingualText;
  dataSource: string;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut';
    metric?: 'sum' | 'count' | 'avg';
    groupBy?: string;
    timeRange?: 'today' | 'week' | 'month' | 'year' | 'custom';
    colors?: string[];
    showLegend?: boolean;
    showTrend?: boolean;
  };
  position: { x: number; y: number; w: number; h: number };
  refreshInterval: number;  // seconds
}

// Dashboard Layout
export interface DashboardLayout {
  id: string;
  name: string;
  userId?: string;  // null for system-wide
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Report Export Options
export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeSummary: boolean;
  dateRange?: { from: string; to: string };
  filters?: Record<string, any>;
}

// Analytics Summary
export interface AnalyticsSummary {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    newCustomers: number;
    returningCustomers: number;
    conversionRate: number;
  };
  trends: {
    salesGrowth: number;
    ordersGrowth: number;
    customerGrowth: number;
  };
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  topCustomers: { customerId: string; name: string; orders: number; revenue: number }[];
}
