import { MockApi } from './mockApi';
import { ToolKey, ToolConfig, CustomerToolsOverride, BusinessProfile } from '../types';

export interface ToolAccessResult {
  hasAccess: boolean;
  reason?: string;
  reasonAr?: string;
  toolConfig?: ToolConfig;
  usageToday?: number;
  usageThisMonth?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  isInMaintenanceMode?: boolean;
}

export interface AllToolsAccessResult {
  [key: string]: ToolAccessResult;
}

export const toolsAccessService = {
  async checkToolAccess(
    toolKey: ToolKey,
    customerId: string,
    customerType?: string
  ): Promise<ToolAccessResult> {
    try {
      const config = await MockApi.getToolConfig(toolKey);
      
      if (!config) {
        return {
          hasAccess: false,
          reason: 'Tool configuration not found',
          reasonAr: 'لم يتم العثور على إعدادات الأداة'
        };
      }

      if (!config.enabled) {
        return {
          hasAccess: false,
          reason: 'This tool is currently disabled',
          reasonAr: 'هذه الأداة معطلة حالياً',
          toolConfig: config
        };
      }

      if (config.maintenanceMode) {
        return {
          hasAccess: false,
          reason: config.maintenanceMessage || 'Tool is under maintenance',
          reasonAr: config.maintenanceMessage || 'الأداة تحت الصيانة',
          toolConfig: config,
          isInMaintenanceMode: true
        };
      }

      const override = await MockApi.getCustomerToolsOverride(customerId);

      if (override && !override.useGlobalDefaults) {
        if (override.forcedDisabledTools?.includes(toolKey)) {
          return {
            hasAccess: false,
            reason: 'Tool access has been disabled for your account',
            reasonAr: 'تم تعطيل الوصول لهذه الأداة لحسابك',
            toolConfig: config
          };
        }

        if (override.forcedEnabledTools?.includes(toolKey)) {
          const usageToday = await MockApi.getCustomerToolUsageToday(customerId, toolKey);
          const usageThisMonth = await MockApi.getCustomerToolUsageThisMonth(customerId, toolKey);
          
          const customLimit = override.customLimits?.find(l => l.toolKey === toolKey);
          const dailyLimit = customLimit?.maxFilesPerDay ?? config.maxFilesPerDay;
          const monthlyLimit = customLimit?.maxFilesPerMonth ?? config.maxFilesPerMonth;

          if (dailyLimit && usageToday >= dailyLimit) {
            return {
              hasAccess: false,
              reason: `Daily usage limit reached (${dailyLimit} uses per day)`,
              reasonAr: `تم الوصول للحد اليومي (${dailyLimit} استخدامات في اليوم)`,
              toolConfig: config,
              usageToday,
              usageThisMonth,
              dailyLimit,
              monthlyLimit
            };
          }

          if (monthlyLimit && usageThisMonth >= monthlyLimit) {
            return {
              hasAccess: false,
              reason: `Monthly usage limit reached (${monthlyLimit} uses per month)`,
              reasonAr: `تم الوصول للحد الشهري (${monthlyLimit} استخدامات في الشهر)`,
              toolConfig: config,
              usageToday,
              usageThisMonth,
              dailyLimit,
              monthlyLimit
            };
          }

          return {
            hasAccess: true,
            toolConfig: config,
            usageToday,
            usageThisMonth,
            dailyLimit,
            monthlyLimit
          };
        }
      }

      if (config.blockedCustomerIds.includes(customerId)) {
        return {
          hasAccess: false,
          reason: 'Tool access has been blocked for your account',
          reasonAr: 'تم حظر الوصول لهذه الأداة لحسابك',
          toolConfig: config
        };
      }

      if (customerType && config.allowedCustomerTypes.length > 0) {
        if (!config.allowedCustomerTypes.includes(customerType)) {
          return {
            hasAccess: false,
            reason: 'This tool is not available for your account type',
            reasonAr: 'هذه الأداة غير متاحة لنوع حسابك',
            toolConfig: config
          };
        }
      }

      const usageToday = await MockApi.getCustomerToolUsageToday(customerId, toolKey);
      const usageThisMonth = await MockApi.getCustomerToolUsageThisMonth(customerId, toolKey);
      const dailyLimit = config.maxFilesPerDay;
      const monthlyLimit = config.maxFilesPerMonth;

      if (dailyLimit && usageToday >= dailyLimit) {
        return {
          hasAccess: false,
          reason: `Daily usage limit reached (${dailyLimit} uses per day)`,
          reasonAr: `تم الوصول للحد اليومي (${dailyLimit} استخدامات في اليوم)`,
          toolConfig: config,
          usageToday,
          usageThisMonth,
          dailyLimit,
          monthlyLimit
        };
      }

      if (monthlyLimit && usageThisMonth >= monthlyLimit) {
        return {
          hasAccess: false,
          reason: `Monthly usage limit reached (${monthlyLimit} uses per month)`,
          reasonAr: `تم الوصول للحد الشهري (${monthlyLimit} استخدامات في الشهر)`,
          toolConfig: config,
          usageToday,
          usageThisMonth,
          dailyLimit,
          monthlyLimit
        };
      }

      return {
        hasAccess: true,
        toolConfig: config,
        usageToday,
        usageThisMonth,
        dailyLimit,
        monthlyLimit
      };
    } catch (error) {
      console.error('Error checking tool access:', error);
      return {
        hasAccess: false,
        reason: 'Error checking tool access',
        reasonAr: 'حدث خطأ أثناء التحقق من صلاحيات الأداة'
      };
    }
  },

  async getAllToolsAccess(
    customerId: string,
    customerType?: string
  ): Promise<AllToolsAccessResult> {
    const toolKeys: ToolKey[] = ['PDF_TO_EXCEL', 'VIN_EXTRACTOR', 'PRICE_COMPARISON'];
    const result: AllToolsAccessResult = {};

    for (const toolKey of toolKeys) {
      result[toolKey] = await this.checkToolAccess(toolKey, customerId, customerType);
    }

    return result;
  },

  async getVisibleTools(
    customerId: string,
    customerType?: string
  ): Promise<ToolConfig[]> {
    const configs = await MockApi.getToolConfigs();
    const accessResults = await this.getAllToolsAccess(customerId, customerType);
    
    return configs
      .filter(config => {
        if (!config.enabled) return false;
        if (!config.showInDashboardShortcuts) return false;
        
        const access = accessResults[config.toolKey];
        if (!access) return false;
        
        if (!access.hasAccess && access.isInMaintenanceMode) return true;
        
        if (config.blockedCustomerIds.includes(customerId)) return false;
        
        const override = accessResults[config.toolKey]?.toolConfig;
        if (override) {
          return true;
        }
        
        if (customerType && config.allowedCustomerTypes.length > 0) {
          if (!config.allowedCustomerTypes.includes(customerType)) return false;
        }
        
        return true;
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  async recordToolUsage(
    toolKey: ToolKey,
    customerId: string,
    success: boolean,
    filesProcessed: number = 1,
    errorMessage?: string,
    processingTimeMs?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const config = await MockApi.getToolConfig(toolKey);
    
    if (config?.logUsageForAnalytics) {
      await MockApi.addToolUsageRecord({
        customerId,
        toolKey,
        usedAt: new Date().toISOString(),
        filesProcessed,
        success,
        errorMessage,
        processingTimeMs,
        metadata
      });
    }
  },

  async getToolUsageStats(
    toolKey?: ToolKey,
    customerId?: string,
    period: 'today' | 'week' | 'month' | 'all' = 'month'
  ): Promise<{
    totalUsage: number;
    successfulUsage: number;
    failedUsage: number;
    avgProcessingTime: number;
    uniqueCustomers: number;
    byDay: { date: string; count: number }[];
  }> {
    const records = await MockApi.getToolUsageRecords(customerId, toolKey);
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    const filteredRecords = records.filter(r => new Date(r.usedAt) >= startDate);
    
    const totalUsage = filteredRecords.length;
    const successfulUsage = filteredRecords.filter(r => r.success).length;
    const failedUsage = filteredRecords.filter(r => !r.success).length;
    
    const processingTimes = filteredRecords
      .filter(r => r.processingTimeMs !== undefined)
      .map(r => r.processingTimeMs!);
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;
    
    const uniqueCustomers = new Set(filteredRecords.map(r => r.customerId)).size;
    
    const byDayMap = new Map<string, number>();
    filteredRecords.forEach(r => {
      const date = r.usedAt.split('T')[0];
      byDayMap.set(date, (byDayMap.get(date) || 0) + 1);
    });
    const byDay = Array.from(byDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalUsage,
      successfulUsage,
      failedUsage,
      avgProcessingTime: Math.round(avgProcessingTime),
      uniqueCustomers,
      byDay
    };
  }
};

export default toolsAccessService;
