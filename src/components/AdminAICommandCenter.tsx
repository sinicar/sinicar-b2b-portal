import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Api } from '../services/api';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
    Terminal,
    Send,
    History,
    RotateCcw,
    Save,
    Trash2,
    Play,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Database,
    Users,
    FileText,
    Settings,
    Globe,
    Shield,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Eye,
    Download,
    Upload,
    RefreshCw,
    Loader2,
    HardDrive,
    Archive,
    Undo2,
    Bot,
    Zap,
    Layers,
    PlusCircle,
    Edit3,
    UserPlus,
    Languages,
    Palette,
    Lock,
    Unlock,
    Copy,
    ExternalLink,
    Info,
    X
} from 'lucide-react';

type CommandType = 
    | 'create_page' 
    | 'edit_content' 
    | 'translate' 
    | 'add_user' 
    | 'edit_user' 
    | 'add_permission' 
    | 'edit_permission'
    | 'add_customer'
    | 'edit_customer'
    | 'edit_settings'
    | 'create_role'
    | 'unknown';

interface ParsedCommand {
    type: CommandType;
    action: string;
    target: string;
    params: Record<string, any>;
    confidence: number;
    description: string;
    descriptionAr: string;
}

interface BackupEntry {
    id: string;
    timestamp: string;
    description: string;
    descriptionAr: string;
    commandId: string;
    dataSnapshot: string;
    size: number;
}

interface CommandHistory {
    id: string;
    command: string;
    parsedCommand: ParsedCommand;
    status: 'pending' | 'previewing' | 'executing' | 'success' | 'failed' | 'rolled_back';
    result?: string;
    resultAr?: string;
    error?: string;
    backupId?: string;
    timestamp: string;
    executedAt?: string;
}

interface DynamicPage {
    id: string;
    title: string;
    titleAr: string;
    slug: string;
    content: string;
    contentAr: string;
    layout: 'default' | 'full-width' | 'sidebar';
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

const COMMAND_EXAMPLES = [
    { ar: 'أنشئ صفحة جديدة للعروض الخاصة', en: 'Create a new page for special offers' },
    { ar: 'أضف مستخدم جديد اسمه أحمد بصلاحية مدير', en: 'Add a new user named Ahmed with admin role' },
    { ar: 'ترجم صفحة العملاء إلى الإنجليزية', en: 'Translate the customers page to English' },
    { ar: 'غير لون الموقع الرئيسي إلى الأخضر', en: 'Change the main site color to green' },
    { ar: 'أضف صلاحية جديدة للتقارير', en: 'Add a new permission for reports' },
    { ar: 'أنشئ عميل جديد اسمه شركة الفهد', en: 'Create a new customer named Al-Fahd Company' },
];

const BACKUP_STORAGE_KEY = 'ai_command_backups';
const HISTORY_STORAGE_KEY = 'ai_command_history';
const DYNAMIC_PAGES_KEY = 'ai_dynamic_pages';

export default function AdminAICommandCenter() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    
    const [command, setCommand] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [history, setHistory] = useState<CommandHistory[]>([]);
    const [backups, setBackups] = useState<BackupEntry[]>([]);
    const [dynamicPages, setDynamicPages] = useState<DynamicPage[]>([]);
    const [activeTab, setActiveTab] = useState<'command' | 'history' | 'backups' | 'pages'>('command');
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
    const [showExamples, setShowExamples] = useState(false);
    
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (savedHistory) setHistory(JSON.parse(savedHistory));
            
            const savedBackups = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (savedBackups) setBackups(JSON.parse(savedBackups));
            
            const savedPages = localStorage.getItem(DYNAMIC_PAGES_KEY);
            if (savedPages) setDynamicPages(JSON.parse(savedPages));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const saveHistory = (newHistory: CommandHistory[]) => {
        setHistory(newHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    };

    const saveBackups = (newBackups: BackupEntry[]) => {
        setBackups(newBackups);
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(newBackups));
    };

