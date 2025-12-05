import { useState, useEffect, memo } from 'react';
import { X, ExternalLink, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { MarketingCampaign } from '../types';
import { MockApi } from '../services/mockApi';
import { useLanguage } from '../services/LanguageContext';

interface MarketingBannerProps {
    userId: string;
    customerType?: string;
}

export const MarketingBanner = memo(({ userId, customerType }: MarketingBannerProps) => {
    const { t, isRTL } = useLanguage();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadCampaigns = async () => {
            const activeCampaigns = await MockApi.getActiveCampaignsForUser(userId, customerType);
            const bannerCampaigns = activeCampaigns
                .filter(c => c.displayType === 'BANNER')
                .sort((a, b) => b.priority - a.priority);
            setCampaigns(bannerCampaigns);
        };
        loadCampaigns();
    }, [userId, customerType]);

    const handleDismiss = async (campaignId: string) => {
        await MockApi.dismissCampaignForUser(userId, campaignId);
        setDismissed(prev => new Set([...prev, campaignId]));
    };

    const visibleCampaigns = campaigns.filter(c => !dismissed.has(c.id));

    if (visibleCampaigns.length === 0) return null;

    const currentCampaign = visibleCampaigns[currentIndex % visibleCampaigns.length];
    if (!currentCampaign) return null;

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % visibleCampaigns.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + visibleCampaigns.length) % visibleCampaigns.length);
    };

    return (
        <div 
            className="relative bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 text-white px-4 py-3 shadow-md"
            data-testid="marketing-banner"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Megaphone size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" data-testid="text-campaign-title">
                            {currentCampaign.title}
                        </p>
                        <p className="text-xs text-white/80 truncate" data-testid="text-campaign-message">
                            {currentCampaign.message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {currentCampaign.ctaUrl && currentCampaign.ctaLabel && (
                        <a
                            href={currentCampaign.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white text-brand-600 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-1"
                            data-testid="link-campaign-cta"
                        >
                            {currentCampaign.ctaLabel}
                            <ExternalLink size={12} />
                        </a>
                    )}
                    
                    {visibleCampaigns.length > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrev}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                data-testid="button-banner-prev"
                            >
                                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>
                            <span className="text-xs text-white/70 min-w-[2rem] text-center">
                                {currentIndex + 1}/{visibleCampaigns.length}
                            </span>
                            <button
                                onClick={handleNext}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                data-testid="button-banner-next"
                            >
                                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                        </div>
                    )}
                    
                    {currentCampaign.skippable && (
                        <button
                            onClick={() => handleDismiss(currentCampaign.id)}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title={t('marketing.dismiss', 'إخفاء')}
                            data-testid="button-dismiss-banner"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

interface MarketingPopupProps {
    userId: string;
    customerType?: string;
    onClose?: () => void;
}

export const MarketingPopup = memo(({ userId, customerType, onClose }: MarketingPopupProps) => {
    const { t, isRTL } = useLanguage();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const loadCampaigns = async () => {
            const activeCampaigns = await MockApi.getActiveCampaignsForUser(userId, customerType);
            const popupCampaigns = activeCampaigns
                .filter(c => c.displayType === 'POPUP')
                .sort((a, b) => b.priority - a.priority);
            
            if (popupCampaigns.length > 0) {
                setCampaigns(popupCampaigns);
                setTimeout(() => setIsVisible(true), 500);
            }
        };
        loadCampaigns();
    }, [userId, customerType]);

    const handleDismiss = async () => {
        const currentCampaign = campaigns[currentIndex];
        if (currentCampaign) {
            await MockApi.dismissCampaignForUser(userId, currentCampaign.id);
        }
        
        if (currentIndex < campaigns.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsVisible(false);
            setTimeout(() => {
                onClose?.();
            }, 300);
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
        campaigns.forEach(c => {
            MockApi.dismissCampaignForUser(userId, c.id);
        });
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    if (campaigns.length === 0 || !isVisible) return null;

    const currentCampaign = campaigns[currentIndex];
    if (!currentCampaign) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            data-testid="marketing-popup"
        >
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={currentCampaign.skippable ? handleSkip : undefined}
            />
            
            <div 
                className={`relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ${
                    isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Megaphone size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white" data-testid="text-popup-title">
                                    {currentCampaign.title}
                                </h3>
                                {campaigns.length > 1 && (
                                    <p className="text-xs text-white/70">
                                        {t('marketing.campaignOf', 'الحملة {{current}} من {{total}}')
                                            .replace('{{current}}', String(currentIndex + 1))
                                            .replace('{{total}}', String(campaigns.length))}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {currentCampaign.skippable && (
                            <button
                                onClick={handleSkip}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
                                data-testid="button-close-popup"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="p-6">
                    {currentCampaign.contentType === 'IMAGE' && currentCampaign.mediaUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden">
                            <img 
                                src={currentCampaign.mediaUrl} 
                                alt={currentCampaign.title}
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}
                    
                    {currentCampaign.contentType === 'VIDEO' && currentCampaign.mediaUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden">
                            <video 
                                src={currentCampaign.mediaUrl}
                                controls
                                className="w-full"
                            />
                        </div>
                    )}
                    
                    {currentCampaign.contentType === 'HTML' && currentCampaign.htmlContent && (
                        <div 
                            className="mb-4 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: currentCampaign.htmlContent }}
                        />
                    )}
                    
                    <p className="text-slate-600 text-sm leading-relaxed" data-testid="text-popup-message">
                        {currentCampaign.message}
                    </p>
                </div>
                
                <div className="px-6 pb-6 flex items-center justify-between gap-3">
                    {currentCampaign.ctaUrl && currentCampaign.ctaLabel && (
                        <a
                            href={currentCampaign.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold text-center hover:shadow-lg hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
                            data-testid="link-popup-cta"
                        >
                            {currentCampaign.ctaLabel}
                            <ExternalLink size={16} />
                        </a>
                    )}
                    
                    <button
                        onClick={handleDismiss}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                            currentCampaign.ctaUrl 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'flex-1 bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-lg'
                        }`}
                        data-testid="button-dismiss-popup"
                    >
                        {currentIndex < campaigns.length - 1 
                            ? t('marketing.next', 'التالي')
                            : t('marketing.understood', 'فهمت')}
                    </button>
                </div>
            </div>
        </div>
    );
});

interface MarketingDashboardCardProps {
    userId: string;
    customerType?: string;
}

export const MarketingDashboardCard = memo(({ userId, customerType }: MarketingDashboardCardProps) => {
    const { t, isRTL } = useLanguage();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadCampaigns = async () => {
            const activeCampaigns = await MockApi.getActiveCampaignsForUser(userId, customerType);
            const cardCampaigns = activeCampaigns
                .filter(c => c.displayType === 'DASHBOARD_CARD')
                .sort((a, b) => b.priority - a.priority);
            setCampaigns(cardCampaigns);
        };
        loadCampaigns();
    }, [userId, customerType]);

    const handleDismiss = async (campaignId: string) => {
        await MockApi.dismissCampaignForUser(userId, campaignId);
        setDismissed(prev => new Set([...prev, campaignId]));
    };

    const visibleCampaigns = campaigns.filter(c => !dismissed.has(c.id));

    if (visibleCampaigns.length === 0) return null;

    return (
        <div className="space-y-4" data-testid="marketing-dashboard-cards">
            {visibleCampaigns.slice(0, 3).map(campaign => (
                <div 
                    key={campaign.id}
                    className="bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200 rounded-2xl p-4 relative"
                    data-testid={`card-campaign-${campaign.id}`}
                >
                    {campaign.skippable && (
                        <button
                            onClick={() => handleDismiss(campaign.id)}
                            className="absolute top-2 left-2 p-1 hover:bg-white/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            data-testid={`button-dismiss-card-${campaign.id}`}
                        >
                            <X size={14} />
                        </button>
                    )}
                    
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Megaphone size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">
                                {campaign.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2">
                                {campaign.message}
                            </p>
                            {campaign.ctaUrl && campaign.ctaLabel && (
                                <a
                                    href={campaign.ctaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-brand-600 hover:text-brand-700"
                                >
                                    {campaign.ctaLabel}
                                    <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});
