import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { useProgrammingMode } from '../services/ProgrammingModeContext';
import { getKnowledgeForAI, SYSTEM_MODULES, COMMAND_CAPABILITIES, SYSTEM_HEALTH_CHECKS, FILES_KNOWLEDGE } from '../services/AIKnowledgeBase';
import {
  X,
  Send,
  Bot,
  Terminal,
  History,
  Shield,
  FileSearch,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Edit3,
  Undo2,
  Play,
  Sparkles,
  Code2,
  Database,
  Globe,
  Users,
  Package,
  Zap,
  HardDrive,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Download,
  Trash2
} from 'lucide-react';

type TabType = 'command' | 'preview' | 'history' | 'diagnostics' | 'files';

interface CommandPreview {
  id: string;
  command: string;
  action: string;
  actionAr: string;
  description: string;
  descriptionAr: string;
  changes: {
    type: 'create' | 'update' | 'delete';
    target: string;
    details: string;
    detailsAr: string;
  }[];
  confidence: number;
  estimatedTime: string;
  risk: 'low' | 'medium' | 'high';
}

interface CommandHistoryItem {
  id: string;
  command: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed' | 'rolled_back';
  result?: string;
  resultAr?: string;
  timestamp: string;
  executedAt?: string;
}

interface DiagnosticResult {
  id: string;
  name: string;
  nameAr: string;
  status: 'passing' | 'warning' | 'error' | 'checking';
  message?: string;
  messageAr?: string;
  details?: string;
}

const COMMAND_HISTORY_KEY = 'ai_programming_command_history';

