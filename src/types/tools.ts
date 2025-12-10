// ============================================
// TRADER TOOLS CENTER TYPES
// ============================================

import type { DeviceType } from './common';

// Tool Types for Trader Tools Center
export type TraderToolType =
  | 'VIN'             // VIN Extraction Tool
  | 'PDF_EXCEL'       // PDF to Excel Conversion
  | 'COMPARISON'      // Price Comparison Tool
  | 'ALTERNATIVES'    // Alternatives Upload
  | 'SEARCH'          // Product Search Requests
  | 'EXCEL_QUOTE';    // Excel Uploads for Quotation

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
  deviceType?: DeviceType;               // WEB or MOBILE
  status: TraderToolActionStatus;
  errorMessage?: string;
  processingTime?: number;               // Milliseconds
}

// Trader Tool Filters
export interface TraderToolFilters {
  customerId?: string;
  toolType?: TraderToolType | 'ALL';
  status?: TraderToolActionStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Trader Tool List Response
export interface TraderToolListResponse {
  items: TraderToolAction[];
  page: number;
  pageSize: number;
  total: number;
}

// Trader Tool Stats
export interface TraderToolStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  byToolType: { toolType: TraderToolType; count: number }[];
  avgProcessingTime: number;
  topUsers: { userId: string; userName: string; count: number }[];
}

// VIN Decode Result
export interface VinDecodeResult {
  vin: string;
  make: string;
  model: string;
  year: number;
  engineType?: string;
  transmission?: string;
  bodyType?: string;
  country?: string;
  plantCode?: string;
  serialNumber?: string;
  checkDigit?: string;
  isValid: boolean;
  errorMessage?: string;
}

// Price Comparison Result
export interface PriceComparisonResult {
  partNumber: string;
  partName?: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    currency: string;
    availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER';
    deliveryDays?: number;
    moq?: number;
  }[];
  bestPrice: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
}

// File Conversion Result
export interface FileConversionResult {
  success: boolean;
  inputFileName: string;
  inputFileType: string;
  outputFileName: string;
  outputFileType: string;
  outputFileUrl?: string;
  rowCount?: number;
  columnCount?: number;
  errorMessage?: string;
}
