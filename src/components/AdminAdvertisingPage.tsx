import React, { useState, useEffect, ReactNode, FormEvent } from 'react';
import { 
  Advertiser, 
  AdCampaign, 
  AdSlot, 
  AdvertiserCompanyType, 
  AdvertiserStatus, 
  AdCampaignType, 
  AdCampaignStatus,
  AdSlotSelectionMode
} from '../types';
import Api from '../services/api';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
  Megaphone,
  Building2,
  LayoutGrid,
  BarChart3,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Power,
  PowerOff,
  Pause,
  Play,
  StopCircle,
  Calendar,
  Link2,
  Image,
  Target,
  Users,
  TrendingUp,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Filter
} from 'lucide-react';

type ActiveTab = 'ADVERTISERS' | 'CAMPAIGNS' | 'SLOTS' | 'REPORTS';

const COMPANY_TYPES: { value: AdvertiserCompanyType; labelAr: string; labelEn: string }[] = [
  { value: 'supplier', labelAr: 'مورد', labelEn: 'Supplier' },
  { value: 'shipping', labelAr: 'شركة شحن', labelEn: 'Shipping Company' },
  { value: 'workshop', labelAr: 'ورشة', labelEn: 'Workshop' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' }
];

const ADVERTISER_STATUSES: { value: AdvertiserStatus; labelAr: string; labelEn: string; color: string }[] = [
  { value: 'active', labelAr: 'نشط', labelEn: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'pending_verification', labelAr: 'بانتظار التحقق', labelEn: 'Pending Verification', color: 'bg-amber-100 text-amber-700' },
  { value: 'suspended', labelAr: 'موقوف', labelEn: 'Suspended', color: 'bg-red-100 text-red-700' },
  { value: 'blacklisted', labelAr: 'محظور', labelEn: 'Blacklisted', color: 'bg-slate-100 text-slate-700' }
];

const CAMPAIGN_TYPES: { value: AdCampaignType; labelAr: string; labelEn: string }[] = [
  { value: 'banner_top', labelAr: 'بانر علوي', labelEn: 'Top Banner' },
  { value: 'banner_sidebar', labelAr: 'بانر جانبي', labelEn: 'Sidebar Banner' },
  { value: 'card_in_tools', labelAr: 'بطاقة في الأدوات', labelEn: 'Card in Tools' },
  { value: 'card_in_products', labelAr: 'بطاقة في المنتجات', labelEn: 'Card in Products' },
  { value: 'popup', labelAr: 'نافذة منبثقة', labelEn: 'Popup' }
];

const CAMPAIGN_STATUSES: { value: AdCampaignStatus; labelAr: string; labelEn: string; color: string }[] = [
  { value: 'draft', labelAr: 'مسودة', labelEn: 'Draft', color: 'bg-slate-100 text-slate-700' },
  { value: 'pending_approval', labelAr: 'بانتظار الموافقة', labelEn: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
  { value: 'running', labelAr: 'نشط', labelEn: 'Running', color: 'bg-green-100 text-green-700' },
  { value: 'paused', labelAr: 'متوقف', labelEn: 'Paused', color: 'bg-blue-100 text-blue-700' },
  { value: 'rejected', labelAr: 'مرفوض', labelEn: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'ended', labelAr: 'منتهي', labelEn: 'Ended', color: 'bg-slate-200 text-slate-600' }
];

const TARGET_PAGES: { value: string; labelAr: string; labelEn: string }[] = [
  { value: 'home', labelAr: 'الصفحة الرئيسية', labelEn: 'Home' },
  { value: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard' },
  { value: 'products', labelAr: 'المنتجات', labelEn: 'Products' },
  { value: 'tools', labelAr: 'الأدوات', labelEn: 'Tools' },
  { value: 'orders', labelAr: 'الطلبات', labelEn: 'Orders' },
  { value: 'quotes', labelAr: 'طلبات التسعير', labelEn: 'Quotes' }
];

const SELECTION_MODES: { value: AdSlotSelectionMode; labelAr: string; labelEn: string }[] = [
  { value: 'by_priority', labelAr: 'حسب الأولوية', labelEn: 'By Priority' },
  { value: 'rotate', labelAr: 'تناوب', labelEn: 'Rotate' },
  { value: 'random', labelAr: 'عشوائي', labelEn: 'Random' }
];

export const AdminAdvertisingPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ADVERTISERS');
  const [loading, setLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [stats, setStats] = useState({
    totalAdvertisers: 0,
    activeAdvertisers: 0,
    totalCampaigns: 0,
    runningCampaigns: 0,
    totalViews: 0,
    totalClicks: 0
  });

  const [showAdvertiserModal, setShowAdvertiserModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState<Advertiser | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);

  const [advertiserSearch, setAdvertiserSearch] = useState('');
  const [advertiserStatusFilter, setAdvertiserStatusFilter] = useState<string>('');
  const [advertiserTypeFilter, setAdvertiserTypeFilter] = useState<string>('');

  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('');
  const [campaignAdvertiserFilter, setCampaignAdvertiserFilter] = useState<string>('');
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('');

  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [advs, camps, slots, statistics] = await Promise.all([
        Api.getAdvertisers(),
        Api.getAdCampaigns(),
        Api.getAdSlots(),
        Api.getAdvertisingStats()
      ]);
      setAdvertisers(advs);
      setCampaigns(camps);
      setAdSlots(slots);
      setStats(statistics);
    } catch (e) {
      addToast(t('advertising.loadError', 'حدث خطأ في تحميل البيانات'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAdvertisers = advertisers.filter(adv => {
    if (advertiserSearch) {
      const search = advertiserSearch.toLowerCase();
      if (!adv.name.toLowerCase().includes(search) && 
          !adv.phone?.toLowerCase().includes(search) &&
          !adv.email?.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (advertiserStatusFilter && adv.status !== advertiserStatusFilter) return false;
    if (advertiserTypeFilter && adv.companyType !== advertiserTypeFilter) return false;
    return true;
  });

  const filteredCampaigns = campaigns.filter(camp => {
    if (campaignSearch && !camp.name.toLowerCase().includes(campaignSearch.toLowerCase())) return false;
    if (campaignStatusFilter && camp.status !== campaignStatusFilter) return false;
    if (campaignAdvertiserFilter && camp.advertiserId !== campaignAdvertiserFilter) return false;
    if (campaignTypeFilter && camp.type !== campaignTypeFilter) return false;
    return true;
  });

  const getAdvertiserName = (id: string) => {
    const adv = advertisers.find(a => a.id === id);
    return adv?.name || t('advertising.unknownAdvertiser', 'معلن غير معروف');
  };

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'ADVERTISERS', label: t('advertising.advertisers', 'المعلنين'), icon: <Building2 size={18} /> },
    { key: 'CAMPAIGNS', label: t('advertising.campaigns', 'الحملات'), icon: <Megaphone size={18} /> },
    { key: 'SLOTS', label: t('advertising.slots', 'مواقع الإعلانات'), icon: <LayoutGrid size={18} /> },
    { key: 'REPORTS', label: t('advertising.reports', 'التقارير'), icon: <BarChart3 size={18} /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-brand-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Megaphone className="text-brand-600" size={28} />
            {t('advertising.title', 'إدارة الإعلانات والمعلنين')}
          </h1>
          <p className="text-slate-500 mt-1">{t('advertising.subtitle', 'إدارة المعلنين والحملات الإعلانية ومواقع العرض')}</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
          data-testid="button-refresh-advertising"
        >
          <RefreshCw size={18} />
          {t('common.refresh', 'تحديث')}
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            data-testid={`tab-${tab.key.toLowerCase()}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ADVERTISERS' && (
        <AdvertisersTab
          advertisers={filteredAdvertisers}
          search={advertiserSearch}
          setSearch={setAdvertiserSearch}
          statusFilter={advertiserStatusFilter}
          setStatusFilter={setAdvertiserStatusFilter}
          typeFilter={advertiserTypeFilter}
          setTypeFilter={setAdvertiserTypeFilter}
          onAdd={() => { setEditingAdvertiser(null); setShowAdvertiserModal(true); }}
          onEdit={(adv) => { setEditingAdvertiser(adv); setShowAdvertiserModal(true); }}
          onDelete={async (id) => {
            if (confirm(t('advertising.confirmDelete', 'هل أنت متأكد من الحذف؟'))) {
              await Api.deleteAdvertiser(id);
              loadData();
              addToast(t('advertising.deleted', 'تم الحذف بنجاح'), 'success');
            }
          }}
          t={t}
          isRTL={isRTL}
          formatDate={formatDate}
        />
      )}

      {activeTab === 'CAMPAIGNS' && (
        <CampaignsTab
          campaigns={filteredCampaigns}
          advertisers={advertisers}
          search={campaignSearch}
          setSearch={setCampaignSearch}
          statusFilter={campaignStatusFilter}
          setStatusFilter={setCampaignStatusFilter}
          advertiserFilter={campaignAdvertiserFilter}
          setAdvertiserFilter={setCampaignAdvertiserFilter}
          typeFilter={campaignTypeFilter}
          setTypeFilter={setCampaignTypeFilter}
          onAdd={() => { setEditingCampaign(null); setShowCampaignModal(true); }}
          onEdit={(camp) => { setEditingCampaign(camp); setShowCampaignModal(true); }}
          onDelete={async (id) => {
            if (confirm(t('advertising.confirmDelete', 'هل أنت متأكد من الحذف؟'))) {
              await Api.deleteAdCampaign(id);
              loadData();
              addToast(t('advertising.deleted', 'تم الحذف بنجاح'), 'success');
            }
          }}
          onStatusChange={async (id, status) => {
            await Api.updateAdCampaign(id, { status });
            loadData();
            addToast(t('advertising.statusUpdated', 'تم تحديث الحالة'), 'success');
          }}
          getAdvertiserName={getAdvertiserName}
          t={t}
          isRTL={isRTL}
          formatDate={formatDate}
        />
      )}

      {activeTab === 'SLOTS' && (
        <SlotsTab
          slots={adSlots}
          onEdit={(slot) => { setEditingSlot(slot); setShowSlotModal(true); }}
          onToggle={async (id, enabled) => {
            await Api.updateAdSlot(id, { isEnabled: enabled });
            loadData();
            addToast(t('advertising.slotUpdated', 'تم تحديث الموقع'), 'success');
          }}
          t={t}
          isRTL={isRTL}
        />
      )}

      {activeTab === 'REPORTS' && (
        <ReportsTab stats={stats} t={t} isRTL={isRTL} />
      )}

      {showAdvertiserModal && (
        <AdvertiserModal
          advertiser={editingAdvertiser}
          onClose={() => setShowAdvertiserModal(false)}
          onSave={async (data) => {
            if (editingAdvertiser) {
              await Api.updateAdvertiser(editingAdvertiser.id, data);
            } else {
              await Api.createAdvertiser(data as Omit<Advertiser, 'id' | 'createdAt' | 'updatedAt'>);
            }
            setShowAdvertiserModal(false);
            loadData();
            addToast(t('advertising.saved', 'تم الحفظ بنجاح'), 'success');
          }}
          t={t}
          isRTL={isRTL}
        />
      )}

      {showCampaignModal && (
        <CampaignModal
          campaign={editingCampaign}
          advertisers={advertisers}
          onClose={() => setShowCampaignModal(false)}
          onSave={async (data) => {
            if (editingCampaign) {
              await Api.updateAdCampaign(editingCampaign.id, data);
            } else {
              await Api.createAdCampaign(data as Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt' | 'currentViews' | 'currentClicks'>);
            }
            setShowCampaignModal(false);
            loadData();
            addToast(t('advertising.saved', 'تم الحفظ بنجاح'), 'success');
          }}
          t={t}
          isRTL={isRTL}
        />
      )}

      {showSlotModal && editingSlot && (
        <SlotModal
          slot={editingSlot}
          onClose={() => setShowSlotModal(false)}
          onSave={async (data) => {
            await Api.updateAdSlot(editingSlot.id, data);
            setShowSlotModal(false);
            loadData();
            addToast(t('advertising.slotUpdated', 'تم تحديث الموقع'), 'success');
          }}
          t={t}
          isRTL={isRTL}
        />
      )}
    </div>
  );
};

interface AdvertisersTabProps {
  advertisers: Advertiser[];
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onAdd: () => void;
  onEdit: (adv: Advertiser) => void;
  onDelete: (id: string) => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatDate: (d: string) => string;
}

const AdvertisersTab = ({
  advertisers, search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter,
  onAdd, onEdit, onDelete, t, isRTL, formatDate
}: AdvertisersTabProps) => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input
            type="text"
            placeholder={t('advertising.searchAdvertiser', 'بحث بالاسم، الهاتف، البريد...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border border-slate-200 rounded-lg py-2 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} w-64 focus:ring-2 focus:ring-brand-500 focus:border-transparent`}
            data-testid="input-search-advertisers"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2"
          data-testid="select-status-filter"
        >
          <option value="">{t('advertising.allStatuses', 'كل الحالات')}</option>
          {ADVERTISER_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2"
          data-testid="select-type-filter"
        >
          <option value="">{t('advertising.allTypes', 'كل الأنواع')}</option>
          {COMPANY_TYPES.map(ct => (
            <option key={ct.value} value={ct.value}>{isRTL ? ct.labelAr : ct.labelEn}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
        data-testid="button-add-advertiser"
      >
        <Plus size={18} />
        {t('advertising.addAdvertiser', 'إضافة معلن')}
      </button>
    </div>

    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.name', 'الاسم')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.companyType', 'نوع الشركة')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.contact', 'التواصل')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.status', 'الحالة')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.createdAt', 'تاريخ الإنشاء')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.actions', 'الإجراءات')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {advertisers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-slate-500">
                {t('advertising.noAdvertisers', 'لا يوجد معلنين')}
              </td>
            </tr>
          ) : (
            advertisers.map(adv => {
              const status = ADVERTISER_STATUSES.find(s => s.value === adv.status);
              const type = COMPANY_TYPES.find(ct => ct.value === adv.companyType);
              return (
                <tr key={adv.id} className="hover:bg-slate-50" data-testid={`row-advertiser-${adv.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{adv.name}</div>
                    {adv.contactName && <div className="text-sm text-slate-500">{adv.contactName}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {type ? (isRTL ? type.labelAr : type.labelEn) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {adv.phone && <div>{adv.phone}</div>}
                    {adv.email && <div className="text-slate-500">{adv.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                      {status ? (isRTL ? status.labelAr : status.labelEn) : adv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(adv.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(adv)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        data-testid={`button-edit-${adv.id}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(adv.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`button-delete-${adv.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

interface CampaignsTabProps {
  campaigns: AdCampaign[];
  advertisers: Advertiser[];
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  advertiserFilter: string;
  setAdvertiserFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onAdd: () => void;
  onEdit: (camp: AdCampaign) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: AdCampaignStatus) => void;
  getAdvertiserName: (id: string) => string;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
  formatDate: (d: string) => string;
}

const CampaignsTab = ({
  campaigns, advertisers, search, setSearch, statusFilter, setStatusFilter,
  advertiserFilter, setAdvertiserFilter, typeFilter, setTypeFilter,
  onAdd, onEdit, onDelete, onStatusChange, getAdvertiserName, t, isRTL, formatDate
}: CampaignsTabProps) => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input
            type="text"
            placeholder={t('advertising.searchCampaign', 'بحث بالاسم...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border border-slate-200 rounded-lg py-2 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} w-48 focus:ring-2 focus:ring-brand-500`}
            data-testid="input-search-campaigns"
          />
        </div>
        <select
          value={advertiserFilter}
          onChange={(e) => setAdvertiserFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2"
          data-testid="select-advertiser-filter"
        >
          <option value="">{t('advertising.allAdvertisers', 'كل المعلنين')}</option>
          {advertisers.map(adv => (
            <option key={adv.id} value={adv.id}>{adv.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2"
          data-testid="select-campaign-type-filter"
        >
          <option value="">{t('advertising.allCampaignTypes', 'كل الأنواع')}</option>
          {CAMPAIGN_TYPES.map(ct => (
            <option key={ct.value} value={ct.value}>{isRTL ? ct.labelAr : ct.labelEn}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2"
          data-testid="select-campaign-status-filter"
        >
          <option value="">{t('advertising.allStatuses', 'كل الحالات')}</option>
          {CAMPAIGN_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
        data-testid="button-add-campaign"
      >
        <Plus size={18} />
        {t('advertising.addCampaign', 'إضافة حملة')}
      </button>
    </div>

    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.campaignName', 'اسم الحملة')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.advertiser', 'المعلن')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.type', 'النوع')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.dates', 'التواريخ')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.performance', 'الأداء')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.status', 'الحالة')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.actions', 'الإجراءات')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-500">
                {t('advertising.noCampaigns', 'لا يوجد حملات')}
              </td>
            </tr>
          ) : (
            campaigns.map(camp => {
              const status = CAMPAIGN_STATUSES.find(s => s.value === camp.status);
              const type = CAMPAIGN_TYPES.find(ct => ct.value === camp.type);
              return (
                <tr key={camp.id} className="hover:bg-slate-50" data-testid={`row-campaign-${camp.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{camp.name}</div>
                    <div className="text-xs text-slate-500">
                      {t('advertising.priority', 'الأولوية')}: {camp.priority}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {getAdvertiserName(camp.advertiserId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {type ? (isRTL ? type.labelAr : type.labelEn) : camp.type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{formatDate(camp.startDate)}</div>
                    {camp.endDate && <div className="text-slate-500">{formatDate(camp.endDate)}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={14} className="text-slate-400" />
                        {camp.currentViews || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={14} className="text-slate-400" />
                        {camp.currentClicks || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                      {status ? (isRTL ? status.labelAr : status.labelEn) : camp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {camp.status === 'running' && (
                        <button
                          onClick={() => onStatusChange(camp.id, 'paused')}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title={t('advertising.pause', 'إيقاف مؤقت')}
                          data-testid={`button-pause-${camp.id}`}
                        >
                          <Pause size={16} />
                        </button>
                      )}
                      {camp.status === 'paused' && (
                        <button
                          onClick={() => onStatusChange(camp.id, 'running')}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title={t('advertising.resume', 'استئناف')}
                          data-testid={`button-resume-${camp.id}`}
                        >
                          <Play size={16} />
                        </button>
                      )}
                      {(camp.status === 'running' || camp.status === 'paused') && (
                        <button
                          onClick={() => onStatusChange(camp.id, 'ended')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('advertising.end', 'إنهاء')}
                          data-testid={`button-end-${camp.id}`}
                        >
                          <StopCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(camp)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        data-testid={`button-edit-campaign-${camp.id}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(camp.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`button-delete-campaign-${camp.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

interface SlotsTabProps {
  slots: AdSlot[];
  onEdit: (slot: AdSlot) => void;
  onToggle: (id: string, enabled: boolean) => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
}

const SlotsTab = ({ slots, onEdit, onToggle, t, isRTL }: SlotsTabProps) => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.slotName', 'اسم الموقع')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.slotKey', 'المفتاح')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.enabled', 'مفعل')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.maxAds', 'الحد الأقصى')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.selectionMode', 'طريقة الاختيار')}
            </th>
            <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-sm font-semibold text-slate-600`}>
              {t('advertising.actions', 'الإجراءات')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {slots.map(slot => {
            const mode = SELECTION_MODES.find(m => m.value === slot.selectionMode);
            return (
              <tr key={slot.id} className="hover:bg-slate-50" data-testid={`row-slot-${slot.id}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{isRTL ? slot.nameAr : slot.nameEn}</div>
                  {slot.descriptionAr && (
                    <div className="text-sm text-slate-500">{isRTL ? slot.descriptionAr : slot.descriptionEn}</div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-slate-600">
                  {slot.slotKey}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggle(slot.id, !slot.isEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      slot.isEnabled ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'
                    }`}
                    data-testid={`button-toggle-slot-${slot.id}`}
                  >
                    {slot.isEnabled ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {slot.maxAds}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {mode ? (isRTL ? mode.labelAr : mode.labelEn) : slot.selectionMode}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEdit(slot)}
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid={`button-edit-slot-${slot.id}`}
                  >
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

interface ReportsTabProps {
  stats: {
    totalAdvertisers: number;
    activeAdvertisers: number;
    totalCampaigns: number;
    runningCampaigns: number;
    totalViews: number;
    totalClicks: number;
  };
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
}

const ReportsTab = ({ stats, t, isRTL }: ReportsTabProps) => {
  const ctr = stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Building2 className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-500">{t('advertising.totalAdvertisers', 'إجمالي المعلنين')}</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.totalAdvertisers}</p>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          {t('advertising.activeCount', 'النشطين')}: <span className="font-semibold text-green-600">{stats.activeAdvertisers}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Megaphone className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-500">{t('advertising.totalCampaigns', 'إجمالي الحملات')}</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.totalCampaigns}</p>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          {t('advertising.runningCount', 'النشطة')}: <span className="font-semibold text-green-600">{stats.runningCampaigns}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Eye className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-500">{t('advertising.totalViews', 'إجمالي المشاهدات')}</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Target className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-500">{t('advertising.totalClicks', 'إجمالي النقرات')}</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.totalClicks.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-100 rounded-xl">
            <TrendingUp className="text-rose-600" size={24} />
          </div>
          <div>
            <h3 className="text-sm text-slate-500">{t('advertising.ctr', 'معدل النقر')}</h3>
            <p className="text-2xl font-bold text-slate-800">{ctr}%</p>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          CTR = {t('advertising.ctrFormula', 'النقرات / المشاهدات')}
        </div>
      </div>
    </div>
  );
};

interface AdvertiserModalProps {
  advertiser: Advertiser | null;
  onClose: () => void;
  onSave: (data: Partial<Advertiser>) => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
}

const AdvertiserModal = ({ advertiser, onClose, onSave, t, isRTL }: AdvertiserModalProps) => {
  const [form, setForm] = useState({
    name: advertiser?.name || '',
    contactName: advertiser?.contactName || '',
    phone: advertiser?.phone || '',
    email: advertiser?.email || '',
    whatsapp: advertiser?.whatsapp || '',
    companyType: advertiser?.companyType || 'other' as AdvertiserCompanyType,
    source: advertiser?.source || '',
    status: advertiser?.status || 'pending_verification' as AdvertiserStatus,
    notes: advertiser?.notes || ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {advertiser ? t('advertising.editAdvertiser', 'تعديل معلن') : t('advertising.addAdvertiser', 'إضافة معلن')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="button-close-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.name', 'الاسم')} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-advertiser-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.contactName', 'اسم جهة الاتصال')}
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-contact-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.phone', 'الهاتف')}
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.email', 'البريد الإلكتروني')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.whatsapp', 'واتساب')}
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-whatsapp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.companyType', 'نوع الشركة')}
              </label>
              <select
                value={form.companyType}
                onChange={(e) => setForm({ ...form, companyType: e.target.value as AdvertiserCompanyType })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="select-company-type"
              >
                {COMPANY_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>{isRTL ? ct.labelAr : ct.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.source', 'المصدر')}
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder={t('advertising.sourcePlaceholder', 'مثال: موقع، معرض...')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-source"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.status', 'الحالة')}
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AdvertiserStatus })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="select-status"
              >
                {ADVERTISER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.notes', 'ملاحظات')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-2"
              data-testid="button-save-advertiser"
            >
              <Check size={18} />
              {t('common.save', 'حفظ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CampaignModalProps {
  campaign: AdCampaign | null;
  advertisers: Advertiser[];
  onClose: () => void;
  onSave: (data: Partial<AdCampaign>) => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
}

const CampaignModal = ({ campaign, advertisers, onClose, onSave, t, isRTL }: CampaignModalProps) => {
  const [form, setForm] = useState({
    advertiserId: campaign?.advertiserId || (advertisers[0]?.id || ''),
    name: campaign?.name || '',
    type: campaign?.type || 'banner_top' as AdCampaignType,
    targetPages: campaign?.targetPages || [] as string[],
    priority: campaign?.priority || 1,
    startDate: campaign?.startDate || new Date().toISOString().split('T')[0],
    endDate: campaign?.endDate || '',
    budgetType: campaign?.budgetType || 'fixed',
    maxViews: campaign?.maxViews || undefined,
    maxClicks: campaign?.maxClicks || undefined,
    landingUrl: campaign?.landingUrl || '',
    imageUrl: campaign?.imageUrl || '',
    status: campaign?.status || 'draft' as AdCampaignStatus
  });

  const toggleTargetPage = (page: string) => {
    setForm(prev => ({
      ...prev,
      targetPages: prev.targetPages.includes(page)
        ? prev.targetPages.filter(p => p !== page)
        : [...prev.targetPages, page]
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {campaign ? t('advertising.editCampaign', 'تعديل حملة') : t('advertising.addCampaign', 'إضافة حملة')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="button-close-campaign-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.advertiser', 'المعلن')} *
              </label>
              <select
                value={form.advertiserId}
                onChange={(e) => setForm({ ...form, advertiserId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="select-campaign-advertiser"
              >
                {advertisers.map(adv => (
                  <option key={adv.id} value={adv.id}>{adv.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.campaignName', 'اسم الحملة')} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-campaign-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.type', 'النوع')}
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AdCampaignType })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="select-campaign-type"
              >
                {CAMPAIGN_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>{isRTL ? ct.labelAr : ct.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.priority', 'الأولوية')}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-priority"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.startDate', 'تاريخ البدء')} *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-start-date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.endDate', 'تاريخ الانتهاء')}
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-end-date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.maxViews', 'الحد الأقصى للمشاهدات')}
              </label>
              <input
                type="number"
                min="0"
                value={form.maxViews || ''}
                onChange={(e) => setForm({ ...form, maxViews: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder={t('advertising.unlimited', 'غير محدود')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-max-views"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.maxClicks', 'الحد الأقصى للنقرات')}
              </label>
              <input
                type="number"
                min="0"
                value={form.maxClicks || ''}
                onChange={(e) => setForm({ ...form, maxClicks: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder={t('advertising.unlimited', 'غير محدود')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-max-clicks"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.landingUrl', 'رابط الهبوط')}
              </label>
              <input
                type="url"
                value={form.landingUrl}
                onChange={(e) => setForm({ ...form, landingUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-landing-url"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.imageUrl', 'رابط الصورة')}
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="input-image-url"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('advertising.targetPages', 'الصفحات المستهدفة')}
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_PAGES.map(page => (
                  <button
                    key={page.value}
                    type="button"
                    onClick={() => toggleTargetPage(page.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      form.targetPages.includes(page.value)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-500'
                    }`}
                    data-testid={`button-target-${page.value}`}
                  >
                    {isRTL ? page.labelAr : page.labelEn}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('advertising.status', 'الحالة')}
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AdCampaignStatus })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                data-testid="select-campaign-status"
              >
                {CAMPAIGN_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-cancel-campaign"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-2"
              data-testid="button-save-campaign"
            >
              <Check size={18} />
              {t('common.save', 'حفظ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SlotModalProps {
  slot: AdSlot;
  onClose: () => void;
  onSave: (data: Partial<AdSlot>) => void;
  t: (key: string, fallback: string) => string;
  isRTL: boolean;
}

const SlotModal = ({ slot, onClose, onSave, t, isRTL }: SlotModalProps) => {
  const [form, setForm] = useState({
    nameAr: slot.nameAr,
    nameEn: slot.nameEn,
    descriptionAr: slot.descriptionAr || '',
    descriptionEn: slot.descriptionEn || '',
    isEnabled: slot.isEnabled,
    maxAds: slot.maxAds,
    selectionMode: slot.selectionMode
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {t('advertising.editSlot', 'تعديل موقع الإعلان')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="button-close-slot-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.nameAr', 'الاسم بالعربية')}
            </label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="input-slot-name-ar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.nameEn', 'الاسم بالإنجليزية')}
            </label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="input-slot-name-en"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.descriptionAr', 'الوصف بالعربية')}
            </label>
            <textarea
              value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="textarea-desc-ar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.descriptionEn', 'الوصف بالإنجليزية')}
            </label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="textarea-desc-en"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">
              {t('advertising.enabled', 'مفعل')}
            </label>
            <button
              type="button"
              onClick={() => setForm({ ...form, isEnabled: !form.isEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.isEnabled ? 'bg-brand-600' : 'bg-slate-300'
              }`}
              data-testid="toggle-slot-enabled"
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                form.isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.maxAds', 'الحد الأقصى للإعلانات')}
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.maxAds}
              onChange={(e) => setForm({ ...form, maxAds: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="input-slot-max-ads"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('advertising.selectionMode', 'طريقة الاختيار')}
            </label>
            <select
              value={form.selectionMode}
              onChange={(e) => setForm({ ...form, selectionMode: e.target.value as AdSlotSelectionMode })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              data-testid="select-selection-mode"
            >
              {SELECTION_MODES.map(mode => (
                <option key={mode.value} value={mode.value}>{isRTL ? mode.labelAr : mode.labelEn}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-cancel-slot"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-2"
              data-testid="button-save-slot"
            >
              <Check size={18} />
              {t('common.save', 'حفظ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAdvertisingPage;
