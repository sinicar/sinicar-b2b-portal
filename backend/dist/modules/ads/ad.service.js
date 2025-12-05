"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adService = exports.AdService = void 0;
const ad_repository_1 = require("./ad.repository");
const errors_1 = require("../../utils/errors");
const CAMPAIGN_STATUS_TRANSITIONS = {
    DRAFT: ['PENDING'],
    PENDING: ['ACTIVE', 'REJECTED'],
    ACTIVE: ['PAUSED', 'COMPLETED'],
    PAUSED: ['ACTIVE', 'COMPLETED'],
    COMPLETED: [],
    REJECTED: []
};
class AdService {
    async listAdvertisers(filters, pagination) {
        return ad_repository_1.adRepository.findAdvertisers(filters, pagination);
    }
    async getAdvertiserById(id) {
        const advertiser = await ad_repository_1.adRepository.findAdvertiserById(id);
        if (!advertiser) {
            throw new errors_1.NotFoundError('المعلن غير موجود');
        }
        return advertiser;
    }
    async createAdvertiser(input) {
        return ad_repository_1.adRepository.createAdvertiser(input);
    }
    async updateAdvertiser(id, input) {
        await this.getAdvertiserById(id);
        return ad_repository_1.adRepository.updateAdvertiser(id, input);
    }
    async deleteAdvertiser(id) {
        const advertiser = await this.getAdvertiserById(id);
        if (advertiser.campaigns.some(c => c.status === 'ACTIVE')) {
            throw new errors_1.BadRequestError('لا يمكن حذف معلن لديه حملات نشطة');
        }
        await ad_repository_1.adRepository.deleteAdvertiser(id);
        return { message: 'تم حذف المعلن بنجاح' };
    }
    async addBalance(id, input) {
        await this.getAdvertiserById(id);
        return ad_repository_1.adRepository.addBalance(id, input.amount);
    }
    async listSlots(isActive, pagination) {
        return ad_repository_1.adRepository.findSlots(isActive, pagination);
    }
    async getSlotById(id) {
        const slot = await ad_repository_1.adRepository.findSlotById(id);
        if (!slot) {
            throw new errors_1.NotFoundError('موقع الإعلان غير موجود');
        }
        return slot;
    }
    async createSlot(input) {
        return ad_repository_1.adRepository.createSlot(input);
    }
    async updateSlot(id, input) {
        await this.getSlotById(id);
        return ad_repository_1.adRepository.updateSlot(id, input);
    }
    async deleteSlot(id) {
        const slot = await this.getSlotById(id);
        if (slot.campaigns.some(c => c.status === 'ACTIVE')) {
            throw new errors_1.BadRequestError('لا يمكن حذف موقع لديه حملات نشطة');
        }
        await ad_repository_1.adRepository.deleteSlot(id);
        return { message: 'تم حذف موقع الإعلان بنجاح' };
    }
    async listCampaigns(filters, pagination) {
        return ad_repository_1.adRepository.findCampaigns(filters, pagination);
    }
    async getCampaignById(id) {
        const campaign = await ad_repository_1.adRepository.findCampaignById(id);
        if (!campaign) {
            throw new errors_1.NotFoundError('الحملة غير موجودة');
        }
        return campaign;
    }
    async createCampaign(input) {
        const advertiser = await this.getAdvertiserById(input.advertiserId);
        const slot = await this.getSlotById(input.slotId);
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        if (startDate >= endDate) {
            throw new errors_1.BadRequestError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
        }
        if (advertiser.balance < input.budget) {
            throw new errors_1.BadRequestError('رصيد المعلن غير كافٍ');
        }
        return ad_repository_1.adRepository.createCampaign({
            advertiserId: input.advertiserId,
            slotId: input.slotId,
            title: input.title,
            imageUrl: input.imageUrl,
            targetUrl: input.targetUrl,
            budget: input.budget,
            startDate,
            endDate
        });
    }
    async updateCampaign(id, input) {
        const campaign = await this.getCampaignById(id);
        if (input.status && input.status !== campaign.status) {
            const allowedTransitions = CAMPAIGN_STATUS_TRANSITIONS[campaign.status];
            if (!allowedTransitions.includes(input.status)) {
                throw new errors_1.BadRequestError(`لا يمكن تغيير حالة الحملة من ${campaign.status} إلى ${input.status}`);
            }
        }
        const updateData = { ...input };
        if (input.startDate)
            updateData.startDate = new Date(input.startDate);
        if (input.endDate)
            updateData.endDate = new Date(input.endDate);
        return ad_repository_1.adRepository.updateCampaign(id, updateData);
    }
    async approveCampaign(id) {
        return this.updateCampaign(id, { status: 'ACTIVE' });
    }
    async rejectCampaign(id, reason) {
        const campaign = await this.getCampaignById(id);
        if (campaign.status !== 'PENDING') {
            throw new errors_1.BadRequestError('لا يمكن رفض حملة غير معلقة');
        }
        return ad_repository_1.adRepository.updateCampaign(id, { status: 'REJECTED' });
    }
    async pauseCampaign(id) {
        return this.updateCampaign(id, { status: 'PAUSED' });
    }
    async resumeCampaign(id) {
        const campaign = await this.getCampaignById(id);
        if (campaign.status !== 'PAUSED') {
            throw new errors_1.BadRequestError('الحملة ليست متوقفة');
        }
        return this.updateCampaign(id, { status: 'ACTIVE' });
    }
    async deleteCampaign(id) {
        const campaign = await this.getCampaignById(id);
        if (campaign.status === 'ACTIVE') {
            throw new errors_1.BadRequestError('لا يمكن حذف حملة نشطة');
        }
        await ad_repository_1.adRepository.deleteCampaign(id);
        return { message: 'تم حذف الحملة بنجاح' };
    }
    async recordImpression(campaignId) {
        await ad_repository_1.adRepository.recordImpression(campaignId);
    }
    async recordClick(campaignId) {
        const campaign = await this.getCampaignById(campaignId);
        await ad_repository_1.adRepository.recordClick(campaignId);
        return { targetUrl: campaign.targetUrl };
    }
    async getActiveCampaignsForSlot(slotId) {
        return ad_repository_1.adRepository.getActiveCampaignsForSlot(slotId);
    }
    async getStats(advertiserId) {
        const filters = advertiserId ? { advertiserId } : {};
        const allCampaigns = await ad_repository_1.adRepository.findCampaigns(filters, { page: 1, limit: 1000 });
        const stats = {
            totalCampaigns: allCampaigns.pagination.total,
            activeCampaigns: 0,
            pendingCampaigns: 0,
            totalBudget: 0,
            totalSpent: 0,
            totalImpressions: 0,
            totalClicks: 0,
            averageCTR: 0
        };
        allCampaigns.data.forEach(campaign => {
            if (campaign.status === 'ACTIVE')
                stats.activeCampaigns++;
            if (campaign.status === 'PENDING')
                stats.pendingCampaigns++;
            stats.totalBudget += campaign.budget;
            stats.totalSpent += campaign.spent;
            stats.totalImpressions += campaign.impressions;
            stats.totalClicks += campaign.clicks;
        });
        if (stats.totalImpressions > 0) {
            stats.averageCTR = (stats.totalClicks / stats.totalImpressions) * 100;
        }
        return stats;
    }
}
exports.AdService = AdService;
exports.adService = new AdService();
//# sourceMappingURL=ad.service.js.map