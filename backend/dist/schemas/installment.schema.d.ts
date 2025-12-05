import { z } from 'zod';
export declare const installmentItemSchema: z.ZodObject<{
    partNumber: z.ZodString;
    partName: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    estimatedPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    partNumber: string;
    quantity: number;
    estimatedPrice: number;
    partName?: string | undefined;
}, {
    partNumber: string;
    quantity: number;
    estimatedPrice: number;
    partName?: string | undefined;
}>;
export declare const createInstallmentRequestSchema: z.ZodObject<{
    totalRequestedValue: z.ZodNumber;
    paymentFrequency: z.ZodDefault<z.ZodEnum<["WEEKLY", "MONTHLY"]>>;
    requestedDurationMonths: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        partNumber: z.ZodString;
        partName: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        estimatedPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        partNumber: string;
        quantity: number;
        estimatedPrice: number;
        partName?: string | undefined;
    }, {
        partNumber: string;
        quantity: number;
        estimatedPrice: number;
        partName?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        partNumber: string;
        quantity: number;
        estimatedPrice: number;
        partName?: string | undefined;
    }[];
    totalRequestedValue: number;
    paymentFrequency: "WEEKLY" | "MONTHLY";
    requestedDurationMonths: number;
}, {
    items: {
        partNumber: string;
        quantity: number;
        estimatedPrice: number;
        partName?: string | undefined;
    }[];
    totalRequestedValue: number;
    requestedDurationMonths: number;
    paymentFrequency?: "WEEKLY" | "MONTHLY" | undefined;
}>;
export declare const adminReviewSchema: z.ZodObject<{
    sinicarDecision: z.ZodEnum<["APPROVED_FULL", "APPROVED_PARTIAL", "REJECTED"]>;
    adminNotes: z.ZodOptional<z.ZodString>;
    allowedForSuppliers: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    sinicarDecision: "REJECTED" | "APPROVED_FULL" | "APPROVED_PARTIAL";
    allowedForSuppliers: boolean;
    adminNotes?: string | undefined;
}, {
    sinicarDecision: "REJECTED" | "APPROVED_FULL" | "APPROVED_PARTIAL";
    adminNotes?: string | undefined;
    allowedForSuppliers?: boolean | undefined;
}>;
export declare const forwardToSuppliersSchema: z.ZodObject<{
    supplierIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    supplierIds: string[];
}, {
    supplierIds: string[];
}>;
export declare const createOfferSchema: z.ZodObject<{
    sourceType: z.ZodDefault<z.ZodEnum<["SINICAR", "SUPPLIER"]>>;
    supplierId: z.ZodOptional<z.ZodString>;
    supplierName: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["FULL", "PARTIAL"]>>;
    itemsApproved: z.ZodOptional<z.ZodArray<z.ZodObject<{
        partNumber: z.ZodString;
        quantity: z.ZodNumber;
        approvedPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        partNumber: string;
        quantity: number;
        approvedPrice: number;
    }, {
        partNumber: string;
        quantity: number;
        approvedPrice: number;
    }>, "many">>;
    totalApprovedValue: z.ZodNumber;
    schedule: z.ZodOptional<z.ZodArray<z.ZodObject<{
        paymentNumber: z.ZodNumber;
        dueDate: z.ZodString;
        amount: z.ZodNumber;
        status: z.ZodDefault<z.ZodEnum<["PENDING", "PAID", "OVERDUE"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "PAID" | "OVERDUE";
        paymentNumber: number;
        dueDate: string;
        amount: number;
    }, {
        paymentNumber: number;
        dueDate: string;
        amount: number;
        status?: "PENDING" | "PAID" | "OVERDUE" | undefined;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "FULL" | "PARTIAL";
    sourceType: "SINICAR" | "SUPPLIER";
    totalApprovedValue: number;
    notes?: string | undefined;
    supplierId?: string | undefined;
    supplierName?: string | undefined;
    itemsApproved?: {
        partNumber: string;
        quantity: number;
        approvedPrice: number;
    }[] | undefined;
    schedule?: {
        status: "PENDING" | "PAID" | "OVERDUE";
        paymentNumber: number;
        dueDate: string;
        amount: number;
    }[] | undefined;
}, {
    totalApprovedValue: number;
    type?: "FULL" | "PARTIAL" | undefined;
    notes?: string | undefined;
    sourceType?: "SINICAR" | "SUPPLIER" | undefined;
    supplierId?: string | undefined;
    supplierName?: string | undefined;
    itemsApproved?: {
        partNumber: string;
        quantity: number;
        approvedPrice: number;
    }[] | undefined;
    schedule?: {
        paymentNumber: number;
        dueDate: string;
        amount: number;
        status?: "PENDING" | "PAID" | "OVERDUE" | undefined;
    }[] | undefined;
}>;
export declare const offerResponseSchema: z.ZodObject<{
    action: z.ZodEnum<["accept", "reject"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "reject" | "accept";
    reason?: string | undefined;
}, {
    action: "reject" | "accept";
    reason?: string | undefined;
}>;
export declare const installmentFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING_SINICAR_REVIEW", "WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR", "REJECTED_BY_SINICAR", "FORWARDED_TO_SUPPLIERS", "WAITING_FOR_SUPPLIER_OFFERS", "WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER", "ACTIVE_CONTRACT", "COMPLETED", "CANCELLED", "CLOSED"]>>;
    customerId: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    minValue: z.ZodOptional<z.ZodNumber>;
    maxValue: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "COMPLETED" | "PENDING_SINICAR_REVIEW" | "WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR" | "REJECTED_BY_SINICAR" | "FORWARDED_TO_SUPPLIERS" | "WAITING_FOR_SUPPLIER_OFFERS" | "WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER" | "ACTIVE_CONTRACT" | "CLOSED" | "CANCELLED" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    customerId?: string | undefined;
    minValue?: number | undefined;
    maxValue?: number | undefined;
}, {
    status?: "COMPLETED" | "PENDING_SINICAR_REVIEW" | "WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR" | "REJECTED_BY_SINICAR" | "FORWARDED_TO_SUPPLIERS" | "WAITING_FOR_SUPPLIER_OFFERS" | "WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER" | "ACTIVE_CONTRACT" | "CLOSED" | "CANCELLED" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    customerId?: string | undefined;
    minValue?: number | undefined;
    maxValue?: number | undefined;
}>;
export type CreateInstallmentRequestInput = z.infer<typeof createInstallmentRequestSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type ForwardToSuppliersInput = z.infer<typeof forwardToSuppliersSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type OfferResponseInput = z.infer<typeof offerResponseSchema>;
export type InstallmentFilterInput = z.infer<typeof installmentFilterSchema>;
//# sourceMappingURL=installment.schema.d.ts.map