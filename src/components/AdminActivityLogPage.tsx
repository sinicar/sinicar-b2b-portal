import { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { ActivityLogEntry, ActivityEventType, ActorType, EntityType, ActivityLogFilters, OnlineUsersResponse, OnlineUser } from '../types';
import { useLanguage } from '../services/LanguageContext';
import { 
  Search, 
  RefreshCw, 
  Activity, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  User,
  Building,
  Store,
  Megaphone,
  Shield,
  Clock,
  Filter,
  X
} from 'lucide-react';

interface AdminActivityLogPageProps {
  onBack?: () => void;
}

const ACTION_TYPE_OPTIONS: { value: ActivityEventType; labelAr: string; labelEn: string }[] = [
  { value: 'LOGIN', labelAr: 'تسجيل دخول', labelEn: 'Login' },
  { value: 'LOGOUT', labelAr: 'تسجيل خروج', labelEn: 'Logout' },
  { value: 'FAILED_LOGIN', labelAr: 'محاولة دخول فاشلة', labelEn: 'Failed Login' },
  { value: 'ORDER_CREATED', labelAr: 'إنشاء طلب', labelEn: 'Order Created' },
  { value: 'QUOTE_REQUEST', labelAr: 'طلب تسعير', labelEn: 'Quote Request' },
  { value: 'IMPORT_REQUEST', labelAr: 'طلب استيراد', labelEn: 'Import Request' },
  { value: 'ACCOUNT_REQUEST', labelAr: 'طلب فتح حساب', labelEn: 'Account Request' },
  { value: 'SEARCH_PERFORMED', labelAr: 'بحث', labelEn: 'Search' },
  { value: 'ORDER_STATUS_CHANGED', labelAr: 'تغيير حالة طلب', labelEn: 'Order Status Changed' },
  { value: 'USER_SUSPENDED', labelAr: 'إيقاف مستخدم', labelEn: 'User Suspended' },
  { value: 'USER_APPROVED', labelAr: 'اعتماد مستخدم', labelEn: 'User Approved' },
  { value: 'PASSWORD_CHANGED', labelAr: 'تغيير كلمة المرور', labelEn: 'Password Changed' },
  { value: 'ALTERNATIVES_UPLOADED', labelAr: 'رفع بدائل', labelEn: 'Alternatives Uploaded' },
  { value: 'SETTINGS_CHANGED', labelAr: 'تغيير إعدادات', labelEn: 'Settings Changed' },
  { value: 'PURCHASE_REQUEST_CREATED', labelAr: 'طلب شراء', labelEn: 'Purchase Request' },
];

const ACTOR_TYPE_OPTIONS: { value: ActorType; labelAr: string; labelEn: string; icon: typeof User }[] = [
  { value: 'CUSTOMER', labelAr: 'عميل', labelEn: 'Customer', icon: User },
  { value: 'SUPPLIER', labelAr: 'مورد', labelEn: 'Supplier', icon: Store },
  { value: 'MARKETER', labelAr: 'مسوق', labelEn: 'Marketer', icon: Megaphone },
  { value: 'EMPLOYEE', labelAr: 'موظف', labelEn: 'Employee', icon: Building },
  { value: 'ADMIN', labelAr: 'إدارة', labelEn: 'Admin', icon: Shield },
];

const ENTITY_TYPE_OPTIONS: { value: EntityType; labelAr: string; labelEn: string }[] = [
  { value: 'ORDER', labelAr: 'طلب', labelEn: 'Order' },
  { value: 'REQUEST', labelAr: 'طلب عام', labelEn: 'Request' },
  { value: 'CUSTOMER', labelAr: 'عميل', labelEn: 'Customer' },
  { value: 'SUPPLIER', labelAr: 'مورد', labelEn: 'Supplier' },
  { value: 'PRODUCT', labelAr: 'منتج', labelEn: 'Product' },
  { value: 'ALTERNATIVE', labelAr: 'بديل', labelEn: 'Alternative' },
  { value: 'SETTINGS', labelAr: 'إعدادات', labelEn: 'Settings' },
  { value: 'QUOTE', labelAr: 'تسعير', labelEn: 'Quote' },
  { value: 'IMPORT', labelAr: 'استيراد', labelEn: 'Import' },
  { value: 'USER', labelAr: 'مستخدم', labelEn: 'User' },
];

export const AdminActivityLogPage: FC<AdminActivityLogPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const [showFilters, setShowFilters] = useState(false);
  const [filterActorType, setFilterActorType] = useState<ActorType | ''>('');
  const [filterActionType, setFilterActionType] = useState<ActivityEventType | ''>('');
  const [filterEntityType, setFilterEntityType] = useState<EntityType | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersResponse | null>(null);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'online'>('logs');

  const [stats, setStats] = useState<{
    totalLogs: number;
    todayLogs: number;
    logsByActorType: Record<ActorType, number>;
  } | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const appliedFilters: ActivityLogFilters = {
        page: currentPage,
        pageSize
      };

      if (filterActorType) appliedFilters.actorType = filterActorType;
      if (filterActionType) appliedFilters.actionType = filterActionType;
      if (filterEntityType) appliedFilters.entityType = filterEntityType;
      if (filterDateFrom) appliedFilters.dateFrom = filterDateFrom;
      if (filterDateTo) appliedFilters.dateTo = filterDateTo;

      const result = await MockApi.getActivityLogsFiltered(appliedFilters);
      setLogs(result.items);
      setTotalLogs(result.total);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineUsers = async () => {
    setOnlineLoading(true);
    try {
      const result = await MockApi.getOnlineUsersGrouped(5);
      setOnlineUsers(result);
    } catch (error) {
      console.error('Error loading online users:', error);
    } finally {
      setOnlineLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await MockApi.getActivityStats();
      setStats(result);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadLogs();
  };

  const clearFilters = () => {
    setFilterActorType('');
    setFilterActionType('');
    setFilterEntityType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
    setTimeout(() => loadLogs(), 0);
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  const getActorTypeLabel = (type?: ActorType) => {
    if (!type) return '-';
    const option = ACTOR_TYPE_OPTIONS.find(o => o.value === type);
    return option ? (isRTL ? option.labelAr : option.labelEn) : type;
  };

  const getActorTypeBadgeColor = (type?: ActorType) => {
    switch (type) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'EMPLOYEE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'MARKETER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'SUPPLIER': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getActionTypeLabel = (type: ActivityEventType) => {
    const option = ACTION_TYPE_OPTIONS.find(o => o.value === type);
    return option ? (isRTL ? option.labelAr : option.labelEn) : type;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getOnlineCount = () => {
    if (!onlineUsers) return 0;
    return onlineUsers.onlineCustomers.length + 
           onlineUsers.onlineSuppliers.length + 
           onlineUsers.onlineMarketers.length + 
           onlineUsers.onlineEmployees.length + 
           onlineUsers.onlineAdmins.length;
  };

  const renderOnlineUsersList = (users: OnlineUser[], title: string, Icon: typeof User) => {
    if (users.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={18} className="text-gray-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">{title}</span>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{users.length}</span>
        </div>
        <div className="space-y-2">
          {users.map(user => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              data-testid={`online-user-${user.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(user.lastActivityAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 md:p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              data-testid="button-back"
            >
              {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <Activity size={24} className="text-blue-600" />
              {t('admin.activityLog.title', isRTL ? 'سجل النشاط' : 'Activity Log')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('admin.activityLog.subtitle', isRTL ? 'تتبع نشاطات المستخدمين والنظام' : 'Track user and system activities')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'logs' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('logs')}
            data-testid="button-tab-logs"
          >
            <Activity size={16} />
            {t('admin.activityLog.logs', isRTL ? 'السجل' : 'Logs')}
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'online' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => {
              setActiveTab('online');
              if (!onlineUsers) loadOnlineUsers();
            }}
            data-testid="button-tab-online"
          >
            <Users size={16} />
            {t('admin.activityLog.online', isRTL ? 'المتصلون' : 'Online')}
            {onlineUsers && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getOnlineCount()}</span>
            )}
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalLogs}</div>
            <div className="text-xs text-gray-500">{t('admin.activityLog.totalLogs', isRTL ? 'إجمالي السجلات' : 'Total Logs')}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{stats.todayLogs}</div>
            <div className="text-xs text-gray-500">{t('admin.activityLog.today', isRTL ? 'اليوم' : 'Today')}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{stats.logsByActorType.CUSTOMER || 0}</div>
            <div className="text-xs text-gray-500">{t('admin.activityLog.customers', isRTL ? 'العملاء' : 'Customers')}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600">{stats.logsByActorType.SUPPLIER || 0}</div>
            <div className="text-xs text-gray-500">{t('admin.activityLog.suppliers', isRTL ? 'الموردين' : 'Suppliers')}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">{stats.logsByActorType.MARKETER || 0}</div>
            <div className="text-xs text-gray-500">{t('admin.activityLog.marketers', isRTL ? 'المسوقين' : 'Marketers')}</div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter size={16} />
                {t('admin.activityLog.filters', isRTL ? 'الفلاتر' : 'Filters')}
              </button>

              <select
                value={filterActorType}
                onChange={(e) => setFilterActorType(e.target.value as ActorType | '')}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                data-testid="select-actor-type"
              >
                <option value="">{t('admin.activityLog.allActors', isRTL ? 'جميع المستخدمين' : 'All Users')}</option>
                {ACTOR_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {isRTL ? opt.labelAr : opt.labelEn}
                  </option>
                ))}
              </select>

              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleSearch}
                disabled={loading}
                data-testid="button-search"
              >
                <Search size={16} />
                {t('common.search', isRTL ? 'بحث' : 'Search')}
              </button>

              {(filterActorType || filterActionType || filterEntityType || filterDateFrom || filterDateTo) && (
                <button
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <X size={16} />
                  {t('common.clear', isRTL ? 'مسح' : 'Clear')}
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t('admin.activityLog.actionType', isRTL ? 'نوع الحدث' : 'Action Type')}
                  </label>
                  <select
                    value={filterActionType}
                    onChange={(e) => setFilterActionType(e.target.value as ActivityEventType | '')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    data-testid="select-action-type"
                  >
                    <option value="">{t('common.all', isRTL ? 'الكل' : 'All')}</option>
                    {ACTION_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {isRTL ? opt.labelAr : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t('admin.activityLog.entityType', isRTL ? 'نوع الكيان' : 'Entity Type')}
                  </label>
                  <select
                    value={filterEntityType}
                    onChange={(e) => setFilterEntityType(e.target.value as EntityType | '')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    data-testid="select-entity-type"
                  >
                    <option value="">{t('common.all', isRTL ? 'الكل' : 'All')}</option>
                    {ENTITY_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {isRTL ? opt.labelAr : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t('admin.activityLog.dateFrom', isRTL ? 'من تاريخ' : 'From Date')}
                  </label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    data-testid="input-date-from"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t('admin.activityLog.dateTo', isRTL ? 'إلى تاريخ' : 'To Date')}
                  </label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    data-testid="input-date-to"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Activity size={18} />
                {t('admin.activityLog.activityLogs', isRTL ? 'سجل النشاطات' : 'Activity Logs')}
              </h2>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
                {totalLogs} {t('admin.activityLog.records', isRTL ? 'سجل' : 'logs')}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="animate-spin text-blue-600" size={28} />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Activity size={48} className="mx-auto mb-3 opacity-40" />
                <p>{t('admin.activityLog.noLogs', isRTL ? 'لا توجد سجلات' : 'No logs found')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-start p-3 font-medium text-gray-600 dark:text-gray-400">
                        {t('admin.activityLog.time', isRTL ? 'الوقت' : 'Time')}
                      </th>
                      <th className="text-start p-3 font-medium text-gray-600 dark:text-gray-400">
                        {t('admin.activityLog.user', isRTL ? 'المستخدم' : 'User')}
                      </th>
                      <th className="text-start p-3 font-medium text-gray-600 dark:text-gray-400">
                        {t('admin.activityLog.type', isRTL ? 'النوع' : 'Type')}
                      </th>
                      <th className="text-start p-3 font-medium text-gray-600 dark:text-gray-400">
                        {t('admin.activityLog.action', isRTL ? 'الحدث' : 'Action')}
                      </th>
                      <th className="text-start p-3 font-medium text-gray-600 dark:text-gray-400">
                        {t('admin.activityLog.description', isRTL ? 'الوصف' : 'Description')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {logs.map(log => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        data-testid={`log-row-${log.id}`}
                      >
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock size={14} />
                            <span className="text-xs">{formatDate(log.createdAt)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {log.userName || log.userId}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getActorTypeBadgeColor(log.actorType)}`}>
                            {getActorTypeLabel(log.actorType)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded text-gray-700 dark:text-gray-300">
                            {getActionTypeLabel(log.eventType)}
                          </span>
                        </td>
                        <td className="p-3 max-w-[300px]">
                          <span className="text-gray-600 dark:text-gray-400 truncate block" title={log.description}>
                            {log.description || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500">
                  {isRTL 
                    ? `صفحة ${currentPage} من ${totalPages}` 
                    : `Page ${currentPage} of ${totalPages}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    data-testid="button-prev-page"
                  >
                    {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  </button>
                  <button
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    data-testid="button-next-page"
                  >
                    {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'online' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Users size={18} />
              {t('admin.activityLog.onlineUsers', isRTL ? 'المستخدمون المتصلون الآن' : 'Online Users Now')}
            </h2>
            <button
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
              onClick={loadOnlineUsers}
              disabled={onlineLoading}
              data-testid="button-refresh-online"
            >
              <RefreshCw size={14} className={onlineLoading ? 'animate-spin' : ''} />
              {t('common.refresh', isRTL ? 'تحديث' : 'Refresh')}
            </button>
          </div>

          <div className="p-4">
            {onlineLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="animate-spin text-blue-600" size={28} />
              </div>
            ) : !onlineUsers ? (
              <div className="text-center py-16 text-gray-500">
                <Users size={48} className="mx-auto mb-3 opacity-40" />
                <p>{t('admin.activityLog.clickRefresh', isRTL ? 'اضغط تحديث لعرض المتصلين' : 'Click refresh to load online users')}</p>
              </div>
            ) : getOnlineCount() === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Users size={48} className="mx-auto mb-3 opacity-40" />
                <p>{t('admin.activityLog.noOnline', isRTL ? 'لا يوجد مستخدمين متصلين' : 'No users online')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {renderOnlineUsersList(onlineUsers.onlineAdmins, t('admin.activityLog.admins', isRTL ? 'الإدارة' : 'Admins'), Shield)}
                {renderOnlineUsersList(onlineUsers.onlineEmployees, t('admin.activityLog.employees', isRTL ? 'الموظفين' : 'Employees'), Building)}
                {renderOnlineUsersList(onlineUsers.onlineSuppliers, t('admin.activityLog.suppliersOnline', isRTL ? 'الموردين' : 'Suppliers'), Store)}
                {renderOnlineUsersList(onlineUsers.onlineMarketers, t('admin.activityLog.marketersOnline', isRTL ? 'المسوقين' : 'Marketers'), Megaphone)}
                {renderOnlineUsersList(onlineUsers.onlineCustomers, t('admin.activityLog.customersOnline', isRTL ? 'العملاء' : 'Customers'), User)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogPage;
