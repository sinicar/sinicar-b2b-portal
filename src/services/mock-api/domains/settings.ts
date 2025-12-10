import { STORAGE_KEYS } from '../core/storage-keys';
import { DEFAULT_SETTINGS } from '../core/defaults';
import { SiteSettings, Banner, BusinessProfile, User, OrderStatus } from '../../../types';
import { MockApi } from '../../mockApi';

export const settingsApi = {
  async getSettings(): Promise<SiteSettings> {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(stored);
    const mergedStatusLabels = DEFAULT_SETTINGS.statusLabels ? {
      orderStatus: { ...DEFAULT_SETTINGS.statusLabels.orderStatus, ...(parsed.statusLabels?.orderStatus || {}) },
      orderInternalStatus: { ...DEFAULT_SETTINGS.statusLabels.orderInternalStatus, ...(parsed.statusLabels?.orderInternalStatus || {}) },
      accountRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.accountRequestStatus, ...(parsed.statusLabels?.accountRequestStatus || {}) },
      quoteRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteRequestStatus, ...(parsed.statusLabels?.quoteRequestStatus || {}) },
      quoteItemStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteItemStatus, ...(parsed.statusLabels?.quoteItemStatus || {}) },
      missingStatus: { ...DEFAULT_SETTINGS.statusLabels.missingStatus, ...(parsed.statusLabels?.missingStatus || {}) },
      importRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.importRequestStatus, ...(parsed.statusLabels?.importRequestStatus || {}) },
      customerStatus: { ...DEFAULT_SETTINGS.statusLabels.customerStatus, ...(parsed.statusLabels?.customerStatus || {}) },
      staffStatus: { ...DEFAULT_SETTINGS.statusLabels.staffStatus, ...(parsed.statusLabels?.staffStatus || {}) }
    } : parsed.statusLabels;
    
    return { 
      ...DEFAULT_SETTINGS, 
      ...parsed, 
      apiConfig: { ...DEFAULT_SETTINGS.apiConfig, ...parsed.apiConfig },
      uiTexts: { ...DEFAULT_SETTINGS.uiTexts, ...(parsed.uiTexts || {}) },
      statusLabels: mergedStatusLabels
    };
  },

  async updateSettings(settings: SiteSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  async updateBanners(banners: Banner[]) {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  },

  async updateNews(news: string[]) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
  },

  async getStatusLabels(): Promise<typeof DEFAULT_SETTINGS.statusLabels> {
    const stored = localStorage.getItem(STORAGE_KEYS.STATUS_LABELS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.STATUS_LABELS, JSON.stringify(DEFAULT_SETTINGS.statusLabels));
      return DEFAULT_SETTINGS.statusLabels;
    }
    const parsed = JSON.parse(stored);
    return {
      orderStatus: { ...DEFAULT_SETTINGS.statusLabels.orderStatus, ...parsed.orderStatus },
      orderInternalStatus: { ...DEFAULT_SETTINGS.statusLabels.orderInternalStatus, ...parsed.orderInternalStatus },
      accountRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.accountRequestStatus, ...parsed.accountRequestStatus },
      quoteRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteRequestStatus, ...parsed.quoteRequestStatus },
      quoteItemStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteItemStatus, ...parsed.quoteItemStatus },
      missingStatus: { ...DEFAULT_SETTINGS.statusLabels.missingStatus, ...parsed.missingStatus },
      importRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.importRequestStatus, ...parsed.importRequestStatus },
      customerStatus: { ...DEFAULT_SETTINGS.statusLabels.customerStatus, ...parsed.customerStatus },
      staffStatus: { ...DEFAULT_SETTINGS.statusLabels.staffStatus, ...parsed.staffStatus }
    };
  },

  async updateStatusLabels(statusLabels: typeof DEFAULT_SETTINGS.statusLabels): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STATUS_LABELS, JSON.stringify(statusLabels));
    const settings = await this.getSettings();
    settings.statusLabels = statusLabels;
    await this.updateSettings(settings);
  },

  async addStatusLabel(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, key: string, definition: { label: string; color: string; bgColor: string; icon?: string; isDefault?: boolean; isSystem?: boolean; sortOrder?: number }): Promise<{ success: boolean; error?: string }> {
    const statusLabels = await this.getStatusLabels();
    if (statusLabels[domain][key]) {
      return { success: false, error: 'المفتاح موجود بالفعل في هذا المجال' };
    }
    const existingLabels = Object.values(statusLabels[domain]) as { sortOrder?: number }[];
    const maxOrder = existingLabels.reduce((max: number, item) => Math.max(max, item.sortOrder || 0), 0);
    statusLabels[domain][key] = {
      ...definition,
      sortOrder: definition.sortOrder || maxOrder + 1,
      isSystem: false
    };
    if (definition.isDefault) {
      Object.keys(statusLabels[domain]).forEach(k => {
        if (k !== key) statusLabels[domain][k].isDefault = false;
      });
    }
    await this.updateStatusLabels(statusLabels);
    return { success: true };
  },

  async updateStatusLabel(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, key: string, definition: { label: string; color: string; bgColor: string; icon?: string; isDefault?: boolean; sortOrder?: number }): Promise<{ success: boolean; error?: string }> {
    const statusLabels = await this.getStatusLabels();
    if (!statusLabels[domain][key]) {
      return { success: false, error: 'الحالة غير موجودة' };
    }
    const existing = statusLabels[domain][key];
    statusLabels[domain][key] = {
      ...existing,
      label: definition.label,
      color: definition.color,
      bgColor: definition.bgColor,
      icon: definition.icon,
      sortOrder: definition.sortOrder ?? existing.sortOrder
    };
    if (definition.isDefault) {
      Object.keys(statusLabels[domain]).forEach(k => {
        if (k !== key) statusLabels[domain][k].isDefault = false;
      });
      statusLabels[domain][key].isDefault = true;
    }
    await this.updateStatusLabels(statusLabels);
    return { success: true };
  },

  async deleteStatusLabel(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, key: string): Promise<{ success: boolean; error?: string }> {
    const statusLabels = await this.getStatusLabels();
    if (!statusLabels[domain][key]) {
      return { success: false, error: 'الحالة غير موجودة' };
    }
    if (statusLabels[domain][key].isSystem) {
      return { success: false, error: 'لا يمكن حذف حالة نظامية' };
    }
    const usageCount = await this.checkStatusUsage(domain, key);
    if (usageCount > 0) {
      return { success: false, error: `لا يمكن الحذف، يوجد ${usageCount} سجل يستخدم هذه الحالة` };
    }
    delete statusLabels[domain][key];
    await this.updateStatusLabels(statusLabels);
    return { success: true };
  },

  async checkStatusUsage(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, statusKey: string): Promise<number> {
    let count = 0;
    switch (domain) {
      case 'orderStatus':
        const orders = await MockApi.getAllOrders();
        count = orders.filter(o => o.status === statusKey || o.status === OrderStatus[statusKey as keyof typeof OrderStatus]).length;
        break;
      case 'orderInternalStatus':
        const allOrders = await MockApi.getAllOrders();
        count = allOrders.filter(o => o.internalStatus === statusKey).length;
        break;
      case 'accountRequestStatus':
        const accounts = await MockApi.getAccountOpeningRequests();
        count = accounts.filter(a => a.status === statusKey).length;
        break;
      case 'quoteRequestStatus':
        const quotes = await MockApi.getAllQuoteRequests();
        count = quotes.filter(q => q.status === statusKey).length;
        break;
      case 'importRequestStatus':
        const imports = await MockApi.getImportRequests();
        count = imports.filter(i => i.status === statusKey).length;
        break;
      case 'missingStatus':
        const missing = await MockApi.getMissingProductRequests();
        count = missing.filter(m => m.status === statusKey).length;
        break;
      case 'customerStatus':
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]') as BusinessProfile[];
        count = profiles.filter(p => p.status === statusKey).length;
        break;
      case 'staffStatus':
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
        count = users.filter(u => u.role === 'CUSTOMER_STAFF' && u.status === statusKey).length;
        break;
    }
    return count;
  }
};