    const saveDynamicPages = (newPages: DynamicPage[]) => {
        setDynamicPages(newPages);
        localStorage.setItem(DYNAMIC_PAGES_KEY, JSON.stringify(newPages));
    };

    const createBackup = (commandId: string, description: string, descriptionAr: string): BackupEntry => {
        const dataToBackup = {
            users: localStorage.getItem('portal_users'),
            customers: localStorage.getItem('portal_customers'),
            settings: localStorage.getItem('portal_settings'),
            permissions: localStorage.getItem('portal_permissions'),
            roles: localStorage.getItem('portal_roles'),
            dynamicPages: localStorage.getItem(DYNAMIC_PAGES_KEY),
            translations_ar: localStorage.getItem('translations_ar'),
            translations_en: localStorage.getItem('translations_en'),
        };

        const snapshot = JSON.stringify(dataToBackup);
        const backup: BackupEntry = {
            id: `backup_${Date.now()}`,
            timestamp: new Date().toISOString(),
            description,
            descriptionAr,
            commandId,
            dataSnapshot: snapshot,
            size: new Blob([snapshot]).size,
        };

        const newBackups = [backup, ...backups].slice(0, 50);
        saveBackups(newBackups);
        
        return backup;
    };

    const restoreBackup = async (backupId: string) => {
        const backup = backups.find(b => b.id === backupId);
        if (!backup) {
            addToast(isRTL ? 'النسخة الاحتياطية غير موجودة' : 'Backup not found', 'error');
            return;
        }

        try {
            const data = JSON.parse(backup.dataSnapshot);
            
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    localStorage.setItem(key, value as string);
                }
            });

            loadData();
            addToast(
                isRTL ? 'تم استعادة النسخة الاحتياطية بنجاح' : 'Backup restored successfully',
                'success'
            );

            const commandToUpdate = history.find(h => h.backupId === backupId);
            if (commandToUpdate) {
                const updatedHistory = history.map(h => 
                    h.id === commandToUpdate.id 
                        ? { ...h, status: 'rolled_back' as const }
                        : h
                );
                saveHistory(updatedHistory);
            }
        } catch (error) {
            addToast(isRTL ? 'فشل في استعادة النسخة الاحتياطية' : 'Failed to restore backup', 'error');
        }
    };

    const parseCommand = async (inputCommand: string): Promise<ParsedCommand> => {
        setIsParsing(true);
        
        try {
            const response = await fetch('/api/v1/ai/parse-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: inputCommand, language })
            });

            if (response.ok) {
                const data = await response.json();
                setIsParsing(false);
                return data.parsedCommand;
            }
        } catch (error) {
            console.log('AI parsing not available, using local parser');
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        
        const lowerCommand = inputCommand.toLowerCase();
        const arabicCommand = inputCommand;
        
        let type: CommandType = 'unknown';
        let action = '';
        let target = '';
        let params: Record<string, any> = {};
        let confidence = 0.5;
        let description = '';
        let descriptionAr = '';

        if (lowerCommand.includes('create page') || lowerCommand.includes('new page') || 
            arabicCommand.includes('أنشئ صفحة') || arabicCommand.includes('صفحة جديدة')) {
            type = 'create_page';
            action = 'create';
            target = 'page';
            confidence = 0.85;
            
            const titleMatch = inputCommand.match(/(?:for|عن|لـ|اسمها)\s+(.+?)(?:\s|$)/i);
            params.title = titleMatch ? titleMatch[1].trim() : inputCommand.replace(/أنشئ صفحة|create page|new page|جديدة/gi, '').trim();
            
            description = `Create a new page: "${params.title}"`;
            descriptionAr = `إنشاء صفحة جديدة: "${params.title}"`;
        }
        else if (lowerCommand.includes('add user') || lowerCommand.includes('new user') ||
                 arabicCommand.includes('أضف مستخدم') || arabicCommand.includes('مستخدم جديد')) {
            type = 'add_user';
            action = 'create';
            target = 'user';
            confidence = 0.8;
            
            const nameMatch = inputCommand.match(/(?:named|اسمه|اسمها)\s+(\S+)/i);
            params.name = nameMatch ? nameMatch[1] : '';
            
            const roleMatch = inputCommand.match(/(?:role|صلاحية|بصلاحية)\s+(\S+)/i);
            params.role = roleMatch ? roleMatch[1] : 'staff';
            
            description = `Add new user: "${params.name}" with role "${params.role}"`;
            descriptionAr = `إضافة مستخدم جديد: "${params.name}" بصلاحية "${params.role}"`;
        }
        else if (lowerCommand.includes('translate') || arabicCommand.includes('ترجم')) {
            type = 'translate';
            action = 'translate';
            confidence = 0.85;
            
            const pageMatch = inputCommand.match(/(?:page|صفحة)\s+(\S+)/i);
            target = pageMatch ? pageMatch[1] : 'current';
            
            const toLangMatch = inputCommand.match(/(?:to|إلى)\s+(english|الإنجليزية|arabic|العربية)/i);
            params.targetLanguage = toLangMatch ? 
                (toLangMatch[1].toLowerCase().includes('english') || toLangMatch[1].includes('الإنجليزية') ? 'en' : 'ar') 
                : (language === 'ar' ? 'en' : 'ar');
            
            description = `Translate ${target} page to ${params.targetLanguage === 'en' ? 'English' : 'Arabic'}`;
            descriptionAr = `ترجمة صفحة ${target} إلى ${params.targetLanguage === 'en' ? 'الإنجليزية' : 'العربية'}`;
        }
        else if (lowerCommand.includes('add customer') || lowerCommand.includes('new customer') ||
                 arabicCommand.includes('أنشئ عميل') || arabicCommand.includes('أضف عميل') || arabicCommand.includes('عميل جديد')) {
            type = 'add_customer';
            action = 'create';
            target = 'customer';
            confidence = 0.8;
            
            const nameMatch = inputCommand.match(/(?:named|اسمه|اسمها)\s+(.+?)(?:\s|$)/i);
            params.businessName = nameMatch ? nameMatch[1].trim() : inputCommand.replace(/أنشئ عميل|أضف عميل|add customer|new customer|جديد/gi, '').trim();
            
            description = `Add new customer: "${params.businessName}"`;
            descriptionAr = `إضافة عميل جديد: "${params.businessName}"`;
        }
        else if (lowerCommand.includes('change color') || lowerCommand.includes('edit color') ||
                 arabicCommand.includes('غير لون') || arabicCommand.includes('تغيير لون')) {
            type = 'edit_settings';
            action = 'edit';
            target = 'settings';
            confidence = 0.75;
            
            const colorMatch = inputCommand.match(/(?:to|إلى)\s+(green|أخضر|blue|أزرق|red|أحمر|orange|برتقالي|purple|بنفسجي)/i);
            const colorMap: Record<string, string> = {
                'green': '#10b981', 'أخضر': '#10b981',
                'blue': '#3b82f6', 'أزرق': '#3b82f6',
                'red': '#ef4444', 'أحمر': '#ef4444',
                'orange': '#f97316', 'برتقالي': '#f97316',
                'purple': '#8b5cf6', 'بنفسجي': '#8b5cf6',
            };
            params.primaryColor = colorMatch ? colorMap[colorMatch[1].toLowerCase()] || colorMatch[1] : '#3b82f6';
            
            description = `Change primary color to ${params.primaryColor}`;
            descriptionAr = `تغيير اللون الرئيسي إلى ${params.primaryColor}`;
        }
        else if (lowerCommand.includes('add permission') || lowerCommand.includes('new permission') ||
                 arabicCommand.includes('أضف صلاحية') || arabicCommand.includes('صلاحية جديدة')) {
            type = 'add_permission';
            action = 'create';
            target = 'permission';
            confidence = 0.75;
            
            const forMatch = inputCommand.match(/(?:for|لـ|عن)\s+(.+?)(?:\s|$)/i);
            params.resource = forMatch ? forMatch[1].trim() : '';
            
            description = `Add new permission for: "${params.resource}"`;
            descriptionAr = `إضافة صلاحية جديدة لـ: "${params.resource}"`;
        }
        else {
            description = 'Unknown command - please try rephrasing';
            descriptionAr = 'أمر غير معروف - يرجى إعادة صياغته';
        }

        setIsParsing(false);
        
        return {
            type,
            action,
            target,
            params,
            confidence,
            description,
            descriptionAr
        };
    };

    const handleParseCommand = async () => {
        if (!command.trim()) return;
        
        const parsed = await parseCommand(command);
        setParsedCommand(parsed);
        setShowPreview(true);
    };

    const executeCommand = async () => {
        if (!parsedCommand) return;
        
        setIsProcessing(true);
        
        const commandEntry: CommandHistory = {
            id: `cmd_${Date.now()}`,
            command,
            parsedCommand,
            status: 'executing',
            timestamp: new Date().toISOString(),
        };

        const backup = createBackup(
            commandEntry.id,
            `Before: ${parsedCommand.description}`,
            `قبل: ${parsedCommand.descriptionAr}`
        );
        commandEntry.backupId = backup.id;

        const updatedHistory = [commandEntry, ...history];
        saveHistory(updatedHistory);

        try {
            let result = '';
            let resultAr = '';

            switch (parsedCommand.type) {
                case 'create_page':
                    const newPage: DynamicPage = {
                        id: `page_${Date.now()}`,
                        title: parsedCommand.params.title || 'New Page',
                        titleAr: parsedCommand.params.title || 'صفحة جديدة',
                        slug: (parsedCommand.params.title || 'new-page').toLowerCase().replace(/\s+/g, '-'),
                        content: `<h1>${parsedCommand.params.title || 'New Page'}</h1>\n<p>Page content goes here...</p>`,
                        contentAr: `<h1>${parsedCommand.params.title || 'صفحة جديدة'}</h1>\n<p>محتوى الصفحة هنا...</p>`,
                        layout: 'default',
                        isPublished: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: 'AI Command Center',
                    };
                    saveDynamicPages([...dynamicPages, newPage]);
                    result = `Page "${newPage.title}" created successfully with slug "/${newPage.slug}"`;
                    resultAr = `تم إنشاء الصفحة "${newPage.titleAr}" بنجاح برابط "/${newPage.slug}"`;
                    break;

                case 'add_user':
                    const users = JSON.parse(localStorage.getItem('portal_users') || '[]');
                    const newUser = {
                        id: `user_${Date.now()}`,
                        username: parsedCommand.params.name?.toLowerCase().replace(/\s+/g, '_') || `user_${Date.now()}`,
                        name: parsedCommand.params.name || 'New User',
                        email: `${parsedCommand.params.name?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                        role: parsedCommand.params.role?.toUpperCase() || 'STAFF',
                        status: 'ACTIVE',
                        createdAt: new Date().toISOString(),
                    };
                    users.push(newUser);
                    localStorage.setItem('portal_users', JSON.stringify(users));
                    result = `User "${newUser.name}" created with role "${newUser.role}"`;
                    resultAr = `تم إنشاء المستخدم "${newUser.name}" بصلاحية "${newUser.role}"`;
                    break;

                case 'add_customer':
                    const existingCustomers = JSON.parse(localStorage.getItem('portal_customers') || '[]');
                    const newCustomer = {
                        id: `cust_${Date.now()}`,
                        businessName: parsedCommand.params.businessName || 'عميل جديد',
                        phone: '0500000000',
                        email: 'customer@example.com',
                        city: 'الرياض',
                        customerType: 'RETAIL',
                        status: 'ACTIVE',
                        createdAt: new Date().toISOString(),
                    };
                    existingCustomers.push(newCustomer);
                    localStorage.setItem('portal_customers', JSON.stringify(existingCustomers));
                    result = `Customer "${newCustomer.businessName}" created successfully`;
                    resultAr = `تم إنشاء العميل "${newCustomer.businessName}" بنجاح`;
                    break;

                case 'translate':
                    result = `Translation request queued for ${parsedCommand.target} page to ${parsedCommand.params.targetLanguage}`;
                    resultAr = `تم إضافة طلب الترجمة لصفحة ${parsedCommand.target} إلى قائمة الانتظار`;
                    break;

                case 'edit_settings':
                    const settings = JSON.parse(localStorage.getItem('portal_settings') || '{}');
                    if (parsedCommand.params.primaryColor) {
                        settings.primaryColor = parsedCommand.params.primaryColor;
                        localStorage.setItem('portal_settings', JSON.stringify(settings));
                        result = `Primary color changed to ${parsedCommand.params.primaryColor}`;
                        resultAr = `تم تغيير اللون الرئيسي إلى ${parsedCommand.params.primaryColor}`;
                    }
                    break;

                case 'add_permission':
                    const permissions = JSON.parse(localStorage.getItem('portal_permissions') || '[]');
                    const newPermission = {
                        id: `perm_${Date.now()}`,
                        resource: parsedCommand.params.resource || 'new_resource',
                        actions: ['view', 'create', 'edit', 'delete'],
                        createdAt: new Date().toISOString(),
                    };
                    permissions.push(newPermission);
                    localStorage.setItem('portal_permissions', JSON.stringify(permissions));
                    result = `Permission for "${newPermission.resource}" created with actions: ${newPermission.actions.join(', ')}`;
                    resultAr = `تم إنشاء صلاحية لـ "${newPermission.resource}" مع الإجراءات: ${newPermission.actions.join('، ')}`;
                    break;

                default:
                    throw new Error('Unknown command type');
            }

            commandEntry.status = 'success';
            commandEntry.result = result;
            commandEntry.resultAr = resultAr;
            commandEntry.executedAt = new Date().toISOString();

            addToast(isRTL ? resultAr : result, 'success');
        } catch (error: any) {
            commandEntry.status = 'failed';
            commandEntry.error = error.message || 'Execution failed';
            addToast(isRTL ? 'فشل في تنفيذ الأمر' : 'Command execution failed', 'error');
        }

        const finalHistory = history.map(h => h.id === commandEntry.id ? commandEntry : h);
        if (!finalHistory.find(h => h.id === commandEntry.id)) {
            finalHistory.unshift(commandEntry);
        }
        saveHistory(finalHistory);

        setIsProcessing(false);
        setShowPreview(false);
        setParsedCommand(null);
        setCommand('');
    };

    const cancelPreview = () => {
        setShowPreview(false);
        setParsedCommand(null);
    };

    const getStatusIcon = (status: CommandHistory['status']) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'rolled_back': return <Undo2 className="w-4 h-4 text-amber-500" />;
            case 'executing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getCommandTypeIcon = (type: CommandType) => {
        switch (type) {
            case 'create_page': return <FileText className="w-4 h-4" />;
            case 'add_user': 
            case 'edit_user': return <Users className="w-4 h-4" />;
            case 'add_permission':
            case 'edit_permission': return <Shield className="w-4 h-4" />;
            case 'add_customer':
            case 'edit_customer': return <UserPlus className="w-4 h-4" />;
            case 'translate': return <Globe className="w-4 h-4" />;
            case 'edit_settings': return <Settings className="w-4 h-4" />;
            default: return <Terminal className="w-4 h-4" />;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const tabs = [
        { id: 'command', label: isRTL ? 'مركز الأوامر' : 'Command Center', icon: Terminal },
        { id: 'history', label: isRTL ? 'سجل العمليات' : 'History', icon: History },
        { id: 'backups', label: isRTL ? 'النسخ الاحتياطية' : 'Backups', icon: Archive },
        { id: 'pages', label: isRTL ? 'الصفحات الديناميكية' : 'Dynamic Pages', icon: Layers },
    ];

    return (
        <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                            {isRTL ? 'مركز أوامر الذكاء الاصطناعي' : 'AI Command Center'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isRTL ? 'نفّذ الأوامر بالعربية أو الإنجليزية مع نسخ احتياطي تلقائي' : 'Execute commands in Arabic or English with automatic backup'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                            {isRTL ? 'النظام جاهز' : 'System Ready'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <History className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold">{history.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الأوامر' : 'Total Commands'}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-2xl font-bold">{history.filter(h => h.status === 'success').length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'أوامر ناجحة' : 'Successful'}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Archive className="w-5 h-5 text-purple-500" />
                        <span className="text-2xl font-bold">{backups.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'النسخ الاحتياطية' : 'Backups'}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Layers className="w-5 h-5 text-amber-500" />
                        <span className="text-2xl font-bold">{dynamicPages.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'صفحات ديناميكية' : 'Dynamic Pages'}</p>
                </div>
            </div>

            <div className="flex gap-2 border-b">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        data-testid={`tab-${tab.id}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'command' && (
                <div className="space-y-6">
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                            <h2 className="font-semibold">{isRTL ? 'أدخل الأمر' : 'Enter Command'}</h2>
                            <button
                                onClick={() => setShowExamples(!showExamples)}
                                className="text-xs text-primary hover:underline flex items-center gap-1 mr-auto"
                            >
                                <Info className="w-3 h-3" />
                                {isRTL ? 'أمثلة' : 'Examples'}
                            </button>
                        </div>

                        {showExamples && (
                            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm font-medium mb-2">{isRTL ? 'أمثلة على الأوامر:' : 'Command Examples:'}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {COMMAND_EXAMPLES.map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCommand(isRTL ? example.ar : example.en)}
                                            className="text-sm text-left p-2 rounded hover:bg-muted transition-colors"
                                        >
                                            <span className="text-primary">→</span> {isRTL ? example.ar : example.en}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleParseCommand();
                                    }
                                }}
                                placeholder={isRTL ? 'اكتب الأمر هنا... (مثال: أنشئ صفحة جديدة للعروض)' : 'Type your command here... (e.g., Create a new page for offers)'}
                                className="w-full min-h-[100px] p-4 bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                data-testid="textarea-command-input"
                            />
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <button
                                onClick={handleParseCommand}
                                disabled={!command.trim() || isParsing || isProcessing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                data-testid="button-parse-command"
                            >
                                {isParsing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Zap className="w-4 h-4" />
                                )}
                                {isRTL ? 'تحليل الأمر' : 'Parse Command'}
                            </button>
                            
                            {command && (
                                <button
                                    onClick={() => setCommand('')}
                                    className="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {isRTL ? 'مسح' : 'Clear'}
                                </button>
                            )}
                        </div>
                    </div>

                    {showPreview && parsedCommand && (
                        <div className="bg-card border-2 border-primary/50 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">{isRTL ? 'معاينة الأمر' : 'Command Preview'}</h3>
                                </div>
                                <button onClick={cancelPreview} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    {getCommandTypeIcon(parsedCommand.type)}
                                    <div>
                                        <p className="font-medium">{isRTL ? parsedCommand.descriptionAr : parsedCommand.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {isRTL ? 'نوع الأمر:' : 'Command Type:'} {parsedCommand.type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                        parsedCommand.confidence >= 0.8 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : parsedCommand.confidence >= 0.6
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {Math.round(parsedCommand.confidence * 100)}% {isRTL ? 'ثقة' : 'confidence'}
                                    </div>
                                </div>

                                {Object.keys(parsedCommand.params).length > 0 && (
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-sm font-medium mb-2">{isRTL ? 'المعاملات:' : 'Parameters:'}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(parsedCommand.params).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="text-muted-foreground">{key}:</span>{' '}
                                                    <span className="font-medium">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        {isRTL 
                                            ? 'سيتم إنشاء نسخة احتياطية تلقائياً قبل تنفيذ هذا الأمر'
                                            : 'A backup will be automatically created before executing this command'
                                        }
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={executeCommand}
                                        disabled={isProcessing || parsedCommand.type === 'unknown'}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        data-testid="button-execute-command"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                        {isRTL ? 'تنفيذ الأمر' : 'Execute Command'}
                                    </button>
                                    <button
                                        onClick={cancelPreview}
                                        className="px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors"
                                    >
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-card border rounded-xl">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">{isRTL ? 'سجل العمليات' : 'Command History'}</h3>
                        {history.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm(isRTL ? 'هل تريد مسح سجل العمليات؟' : 'Clear command history?')) {
                                        saveHistory([]);
                                    }
                                }}
                                className="text-sm text-red-500 hover:text-red-600"
                            >
                                {isRTL ? 'مسح السجل' : 'Clear History'}
                            </button>
                        )}
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{isRTL ? 'لا توجد أوامر سابقة' : 'No command history yet'}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {history.map(item => (
                                <div key={item.id} className="p-4">
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer"
                                        onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                                    >
                                        {getStatusIcon(item.status)}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.command}</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getCommandTypeIcon(item.parsedCommand.type)}
                                            {expandedHistoryId === item.id ? (
                                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {expandedHistoryId === item.id && (
                                        <div className="mt-3 pt-3 border-t space-y-2">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">{isRTL ? 'النوع:' : 'Type:'}</span>{' '}
                                                {item.parsedCommand.type}
                                            </div>
                                            {item.result && (
                                                <div className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                    <span className="text-green-700 dark:text-green-400">
                                                        {isRTL ? item.resultAr : item.result}
                                                    </span>
                                                </div>
                                            )}
                                            {item.error && (
                                                <div className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                    <span className="text-red-700 dark:text-red-400">{item.error}</span>
                                                </div>
                                            )}
                                            {item.backupId && item.status === 'success' && (
                                                <button
                                                    onClick={() => restoreBackup(item.backupId!)}
                                                    className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                    {isRTL ? 'التراجع عن هذا الأمر' : 'Rollback this command'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'backups' && (
                <div className="bg-card border rounded-xl">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">{isRTL ? 'النسخ الاحتياطية' : 'Backups'}</h3>
                        <span className="text-sm text-muted-foreground">
                            {backups.length} / 50 {isRTL ? 'نسخة' : 'backups'}
                        </span>
                    </div>
                    
                    {backups.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{isRTL ? 'لا توجد نسخ احتياطية' : 'No backups yet'}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {backups.map(backup => (
                                <div key={backup.id} className="p-4 flex items-center gap-4">
                                    <HardDrive className="w-5 h-5 text-purple-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {isRTL ? backup.descriptionAr : backup.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{formatDate(backup.timestamp)}</span>
                                            <span>•</span>
                                            <span>{formatBytes(backup.size)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(isRTL ? 'هل تريد استعادة هذه النسخة؟' : 'Restore this backup?')) {
                                                restoreBackup(backup.id);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        {isRTL ? 'استعادة' : 'Restore'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'pages' && (
                <div className="bg-card border rounded-xl">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">{isRTL ? 'الصفحات الديناميكية' : 'Dynamic Pages'}</h3>
                    </div>
                    
                    {dynamicPages.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{isRTL ? 'لا توجد صفحات ديناميكية' : 'No dynamic pages yet'}</p>
                            <p className="text-sm mt-1">{isRTL ? 'استخدم الأوامر لإنشاء صفحات جديدة' : 'Use commands to create new pages'}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {dynamicPages.map(page => (
                                <div key={page.id} className="p-4 flex items-center gap-4">
                                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{isRTL ? page.titleAr : page.title}</p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>/{page.slug}</span>
                                            <span>•</span>
                                            <span>{formatDate(page.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {page.isPublished ? (
                                            <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                <Unlock className="w-3 h-3" />
                                                {isRTL ? 'منشور' : 'Published'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                <Lock className="w-3 h-3" />
                                                {isRTL ? 'مسودة' : 'Draft'}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                const updated = dynamicPages.map(p => 
                                                    p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
                                                );
                                                saveDynamicPages(updated);
                                            }}
                                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(isRTL ? 'هل تريد حذف هذه الصفحة؟' : 'Delete this page?')) {
                                                    saveDynamicPages(dynamicPages.filter(p => p.id !== page.id));
                                                }
                                            }}
                                            className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
