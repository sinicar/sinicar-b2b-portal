import { useState, useEffect, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Clock, Trash2, RefreshCw, User, Package, FileText, CreditCard, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Api from '../services/api';
import { normalizeListResponse } from '../services/normalize';
import { Notification, NotificationType, User as UserType } from '../types';
import { useLanguage } from '../services/LanguageContext';

interface NotificationsPageProps {
  user: UserType;
  onBack?: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'ACCOUNT_APPROVED':
    case 'ACCOUNT_REJECTED':
    case 'NEW_ACCOUNT_REQUEST':
    case 'ACCOUNT_UPDATE':
      return User;
    case 'ORDER_STATUS_CHANGED':
    case 'CUSTOMER_ORDER':
      return Package;
    case 'NEW_PURCHASE_REQUEST':
    case 'NEW_QUOTE_REQUEST':
    case 'NEW_IMPORT_REQUEST':
    case 'QUOTE_PROCESSED':
      return FileText;
    case 'SEARCH_POINTS_ADDED':
      return CreditCard;
    case 'ABANDONED_CART_ALERT':
      return ShoppingCart;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'ACCOUNT_APPROVED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'ACCOUNT_REJECTED':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'ORDER_STATUS_CHANGED':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'NEW_PURCHASE_REQUEST':
    case 'NEW_ACCOUNT_REQUEST':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'SEARCH_POINTS_ADDED':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'SYSTEM':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const NotificationsPage: FC<NotificationsPageProps> = ({ user, onBack }) => {
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();
  const isRTL = i18n.dir() === 'rtl';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  const categoryFilters = [
    { value: 'all', types: [], label: t('notifications.categories.all') },
    { value: 'orders', types: ['ORDER_STATUS_CHANGED', 'CUSTOMER_ORDER'], label: t('notifications.categories.orders') },
    { value: 'account', types: ['ACCOUNT_APPROVED', 'ACCOUNT_REJECTED', 'ACCOUNT_UPDATE', 'NEW_ACCOUNT_REQUEST', 'NEW_CUSTOMER_REGISTERED'], label: t('notifications.categories.account') },
    { value: 'requests', types: ['NEW_PURCHASE_REQUEST', 'NEW_QUOTE_REQUEST', 'NEW_IMPORT_REQUEST', 'SUPPLIER_REQUEST_ASSIGNED'], label: t('notifications.categories.requests') },
    { value: 'quotes', types: ['QUOTE_PROCESSED', 'NEW_QUOTE_REQUEST'], label: t('notifications.categories.quotes') },
    { value: 'points', types: ['SEARCH_POINTS_ADDED'], label: t('notifications.categories.points') },
    { value: 'system', types: ['SYSTEM', 'GENERAL', 'MARKETING', 'ABANDONED_CART_ALERT', 'NEW_MESSAGE', 'IMPORT_UPDATE'], label: t('notifications.categories.system') },
  ];
  
  const getTypesForCategory = (category: string): NotificationType[] | undefined => {
    const filter = categoryFilters.find(f => f.value === category);
    return filter && filter.types.length > 0 ? (filter.types as NotificationType[]) : undefined;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS_CHANGED': return t('notifications.types.orderUpdate');
      case 'SEARCH_POINTS_ADDED': return t('notifications.types.searchPoints');
      case 'QUOTE_PROCESSED': return t('notifications.types.quote');
      case 'GENERAL': return t('notifications.types.general');
      case 'ACCOUNT_UPDATE': return t('notifications.types.accountUpdate');
      case 'IMPORT_UPDATE': return t('notifications.types.importUpdate');
      case 'SYSTEM': return t('notifications.types.system');
      case 'MARKETING': return t('notifications.types.marketing');
      case 'ACCOUNT_APPROVED': return t('notifications.types.accountApproved');
      case 'ACCOUNT_REJECTED': return t('notifications.types.accountRejected');
      case 'NEW_PURCHASE_REQUEST': return t('notifications.types.purchaseRequest');
      case 'NEW_MESSAGE': return t('notifications.types.newMessage');
      case 'NEW_CUSTOMER_REGISTERED': return t('notifications.types.newCustomer');
      case 'CUSTOMER_ORDER': return t('notifications.types.customerOrder');
      case 'SUPPLIER_REQUEST_ASSIGNED': return t('notifications.types.supplierRequest');
      case 'NEW_ACCOUNT_REQUEST': return t('notifications.types.accountRequest');
      case 'NEW_QUOTE_REQUEST': return t('notifications.types.quoteRequest');
      case 'NEW_IMPORT_REQUEST': return t('notifications.types.importRequest');
      case 'ABANDONED_CART_ALERT': return t('notifications.types.abandonedCart');
      default: return type;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notifications.time.justNow');
    if (diffMins < 60) return t('notifications.time.minAgo', { count: diffMins });
    if (diffHours < 24) return t('notifications.time.hrAgo', { count: diffHours });
    if (diffDays < 7) return t('notifications.time.dayAgo', { count: diffDays });
    
    return date.toLocaleDateString(i18n.language);
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const typesFilter = getTypesForCategory(selectedCategory);
      const result = await Api.getNotificationsForUser(user.id, {
        isRead: activeTab === 'unread' ? false : undefined,
        types: typesFilter,
        limit: pageSize,
        page
      });
      // استخدام normalizeListResponse لضمان items دائماً array
      const { items, total } = normalizeListResponse<Notification>(result);
      setNotifications(items);
      setUnreadCount(result.unreadCount ?? 0);
      setTotal(total);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeTab, selectedCategory, page]); // Removed redundant deps, kept simple

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await Api.markNotificationAsRead(user.id, notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await Api.markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await Api.deleteNotification(user.id, notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await Api.clearNotificationsForUser(user.id);
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={`p-4 md:p-6 space-y-4`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-xl">
            <Bell className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {t('notifications.title')}
            </h1>
            <p className="text-sm text-slate-500">
              {unreadCount} {t('notifications.unread')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={fetchNotifications}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            data-testid="button-refresh-notifications"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('notifications.refresh')}
          </button>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4" />
              {t('notifications.markAllRead')}
            </button>
          )}
          
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
              data-testid="button-clear-all"
            >
              <Trash2 className="h-4 w-4" />
              {t('notifications.clearAll')}
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'border-brand-600 text-brand-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          data-testid="tab-all"
        >
          {t('notifications.categories.all')}
          <span className="mx-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{total}</span>
        </button>
        <button
          onClick={() => { setActiveTab('unread'); setPage(1); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'unread' 
              ? 'border-brand-600 text-brand-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          data-testid="tab-unread"
        >
          {t('notifications.unread')}
          {unreadCount > 0 && (
            <span className="mx-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 py-3">
        <span className="text-sm font-medium text-slate-600">
          {t('notifications.filterByType')}:
        </span>
        {categoryFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setSelectedCategory(filter.value); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedCategory === filter.value
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            data-testid={`filter-type-${filter.value}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-slate-400" />
            <p className="mt-2 text-slate-500">
              {t('loading', 'Loading...')}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-600">
              {t('notifications.noNotifications')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {t('notifications.newUpdates')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div 
                  key={notification.id}
                  className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-brand-200 bg-brand-50/30' : 'border-slate-200'
                  }`}
                  data-testid={`notification-card-${notification.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg border shrink-0 ${colorClass}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-slate-800 ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-brand-600 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                        {notification.relatedType && notification.relatedId && (
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded">
                              {notification.relatedType}: {notification.relatedId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          title={t('notifications.markAllRead')}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        title={t('notifications.delete')}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-prev-page"
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {t('pagination.prev', 'Previous')}
                </button>
                <span className="text-sm text-slate-500 px-3">
                   {t('pagination.pageOf', { page, total: totalPages })}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-next-page"
                >
                  {t('pagination.next', 'Next')}
                  {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
