import { useState, useEffect, type ReactNode } from 'react';
import { 
  FileSpreadsheet, Car, BarChart3, Wrench, Lock, Clock, CheckCircle, 
  AlertTriangle, FileText, Upload, Download, Loader2, X, Info,
  Settings2, ChevronRight, Image as ImageIcon, Table, Scale
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { toolsAccessService, ToolAccessResult, AllToolsAccessResult } from '../services/toolsAccess';
import { User, BusinessProfile, ToolKey, ToolConfig } from '../types';
import { PdfToExcelTool } from './PdfToExcelTool';
import { VinExtractorTool } from './VinExtractorTool';
import { PriceComparisonTool } from './PriceComparisonTool';

interface TraderToolsHubProps {
  user: User;
  profile: BusinessProfile | null;
}

type ActiveTool = 'NONE' | 'PDF_TO_EXCEL' | 'VIN_EXTRACTOR' | 'PRICE_COMPARISON';

interface ToolCardProps {
  toolKey: ToolKey;
  icon: ReactNode;
  title: string;
  description: string;
  access: ToolAccessResult;
  onSelect: () => void;
  isRTL: boolean;
}

const ToolCard = ({ toolKey, icon, title, description, access, onSelect, isRTL }: ToolCardProps) => {
  const { t } = useLanguage();
  const hasAccess = access.hasAccess;
  const isMaintenanceMode = access.isInMaintenanceMode;
  
  const getStatusBadge = () => {
    if (isMaintenanceMode) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          <Settings2 size={12} />
          {t('traderTools.maintenance', 'تحت الصيانة')}
        </span>
      );
    }
    if (!hasAccess) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
          <Lock size={12} />
          {t('traderTools.noAccess', 'غير متاح')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        <CheckCircle size={12} />
        {t('traderTools.available', 'متاح')}
      </span>
    );
  };

  const getUsageInfo = () => {
    if (!hasAccess) return null;
    if (access.usageToday === undefined && access.usageThisMonth === undefined) return null;
    
    const daily = access.dailyLimit ? `${access.usageToday || 0}/${access.dailyLimit}` : null;
    const monthly = access.monthlyLimit ? `${access.usageThisMonth || 0}/${access.monthlyLimit}` : null;
    
    if (!daily && !monthly) return null;
    
    return (
      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
        {daily && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {t('traderTools.dailyUsage', 'يومي')}: {daily}
          </span>
        )}
        {monthly && (
          <span className="flex items-center gap-1">
            <BarChart3 size={12} />
            {t('traderTools.monthlyUsage', 'شهري')}: {monthly}
          </span>
        )}
      </div>
    );
  };

  return (
    <button
      onClick={onSelect}
      disabled={!hasAccess}
      className={`group relative w-full text-${isRTL ? 'right' : 'left'} p-6 rounded-2xl border-2 transition-all duration-200 ${
        hasAccess
          ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-brand-500 hover:shadow-lg cursor-pointer'
          : isMaintenanceMode
            ? 'bg-amber-50/50 border-amber-200 cursor-not-allowed'
            : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70'
      }`}
      data-testid={`tool-card-${toolKey.toLowerCase().replace('_', '-')}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          hasAccess
            ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30'
            : isMaintenanceMode
              ? 'bg-amber-200 text-amber-700'
              : 'bg-slate-200 text-slate-500'
        }`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-800 truncate">{title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          {getUsageInfo()}
          
          {!hasAccess && !isMaintenanceMode && access.reason && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              {isRTL ? access.reasonAr : access.reason}
            </p>
          )}
        </div>
        
        {hasAccess && (
          <ChevronRight 
            size={20} 
            className={`text-slate-400 group-hover:text-brand-600 transition-transform ${
              isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
            }`} 
          />
        )}
      </div>
    </button>
  );
};

