
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { Notification, User } from '../types';
import { MockApi } from '../services/mockApi';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';

interface NotificationBellProps {
    user: User;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ user }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
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
    }, [user.id]);

    const loadNotifications = async () => {
        try {
            const list = await MockApi.getNotificationsForUser(user.id);
            // Sort by newest
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.isRead).length);
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    };

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            try {
                await MockApi.markNotificationsAsRead(user.id);
                // Locally update read status to avoid refetch lag
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            } catch (e) {
                console.error("Failed to mark read");
            }
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS_CHANGED':
                return <CheckCircle2 size={16} className="text-blue-500" />;
            case 'SEARCH_POINTS_ADDED':
                return <CheckCircle2 size={16} className="text-green-500" />;
            default:
                return <CheckCircle2 size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={handleOpen}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                title="التنبيهات"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up origin-top-left">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm">التنبيهات</h3>
                        <span className="text-xs text-slate-500">{notifications.length} تنبيه</span>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3">
                                        <div className="mt-1 bg-white p-2 rounded-full border border-slate-100 shadow-sm shrink-0 h-fit">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                                                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                                                    {formatDateTime(notif.createdAt).split('-')[1]}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-400">
                                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-bold">لا توجد تنبيهات جديدة</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
