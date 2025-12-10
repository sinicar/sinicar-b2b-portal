// ============================================
// TRADER TOOLS CENTER TYPES (Command Extension)
// ============================================

// Tool Types for Trader Tools Center
export type TraderToolType =
  | 'VIN'             // VIN Extraction Tool
  | 'PDF_EXCEL'       // PDF to Excel Conversion
  | 'COMPARISON'      // Price Comparison Tool
  | 'ALTERNATIVES'    // Alternatives Upload
  | 'SEARCH'          // Product Search Requests
  | 'EXCEL_QUOTE';    // Excel Uploads for Quotation

// Device Types
export type DeviceType = 'WEB' | 'MOBILE';

// Action Status
export type TraderToolActionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'PROCESSING';

// Main TraderToolAction Model
export interface TraderToolAction {
  id: string;
  customerId: string;                    // FK to User
  customerName?: string;                 // Cached customer name for display
  toolType: TraderToolType;
  inputData: Record<string, any>;        // JSON input data (VIN number, search terms, etc.)
  outputData?: Record<string, any>;      // JSON output summary (not full data)
  inputFileUrl?: string;                 // Optional uploaded file URL
  inputFileName?: string;                // Original filename
  outputFileUrl?: string;                // Optional generated file URL
  outputFileName?: string;               // Generated filename
  createdAt: string;                     // ISO timestamp
  createdFromIp?: string;                // IP address
  deviceType: DeviceType;                // WEB or MOBILE
  status: TraderToolActionStatus;        // SUCCESS, FAILED, PENDING, PROCESSING
  errorMessage?: string;                 // Error details if failed
  processingTimeMs?: number;             // Processing duration in milliseconds
  isDeleted?: boolean;                   // Soft delete flag
  
  // Additional metadata for each tool type
  metadata?: {
    // VIN Tool
    vin?: string;
    confidence?: number;
    manufacturer?: string;
    model?: string;
    year?: string;
    
    // PDF to Excel
    rowCount?: number;
    columnCount?: number;
    pageCount?: number;
    
    // Price Comparison
    partNumber?: string;
    partName?: string;
    suppliersCount?: number;
    lowestPrice?: number;
    highestPrice?: number;
    
    // Search
    searchQuery?: string;
    resultsCount?: number;
    
    // Excel Quote
    itemsCount?: number;
    quotedTotal?: number;
  };
}

// Admin API Filters for Trader Tools
export interface TraderToolsAdminFilters {
  customerId?: string;
  toolType?: TraderToolType | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  status?: TraderToolActionStatus | 'ALL';
  hasFiles?: boolean;
  deviceType?: DeviceType | 'ALL';
  search?: string;                       // Search in VIN, filename, keyword in inputData
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'toolType' | 'status' | 'customerName';
  sortDirection?: 'asc' | 'desc';
}

// Admin API Response
export interface TraderToolsAdminResponse {
  items: TraderToolAction[];
  total: number;
  page: number;
  pageSize: number;
  summary: {
    total: number;
    byToolType: Record<TraderToolType, number>;
    byStatus: Record<TraderToolActionStatus, number>;
    successRate: number;
  };
}

// Customer History Filters
export interface TraderToolsCustomerFilters {
  toolType?: TraderToolType | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  status?: TraderToolActionStatus | 'ALL';
  page?: number;
  pageSize?: number;
}

// Customer History Response
export interface TraderToolsCustomerResponse {
  items: TraderToolAction[];
  total: number;
  page: number;
  pageSize: number;
}

// Export Data for Trader Tools
export interface TraderToolsExportRow {
  id: string;
  customerId: string;
  customerName: string;
  toolType: TraderToolType;
  inputSummary: string;
  outputSummary: string;
  status: TraderToolActionStatus;
  deviceType: DeviceType;
  createdAt: string;
  hasInputFile: boolean;
  hasOutputFile: boolean;
}

// Trader Tool Settings (per customer type)
export interface TraderToolSettings {
  toolKey: TraderToolType;
  enabledForCustomerTypes: string[];     // Which customer types can use this tool
  dailyLimit?: number;                   // Optional daily usage limit
  monthlyLimit?: number;                 // Optional monthly usage limit
  requiresApproval?: boolean;            // Require admin approval for certain actions
  allowedForNewCustomers?: boolean;      // Allow new customers to use
  maintenanceMode?: boolean;             // Temporarily disable
  maintenanceMessage?: string;           // Message to show during maintenance
}

// Trader Tools Usage Report
export interface TraderToolsUsageReport {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dateFrom: string;
  dateTo: string;
  totalActions: number;
  uniqueCustomers: number;
  successRate: number;
  byToolType: {
    toolType: TraderToolType;
    count: number;
    successCount: number;
    failedCount: number;
    avgProcessingTime: number;
  }[];
  byCustomerType: {
    customerType: string;
    count: number;
  }[];
  byDate: {
    date: string;
    count: number;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    usageCount: number;
  }[];
}
