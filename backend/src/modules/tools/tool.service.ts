import { v4 as uuidv4 } from 'uuid';
import { toolRepository, MarketerFilters } from './tool.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import {
  ToolConfigInput,
  UpdateToolConfigInput,
  CustomerToolsOverrideInput,
  PriceComparisonInput,
  VinExtractionInput,
  SupplierPriceUploadInput,
  CreateMarketerInput,
  UpdateMarketerInput
} from '../../schemas/tools.schema';

export class ToolService {
  async getToolConfigs() {
    return toolRepository.findToolConfigs();
  }

  async getToolConfig(toolKey: string) {
    const config = await toolRepository.findToolConfigByKey(toolKey);
    if (!config) {
      throw new NotFoundError('الأداة غير موجودة');
    }
    return config;
  }

  async createToolConfig(input: ToolConfigInput) {
    const existing = await toolRepository.findToolConfigByKey(input.toolKey);
    if (existing) {
      throw new BadRequestError('الأداة موجودة بالفعل');
    }
    return toolRepository.createToolConfig(input);
  }

  async updateToolConfig(toolKey: string, input: UpdateToolConfigInput) {
    await this.getToolConfig(toolKey);
    
    const { allowedCustomerTypes, ...data } = input;
    return toolRepository.updateToolConfig(toolKey, {
      ...data,
      ...(allowedCustomerTypes && { allowedCustomerTypes: JSON.stringify(allowedCustomerTypes) })
    });
  }

  async deleteToolConfig(toolKey: string) {
    await this.getToolConfig(toolKey);
    await toolRepository.deleteToolConfig(toolKey);
    return { message: 'تم حذف الأداة بنجاح' };
  }

  async getCustomerToolOverrides(customerId: string) {
    const overrides = await toolRepository.getCustomerToolOverrides(customerId);
    if (!overrides) return null;
    
    return {
      ...overrides,
      overrides: JSON.parse(overrides.overrides)
    };
  }

  async setCustomerToolOverrides(input: CustomerToolsOverrideInput) {
    return toolRepository.upsertCustomerToolOverrides(input.customerId, input.overrides);
  }

  async canUseTool(customerId: string, toolKey: string): Promise<{ allowed: boolean; reason?: string }> {
    const config = await toolRepository.findToolConfigByKey(toolKey);
    if (!config || !config.isEnabled) {
      return { allowed: false, reason: 'الأداة غير متاحة' };
    }

    const overrides = await this.getCustomerToolOverrides(customerId);
    const toolOverride = overrides?.overrides?.[toolKey];

    if (toolOverride?.isEnabled === false) {
      return { allowed: false, reason: 'الأداة معطلة لحسابك' };
    }

    const dailyLimit = toolOverride?.dailyLimit ?? config.dailyLimit;
    const monthlyLimit = toolOverride?.monthlyLimit ?? config.monthlyLimit;

    if (dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dailyUsage = await toolRepository.getToolUsageCount(customerId, toolKey, today);
      if (dailyUsage >= dailyLimit) {
        return { allowed: false, reason: 'تم الوصول للحد اليومي' };
      }
    }

    if (monthlyLimit) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthlyUsage = await toolRepository.getToolUsageCount(customerId, toolKey, monthStart);
      if (monthlyUsage >= monthlyLimit) {
        return { allowed: false, reason: 'تم الوصول للحد الشهري' };
      }
    }

