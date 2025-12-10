// ============================================
// PDF/PRINT TEMPLATE DESIGNER TYPES
// ============================================

export type DocumentTemplateType = 
  | 'invoice'
  | 'order'
  | 'quote'
  | 'receipt'
  | 'delivery_note'
  | 'packing_list'
  | 'price_list'
  | 'report';

export type PageSize = 'A4' | 'A5' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';

export interface TemplateMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateHeaderFooter {
  enabled: boolean;
  height: number;
  showLogo: boolean;
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: number;
  showCompanyName: boolean;
  showDate: boolean;
  showPageNumber: boolean;
  customText?: string;
  backgroundColor?: string;
  textColor?: string;
  borderBottom?: boolean;
  borderTop?: boolean;
}

export interface TemplateField {
  id: string;
  key: string;
  label: string;
  labelAr: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'image' | 'qrcode' | 'barcode';
  enabled: boolean;
  required: boolean;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  order: number;
}

export interface TemplateTableColumn {
  id: string;
  key: string;
  header: string;
  headerAr: string;
  width: number;
  alignment: 'left' | 'center' | 'right';
  enabled: boolean;
  order: number;
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'header' | 'info' | 'table' | 'summary' | 'footer' | 'custom';
  enabled: boolean;
  order: number;
  fields?: TemplateField[];
  tableColumns?: TemplateTableColumn[];
  customContent?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  nameAr: string;
  type: DocumentTemplateType;
  isDefault: boolean;
  isActive: boolean;
  
  // Page Settings
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: TemplateMargins;
  
  // Branding
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  
  // Header & Footer
  header: TemplateHeaderFooter;
  footer: TemplateHeaderFooter;
  
  // Sections
  sections: TemplateSection[];
  
  // Simple columns array for quick access
  columns?: string[];
  
  // Simplified color config for template designer
  colors?: {
    primary: string;
    secondary: string;
    text: string;
    border: string;
  };
  
  // Simplified font config for template designer  
  fonts?: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
    };
  };
  
  // Watermark
  watermark?: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    opacity: number;
    position: 'center' | 'diagonal';
  };
  
  // Localization
  defaultLanguage: 'ar' | 'en';
  showBilingual: boolean;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface PrintSettings {
  templates: DocumentTemplate[];
  companyInfo: {
    name: string;
    nameEn?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxNumber?: string;
    crNumber?: string;
    logoUrl?: string;
  };
  defaultTemplate: Record<DocumentTemplateType, string>;
}

// --- Excel Import Template Types ---

export interface ExcelTemplateColumn {
  id: string;
  templateId: string;
  columnIndex: number;
  headerName: string;
  headerNameAr?: string;
  headerNameEn?: string;
  mapToField: string;
  isRequired: boolean;
  defaultValue?: string;
  validationRegex?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExcelImportTemplate {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  templateType: string;
  languageHint?: string;
  instructionsText?: string;
  instructionsTextAr?: string;
  isActive: boolean;
  columns: ExcelTemplateColumn[];
  createdAt: string;
  updatedAt?: string;
}
