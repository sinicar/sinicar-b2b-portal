import React, { memo, useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import Api from '../../services/api';

export interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number | string | boolean;
}

export const SidebarItem = memo(({ icon, label, active, onClick, badge }: SidebarItemProps) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1.5 transition-all ${
            active 
            ? 'bg-brand-800 text-white font-bold shadow-md' 
            : 'text-brand-100 hover:bg-brand-800/50 hover:text-white font-medium'
        }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm md:text-[15px]">{label}</span>
        </div>
        {badge ? (
            <span className="bg-action-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                {badge === true ? '!' : badge}
            </span>
        ) : null}
    </button>
));

export const MarketingCard = memo(({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-[15px] mb-1.5">{title}</h4>
            <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
));

export interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    colorClass?: string;
    onClick?: () => void;
}

export const InfoCard = memo(({ icon, title, desc, colorClass = "bg-slate-50 text-brand-600", onClick }: InfoCardProps) => (
    <div 
        onClick={onClick}
        className={`bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-3 sm:gap-4 transition-all duration-300 group h-full ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-brand-300 hover:-translate-y-1' : 'hover:shadow-md'}`}
    >
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <h4 className={`font-bold text-slate-800 text-base sm:text-lg mb-1.5 sm:mb-2 transition-colors ${onClick ? 'group-hover:text-brand-700' : ''}`}>{title}</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
));

export interface BusinessTypeCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    colorClass: string;
    iconBgClass: string;
}

export const BusinessTypeCard = memo(({ icon, title, desc, colorClass, iconBgClass }: BusinessTypeCardProps) => (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 ${iconBgClass} opacity-10 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150`}></div>
        <div className="relative z-10">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all duration-300 group-hover:scale-105 ${colorClass}`}>
                {icon}
            </div>
            <h4 className="font-bold text-slate-800 text-base sm:text-lg mb-2 group-hover:text-brand-700 transition-colors">{title}</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
));

export const ClientTicker = memo(() => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        Api.getSettings().then(setSettings);
    }, []);

    if (!settings || !settings.tickerEnabled) return null;

    const duration = 40 - ((settings.tickerSpeed || 5) - 1) * 3; 

    return (
        <div style={{ backgroundColor: settings.tickerBgColor || '#0f172a' }} className="w-full overflow-hidden py-3 relative z-50 shadow-sm border-b border-white/10">
             <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .ticker-content {
                    white-space: nowrap;
                    display: inline-block;
                    animation: marquee ${duration}s linear infinite;
                    min-width: 100%;
                }
                .ticker-content:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="ticker-content px-4">
                <span style={{ color: settings.tickerTextColor || '#f97316' }} className="font-bold text-sm md:text-base mx-4">
                    {settings.tickerText}
                </span>
            </div>
        </div>
    );
});