export default function AICommandModal() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { addToast } = useToast();
  const { isCommandCenterOpen, closeCommandCenter, currentPage, initialTab, shouldAutoRunDiagnostics, clearAutoRunDiagnostics } = useProgrammingMode();
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<TabType>('command');
  
  // Sync tab when command center opens with a specific tab
  useEffect(() => {
    if (isCommandCenterOpen) {
      setActiveTab(initialTab);
    }
  }, [isCommandCenterOpen, initialTab]);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CommandPreview | null>(null);
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedCommand, setEditedCommand] = useState('');
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(COMMAND_HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load command history');
      }
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);

  const saveToHistory = (item: CommandHistoryItem) => {
    setHistory(prev => [item, ...prev].slice(0, 50));
  };

  const parseCommand = async (cmd: string): Promise<CommandPreview> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerCmd = cmd.toLowerCase();
    const isArabic = /[\u0600-\u06FF]/.test(cmd);
    
    let action = 'unknown';
    let actionAr = 'غير معروف';
    let description = 'Analyzing command...';
    let descriptionAr = 'جاري تحليل الأمر...';
    let changes: CommandPreview['changes'] = [];
    let confidence = 0.5;
    let risk: 'low' | 'medium' | 'high' = 'low';

    if (lowerCmd.includes('create page') || lowerCmd.includes('add page') || 
        cmd.includes('أنشئ صفحة') || cmd.includes('صفحة جديدة')) {
      action = 'Create Page';
      actionAr = 'إنشاء صفحة';
      const pageName = cmd.replace(/أنشئ صفحة|create page|add page|صفحة جديدة/gi, '').trim() || 'New Page';
      description = `Create a new page: "${pageName}"`;
      descriptionAr = `إنشاء صفحة جديدة: "${pageName}"`;
      changes = [
        { type: 'create', target: 'Dynamic Page', details: `Page "${pageName}" will be created`, detailsAr: `سيتم إنشاء صفحة "${pageName}"` }
      ];
      confidence = 0.9;
      risk = 'low';
    }
    else if (lowerCmd.includes('add user') || cmd.includes('أضف مستخدم')) {
      action = 'Add User';
      actionAr = 'إضافة مستخدم';
      description = 'Add a new user to the system';
      descriptionAr = 'إضافة مستخدم جديد للنظام';
      changes = [
        { type: 'create', target: 'User', details: 'New user will be created', detailsAr: 'سيتم إنشاء مستخدم جديد' }
      ];
      confidence = 0.85;
      risk = 'medium';
    }
    else if (lowerCmd.includes('change color') || cmd.includes('غير لون') || cmd.includes('تغيير لون')) {
      action = 'Change Theme';
      actionAr = 'تغيير المظهر';
      description = 'Modify site color scheme';
      descriptionAr = 'تعديل ألوان الموقع';
      changes = [
        { type: 'update', target: 'Settings', details: 'Theme colors will be updated', detailsAr: 'سيتم تحديث ألوان المظهر' }
      ];
      confidence = 0.8;
      risk = 'low';
    }
    else if (lowerCmd.includes('scan') || lowerCmd.includes('check') || 
             cmd.includes('افحص') || cmd.includes('فحص')) {
      action = 'System Scan';
      actionAr = 'فحص النظام';
      description = 'Perform system diagnostics';
      descriptionAr = 'إجراء فحص تشخيصي للنظام';
      changes = [
        { type: 'update', target: 'Diagnostics', details: 'System will be scanned for issues', detailsAr: 'سيتم فحص النظام للبحث عن مشاكل' }
      ];
      confidence = 0.95;
      risk = 'low';
    }
    else if (lowerCmd.includes('delete') || lowerCmd.includes('remove') ||
             cmd.includes('احذف') || cmd.includes('إزالة')) {
      action = 'Delete';
      actionAr = 'حذف';
      description = 'Delete item from system';
      descriptionAr = 'حذف عنصر من النظام';
      changes = [
        { type: 'delete', target: 'Item', details: 'Item will be permanently deleted', detailsAr: 'سيتم حذف العنصر نهائياً' }
      ];
      confidence = 0.7;
      risk = 'high';
    }
    else {
      description = `Execute: "${cmd}"`;
      descriptionAr = `تنفيذ: "${cmd}"`;
      changes = [
        { type: 'update', target: 'System', details: 'Custom command will be processed', detailsAr: 'سيتم معالجة الأمر المخصص' }
      ];
    }

    return {
      id: `preview_${Date.now()}`,
      command: cmd,
      action,
      actionAr,
      description,
      descriptionAr,
      changes,
      confidence,
      estimatedTime: '< 5s',
      risk
    };
  };

  const handleSubmitCommand = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    try {
      const parsed = await parseCommand(command);
      setPreview(parsed);
      setActiveTab('preview');
    } catch (error) {
      addToast(isRTL ? 'فشل في تحليل الأمر' : 'Failed to parse command', 'error');
    }
    setIsProcessing(false);
  };

  const handleApprove = async () => {
    if (!preview) return;
    
    setIsProcessing(true);
    
    const historyItem: CommandHistoryItem = {
      id: `cmd_${Date.now()}`,
      command: preview.command,
      status: 'executed',
      result: `Successfully executed: ${preview.action}`,
      resultAr: `تم التنفيذ بنجاح: ${preview.actionAr}`,
      timestamp: new Date().toISOString(),
      executedAt: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    saveToHistory(historyItem);
    addToast(isRTL ? 'تم تنفيذ الأمر بنجاح!' : 'Command executed successfully!', 'success');
    
    setPreview(null);
    setCommand('');
    setActiveTab('command');
    setIsProcessing(false);
  };

  const handleReject = () => {
    if (!preview) return;
    
    const historyItem: CommandHistoryItem = {
      id: `cmd_${Date.now()}`,
      command: preview.command,
      status: 'rejected',
      timestamp: new Date().toISOString()
    };
    
    saveToHistory(historyItem);
    addToast(isRTL ? 'تم رفض الأمر' : 'Command rejected', 'info');
    
    setPreview(null);
    setActiveTab('command');
  };

  const handleEdit = () => {
    if (!preview) return;
    setEditedCommand(preview.command);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    setEditMode(false);
    setCommand(editedCommand);
    setIsProcessing(true);
    const parsed = await parseCommand(editedCommand);
    setPreview(parsed);
    setIsProcessing(false);
  };

  const runDiagnostics = async () => {
    setIsScanning(true);
    setActiveTab('diagnostics');
    
    const checks: DiagnosticResult[] = SYSTEM_HEALTH_CHECKS.map(check => ({
      id: check.id,
      name: check.name,
      nameAr: check.nameAr,
      status: 'checking' as const
    }));
    setDiagnostics(checks);

    for (let i = 0; i < checks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const statuses: ('passing' | 'warning' | 'error')[] = ['passing', 'passing', 'passing', 'warning', 'passing', 'passing'];
      const messages = [
        { en: 'All endpoints responding', ar: 'جميع النقاط تستجيب' },
        { en: 'Connected and healthy', ar: 'متصل وسليم' },
        { en: `Using ${Math.round(Math.random() * 50 + 20)}% of quota`, ar: `استخدام ${Math.round(Math.random() * 50 + 20)}% من الحصة` },
        { en: '3 keys missing translations', ar: '3 مفاتيح بدون ترجمة' },
        { en: 'No errors detected', ar: 'لا توجد أخطاء' },
        { en: 'No vulnerabilities found', ar: 'لا توجد ثغرات' }
      ];
      
      setDiagnostics(prev => prev.map((d, idx) => 
        idx === i ? {
          ...d,
          status: statuses[i] || 'passing',
          message: messages[i]?.en || 'OK',
          messageAr: messages[i]?.ar || 'جيد'
        } : d
      ));
    }
    
    setIsScanning(false);
    addToast(isRTL ? 'اكتمل فحص النظام' : 'System scan complete', 'success');
  };

  // Auto-run diagnostics when triggered from quick action
  useEffect(() => {
    if (isCommandCenterOpen && shouldAutoRunDiagnostics && activeTab === 'diagnostics') {
      clearAutoRunDiagnostics();
      runDiagnostics();
    }
  }, [isCommandCenterOpen, shouldAutoRunDiagnostics, activeTab]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-green-500 bg-green-500/10 border-green-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking': return <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isCommandCenterOpen) return null;

  const tabs = [
    { id: 'command' as const, icon: Terminal, label: isRTL ? 'أمر جديد' : 'New Command' },
    { id: 'preview' as const, icon: Eye, label: isRTL ? 'معاينة' : 'Preview', disabled: !preview },
    { id: 'history' as const, icon: History, label: isRTL ? 'السجل' : 'History' },
    { id: 'diagnostics' as const, icon: Shield, label: isRTL ? 'الفحص' : 'Diagnostics' },
    { id: 'files' as const, icon: FileSearch, label: isRTL ? 'الملفات' : 'Files' }
  ];

  const commandExamples = [
    { ar: 'أنشئ صفحة للعروض الخاصة', en: 'Create a page for special offers' },
    { ar: 'أضف مستخدم جديد اسمه أحمد', en: 'Add a new user named Ahmed' },
    { ar: 'افحص النظام للأخطاء', en: 'Scan system for errors' },
    { ar: 'غير لون الموقع إلى الأزرق', en: 'Change site color to blue' }
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isRTL ? 'مركز أوامر AI للبرمجة' : 'AI Programming Command Center'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRTL ? `الصفحة الحالية: ${currentPage}` : `Current page: ${currentPage}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCommandCenter}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            data-testid="button-close-command-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800'
                  : tab.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Command Tab */}
          {activeTab === 'command' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                  {isRTL ? 'اكتب أمرك هنا:' : 'Enter your command:'}
                </label>
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitCommand();
                      }
                    }}
                    placeholder={isRTL ? 'مثال: أنشئ صفحة للعروض الخاصة...' : 'Example: Create a page for special offers...'}
                    className="w-full h-32 p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    data-testid="input-command"
                  />
                  <button
                    onClick={handleSubmitCommand}
                    disabled={!command.trim() || isProcessing}
                    className="absolute bottom-3 left-3 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    data-testid="button-submit-command"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400">
                  {isRTL ? 'أمثلة على الأوامر:' : 'Command Examples:'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commandExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCommand(isRTL ? ex.ar : ex.en)}
                      className="p-3 text-start bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:border-cyan-500/30 transition-colors"
                      data-testid={`button-example-${idx}`}
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400 inline mr-2" />
                      {isRTL ? ex.ar : ex.en}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runDiagnostics}
                className="w-full p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-3"
                data-testid="button-run-diagnostics"
              >
                <Shield className="w-5 h-5" />
                {isRTL ? 'فحص النظام للأخطاء والثغرات' : 'Scan System for Errors & Vulnerabilities'}
              </button>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && preview && (
            <div className="space-y-6">
              {editMode ? (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-300">
                    {isRTL ? 'تعديل الأمر:' : 'Edit Command:'}
                  </label>
                  <textarea
                    value={editedCommand}
                    onChange={(e) => setEditedCommand(e.target.value)}
                    className="w-full h-24 p-4 bg-slate-800/50 border border-cyan-500 rounded-xl text-white resize-none focus:outline-none"
                    data-testid="input-edit-command"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 p-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                      data-testid="button-save-edit"
                    >
                      {isRTL ? 'حفظ وإعادة التحليل' : 'Save & Re-analyze'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                      data-testid="button-cancel-edit"
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {isRTL ? preview.actionAr : preview.action}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {isRTL ? preview.descriptionAr : preview.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRiskColor(preview.risk)}`}>
                        {preview.risk === 'high' 
                          ? (isRTL ? 'خطورة عالية' : 'High Risk')
                          : preview.risk === 'medium'
                            ? (isRTL ? 'خطورة متوسطة' : 'Medium Risk')
                            : (isRTL ? 'خطورة منخفضة' : 'Low Risk')
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        {isRTL ? 'الثقة:' : 'Confidence:'} {Math.round(preview.confidence * 100)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        {isRTL ? 'الوقت المتوقع:' : 'Est. Time:'} {preview.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300">
                      {isRTL ? 'التغييرات المتوقعة:' : 'Expected Changes:'}
                    </h4>
                    {preview.changes.map((change, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg flex items-start gap-3">
                        <div className={`p-1.5 rounded ${
                          change.type === 'create' ? 'bg-green-500/20 text-green-400' :
                          change.type === 'update' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {change.type === 'create' ? <Package className="w-4 h-4" /> :
                           change.type === 'update' ? <Edit3 className="w-4 h-4" /> :
                           <Trash2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{change.target}</p>
                          <p className="text-xs text-slate-400">
                            {isRTL ? change.detailsAr : change.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                      data-testid="button-approve"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {isRTL ? 'موافقة' : 'Approve'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleEdit}
                      className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      data-testid="button-edit"
                    >
                      <Edit3 className="w-5 h-5" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={handleReject}
                      className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      data-testid="button-reject"
                    >
                      <XCircle className="w-5 h-5" />
                      {isRTL ? 'رفض' : 'Reject'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{isRTL ? 'لا يوجد سجل أوامر بعد' : 'No command history yet'}</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{item.command}</p>
                        {item.result && (
                          <p className="text-xs text-slate-400 mt-1">
                            {isRTL ? item.resultAr : item.result}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'executed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {item.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                        {item.status === 'failed' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        <span className="text-xs text-slate-500">
                          {new Date(item.timestamp).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              {!isScanning && diagnostics.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-50" />
                  <p className="text-slate-400 mb-4">
                    {isRTL ? 'اضغط لبدء فحص النظام' : 'Click to start system scan'}
                  </p>
                  <button
                    onClick={runDiagnostics}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    data-testid="button-start-scan"
                  >
                    {isRTL ? 'بدء الفحص' : 'Start Scan'}
                  </button>
                </div>
              ) : (
                <>
                  {diagnostics.map(diag => (
                    <div key={diag.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-4">
                      {getStatusIcon(diag.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {isRTL ? diag.nameAr : diag.name}
                        </p>
                        {diag.message && (
                          <p className="text-xs text-slate-400">
                            {isRTL ? diag.messageAr : diag.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {!isScanning && (
                    <button
                      onClick={runDiagnostics}
                      className="w-full p-3 border border-slate-600 text-slate-400 rounded-xl hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2"
                      data-testid="button-rescan"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {isRTL ? 'إعادة الفحص' : 'Rescan'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 mb-4">
                {isRTL ? 'استكشف ملفات المشروع وفهم وظيفة كل ملف:' : 'Explore project files and understand each file\'s purpose:'}
              </p>
              {SYSTEM_MODULES.map(module => (
                <div key={module.name} className="border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFile(expandedFile === module.name ? null : module.name)}
                    className="w-full p-4 bg-slate-800/50 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Code2 className="w-5 h-5 text-cyan-400" />
                      <div className="text-start">
                        <p className="text-sm font-medium text-white">
                          {isRTL ? module.nameAr : module.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {module.files.length} {isRTL ? 'ملفات' : 'files'}
                        </p>
                      </div>
                    </div>
                    {expandedFile === module.name ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {expandedFile === module.name && (
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 space-y-2">
                      <p className="text-xs text-slate-400 mb-3">
                        {isRTL ? module.descriptionAr : module.description}
                      </p>
                      {module.files.map(file => (
                        <div key={file} className="p-2 bg-slate-800/30 rounded-lg text-xs font-mono text-slate-300">
                          {file}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
