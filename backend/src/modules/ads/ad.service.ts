import { adRepository, AdvertiserFilters, CampaignFilters } from './ad.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import {
  CreateAdvertiserInput,
  UpdateAdvertiserInput,
  AddBalanceInput,
  CreateAdSlotInput,
  UpdateAdSlotInput,
  CreateCampaignInput,
  UpdateCampaignInput
} from '../../schemas/ad.schema';
import { CampaignStatus } from '@prisma/client';

const CAMPAIGN_STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  PENDING: ['ACTIVE', 'REJECTED'],
  ACTIVE: ['PAUSED', 'COMPLETED'],
  PAUSED: ['ACTIVE', 'COMPLETED'],
  COMPLETED: [],
  REJECTED: []
};

export class AdService {
  async listAdvertisers(filters: AdvertiserFilters, pagination: PaginationParams) {
    return adRepository.findAdvertisers(filters, pagination);
  }

  async getAdvertiserById(id: string) {
    const advertiser = await adRepository.findAdvertiserById(id);
    if (!advertiser) {
      throw new NotFoundError('المعلن غير موجود');
    }
    return advertiser;
  }

  async createAdvertiser(input: CreateAdvertiserInput) {
    return adRepository.createAdvertiser(input);
  }

  async updateAdvertiser(id: string, input: UpdateAdvertiserInput) {
    await this.getAdvertiserById(id);
    return adRepository.updateAdvertiser(id, input);
  }

  async deleteAdvertiser(id: string) {
    const advertiser = await this.getAdvertiserById(id);
    
    if (advertiser.campaigns.some(c => c.status === 'ACTIVE')) {
      throw new BadRequestError('لا يمكن حذف معلن لديه حملات نشطة');
    }

    await adRepository.deleteAdvertiser(id);
    return { message: 'تم حذف المعلن بنجاح' };
  }

  async addBalance(id: string, input: AddBalanceInput) {
    await this.getAdvertiserById(id);
    return adRepository.addBalance(id, input.amount);
  }

  async listSlots(isActive?: boolean, pagination?: PaginationParams) {
    return adRepository.findSlots(isActive, pagination);
  }

  async getSlotById(id: string) {
    const slot = await adRepository.findSlotById(id);
    if (!slot) {
      throw new NotFoundError('موقع الإعلان غير موجود');
    }
    return slot;
  }

  async createSlot(input: CreateAdSlotInput) {
    return adRepository.createSlot(input);
  }

  async updateSlot(id: string, input: UpdateAdSlotInput) {
    await this.getSlotById(id);
    return adRepository.updateSlot(id, input);
  }

  async deleteSlot(id: string) {
    const slot = await this.getSlotById(id);
    
    if (slot.campaigns.some(c => c.status === 'ACTIVE')) {
      throw new BadRequestError('لا يمكن حذف موقع لديه حملات نشطة');
    }

    await adRepository.deleteSlot(id);
    return { message: 'تم حذف موقع الإعلان بنجاح' };
  }

  async listCampaigns(filters: CampaignFilters, pagination: PaginationParams) {
    return adRepository.findCampaigns(filters, pagination);
  }

  async getCampaignById(id: string) {
    const campaign = await adRepository.findCampaignById(id);
    if (!campaign) {
      throw new NotFoundError('الحملة غير موجودة');
    }
    return campaign;
  }

  async createCampaign(input: CreateCampaignInput) {
    const advertiser = await this.getAdvertiserById(input.advertiserId);
    const slot = await this.getSlotById(input.slotId);

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate >= endDate) {
      throw new BadRequestError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
    }

    if (advertiser.balance < input.budget) {
      throw new BadRequestError('رصيد المعلن غير كافٍ');
    }

    return adRepository.createCampaign({
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

  async updateCampaign(id: string, input: UpdateCampaignInput) {
    const campaign = await this.getCampaignById(id);

    if (input.status && input.status !== campaign.status) {
      const allowedTransitions = CAMPAIGN_STATUS_TRANSITIONS[campaign.status];
      if (!allowedTransitions.includes(input.status)) {
        throw new BadRequestError(
          `لا يمكن تغيير حالة الحملة من ${campaign.status} إلى ${input.status}`
        );
      }
    }

    const updateData: any = { ...input };
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);

    return adRepository.updateCampaign(id, updateData);
  }

  async approveCampaign(id: string) {
    return this.updateCampaign(id, { status: 'ACTIVE' });
  }

  async rejectCampaign(id: string, reason?: string) {
    const campaign = await this.getCampaignById(id);
    
    if (campaign.status !== 'PENDING') {
      throw new BadRequestError('لا يمكن رفض حملة غير معلقة');
    }

    return adRepository.updateCampaign(id, { status: 'REJECTED' });
  }

  async pauseCampaign(id: string) {
    return this.updateCampaign(id, { status: 'PAUSED' });
  }

  async resumeCampaign(id: string) {
    const campaign = await this.getCampaignById(id);
    
    if (campaign.status !== 'PAUSED') {
      throw new BadRequestError('الحملة ليست متوقفة');
    }

    return this.updateCampaign(id, { status: 'ACTIVE' });
  }

  async deleteCampaign(id: string) {
    const campaign = await this.getCampaignById(id);

    if (campaign.status === 'ACTIVE') {
      throw new BadRequestError('لا يمكن حذف حملة نشطة');
    }

    await adRepository.deleteCampaign(id);
    return { message: 'تم حذف الحملة بنجاح' };
  }

  async recordImpression(campaignId: string) {
    await adRepository.recordImpression(campaignId);
  }

  async recordClick(campaignId: string) {
    const campaign = await this.getCampaignById(campaignId);
    await adRepository.recordClick(campaignId);
    return { targetUrl: campaign.targetUrl };
  }

  async getActiveCampaignsForSlot(slotId: string) {
    return adRepository.getActiveCampaignsForSlot(slotId);
  }

  async getStats(advertiserId?: string) {
    const filters: CampaignFilters = advertiserId ? { advertiserId } : {};
    const allCampaigns = await adRepository.findCampaigns(filters, { page: 1, limit: 1000 });

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
      if (campaign.status === 'ACTIVE') stats.activeCampaigns++;
      if (campaign.status === 'PENDING') stats.pendingCampaigns++;
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

export const adService = new AdService();
