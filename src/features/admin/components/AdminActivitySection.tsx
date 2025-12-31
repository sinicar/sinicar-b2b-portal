import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, Activity, Bell, ExternalLink } from 'lucide-react';
import { formatDateTime } from '../../../utils/dateUtils';
import type { Notification } from '../../../types';

// ============================================================================
// AdminActivitySection (COPY ONLY - Step E1)
// Source: AdminDashboard.tsx lines 617-675 (Bottom Grid: Insights & Alerts)
// NOTE: Not wired yet. This is the exact JSX/CSS copied from AdminDashboard.
// ============================================================================

// --- Helper Component (copied from AdminDashboard.tsx lines 896-904) ---
const ActivityCard = ({ label, value, color }: { label: string; value: number; color: 'blue' | 'emerald' | 'amber' | 'slate' }) => {
    const colors: Record<string, string> = { 
        blue: 'bg-blue-50 text-blue-700', 
        emerald: 'bg-emerald-50 text-emerald-700', 
        amber: 'bg-amber-50 text-amber-700', 
        slate: 'bg-slate-100 text-slate-700' 
    };
    return (
        <div className={`p-4 rounded-xl ${colors[color]} text-center`}>
            <p className="text-2xl font-black mb-1">{value}</p>
            <p className="text-xs font-bold opacity-70">{label}</p>
        </div>
    );
};

// --- Props Types ---
export interface AdminActivitySectionProps {
    /** Top missing search terms: [term, count][] */
    insights: {
        topMissing: [string, number][];
    };
    /** Activity summary counts for today */
    activitySummary: {
        logins: number;
        orders: number;
        quotes: number;
        searches: number;
    };
    /** Recent notifications */
    notifications: Notification[];
    /** View setter for navigation */
    setView: (view: string) => void;
}

export function AdminActivitySection({ 
    insights, 
    activitySummary, 
    notifications, 
    setView 
}: AdminActivitySectionProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Insights - Top Missing Parts */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <SearchX size={20} className="text-red-500" /> {t('adminDashboard.charts.topMissingParts')}
                </h3>
                <div className="space-y-4">
                    {insights.topMissing.length > 0 ? insights.topMissing.map(([term, count], i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                                <span className="font-bold text-slate-700">{term}</span>
                            </div>
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">{count} {t('common.search')}</span>
                        </div>
                    )) : (
                        <p className="text-center text-slate-400 py-8">{t('common.noData')}</p>
                    )}
                </div>
                <button onClick={() => setView('MISSING')} className="w-full mt-4 text-center text-sm font-bold text-brand-600 hover:text-brand-700 py-2">{t('common.view')} {t('adminDashboard.missingParts')}</button>
            </div>

            {/* Activity Summary */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" /> {t('adminDashboard.activityLog')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <ActivityCard label={t('adminDashboard.activity.logins')} value={activitySummary.logins} color="blue" />
                    <ActivityCard label={t('adminDashboard.activity.ordersCreated')} value={activitySummary.orders} color="emerald" />
                    <ActivityCard label={t('adminDashboard.activity.quotesRequested')} value={activitySummary.quotes} color="amber" />
                    <ActivityCard label={t('adminDashboard.activity.searchesPerformed')} value={activitySummary.searches} color="slate" />
                </div>
                <button onClick={() => setView('ACTIVITY_LOGS')} className="w-full mt-6 bg-slate-50 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> {t('common.view')} {t('adminDashboard.activityLog')}
                </button>
            </div>

            {/* Latest Alerts / Notifications */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-slate-400" /> {t('nav.notifications')}
                </h3>
                <div className="space-y-4">
                    {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                            <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{n.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">{formatDateTime(n.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <p className="text-center text-slate-400 py-8">{t('notifications.noNotifications')}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminActivitySection;
