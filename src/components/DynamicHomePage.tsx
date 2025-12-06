import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  FileText, 
  Package, 
  Truck, 
  Settings, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Wrench,
  FileSearch,
  Globe,
  Shield,
  Sparkles,
  Star,
  CheckCircle,
  Zap,
  MessageSquare,
  Phone,
  HelpCircle,
  Car,
  ShoppingBag,
  Users,
  BarChart3,
  ClipboardList,
  RefreshCw,
  ExternalLink,
  Headphones
} from 'lucide-react';
import { MockApi } from '../services/mockApi';
import { 
  HomepageConfig, 
  HomepageStats, 
  HomepageCustomerType,
  MultilingualText,
  User,
  BusinessProfile
} from '../types';

interface DynamicHomePageProps {
  user: User;
  profile?: BusinessProfile;
  onNavigate: (view: string) => void;
  isRTL: boolean;
}

const getTextByLang = (text: MultilingualText | undefined, lang: string): string => {
  if (!text) return '';
  const langKey = lang.split('-')[0] as keyof MultilingualText;
  return text[langKey] || text.ar || text.en || '';
};

const getShortcutIcon = (iconName: string) => {
  const iconMap: Record<string, JSX.Element> = {
    'search': <Search className="w-6 h-6" />,
    'file-text': <FileText className="w-6 h-6" />,
    'package': <Package className="w-6 h-6" />,
    'truck': <Truck className="w-6 h-6" />,
    'settings': <Settings className="w-6 h-6" />,
    'trending-up': <TrendingUp className="w-6 h-6" />,
    'wrench': <Wrench className="w-6 h-6" />,
    'file-search': <FileSearch className="w-6 h-6" />,
    'globe': <Globe className="w-6 h-6" />,
    'shield': <Shield className="w-6 h-6" />,
    'star': <Star className="w-6 h-6" />,
    'check-circle': <CheckCircle className="w-6 h-6" />,
    'zap': <Zap className="w-6 h-6" />,
    'message-square': <MessageSquare className="w-6 h-6" />,
    'phone': <Phone className="w-6 h-6" />,
    'help-circle': <HelpCircle className="w-6 h-6" />,
    'car': <Car className="w-6 h-6" />,
    'shopping-bag': <ShoppingBag className="w-6 h-6" />,
    'users': <Users className="w-6 h-6" />,
    'bar-chart': <BarChart3 className="w-6 h-6" />,
    'clipboard-list': <ClipboardList className="w-6 h-6" />,
    'refresh-cw': <RefreshCw className="w-6 h-6" />
  };
  return iconMap[iconName] || <Package className="w-6 h-6" />;
};

