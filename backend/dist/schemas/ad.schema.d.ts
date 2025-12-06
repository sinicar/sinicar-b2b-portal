import { z } from 'zod';
export declare const createAdvertiserSchema: z.ZodObject<{
    name: z.ZodString;
    contactName: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
}, {
    name: string;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
}>;
export declare const updateAdvertiserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "INACTIVE"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "SUSPENDED" | "INACTIVE" | undefined;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "SUSPENDED" | "INACTIVE" | undefined;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
}>;
export declare const addBalanceSchema: z.ZodObject<{
    amount: z.ZodNumber;
    paymentMethod: z.ZodOptional<z.ZodString>;
    transactionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    paymentMethod?: string | undefined;
    transactionId?: string | undefined;
}, {
    amount: number;
    paymentMethod?: string | undefined;
    transactionId?: string | undefined;
}>;
export declare const createAdSlotSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    pricePerDay: z.ZodNumber;
    pricePerWeek: z.ZodNumber;
    pricePerMonth: z.ZodNumber;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    location: string;
    width: number;
    height: number;
    pricePerDay: number;
    pricePerWeek: number;
    pricePerMonth: number;
}, {
    name: string;
    location: string;
    width: number;
    height: number;
    pricePerDay: number;
    pricePerWeek: number;
    pricePerMonth: number;
    isActive?: boolean | undefined;
}>;
export declare const updateAdSlotSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    pricePerDay: z.ZodOptional<z.ZodNumber>;
    pricePerWeek: z.ZodOptional<z.ZodNumber>;
    pricePerMonth: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    location?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    pricePerDay?: number | undefined;
    pricePerWeek?: number | undefined;
    pricePerMonth?: number | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    location?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    pricePerDay?: number | undefined;
    pricePerWeek?: number | undefined;
    pricePerMonth?: number | undefined;
}>;
export declare const createCampaignSchema: z.ZodObject<{
    advertiserId: z.ZodString;
    slotId: z.ZodString;
    title: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    targetUrl: z.ZodOptional<z.ZodString>;
    budget: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
    title: string;
    budget: number;
    slotId: string;
    advertiserId: string;
    imageUrl?: string | undefined;
    targetUrl?: string | undefined;
}, {
    startDate: string;
    endDate: string;
    title: string;
    budget: number;
    slotId: string;
    advertiserId: string;
    imageUrl?: string | undefined;
    targetUrl?: string | undefined;
}>;
export declare const updateCampaignSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    targetUrl: z.ZodOptional<z.ZodString>;
    budget: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "PAUSED", "COMPLETED", "REJECTED"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "PAUSED" | "COMPLETED" | undefined;
    imageUrl?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    title?: string | undefined;
    targetUrl?: string | undefined;
    budget?: number | undefined;
}, {
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "PAUSED" | "COMPLETED" | undefined;
    imageUrl?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    title?: string | undefined;
    targetUrl?: string | undefined;
    budget?: number | undefined;
}>;
export declare const campaignFilterSchema: z.ZodObject<{
    advertiserId: z.ZodOptional<z.ZodString>;
    slotId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "PAUSED", "COMPLETED", "REJECTED"]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "PAUSED" | "COMPLETED" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    slotId?: string | undefined;
    advertiserId?: string | undefined;
}, {
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "PAUSED" | "COMPLETED" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    slotId?: string | undefined;
    advertiserId?: string | undefined;
}>;
export type CreateAdvertiserInput = z.infer<typeof createAdvertiserSchema>;
export type UpdateAdvertiserInput = z.infer<typeof updateAdvertiserSchema>;
export type AddBalanceInput = z.infer<typeof addBalanceSchema>;
export type CreateAdSlotInput = z.infer<typeof createAdSlotSchema>;
export type UpdateAdSlotInput = z.infer<typeof updateAdSlotSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignFilterInput = z.infer<typeof campaignFilterSchema>;
//# sourceMappingURL=ad.schema.d.ts.map