    return { allowed: true };
  }

  async recordToolUsage(customerId: string, toolKey: string, metadata?: object) {
    const canUse = await this.canUseTool(customerId, toolKey);
    if (!canUse.allowed) {
      throw new BadRequestError(canUse.reason || 'لا يمكن استخدام الأداة');
    }

    return toolRepository.recordToolUsage(customerId, toolKey, metadata);
  }

  async comparePrices(customerId: string, input: PriceComparisonInput) {
    await this.recordToolUsage(customerId, 'price_comparison', { partNumbers: input.partNumbers });

    const results: any[] = [];

    return toolRepository.savePriceComparison({
      customerId,
      partNumbers: input.partNumbers,
      supplierIds: input.supplierIds,
      results
    });
  }

  async extractVin(customerId: string, input: VinExtractionInput) {
    await this.recordToolUsage(customerId, 'vin_extraction', { vinNumber: input.vinNumber });

    const extractedData = {
      vin: input.vinNumber,
      manufacturer: 'Unknown',
      model: 'Unknown',
      year: 'Unknown',
      engine: 'Unknown',
      transmission: 'Unknown',
      parts: []
    };

    return toolRepository.saveVinExtraction({
      customerId,
      vinNumber: input.vinNumber,
      extractedData
    });
  }

  async uploadSupplierPrices(customerId: string, input: SupplierPriceUploadInput) {
    await this.recordToolUsage(customerId, 'supplier_price_upload', {
      fileName: input.fileName,
      itemsCount: input.data.length
    });

    return toolRepository.saveSupplierPriceRecord({
      customerId,
      fileName: input.fileName,
      supplierName: input.supplierName,
      data: input.data
    });
  }

  async listMarketers(filters: MarketerFilters, pagination: PaginationParams) {
    return toolRepository.findMarketers(filters, pagination);
  }

  async getMarketerById(id: string) {
    const marketer = await toolRepository.findMarketerById(id);
    if (!marketer) {
      throw new NotFoundError('المسوق غير موجود');
    }
    return marketer;
  }

  async getMarketerByReferralCode(referralCode: string) {
    const marketer = await toolRepository.findMarketerByReferralCode(referralCode);
    if (!marketer) {
      throw new NotFoundError('رمز الإحالة غير صالح');
    }
    return marketer;
  }

  async createMarketer(input: CreateMarketerInput) {
    const referralCode = uuidv4().split('-')[0].toUpperCase();
    const referralUrl = `https://sinicar.com/ref/${referralCode}`;

    return toolRepository.createMarketer({
      ...input,
      referralCode,
      referralUrl,
      bankDetails: input.bankDetails
    });
  }

  async updateMarketer(id: string, input: UpdateMarketerInput) {
    await this.getMarketerById(id);
    
    const { bankDetails, ...data } = input;
    return toolRepository.updateMarketer(id, {
      ...data,
      ...(bankDetails && { bankDetails: JSON.stringify(bankDetails) })
    });
  }

  async approveMarketer(id: string) {
    await this.getMarketerById(id);
    return toolRepository.updateMarketer(id, {
      status: 'ACTIVE',
      approvedAt: new Date()
    });
  }

  async suspendMarketer(id: string) {
    await this.getMarketerById(id);
    return toolRepository.updateMarketer(id, { status: 'SUSPENDED' });
  }

  async deleteMarketer(id: string) {
    await this.getMarketerById(id);
    await toolRepository.deleteMarketer(id);
    return { message: 'تم حذف المسوق بنجاح' };
  }

  async createReferral(referralCode: string, customerId: string, customerName?: string) {
    const marketer = await this.getMarketerByReferralCode(referralCode);

    if (marketer.status !== 'ACTIVE') {
      throw new BadRequestError('المسوق غير نشط');
    }

    return toolRepository.createReferral(marketer.id, customerId, customerName);
  }

  async recordCommission(
    marketerId: string,
    orderId: string,
    customerId: string,
    customerName: string,
    orderAmount: number
  ) {
    const marketer = await this.getMarketerById(marketerId);

    const commissionAmount = (orderAmount * marketer.commissionRate) / 100;

    return toolRepository.createCommission({
      marketerId,
      orderId,
      customerId,
      customerName,
      orderAmount,
      commissionRate: marketer.commissionRate,
      commissionAmount
    });
  }

  async approveCommission(commissionId: string) {
    return toolRepository.approveCommission(commissionId);
  }

  async payCommission(commissionId: string) {
    return toolRepository.payCommission(commissionId);
  }

  async getMarketerSettings() {
    return toolRepository.getMarketerSettings();
  }

  async updateMarketerSettings(data: any) {
    return toolRepository.updateMarketerSettings(data);
  }

  async getMarketerStats(marketerId?: string) {
    const filters: MarketerFilters = {};
    const allMarketers = await toolRepository.findMarketers(filters, { page: 1, limit: 1000 });

    if (marketerId) {
      const marketer = await this.getMarketerById(marketerId);
      return {
        totalEarnings: marketer.totalEarnings,
        pendingPayouts: marketer.pendingPayouts,
        paidAmount: marketer.paidAmount,
        referralCount: marketer.referralCount,
        referrals: marketer.referrals,
        commissions: marketer.commissions
      };
    }

    const stats = {
      totalMarketers: allMarketers.pagination.total,
      activeMarketers: 0,
      pendingMarketers: 0,
      totalReferrals: 0,
      totalCommissions: 0,
      totalPaid: 0
    };

    allMarketers.data.forEach(marketer => {
      if (marketer.status === 'ACTIVE') stats.activeMarketers++;
      if (marketer.status === 'PENDING') stats.pendingMarketers++;
      stats.totalReferrals += marketer.referralCount;
      stats.totalCommissions += marketer.totalEarnings;
      stats.totalPaid += marketer.paidAmount;
    });

    return stats;
  }
}

export const toolService = new ToolService();
