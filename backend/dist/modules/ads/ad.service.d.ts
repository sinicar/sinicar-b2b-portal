import { AdvertiserFilters, CampaignFilters } from './ad.repository';
import { PaginationParams } from '../../utils/pagination';
import { CreateAdvertiserInput, UpdateAdvertiserInput, AddBalanceInput, CreateAdSlotInput, UpdateAdSlotInput, CreateCampaignInput, UpdateCampaignInput } from '../../schemas/ad.schema';
export declare class AdService {
    listAdvertisers(filters: AdvertiserFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
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
    getAdvertiserById(id: string): Promise<{
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
    }>;
    createAdvertiser(input: CreateAdvertiserInput): Promise<{
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
    updateAdvertiser(id: string, input: UpdateAdvertiserInput): Promise<{
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
        message: string;
    }>;
    addBalance(id: string, input: AddBalanceInput): Promise<{
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
    listSlots(isActive?: boolean, pagination?: PaginationParams): Promise<{
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
    getSlotById(id: string): Promise<{
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
    }>;
    createSlot(input: CreateAdSlotInput): Promise<{
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
    updateSlot(id: string, input: UpdateAdSlotInput): Promise<{
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
        message: string;
    }>;
    listCampaigns(filters: CampaignFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
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
    getCampaignById(id: string): Promise<{
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
    createCampaign(input: CreateCampaignInput): Promise<{
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
    updateCampaign(id: string, input: UpdateCampaignInput): Promise<{
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
    approveCampaign(id: string): Promise<{
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
    rejectCampaign(id: string, reason?: string): Promise<{
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
    pauseCampaign(id: string): Promise<{
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
    resumeCampaign(id: string): Promise<{
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
        message: string;
    }>;
    recordImpression(campaignId: string): Promise<void>;
    recordClick(campaignId: string): Promise<{
        targetUrl: string | null;
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
    getStats(advertiserId?: string): Promise<{
        totalCampaigns: number;
        activeCampaigns: number;
        pendingCampaigns: number;
        totalBudget: number;
        totalSpent: number;
        totalImpressions: number;
        totalClicks: number;
        averageCTR: number;
    }>;
}
export declare const adService: AdService;
//# sourceMappingURL=ad.service.d.ts.map