export const DynamicHomePage: React.FC<DynamicHomePageProps> = ({
  user,
  profile,
  onNavigate,
  isRTL
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerTransitioning, setBannerTransitioning] = useState(false);

  const mapProfileToHomepageType = (profile?: BusinessProfile): HomepageCustomerType => {
    if (!profile?.businessCustomerType) return 'DEFAULT';
    switch (profile.businessCustomerType) {
      case 'PARTS_SHOP': return 'PARTS_SHOP';
      case 'RENTAL_COMPANY': return 'RENTAL';
      case 'INSURANCE_COMPANY': return 'INSURANCE';
      case 'SALES_AGENT': return 'MARKETER';
      case 'FLEET_CUSTOMER': return 'RENTAL';
      default: return 'DEFAULT';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const customerType = mapProfileToHomepageType(profile);
        const [configData, statsData] = await Promise.all([
          MockApi.getHomepageConfig(customerType),
          MockApi.getHomepageStats(user.id)
        ]);
        setConfig(configData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user.id, profile]);

  const activeBanners = config?.bannersConfig.banners.filter(b => b.isActive) || [];

  const nextBanner = useCallback(() => {
    if (activeBanners.length > 1 && !bannerTransitioning) {
      setBannerTransitioning(true);
      setTimeout(() => {
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
        setBannerTransitioning(false);
      }, 300);
    }
  }, [activeBanners.length, bannerTransitioning]);

  const prevBanner = useCallback(() => {
    if (activeBanners.length > 1 && !bannerTransitioning) {
      setBannerTransitioning(true);
      setTimeout(() => {
        setCurrentBannerIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
        setBannerTransitioning(false);
      }, 300);
    }
  }, [activeBanners.length, bannerTransitioning]);

  useEffect(() => {
    if (!config?.bannersConfig.autoPlayInterval || activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      nextBanner();
    }, config.bannersConfig.autoPlayInterval);

    return () => clearInterval(interval);
  }, [config?.bannersConfig.autoPlayInterval, activeBanners.length, nextBanner]);

  const handleCtaClick = (link: string) => {
    if (!link) return;
    
    // Handle external URLs (open in new tab)
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Handle internal navigation views
    const validViews = [
      'HOME', 'PRODUCT_SEARCH', 'ORDERS', 'QUOTE_REQUEST', 'IMPORT_CHINA',
      'TRADER_TOOLS', 'ALTERNATIVES', 'ORGANIZATION', 'TEAM_MANAGEMENT',
      'ABOUT', 'NOTIFICATIONS', 'HISTORY'
    ];
    
    if (validViews.includes(link)) {
      onNavigate(link);
    } else {
      // Default to product search for unknown links
      onNavigate('PRODUCT_SEARCH');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">{t('common.error')}</p>
      </div>
    );
  }

  const { layoutConfig, bannersConfig, shortcutsConfig } = config;
  const shortcuts = shortcutsConfig?.shortcuts || [];

  return (
    <div className="flex flex-col gap-8 pb-8 animate-fade-in">
      {/* Hero Section */}
      <section
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ 
          background: layoutConfig.heroBackgroundGradient || 'linear-gradient(135deg, #081a33 0%, #102b57 100%)'
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Welcome badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">
                {t('homepage.welcomeBack', { name: user.name })}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              {getTextByLang(layoutConfig.heroTitle, lang)}
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8">
              {getTextByLang(layoutConfig.heroSubtitle, lang)}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {layoutConfig.primaryCtaLink && (
                <button
                  onClick={() => handleCtaClick(layoutConfig.primaryCtaLink!)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 font-bold transition-all hover:scale-105 active:scale-95"
                  data-testid="button-primary-cta"
                >
                  <Search className="w-5 h-5" />
                  {getTextByLang(layoutConfig.primaryCtaLabel, lang)}
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              )}
              
              {layoutConfig.secondaryCtaLink && (
                <button
                  onClick={() => handleCtaClick(layoutConfig.secondaryCtaLink!)}
                  className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-xl backdrop-blur-sm font-bold transition-all hover:scale-105 active:scale-95"
                  data-testid="button-secondary-cta"
                >
                  <FileText className="w-5 h-5" />
                  {getTextByLang(layoutConfig.secondaryCtaLabel, lang)}
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="flex justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalOrders}</div>
                <div className="text-slate-300 text-sm">{t('homepage.totalOrders')}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stats.pendingRequests}</div>
                <div className="text-slate-300 text-sm">{t('homepage.pendingRequests')}</div>
              </div>
              <div className="w-px bg-white/20 hidden md:block" />
              <div className="text-center hidden md:block">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400">{stats.approvedOrders}</div>
                <div className="text-slate-300 text-sm">{t('homepage.approvedOrders')}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Banner Carousel */}
      {activeBanners.length > 0 && (
        <section className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
            {/* Current Banner */}
            <div
              className={`absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-300 ${
                bannerTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ background: activeBanners[currentBannerIndex]?.backgroundColor }}
            >
              <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16">
                <div className="max-w-lg">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {getTextByLang(activeBanners[currentBannerIndex]?.title, lang)}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base mb-4">
                    {getTextByLang(activeBanners[currentBannerIndex]?.subtitle, lang)}
                  </p>
                  <button
                    onClick={() => handleCtaClick(activeBanners[currentBannerIndex]?.ctaLink || 'HOME')}
                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                      activeBanners[currentBannerIndex]?.ctaVariant === 'outline' 
                        ? 'border-2 border-white/50 text-white hover:bg-white/10' 
                        : 'bg-white text-slate-900 hover:bg-white/90'
                    }`}
                    data-testid={`button-banner-cta-${currentBannerIndex}`}
                  >
                    {getTextByLang(activeBanners[currentBannerIndex]?.ctaLabel, lang)}
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Package className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all`}
                  data-testid="button-banner-prev"
                >
                  {isRTL ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={nextBanner}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all`}
                  data-testid="button-banner-next"
                >
                  {isRTL ? <ChevronLeft className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
                </button>
              </>
            )}

            {/* Dots indicator */}
            {activeBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!bannerTransitioning) {
                        setBannerTransitioning(true);
                        setTimeout(() => {
                          setCurrentBannerIndex(idx);
                          setBannerTransitioning(false);
                        }, 300);
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                    }`}
                    data-testid={`button-banner-dot-${idx}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Action Shortcuts */}
      {shortcuts && shortcuts.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
            {t('homepage.quickActions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shortcuts.map((shortcut, idx) => (
              <button
                key={shortcut.id}
                onClick={() => handleCtaClick(shortcut.link)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:-translate-y-1"
                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                data-testid={`button-shortcut-${shortcut.id}`}
              >
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${shortcut.colorClass || 'bg-blue-600'} text-white`}
                >
                  {getShortcutIcon(shortcut.icon)}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base mb-1">
                  {getTextByLang(shortcut.title, lang)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm line-clamp-2">
                  {getTextByLang(shortcut.description, lang)}
                </p>
                <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Feature Cards */}
      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('homepage.fastShipping')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{t('homepage.fastShippingDesc')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('homepage.qualityGuarantee')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{t('homepage.qualityGuaranteeDesc')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('homepage.support')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{t('homepage.supportDesc')}</p>
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('homepage.needHelp')}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{t('homepage.needHelpDesc')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+966123456789" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              data-testid="link-call-support"
            >
              <Phone className="w-5 h-5" />
              {t('homepage.callUs')}
            </a>
            <a 
              href="https://wa.me/966123456789" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              data-testid="link-whatsapp"
            >
              <MessageSquare className="w-5 h-5" />
              {t('homepage.whatsapp')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
