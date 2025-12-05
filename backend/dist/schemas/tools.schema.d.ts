import { z } from 'zod';
export declare const toolConfigSchema: z.ZodObject<{
    toolKey: z.ZodString;
    displayName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isEnabled: z.ZodDefault<z.ZodBoolean>;
    dailyLimit: z.ZodOptional<z.ZodNumber>;
    monthlyLimit: z.ZodOptional<z.ZodNumber>;
    requiredPriceLevel: z.ZodOptional<z.ZodString>;
    allowedCustomerTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    toolKey: string;
    displayName: string;
    isEnabled: boolean;
    description?: string | undefined;
    dailyLimit?: number | undefined;
    monthlyLimit?: number | undefined;
    requiredPriceLevel?: string | undefined;
    allowedCustomerTypes?: string[] | undefined;
}, {
    toolKey: string;
    displayName: string;
    description?: string | undefined;
    isEnabled?: boolean | undefined;
    dailyLimit?: number | undefined;
    monthlyLimit?: number | undefined;
    requiredPriceLevel?: string | undefined;
    allowedCustomerTypes?: string[] | undefined;
}>;
export declare const updateToolConfigSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isEnabled: z.ZodOptional<z.ZodBoolean>;
    dailyLimit: z.ZodOptional<z.ZodNumber>;
    monthlyLimit: z.ZodOptional<z.ZodNumber>;
    requiredPriceLevel: z.ZodOptional<z.ZodString>;
    allowedCustomerTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    displayName?: string | undefined;
    isEnabled?: boolean | undefined;
    dailyLimit?: number | undefined;
    monthlyLimit?: number | undefined;
    requiredPriceLevel?: string | undefined;
    allowedCustomerTypes?: string[] | undefined;
}, {
    description?: string | undefined;
    displayName?: string | undefined;
    isEnabled?: boolean | undefined;
    dailyLimit?: number | undefined;
    monthlyLimit?: number | undefined;
    requiredPriceLevel?: string | undefined;
    allowedCustomerTypes?: string[] | undefined;
}>;
export declare const customerToolsOverrideSchema: z.ZodObject<{
    customerId: z.ZodString;
    overrides: z.ZodRecord<z.ZodString, z.ZodObject<{
        isEnabled: z.ZodOptional<z.ZodBoolean>;
        dailyLimit: z.ZodOptional<z.ZodNumber>;
        monthlyLimit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        isEnabled?: boolean | undefined;
        dailyLimit?: number | undefined;
        monthlyLimit?: number | undefined;
    }, {
        isEnabled?: boolean | undefined;
        dailyLimit?: number | undefined;
        monthlyLimit?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    overrides: Record<string, {
        isEnabled?: boolean | undefined;
        dailyLimit?: number | undefined;
        monthlyLimit?: number | undefined;
    }>;
}, {
    customerId: string;
    overrides: Record<string, {
        isEnabled?: boolean | undefined;
        dailyLimit?: number | undefined;
        monthlyLimit?: number | undefined;
    }>;
}>;
export declare const priceComparisonSchema: z.ZodObject<{
    partNumbers: z.ZodArray<z.ZodString, "many">;
    supplierIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    partNumbers: string[];
    supplierIds?: string[] | undefined;
}, {
    partNumbers: string[];
    supplierIds?: string[] | undefined;
}>;
export declare const vinExtractionSchema: z.ZodObject<{
    vinNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    vinNumber: string;
}, {
    vinNumber: string;
}>;
export declare const supplierPriceUploadSchema: z.ZodObject<{
    supplierName: z.ZodOptional<z.ZodString>;
    fileName: z.ZodOptional<z.ZodString>;
    data: z.ZodArray<z.ZodObject<{
        partNumber: z.ZodString;
        partName: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        stock: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        partNumber: string;
        price: number;
        partName?: string | undefined;
        stock?: number | undefined;
    }, {
        partNumber: string;
        price: number;
        partName?: string | undefined;
        stock?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        partNumber: string;
        price: number;
        partName?: string | undefined;
        stock?: number | undefined;
    }[];
    fileName?: string | undefined;
    supplierName?: string | undefined;
}, {
    data: {
        partNumber: string;
        price: number;
        partName?: string | undefined;
        stock?: number | undefined;
    }[];
    fileName?: string | undefined;
    supplierName?: string | undefined;
}>;
export declare const createMarketerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    paymentMethod: z.ZodOptional<z.ZodString>;
    bankDetails: z.ZodOptional<z.ZodObject<{
        bankName: z.ZodString;
        accountNumber: z.ZodString;
        iban: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        bankName: string;
        accountNumber: string;
        iban: string;
    }, {
        bankName: string;
        accountNumber: string;
        iban: string;
    }>>;
    commissionRate: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    commissionRate: number;
    paymentMethod?: string | undefined;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        iban: string;
    } | undefined;
}, {
    name: string;
    email: string;
    phone: string;
    paymentMethod?: string | undefined;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        iban: string;
    } | undefined;
    commissionRate?: number | undefined;
}>;
export declare const updateMarketerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]>>;
    paymentMethod: z.ZodOptional<z.ZodString>;
    bankDetails: z.ZodOptional<z.ZodObject<{
        bankName: z.ZodString;
        accountNumber: z.ZodString;
        iban: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        bankName: string;
        accountNumber: string;
        iban: string;
    }, {
        bankName: string;
        accountNumber: string;
        iban: string;
    }>>;
    commissionRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED" | undefined;
    paymentMethod?: string | undefined;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        iban: string;
    } | undefined;
    commissionRate?: number | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED" | undefined;
    paymentMethod?: string | undefined;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        iban: string;
    } | undefined;
    commissionRate?: number | undefined;
}>;
export declare const marketerFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]>>;
    search: z.ZodOptional<z.ZodString>;
    minEarnings: z.ZodOptional<z.ZodNumber>;
    minReferrals: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED" | undefined;
    minEarnings?: number | undefined;
    minReferrals?: number | undefined;
}, {
    search?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED" | undefined;
    minEarnings?: number | undefined;
    minReferrals?: number | undefined;
}>;
export type ToolConfigInput = z.infer<typeof toolConfigSchema>;
export type UpdateToolConfigInput = z.infer<typeof updateToolConfigSchema>;
export type CustomerToolsOverrideInput = z.infer<typeof customerToolsOverrideSchema>;
export type PriceComparisonInput = z.infer<typeof priceComparisonSchema>;
export type VinExtractionInput = z.infer<typeof vinExtractionSchema>;
export type SupplierPriceUploadInput = z.infer<typeof supplierPriceUploadSchema>;
export type CreateMarketerInput = z.infer<typeof createMarketerSchema>;
export type UpdateMarketerInput = z.infer<typeof updateMarketerSchema>;
export type MarketerFilterInput = z.infer<typeof marketerFilterSchema>;
//# sourceMappingURL=tools.schema.d.ts.map