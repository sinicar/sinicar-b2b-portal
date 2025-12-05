import { Prisma } from '@prisma/client';
import { AdvertiserStatus, CampaignStatus } from '../../types/enums';
import { PaginationParams } from '../../utils/pagination';
export interface AdvertiserFilters {
    status?: AdvertiserStatus;
    search?: string;
}
export interface CampaignFilters {
    advertiserId?: string;
    slotId?: string;
    status?: CampaignStatus;
    fromDate?: Date;
    toDate?: Date;
}
export declare class AdRepository {
    findAdvertisers(filters: AdvertiserFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            campaigns: number;
        };
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        balance: number;
    }>>;
    findAdvertiserById(id: string): Promise<({
        campaigns: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            startDate: Date;
            endDate: Date;
            title: string;
            targetUrl: string | null;
            budget: number;
            spent: number;
            impressions: number;
            clicks: number;
            slotId: string;
            advertiserId: string;
        }[];
    } & {
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        balance: number;
    }) | null>;
    createAdvertiser(data: {
        name: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
    }): Promise<{
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        balance: number;
    }>;
    updateAdvertiser(id: string, data: Prisma.AdvertiserUpdateInput): Promise<{
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        balance: number;
    }>;
    deleteAdvertiser(id: string): Promise<{
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        balance: number;
    }>;
    addBalance(id: string, amount: number): Promise<{
        id: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        balance: number;
    }>;
    findSlots(isActive?: boolean, pagination?: PaginationParams): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
    }[] | import("../../utils/pagination").PaginatedResult<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
    }>>;
    findSlotById(id: string): Promise<({
        campaigns: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            startDate: Date;
            endDate: Date;
            title: string;
            targetUrl: string | null;
            budget: number;
            spent: number;
            impressions: number;
            clicks: number;
            slotId: string;
            advertiserId: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
    }) | null>;
    createSlot(data: {
        name: string;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
    }>;
    updateSlot(id: string, data: Prisma.AdSlotUpdateInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
    }>;
    deleteSlot(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        width: number;
        height: number;
        pricePerDay: number;
        pricePerWeek: number;
        pricePerMonth: number;
    }>;
    findCampaigns(filters: CampaignFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        advertiser: {
            id: string;
            name: string;
        };
        slot: {
            id: string;
            name: string;
            location: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }>>;
    findCampaignById(id: string): Promise<({
        advertiser: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            contactName: string | null;
            contactPhone: string | null;
            contactEmail: string | null;
            balance: number;
        };
        slot: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            width: number;
            height: number;
            pricePerDay: number;
            pricePerWeek: number;
            pricePerMonth: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }) | null>;
    createCampaign(data: {
        advertiserId: string;
        slotId: string;
        title: string;
        imageUrl?: string;
        targetUrl?: string;
        budget: number;
        startDate: Date;
        endDate: Date;
    }): Promise<{
        advertiser: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            contactName: string | null;
            contactPhone: string | null;
            contactEmail: string | null;
            balance: number;
        };
        slot: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            width: number;
            height: number;
            pricePerDay: number;
            pricePerWeek: number;
            pricePerMonth: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }>;
    updateCampaign(id: string, data: Prisma.AdCampaignUpdateInput): Promise<{
        advertiser: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            contactName: string | null;
            contactPhone: string | null;
            contactEmail: string | null;
            balance: number;
        };
        slot: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            width: number;
            height: number;
            pricePerDay: number;
            pricePerWeek: number;
            pricePerMonth: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }>;
    deleteCampaign(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }>;
    recordImpression(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }>;
    recordClick(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    }>;
    getActiveCampaignsForSlot(slotId: string): Promise<({
        advertiser: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        targetUrl: string | null;
        budget: number;
        spent: number;
        impressions: number;
        clicks: number;
        slotId: string;
        advertiserId: string;
    })[]>;
}
export declare const adRepository: AdRepository;
//# sourceMappingURL=ad.repository.d.ts.map