
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2, Clock, Trash2, X, Package, FileSpreadsheet, Search, AlertTriangle, Key, Info, Settings, Megaphone } from 'lucide-react';
import { Notification, User, MarketingCampaign } from '../types';
import { MockApi } from '../services/mockApi';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';

interface NotificationBellProps {
    user: User;
    customerType?: string;
}

// Extended notification type to include marketing campaigns
interface ExtendedNotification extends Notification {
    isCampaign?: boolean;
    campaignId?: string;
    ctaUrl?: string;
    ctaLabel?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ user, customerType }) => {
    const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { addToast } = useToast();

    // Poll for notifications every 30 seconds (simulating real-time)
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        
        // Listener for click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [user.id, customerType]);

    const loadNotifications = async () => {
        try {
            // Load regular notifications
            const regularNotifs = await MockApi.getNotificationsForUser(user.id);
            
            // Load BELL type marketing campaigns (getActiveCampaignsForUser already filters dismissed ones)
            const campaigns = await MockApi.getActiveCampaignsForUser(user.id, customerType);
            const bellCampaigns = campaigns.filter(c => c.displayType === 'BELL');
            
            // Get list of campaigns the user has "read" in the bell (stored locally per session)
            const readCampaignIds = JSON.parse(localStorage.getItem(`siniCar_bell_read_${user.id}`) || '[]');
            
            // Convert campaigns to notification format
            const campaignNotifs: ExtendedNotification[] = bellCampaigns.map(campaign => ({
                id: `campaign-${campaign.id}`,
                userId: user.id,
                type: 'MARKETING' as const,
                title: campaign.title,
                message: campaign.message,
                createdAt: campaign.createdAt,
                isRead: readCampaignIds.includes(campaign.id),
                isCampaign: true,
                campaignId: campaign.id,
                ctaUrl: campaign.ctaUrl,
                ctaLabel: campaign.ctaLabel
            }));
            
            // Combine and sort by newest
            const allNotifs: ExtendedNotification[] = [...regularNotifs, ...campaignNotifs];
            allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setNotifications(allNotifs);
            setUnreadCount(allNotifs.filter(n => !n.isRead).length);
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    };

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            try {
                // Mark regular notifications as read
                await MockApi.markNotificationsAsRead(user.id);
                
                // Mark campaign notifications as read in localStorage
                const unreadCampaignIds = notifications
                    .filter(n => n.isCampaign && !n.isRead && n.campaignId)
                    .map(n => n.campaignId!);
                
                if (unreadCampaignIds.length > 0) {
                    const readCampaignIds = JSON.parse(localStorage.getItem(`siniCar_bell_read_${user.id}`) || '[]');
                    const newReadIds = [...new Set([...readCampaignIds, ...unreadCampaignIds])];
                    localStorage.setItem(`siniCar_bell_read_${user.id}`, JSON.stringify(newReadIds));
                }
                
                // Locally update read status to avoid refetch lag
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            } catch (e) {
                console.error("Failed to mark read");
            }
        }
    };

    const handleClearAll = async () => {
        try {
            await MockApi.clearNotificationsForUser(user.id);
            setNotifications([]);
            setUnreadCount(0);
            addToast('تم حذف جميع التنبيهات', 'success');
        } catch (e) {
            console.error("Failed to clear notifications", e);
            addToast('حدث خطأ في حذف التنبيهات', 'error');
        }
    };

    const handleDeleteOne = async (notifId: string) => {
        try {
            await MockApi.deleteNotification(user.id, notifId);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
            addToast('تم حذف التنبيه', 'success');
        } catch (e) {
            console.error("Failed to delete notification", e);
        }
    };

    const handleDismissCampaign = async (campaignId: string, notifId: string) => {
        try {
            await MockApi.dismissCampaignForUser(user.id, campaignId);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
            addToast('تم إخفاء الإشعار', 'success');
        } catch (e) {
            console.error("Failed to dismiss campaign", e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS_CHANGED':
                return <Package size={16} className="text-blue-500" />;
            case 'SEARCH_POINTS_ADDED':
                return <Search size={16} className="text-green-500" />;
            case 'QUOTE_PROCESSED':
                return <FileSpreadsheet size={16} className="text-purple-500" />;
            case 'SYSTEM':
                return <Key size={16} className="text-amber-500" />;
            case 'ACCOUNT_UPDATE':
                return <Settings size={16} className="text-slate-500" />;
            case 'IMPORT_UPDATE':
                return <Package size={16} className="text-orange-500" />;
            case 'GENERAL':
                return <Info size={16} className="text-blue-400" />;
            case 'MARKETING':
                return <Megaphone size={16} className="text-pink-500" />;
            default:
                return <Bell size={16} className="text-slate-400" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS_CHANGED':
                return 'bg-blue-50 border-blue-100';
            case 'SEARCH_POINTS_ADDED':
                return 'bg-green-50 border-green-100';
            case 'QUOTE_PROCESSED':
                return 'bg-purple-50 border-purple-100';
            case 'SYSTEM':
                return 'bg-amber-50 border-amber-100';
            case 'ACCOUNT_UPDATE':
                return 'bg-slate-50 border-slate-200';
            case 'IMPORT_UPDATE':
                return 'bg-orange-50 border-orange-100';
            case 'MARKETING':
                return 'bg-pink-50 border-pink-100';
            default:
                return 'bg-white border-slate-100';
        }
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        return formatDateTime(dateStr).split('-')[1];
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={handleOpen}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                title="التنبيهات"
                data-testid="button-notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 md:w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up origin-top-left">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-brand-600" />
                            <h3 className="font-bold text-slate-800 text-sm">مركز التنبيهات</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {notifications.length > 0 && (
                                <button 
                                    onClick={handleClearAll}
                                    className="text-[10px] text-red-500 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    data-testid="button-clear-all-notifications"
                                >
                                    مسح الكل
                                </button>
                            )}
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">
                                {notifications.length}
                            </span>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 group ${
                                            notif.isCampaign ? 'bg-gradient-to-l from-pink-50/50 to-transparent' : 
                                            !notif.isRead ? 'bg-blue-50/30' : ''
                                        }`}
                                        data-testid={`notification-item-${notif.id}`}
                                    >
                                        <div className={`mt-0.5 p-2 rounded-full border shadow-sm shrink-0 h-fit ${getIconBg(notif.type)}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">{notif.title}</h4>
                                                    {notif.isCampaign && (
                                                        <span className="text-[9px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-bold">
                                                            عرض
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                        {formatRelativeTime(notif.createdAt)}
                                                    </span>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if (notif.isCampaign && notif.campaignId) {
                                                                handleDismissCampaign(notif.campaignId, notif.id);
                                                            } else {
                                                                handleDeleteOne(notif.id);
                                                            }
                                                        }}
                                                        className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-50"
                                                        title="حذف"
                                                        data-testid={`button-delete-notification-${notif.id}`}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {notif.message}
                                            </p>
                                            {/* CTA Button for campaigns */}
                                            {notif.isCampaign && notif.ctaUrl && notif.ctaLabel && (
                                                <a 
                                                    href={notif.ctaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-[11px] bg-pink-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-pink-600 transition-colors"
                                                    data-testid={`button-cta-${notif.id}`}
                                                >
                                                    {notif.ctaLabel}
                                                </a>
                                            )}
                                            {!notif.isRead && !notif.isCampaign && (
                                                <span className="inline-block mt-1.5 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                                    جديد
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 px-6 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell size={28} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-600 mb-1">لا توجد تنبيهات</p>
                                <p className="text-xs text-slate-400">ستظهر هنا جميع التحديثات الجديدة</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 5 && (
                        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                            <span className="text-xs text-slate-500">
                                عرض آخر {Math.min(notifications.length, 20)} تنبيه
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
