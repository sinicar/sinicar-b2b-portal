

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  WAREHOUSE_KEEPER = 'WAREHOUSE_KEEPER',
  STOCK_TAKER = 'STOCK_TAKER',
  REPORTER = 'REPORTER', // VIEWER
  VIEWER = 'VIEWER'
}

export enum DeviceAccess {
  MOBILE_ONLY = 'MOBILE_ONLY',
  DESKTOP_ONLY = 'DESKTOP_ONLY',
  BOTH = 'BOTH'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password: string; // Plaintext for demo
  branchIds: string[]; // Empty [] means ALL branches (for Admin/Reporter)
  warehouseIds: string[]; // Empty [] means ALL warehouses in allowed branches
  deviceAccess: DeviceAccess;
  canExportExcel: boolean;
  allowedDays: number[]; // 0=Sunday, 6=Saturday
  allowedTimeFrom?: string; // "09:00"
  allowedTimeTo?: string; // "17:00"
  isActive: boolean;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  branchId: string;
  name: string;
  code: string;
  type: 'MAIN' | 'FAST' | 'RETURNS' | 'OTHER';
  isActive: boolean;
}

export interface Bin {
  id: string;
  warehouseId: string;
  code: string; // Generated: Z1-A01-S03-D05
  zone: string;
  aisle?: string;
  shelf: string;
  drawer: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  partNumber: string;
  barcode: string;
  uom: string;
  minStock: number;
  isActive: boolean;
  defaultBinId?: string; // For Inventory Control logic
  notes?: string;
}

export interface Inventory {
  itemId: string;
  warehouseId: string;
  quantity: number;
}

export interface BinAllocation {
  id: string;
  itemId: string;
  binId: string;
  warehouseId: string;
  quantity: number;
}

export interface PutawayLog {
  id: string;
  date: string;
  itemId: string;
  binId: string;
  warehouseId: string;
  quantity: number;
  performedBy: string;
}

export enum TransactionSource {
  LOCAL_PURCHASE = 'مشتريات محلية',
  INTL_PURCHASE = 'مشتريات دولية',
  OTHER = 'مصدر آخر'
}

export interface Receipt {
  id: string;
  serialNumber: string;
  date: string;
  branchId: string;
  warehouseId: string;
  sourceType: TransactionSource;
  invoiceNumber: string;
  invoiceDate?: string;
  supplierName?: string;
  notes?: string;
  items: { itemId: string; quantity: number }[];
  createdBy: string;
}

export interface Transfer {
  id: string;
  date: string;
  fromBranchId: string;
  fromWarehouseId: string;
  toBranchId: string;
  toWarehouseId: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  items: { itemId: string; sentQty: number; receivedQty?: number }[];
  createdBy: string;
}

export interface Stocktake {
  id: string;
  date: string;
  warehouseId: string;
  status: 'DRAFT' | 'APPROVED';
  items: { itemId: string; systemQty: number; actualQty: number }[];
}

export enum AlertType {
  DUPLICATE_BIN = 'DUPLICATE_BIN',
  BIN_QTY_MISMATCH = 'BIN_QTY_MISMATCH',
  TRANSFER_VARIANCE = 'TRANSFER_VARIANCE',
  NO_BIN_ASSIGNED = 'NO_BIN_ASSIGNED'
}

export interface SystemAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  relatedId?: string; // ItemId or TransferId
  warehouseId: string;
  status: 'OPEN' | 'RESOLVED' | 'IGNORED';
  createdAt: string;
}

// --- INVENTORY CONTROL TYPES ---

export type InventoryControlIssueType =
  | "EXTRA_QTY"                 // كمية زائدة
  | "MISSING_QTY"               // كمية ناقصة
  | "NEGATIVE_QTY"              // كمية سالبة
  | "ITEM_NOT_ALLOWED_BRANCH"   // صنف لا يفترض أن يكون في هذا الفرع
  | "DUPLICATE_LOCATION"        // الصنف موجود في أكثر من درج/موقع
  | "WRONG_LOCATION"            // الصنف في درج مختلف عن الدرج الرئيسي المخصص له
  | "UNJUSTIFIED_ADJUSTMENT"    // تعديل كمية بدون مبرر واضح
  | "REPEATED_DIFFERENCE"       // فروقات متكررة لنفس الصنف أو الموظف
  | "MISSING_MASTER_DATA"       // بيانات ناقصة: موقع غير محدد، حد أدنى غير موجود...
  | "OTHER_SUSPICIOUS";         // أي اشتباه آخر

export type InventoryControlIssueStatus = "OPEN" | "UNDER_REVIEW" | "JUSTIFIED" | "CLOSED";

export type InventoryControlIssue = {
  id: string;
  type: InventoryControlIssueType;
  status: InventoryControlIssueStatus;

  branchId?: string;
  warehouseId?: string;
  locationCode?: string; // كود الدرج / الرف
  itemId?: string;

  expectedQty?: number;  // الكمية المفترضة
  actualQty?: number;    // الكمية الفعلية
  differenceQty?: number;

  sourceOperationType?: "STOCKTAKE" | "RECEIPT" | "TRANSFER" | "PUTAWAY" | "ADJUSTMENT";
  sourceOperationId?: string; // معرف العملية المرتبطة (جرد، تحويل، استلام...)

  detectedAt: string;   // تاريخ/وقت اكتشاف المشكلة
  detectedBy?: string;  // من اكتشفها (قد يكون النظام نفسه)

  severity: "LOW" | "MEDIUM" | "HIGH"; // درجة الخطورة

  notes?: string;             // ملاحظات عامة
  reviewerComment?: string;   // تعليق مراقب المخزون
  resolvedAt?: string;        // تاريخ الإغلاق
};

// --- BARCODE TEMPLATE TYPES ---

export type BarcodeTemplate = {
  id: string;
  name: string;
  
  // Dimensions
  widthMm: number;
  heightMm: number;
  labelsPerRow: number;
  marginMm: number;
  
  // Typography & Style
  fontFamily: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  textBold: boolean;
  borderStyle: 'none' | 'thin' | 'medium' | 'dashed';
  
  // Content Toggles
  showItemName: boolean;
  showItemCode: boolean;
  showPartNumber: boolean;
  showBarcodeNumber: boolean;
  showCompanyLogo: boolean;
  showBinLocation: boolean; // Print where it is found
  
  // Custom Content
  companyLogoDataUrl?: string; // Base64
  customText?: string; // "Made in KSA", etc.
  
  // Advanced Layout
  logoPosition: 'top' | 'bottom' | 'left' | 'right';
  logoSizePercent: number; // 10-100%
};

// --- PREPARATION REQUEST TYPES ---

export type PreparationRequestStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type PreparationRequestItem = {
  id: string;
  itemId: string;
  requestedQty: number;
  preparedQty: number;
  isPrepared: boolean;
};

export type PreparationRequest = {
  id: string;
  requestNumber: string;
  branchId: string;           // The requesting branch
  branchWarehouseId?: string; // Optional: specific warehouse in requesting branch
  sourceWarehouseId: string;  // The warehouse fulfilling the request
  status: PreparationRequestStatus;
  items: PreparationRequestItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// Helper for App State
export interface AppState {
  currentUser: User | null;
}