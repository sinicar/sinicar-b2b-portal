import { z } from 'zod';
export declare const orderItemSchema: z.ZodObject<{
    productId: z.ZodString;
    partNumber: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    productId: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
}, {
    name: string;
    productId: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
}>;
export declare const createOrderSchema: z.ZodObject<{
    branchId: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        partNumber: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        productId: string;
        partNumber: string;
        quantity: number;
        unitPrice: number;
    }, {
        name: string;
        productId: string;
        partNumber: string;
        quantity: number;
        unitPrice: number;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        name: string;
        productId: string;
        partNumber: string;
        quantity: number;
        unitPrice: number;
    }[];
    branchId?: string | undefined;
    notes?: string | undefined;
}, {
    items: {
        name: string;
        productId: string;
        partNumber: string;
        quantity: number;
        unitPrice: number;
    }[];
    branchId?: string | undefined;
    notes?: string | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "SHIPPED", "DELIVERED", "CANCELLED"]>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "REJECTED" | "CANCELLED" | "APPROVED" | "SHIPPED" | "DELIVERED";
    note?: string | undefined;
}, {
    status: "PENDING" | "REJECTED" | "CANCELLED" | "APPROVED" | "SHIPPED" | "DELIVERED";
    note?: string | undefined;
}>;
export declare const updateInternalStatusSchema: z.ZodObject<{
    internalStatus: z.ZodEnum<["NEW", "SENT_TO_WAREHOUSE", "WAITING_PAYMENT", "PAYMENT_CONFIRMED", "SALES_INVOICE_CREATED", "READY_FOR_SHIPMENT", "COMPLETED_INTERNAL", "CANCELLED_INTERNAL"]>;
    internalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    internalStatus: "NEW" | "SENT_TO_WAREHOUSE" | "WAITING_PAYMENT" | "PAYMENT_CONFIRMED" | "SALES_INVOICE_CREATED" | "READY_FOR_SHIPMENT" | "COMPLETED_INTERNAL" | "CANCELLED_INTERNAL";
    internalNotes?: string | undefined;
}, {
    internalStatus: "NEW" | "SENT_TO_WAREHOUSE" | "WAITING_PAYMENT" | "PAYMENT_CONFIRMED" | "SALES_INVOICE_CREATED" | "READY_FOR_SHIPMENT" | "COMPLETED_INTERNAL" | "CANCELLED_INTERNAL";
    internalNotes?: string | undefined;
}>;
export declare const orderFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "SHIPPED", "DELIVERED", "CANCELLED"]>>;
    internalStatus: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    status?: "PENDING" | "REJECTED" | "CANCELLED" | "APPROVED" | "SHIPPED" | "DELIVERED" | undefined;
    userId?: string | undefined;
    internalStatus?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    search?: string | undefined;
    status?: "PENDING" | "REJECTED" | "CANCELLED" | "APPROVED" | "SHIPPED" | "DELIVERED" | undefined;
    userId?: string | undefined;
    internalStatus?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>;
export declare const quoteItemSchema: z.ZodObject<{
    partNumber: z.ZodString;
    partName: z.ZodOptional<z.ZodString>;
    requestedQty: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    partNumber: string;
    requestedQty: number;
    partName?: string | undefined;
    notes?: string | undefined;
}, {
    partNumber: string;
    requestedQty: number;
    partName?: string | undefined;
    notes?: string | undefined;
}>;
export declare const createQuoteRequestSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        partNumber: z.ZodString;
        partName: z.ZodOptional<z.ZodString>;
        requestedQty: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        partNumber: string;
        requestedQty: number;
        partName?: string | undefined;
        notes?: string | undefined;
    }, {
        partNumber: string;
        requestedQty: number;
        partName?: string | undefined;
        notes?: string | undefined;
    }>, "many">;
    priceType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        partNumber: string;
        requestedQty: number;
        partName?: string | undefined;
        notes?: string | undefined;
    }[];
    priceType?: string | undefined;
}, {
    items: {
        partNumber: string;
        requestedQty: number;
        partName?: string | undefined;
        notes?: string | undefined;
    }[];
    priceType?: string | undefined;
}>;
export declare const updateQuoteStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["NEW", "UNDER_REVIEW", "PROCESSED", "EXPIRED", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "CANCELLED" | "EXPIRED" | "NEW" | "UNDER_REVIEW" | "PROCESSED";
}, {
    status: "CANCELLED" | "EXPIRED" | "NEW" | "UNDER_REVIEW" | "PROCESSED";
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateInternalStatusInput = z.infer<typeof updateInternalStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
//# sourceMappingURL=order.schema.d.ts.map