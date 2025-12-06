import { z } from 'zod';
export declare const createCustomerSchema: z.ZodObject<{
    clientId: z.ZodString;
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["CUSTOMER_OWNER", "CUSTOMER_STAFF"]>>;
    profile: z.ZodObject<{
        companyName: z.ZodString;
        phone: z.ZodString;
        region: z.ZodString;
        city: z.ZodString;
        crNumber: z.ZodString;
        taxNumber: z.ZodString;
        nationalAddress: z.ZodOptional<z.ZodString>;
        customerType: z.ZodDefault<z.ZodEnum<["PARTS_STORE", "INSURANCE", "RENTAL", "REPRESENTATIVE", "MAINTENANCE"]>>;
        businessCustomerType: z.ZodOptional<z.ZodEnum<["SMALL_STORE", "MEDIUM_STORE", "LARGE_STORE", "CHAIN_STORE", "INSURANCE_COMPANY", "RENTAL_COMPANY", "MAINTENANCE_CENTER", "SALES_REP"]>>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        companyName: string;
        region: string;
        city: string;
        crNumber: string;
        taxNumber: string;
        customerType: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE";
        nationalAddress?: string | undefined;
        businessCustomerType?: "SMALL_STORE" | "MEDIUM_STORE" | "LARGE_STORE" | "CHAIN_STORE" | "INSURANCE_COMPANY" | "RENTAL_COMPANY" | "MAINTENANCE_CENTER" | "SALES_REP" | undefined;
    }, {
        phone: string;
        companyName: string;
        region: string;
        city: string;
        crNumber: string;
        taxNumber: string;
        nationalAddress?: string | undefined;
        customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
        businessCustomerType?: "SMALL_STORE" | "MEDIUM_STORE" | "LARGE_STORE" | "CHAIN_STORE" | "INSURANCE_COMPANY" | "RENTAL_COMPANY" | "MAINTENANCE_CENTER" | "SALES_REP" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    role: "CUSTOMER_STAFF" | "CUSTOMER_OWNER";
    clientId: string;
    name: string;
    password: string;
    profile: {
        phone: string;
        companyName: string;
        region: string;
        city: string;
        crNumber: string;
        taxNumber: string;
        customerType: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE";
        nationalAddress?: string | undefined;
        businessCustomerType?: "SMALL_STORE" | "MEDIUM_STORE" | "LARGE_STORE" | "CHAIN_STORE" | "INSURANCE_COMPANY" | "RENTAL_COMPANY" | "MAINTENANCE_CENTER" | "SALES_REP" | undefined;
    };
    email?: string | undefined;
    phone?: string | undefined;
}, {
    clientId: string;
    name: string;
    password: string;
    profile: {
        phone: string;
        companyName: string;
        region: string;
        city: string;
        crNumber: string;
        taxNumber: string;
        nationalAddress?: string | undefined;
        customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
        businessCustomerType?: "SMALL_STORE" | "MEDIUM_STORE" | "LARGE_STORE" | "CHAIN_STORE" | "INSURANCE_COMPANY" | "RENTAL_COMPANY" | "MAINTENANCE_CENTER" | "SALES_REP" | undefined;
    };
    role?: "CUSTOMER_STAFF" | "CUSTOMER_OWNER" | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export declare const updateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "BLOCKED", "PENDING"]>>;
    searchLimit: z.ZodOptional<z.ZodNumber>;
    profile: z.ZodOptional<z.ZodObject<{
        companyName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        nationalAddress: z.ZodOptional<z.ZodString>;
        customerType: z.ZodOptional<z.ZodEnum<["PARTS_STORE", "INSURANCE", "RENTAL", "REPRESENTATIVE", "MAINTENANCE"]>>;
        assignedPriceLevel: z.ZodOptional<z.ZodEnum<["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5", "VIP"]>>;
        priceVisibility: z.ZodOptional<z.ZodEnum<["VISIBLE", "HIDDEN"]>>;
        isApproved: z.ZodOptional<z.ZodBoolean>;
        searchPointsTotal: z.ZodOptional<z.ZodNumber>;
        staffLimit: z.ZodOptional<z.ZodNumber>;
        canActAsSupplier: z.ZodOptional<z.ZodBoolean>;
        internalNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        companyName?: string | undefined;
        region?: string | undefined;
        city?: string | undefined;
        nationalAddress?: string | undefined;
        customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
        assignedPriceLevel?: "VIP" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | undefined;
        priceVisibility?: "VISIBLE" | "HIDDEN" | undefined;
        isApproved?: boolean | undefined;
        searchPointsTotal?: number | undefined;
        internalNotes?: string | undefined;
        staffLimit?: number | undefined;
        canActAsSupplier?: boolean | undefined;
    }, {
        phone?: string | undefined;
        companyName?: string | undefined;
        region?: string | undefined;
        city?: string | undefined;
        nationalAddress?: string | undefined;
        customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
        assignedPriceLevel?: "VIP" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | undefined;
        priceVisibility?: "VISIBLE" | "HIDDEN" | undefined;
        isApproved?: boolean | undefined;
        searchPointsTotal?: number | undefined;
        internalNotes?: string | undefined;
        staffLimit?: number | undefined;
        canActAsSupplier?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "BLOCKED" | "SUSPENDED" | undefined;
    isActive?: boolean | undefined;
    searchLimit?: number | undefined;
    profile?: {
        phone?: string | undefined;
        companyName?: string | undefined;
        region?: string | undefined;
        city?: string | undefined;
        nationalAddress?: string | undefined;
        customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
        assignedPriceLevel?: "VIP" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | undefined;
        priceVisibility?: "VISIBLE" | "HIDDEN" | undefined;
        isApproved?: boolean | undefined;
        searchPointsTotal?: number | undefined;
        internalNotes?: string | undefined;
        staffLimit?: number | undefined;
        canActAsSupplier?: boolean | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "BLOCKED" | "SUSPENDED" | undefined;
    isActive?: boolean | undefined;
    searchLimit?: number | undefined;
    profile?: {
        phone?: string | undefined;
        companyName?: string | undefined;
        region?: string | undefined;
        city?: string | undefined;
        nationalAddress?: string | undefined;
        customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
        assignedPriceLevel?: "VIP" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | undefined;
        priceVisibility?: "VISIBLE" | "HIDDEN" | undefined;
        isApproved?: boolean | undefined;
        searchPointsTotal?: number | undefined;
        internalNotes?: string | undefined;
        staffLimit?: number | undefined;
        canActAsSupplier?: boolean | undefined;
    } | undefined;
}>;
export declare const customerFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "BLOCKED", "PENDING"]>>;
    customerType: z.ZodOptional<z.ZodEnum<["PARTS_STORE", "INSURANCE", "RENTAL", "REPRESENTATIVE", "MAINTENANCE"]>>;
    priceLevel: z.ZodOptional<z.ZodEnum<["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5", "VIP"]>>;
    isApproved: z.ZodOptional<z.ZodBoolean>;
    region: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "BLOCKED" | "SUSPENDED" | undefined;
    region?: string | undefined;
    city?: string | undefined;
    customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
    isApproved?: boolean | undefined;
    priceLevel?: "VIP" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | undefined;
}, {
    search?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "BLOCKED" | "SUSPENDED" | undefined;
    region?: string | undefined;
    city?: string | undefined;
    customerType?: "PARTS_STORE" | "INSURANCE" | "RENTAL" | "REPRESENTATIVE" | "MAINTENANCE" | undefined;
    isApproved?: boolean | undefined;
    priceLevel?: "VIP" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | undefined;
}>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
//# sourceMappingURL=customer.schema.d.ts.map