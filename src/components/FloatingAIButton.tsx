import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../services/LanguageContext';
import { useProgrammingMode } from '../services/ProgrammingModeContext';
import {
  Bot,
  Code2,
  X,
  Settings,
  Sparkles,
  Terminal,
  Wrench,
  Shield,
  FileSearch,
  Zap,
  ChevronUp,
  Power
} from 'lucide-react';

interface FloatingAIButtonProps {
  onOpenCommandCenter?: () => void;
}

export default function FloatingAIButton({ onOpenCommandCenter }: FloatingAIButtonProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { 
    isProgrammingMode, 
    toggleProgrammingMode, 
    currentPage,
    isCommandCenterOpen,
    openCommandCenter 
  } = useProgrammingMode();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPulseAnimation(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isProgrammingMode) {
    return (
      <div className={`fixed bottom-6 z-[9999] ${isRTL ? 'left-6' : 'right-6'}`}>
        <button
          onClick={toggleProgrammingMode}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-full shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 flex items-center justify-center"
          data-testid="button-enable-programming-mode"
        >
          <Code2 className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          
          {showTooltip && (
            <div className={`absolute bottom-full mb-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white whitespace-nowrap ${isRTL ? 'right-0' : 'left-0'}`}>
              {isRTL ? 'تفعيل وضع البرمجة' : 'Enable Programming Mode'}
              <div className={`absolute top-full ${isRTL ? 'right-4' : 'left-4'} w-2 h-2 bg-slate-800 border-r border-b border-slate-700 transform rotate-45 -translate-y-1`}></div>
            </div>
          )}
        </button>
      </div>
    );
  }

  const quickActions = [
    { 
      id: 'command', 
      icon: Terminal, 
      label: isRTL ? 'مركز الأوامر' : 'Command Center',
      color: 'from-cyan-500 to-blue-600',
      action: () => {
        openCommandCenter('command');
        setIsExpanded(false);
      }
    },
    { 
      id: 'scan', 
      icon: Shield, 
      label: isRTL ? 'فحص النظام' : 'Scan System',
      color: 'from-green-500 to-emerald-600',
      action: () => {
        openCommandCenter('diagnostics', true);
        setIsExpanded(false);
      }
    },
    { 
      id: 'files', 
      icon: FileSearch, 
      label: isRTL ? 'استكشاف الملفات' : 'Explore Files',
      color: 'from-purple-500 to-violet-600',
      action: () => {
        openCommandCenter('files');
        setIsExpanded(false);
      }
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: isRTL ? 'إعدادات AI' : 'AI Settings',
      color: 'from-amber-500 to-orange-600',
      action: () => {
        openCommandCenter('history');
        setIsExpanded(false);
      }
    }
  ];

  return (
    <div className={`fixed bottom-6 z-[9999] ${isRTL ? 'left-6' : 'right-6'}`}>
      {isExpanded && (
        <div className="absolute bottom-16 flex flex-col gap-3 animate-fade-in">
          {quickActions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`group relative flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r ${action.color} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
              style={{ animationDelay: `${index * 50}ms` }}
              data-testid={`button-quick-action-${action.id}`}
            >
              <action.icon className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}
          
          <button
            onClick={() => {
              toggleProgrammingMode();
              setIsExpanded(false);
            }}
            className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            data-testid="button-disable-programming-mode"
          >
            <Power className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {isRTL ? 'إيقاف وضع البرمجة' : 'Exit Programming Mode'}
            </span>
          </button>
        </div>
      )}

      <div className="relative">
        {pulseAnimation && (
          <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-30"></div>
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center group ${isExpanded ? 'rotate-180' : ''}`}
          data-testid="button-floating-ai-main"
        >
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-white transition-transform" />
          ) : (
            <Bot className="w-6 h-6 text-white group-hover:animate-bounce" />
          )}
          
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
        </button>
      </div>

      <div className={`absolute ${isRTL ? 'right-16' : 'left-16'} bottom-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-cyan-400 whitespace-nowrap">
            {isRTL ? 'وضع البرمجة نشط' : 'Programming Mode Active'}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {isRTL ? `الصفحة: ${currentPage}` : `Page: ${currentPage}`}
        </div>
      </div>
    </div>
  );
}