export const TraderToolsHub = ({ user, profile }: TraderToolsHubProps) => {
  const { t, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  
  const [loading, setLoading] = useState(true);
  const [toolsAccess, setToolsAccess] = useState<AllToolsAccessResult>({});
  const [activeTool, setActiveTool] = useState<ActiveTool>('NONE');
  
  useEffect(() => {
    const loadAccess = async () => {
      setLoading(true);
      try {
        const access = await toolsAccessService.getAllToolsAccess(
          user.id,
          profile?.customerType
        );
        setToolsAccess(access);
      } catch (error) {
        console.error('Failed to load tools access:', error);
        addToast(t('traderTools.loadError', 'حدث خطأ أثناء تحميل الأدوات'), 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccess();
  }, [user.id, profile?.customerType]);
  
  const handleToolSelect = (toolKey: ActiveTool) => {
    const access = toolsAccess[toolKey];
    if (access?.hasAccess) {
      setActiveTool(toolKey);
    } else if (access?.isInMaintenanceMode) {
      addToast(t('traderTools.maintenanceMessage', 'هذه الأداة تحت الصيانة حالياً'), 'info');
    }
  };
  
  const handleBackToHub = () => {
    setActiveTool('NONE');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{t('traderTools.loading', 'جاري تحميل الأدوات...')}</p>
        </div>
      </div>
    );
  }
  
  if (activeTool !== 'NONE') {
    const ToolComponent = {
      'PDF_TO_EXCEL': PdfToExcelTool,
      'VIN_EXTRACTOR': VinExtractorTool,
      'PRICE_COMPARISON': PriceComparisonTool
    }[activeTool];
    
    return (
      <div className="animate-fade-in">
        <button
          onClick={handleBackToHub}
          className={`mb-6 flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors font-medium`}
          data-testid="button-back-to-tools"
        >
          <ChevronRight size={20} className={isRTL ? '' : 'rotate-180'} />
          {t('traderTools.backToTools', 'العودة لقائمة الأدوات')}
        </button>
        
        <ToolComponent 
          user={user}
          profile={profile}
          onClose={handleBackToHub}
        />
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#081a33] to-[#102b57] rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Wrench size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t('traderTools.title', 'أدوات التاجر')}
            </h1>
            <p className="text-slate-300 mt-1">
              {t('traderTools.subtitle', 'أدوات متقدمة لتسهيل عملك اليومي')}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <FileSpreadsheet size={24} className="text-green-400 mb-2" />
            <p className="text-sm text-slate-300">{t('traderTools.pdfConversion', 'تحويل PDF')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Car size={24} className="text-blue-400 mb-2" />
            <p className="text-sm text-slate-300">{t('traderTools.vinExtraction', 'استخراج VIN')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Scale size={24} className="text-purple-400 mb-2" />
            <p className="text-sm text-slate-300">{t('traderTools.priceComparison', 'مقارنة الأسعار')}</p>
          </div>
        </div>
      </div>
      
      {/* Tools Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          {t('traderTools.availableTools', 'الأدوات المتاحة')}
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            toolKey="PDF_TO_EXCEL"
            icon={<FileSpreadsheet size={24} />}
            title={t('traderTools.pdfToExcel.title', 'تحويل PDF إلى Excel')}
            description={t('traderTools.pdfToExcel.description', 'حول ملفات PDF التي تحتوي على جداول إلى ملفات Excel قابلة للتعديل')}
            access={toolsAccess['PDF_TO_EXCEL'] || { hasAccess: false }}
            onSelect={() => handleToolSelect('PDF_TO_EXCEL')}
            isRTL={isRTL}
          />
          
          <ToolCard
            toolKey="VIN_EXTRACTOR"
            icon={<Car size={24} />}
            title={t('traderTools.vinExtractor.title', 'استخراج رقم الشاصي (VIN)')}
            description={t('traderTools.vinExtractor.description', 'استخرج أرقام الشاصي من صور المستندات والسيارات تلقائياً')}
            access={toolsAccess['VIN_EXTRACTOR'] || { hasAccess: false }}
            onSelect={() => handleToolSelect('VIN_EXTRACTOR')}
            isRTL={isRTL}
          />
          
          <ToolCard
            toolKey="PRICE_COMPARISON"
            icon={<Scale size={24} />}
            title={t('traderTools.priceComparison.title', 'مقارنة الأسعار')}
            description={t('traderTools.priceComparison.description', 'قارن أسعار القطع بين الموردين واحصل على أفضل سعر')}
            access={toolsAccess['PRICE_COMPARISON'] || { hasAccess: false }}
            onSelect={() => handleToolSelect('PRICE_COMPARISON')}
            isRTL={isRTL}
          />
        </div>
      </div>
      
      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info size={24} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">
              {t('traderTools.tips.title', 'نصائح للاستخدام')}
            </h3>
            <ul className={`text-sm text-blue-700 space-y-1.5 ${isRTL ? 'list-disc list-inside' : 'list-disc list-inside'}`}>
              <li>{t('traderTools.tips.tip1', 'تأكد من جودة الصور والملفات المرفوعة للحصول على أفضل النتائج')}</li>
              <li>{t('traderTools.tips.tip2', 'بعض الأدوات لها حدود استخدام يومية وشهرية')}</li>
              <li>{t('traderTools.tips.tip3', 'يتم حفظ سجل الاستخدام لمراجعته لاحقاً')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderToolsHub;
