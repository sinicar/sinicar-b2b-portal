export type ImportRequestStatus =
  | 'NEW'                      // طلب جديد – بانتظار مراجعة فريق صيني كار
  | 'UNDER_REVIEW'             // قيد المراجعة / التواصل مع العميل
  | 'WAITING_CUSTOMER_EXCEL'   // في انتظار ملف Excel من العميل
  | 'PRICING_IN_PROGRESS'      // يتم إعداد عرض السعر
  | 'PRICING_SENT'             // تم إرسال عرض السعر للعميل
  | 'WAITING_CUSTOMER_APPROVAL'// في انتظار موافقة العميل على عرض السعر
  | 'APPROVED_BY_CUSTOMER'     // العميل وافق على العرض – بدأ الاستيراد
  | 'IN_FACTORY'               // الطلب في المصنع/التجهيز
  | 'SHIPMENT_BOOKED'          // تم حجز الشحن
  | 'ON_THE_SEA'               // الشحنة في البحر
  | 'IN_PORT'                  // الشحنة في الميناء
  | 'CUSTOMS_CLEARED'          // تم التخليص الجمركي
  | 'ON_THE_WAY'               // في الطريق للمستودع / للعميل
  | 'DELIVERED'                // تم التسليم
  | 'CANCELLED'                // ملغي
  | 'IN_REVIEW'                // Legacy compatible
  | 'CONTACTED'                // Legacy compatible
  | 'CLOSED';                  // Legacy compatible

export interface ImportRequestTimelineEntry {
  status: ImportRequestStatus;
  note?: string | null;
  changedAt: string;     // ISO date
  changedBy: string;     // اسم أو معرف المستخدم (أدمن أو عميل)
  actorRole: 'ADMIN' | 'CUSTOMER';
}

export interface ImportRequest {
  id: string;
  customerId: string;         // المنشأة
  createdByUserId?: string;    // المستخدم الذي أنشأ الطلب
  businessName?: string;       // اسم المنشأة/الشركة
  createdAt: string;
  updatedAt?: string;

  // بيانات أساسية من نموذج العميل:
  branchesCount?: number;      // عدد الفروع
  targetCarBrands: string[];  // الشركات التي يريد توفير قطع غيارها
  brandPreferences?: string;  // الماركات المطلوبة (legacy alias)
  hasImportedBefore: boolean; // هل سبق له الاستيراد من الصين؟
  previousImportDetails?: string; // وصف مختصر إذا كانت الإجابة نعم

  serviceMode: 'FULL_SERVICE' | 'GOODS_ONLY';
  // FULL_SERVICE = نحن نشتري ونشحن ونخلص له (استيراد كامل)
  // GOODS_ONLY  = نجهز البضاعة فقط وهو يتولى الشحن والتخليص

  preferredPorts?: string;      // الميناء أو منفذ الوصول المفضل
  estimatedAnnualValue?: string; // قيمة أو كمية الاستيراد التقريبية سنوياً
  paymentPreference?: string;    // تفضيل طريقة الدفع

  notes?: string;              // ملاحظات إضافية من العميل
  status: ImportRequestStatus; // NEW عند الإنشاء

  // ملف Excel الخاص بقطع الاستيراد:
  customerExcelFileName?: string | null;
  customerExcelUploadedAt?: string | null;

  // بيانات التسعير:
  pricingPreparedBy?: string | null;
  pricingPreparedAt?: string | null;
  pricingFileNameForCustomer?: string | null; // اسم ملف التسعير (Excel/PDF) المخزّن
  pricingTotalAmount?: number | null;

  // موافقة العميل على عرض السعر:
  customerApprovedAt?: string | null;
  customerApprovalNote?: string | null;

  // خط الزمن:
  timeline?: ImportRequestTimelineEntry[];

  // ملاحظات إدارية داخلية:
  adminNotes?: string | null;
  assignedSalesRepId?: string | null; // الموظف المسؤول عن الاستيراد
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
}
