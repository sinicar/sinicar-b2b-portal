import { useState, useEffect, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Clock, Trash2, RefreshCw, User, Package, FileText, CreditCard, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { MockApi } from '../services/mockApi';
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

const getTypeLabel = (type: NotificationType, isRTL: boolean): string => {
  const labels: Record<string, { ar: string; en: string }> = {
    'ORDER_STATUS_CHANGED': { ar: 'تحديث الطلب', en: 'Order Update' },
    'SEARCH_POINTS_ADDED': { ar: 'نقاط البحث', en: 'Search Points' },
    'QUOTE_PROCESSED': { ar: 'عرض سعر', en: 'Quote' },
    'GENERAL': { ar: 'عام', en: 'General' },
    'ACCOUNT_UPDATE': { ar: 'تحديث الحساب', en: 'Account Update' },
    'IMPORT_UPDATE': { ar: 'تحديث الاستيراد', en: 'Import Update' },
    'SYSTEM': { ar: 'النظام', en: 'System' },
    'MARKETING': { ar: 'تسويق', en: 'Marketing' },
    'ACCOUNT_APPROVED': { ar: 'اعتماد الحساب', en: 'Account Approved' },
    'ACCOUNT_REJECTED': { ar: 'رفض الحساب', en: 'Account Rejected' },
    'NEW_PURCHASE_REQUEST': { ar: 'طلب شراء', en: 'Purchase Request' },
    'NEW_MESSAGE': { ar: 'رسالة جديدة', en: 'New Message' },
    'NEW_CUSTOMER_REGISTERED': { ar: 'عميل جديد', en: 'New Customer' },
    'CUSTOMER_ORDER': { ar: 'طلب عميل', en: 'Customer Order' },
    'SUPPLIER_REQUEST_ASSIGNED': { ar: 'طلب مورد', en: 'Supplier Request' },
    'NEW_ACCOUNT_REQUEST': { ar: 'طلب حساب', en: 'Account Request' },
    'NEW_QUOTE_REQUEST': { ar: 'طلب عرض سعر', en: 'Quote Request' },
    'NEW_IMPORT_REQUEST': { ar: 'طلب استيراد', en: 'Import Request' },
    'ABANDONED_CART_ALERT': { ar: 'سلة متروكة', en: 'Abandoned Cart' }
  };
  return labels[type]?.[isRTL ? 'ar' : 'en'] || type;
};

const formatRelativeTime = (dateString: string, isRTL: boolean): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (isRTL) {
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
  } else {
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
  }
  return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
};

export const NotificationsPage: FC<NotificationsPageProps> = ({ user, onBack }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  const categoryFilters: Array<{ value: string; types: NotificationType[]; ar: string; en: string }> = [
    { value: 'all', types: [], ar: 'الكل', en: 'All' },
    { value: 'orders', types: ['ORDER_STATUS_CHANGED', 'CUSTOMER_ORDER'], ar: 'الطلبات', en: 'Orders' },
    { value: 'account', types: ['ACCOUNT_APPROVED', 'ACCOUNT_REJECTED', 'ACCOUNT_UPDATE', 'NEW_ACCOUNT_REQUEST', 'NEW_CUSTOMER_REGISTERED'], ar: 'الحساب', en: 'Account' },
    { value: 'requests', types: ['NEW_PURCHASE_REQUEST', 'NEW_QUOTE_REQUEST', 'NEW_IMPORT_REQUEST', 'SUPPLIER_REQUEST_ASSIGNED'], ar: 'طلبات الشراء', en: 'Requests' },
    { value: 'quotes', types: ['QUOTE_PROCESSED', 'NEW_QUOTE_REQUEST'], ar: 'عروض الأسعار', en: 'Quotes' },
    { value: 'points', types: ['SEARCH_POINTS_ADDED'], ar: 'النقاط', en: 'Points' },
    { value: 'system', types: ['SYSTEM', 'GENERAL', 'MARKETING', 'ABANDONED_CART_ALERT', 'NEW_MESSAGE', 'IMPORT_UPDATE'], ar: 'النظام', en: 'System' },
  ];
  
  const getTypesForCategory = (category: string): NotificationType[] | undefined => {
    const filter = categoryFilters.find(f => f.value === category);
    return filter && filter.types.length > 0 ? filter.types : undefined;
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const typesFilter = getTypesForCategory(selectedCategory);
      const result = await MockApi.getNotificationsForUser(user.id, {
        isRead: activeTab === 'unread' ? false : undefined,
        types: typesFilter,
        limit: pageSize,
        page
      });
      setNotifications(result.items);
      setUnreadCount(result.unreadCount);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeTab, selectedCategory, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await MockApi.markNotificationAsRead(user.id, notificationId);
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
      await MockApi.markAllNotificationsAsRead(user.id);
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
      await MockApi.deleteNotification(user.id, notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await MockApi.clearNotificationsForUser(user.id);
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
    <div className={`p-4 md:p-6 space-y-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-xl">
            <Bell className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </h1>
            <p className="text-sm text-slate-500">
              {isRTL 
                ? `${unreadCount} إشعار غير مقروء من ${total}`
                : `${unreadCount} unread of ${total} total`
              }
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
            {isRTL ? 'تحديث' : 'Refresh'}
          </button>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4" />
              {isRTL ? 'تعيين الكل كمقروء' : 'Mark all read'}
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
              {isRTL ? 'مسح الكل' : 'Clear all'}
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
          {isRTL ? 'الكل' : 'All'}
          <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{total}</span>
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
          {isRTL ? 'غير مقروء' : 'Unread'}
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 py-3">
        <span className="text-sm font-medium text-slate-600">
          {isRTL ? 'تصفية حسب النوع:' : 'Filter by type:'}
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
            {isRTL ? filter.ar : filter.en}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-slate-400" />
            <p className="mt-2 text-slate-500">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-600">
              {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {isRTL 
                ? 'ستظهر هنا الإشعارات الجديدة'
                : 'New notifications will appear here'
              }
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
                          {getTypeLabel(notification.type, isRTL)}
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
                          {formatRelativeTime(notification.createdAt, isRTL)}
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
                          title={isRTL ? 'تعيين كمقروء' : 'Mark as read'}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        title={isRTL ? 'حذف' : 'Delete'}
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
                  <ChevronRight className="h-4 w-4" />
                  {isRTL ? 'السابق' : 'Previous'}
                </button>
                <span className="text-sm text-slate-500 px-3">
                  {isRTL 
                    ? `صفحة ${page} من ${totalPages}`
                    : `Page ${page} of ${totalPages}`
                  }
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-next-page"
                >
                  {isRTL ? 'التالي' : 'Next'}
                  <ChevronLeft className="h-4 w-4" />
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
