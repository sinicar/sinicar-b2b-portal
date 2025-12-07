import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
    Brain,
    BookOpen,
    MessageSquare,
    Settings2,
    TestTube,
    FileText,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Search,
    Upload,
    Download,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Sparkles,
    Bot,
    User,
    Send,
    Copy,
    ChevronDown,
    ChevronUp,
    Filter,
    Tag,
    Clock,
    BarChart3,
    Zap,
    Shield,
    Globe,
    Target,
    Lightbulb,
    HelpCircle,
    Play,
    Pause,
    RotateCcw,
    FileUp,
    FileDown,
    Layers,
    Database,
    Hash,
    Star,
    ThumbsUp,
    ThumbsDown,
    Eye,
    EyeOff,
    Volume2,
    Sliders,
    Wand2
} from 'lucide-react';

type TabType = 'knowledge' | 'conversations' | 'prompts' | 'testing' | 'analytics';

interface KnowledgeEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    priority: number;
    enabled: boolean;
    usageCount: number;
    lastUsed: string | null;
    createdAt: string;
    updatedAt: string;
}

interface TrainingConversation {
    id: string;
    title: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
    category: string;
    rating: number;
    enabled: boolean;
    createdAt: string;
}

interface SystemPrompt {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    content: string;
    contentAr: string;
    type: 'system' | 'persona' | 'context' | 'instruction';
    enabled: boolean;
    order: number;
}

interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    passed?: boolean;
    score?: number;
    category: string;
    lastTested?: string;
}

const CATEGORIES = [
    { value: 'general', labelAr: 'عام', labelEn: 'General' },
    { value: 'products', labelAr: 'المنتجات', labelEn: 'Products' },
    { value: 'orders', labelAr: 'الطلبات', labelEn: 'Orders' },
    { value: 'pricing', labelAr: 'التسعير', labelEn: 'Pricing' },
    { value: 'shipping', labelAr: 'الشحن', labelEn: 'Shipping' },
    { value: 'returns', labelAr: 'الإرجاع', labelEn: 'Returns' },
    { value: 'support', labelAr: 'الدعم', labelEn: 'Support' },
    { value: 'account', labelAr: 'الحساب', labelEn: 'Account' },
    { value: 'technical', labelAr: 'تقني', labelEn: 'Technical' }
];

export default function AdminAITrainingPage() {
    const { t } = useTranslation();
    const { language, dir } = useLanguage();
    const { addToast } = useToast();
    const isRTL = dir === 'rtl';

    const [activeTab, setActiveTab] = useState<TabType>('knowledge');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Knowledge Base State
    const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
    const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
    const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeEntry | null>(null);
    const [knowledgeSearch, setKnowledgeSearch] = useState('');
    const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState('all');

    // Training Conversations State
    const [conversations, setConversations] = useState<TrainingConversation[]>([]);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [editingConversation, setEditingConversation] = useState<TrainingConversation | null>(null);

    // System Prompts State
    const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);

    // Testing State
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [testingInProgress, setTestingInProgress] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    // Analytics State
    const [analytics, setAnalytics] = useState({
        totalQueries: 0,
        successRate: 0,
        avgResponseTime: 0,
        topCategories: [] as Array<{ category: string; count: number }>,
        recentActivity: [] as Array<{ date: string; queries: number; success: number }>
    });

    // Form States
    const [knowledgeForm, setKnowledgeForm] = useState({
        question: '',
        answer: '',
        category: 'general',
        tags: '',
        priority: 5,
        enabled: true
    });

    const [conversationForm, setConversationForm] = useState({
        title: '',
        category: 'general',
        messages: [] as Array<{ role: 'user' | 'assistant'; content: string }>,
        rating: 5,
        enabled: true
    });

    const [promptForm, setPromptForm] = useState({
        name: '',
        nameAr: '',
        description: '',
        content: '',
        contentAr: '',
        type: 'system' as 'system' | 'persona' | 'context' | 'instruction',
        enabled: true,
        order: 1
    });

    const [newMessage, setNewMessage] = useState({ role: 'user' as 'user' | 'assistant', content: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load from localStorage or initialize with demo data
            const storedKnowledge = localStorage.getItem('ai_knowledge_base');
            const storedConversations = localStorage.getItem('ai_training_conversations');
            const storedPrompts = localStorage.getItem('ai_system_prompts');
            const storedTestCases = localStorage.getItem('ai_test_cases');

            if (storedKnowledge) {
                setKnowledgeEntries(JSON.parse(storedKnowledge));
            } else {
                // Initialize with demo data
                const demoKnowledge: KnowledgeEntry[] = [
                    {
                        id: 'kb-1',
                        question: 'ما هي طرق الدفع المتاحة؟',
                        answer: 'نوفر طرق دفع متعددة تشمل: التحويل البنكي، الدفع عند الاستلام، بطاقات الائتمان (فيزا، ماستركارد)، وخدمة مدى. جميع المعاملات آمنة ومشفرة.',
                        category: 'general',
                        tags: ['دفع', 'payment', 'بطاقات'],
                        priority: 10,
                        enabled: true,
                        usageCount: 45,
                        lastUsed: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'kb-2',
                        question: 'كيف يمكنني تتبع طلبي؟',
                        answer: 'يمكنك تتبع طلبك من خلال صفحة "طلباتي" في حسابك. ستجد رقم التتبع ورابط شركة الشحن لمتابعة الشحنة لحظة بلحظة.',
                        category: 'orders',
                        tags: ['تتبع', 'شحن', 'طلبات'],
                        priority: 9,
                        enabled: true,
                        usageCount: 78,
                        lastUsed: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'kb-3',
                        question: 'ما هي سياسة الإرجاع؟',
                        answer: 'يمكنك إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام بشرط أن تكون في حالتها الأصلية. القطع الكهربائية غير قابلة للإرجاع بعد التركيب.',
                        category: 'returns',
                        tags: ['إرجاع', 'استبدال', 'ضمان'],
                        priority: 8,
                        enabled: true,
                        usageCount: 32,
                        lastUsed: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'kb-4',
                        question: 'هل توفرون قطع غيار أصلية؟',
                        answer: 'نعم، نوفر قطع غيار أصلية ومعتمدة من الوكلاء المحليين. كما نوفر قطع بديلة عالية الجودة بأسعار منافسة. جميع القطع مضمونة.',
                        category: 'products',
                        tags: ['أصلي', 'بديل', 'جودة', 'ضمان'],
                        priority: 10,
                        enabled: true,
                        usageCount: 120,
                        lastUsed: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'kb-5',
                        question: 'كم تستغرق عملية الشحن؟',
                        answer: 'مدة الشحن تختلف حسب المدينة:\n- الرياض: 1-2 أيام عمل\n- جدة والمنطقة الغربية: 2-3 أيام عمل\n- المناطق الأخرى: 3-5 أيام عمل\nيمكنك اختيار الشحن السريع للتوصيل خلال 24 ساعة.',
                        category: 'shipping',
                        tags: ['شحن', 'توصيل', 'مدة'],
                        priority: 9,
                        enabled: true,
                        usageCount: 89,
                        lastUsed: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
                setKnowledgeEntries(demoKnowledge);
                localStorage.setItem('ai_knowledge_base', JSON.stringify(demoKnowledge));
            }

            if (storedConversations) {
                setConversations(JSON.parse(storedConversations));
            } else {
                const demoConversations: TrainingConversation[] = [
                    {
                        id: 'conv-1',
                        title: 'استفسار عن قطع غيار تويوتا',
                        messages: [
                            { role: 'user', content: 'السلام عليكم، أبحث عن فلتر زيت لسيارة تويوتا كامري 2020' },
                            { role: 'assistant', content: 'وعليكم السلام! سعيد بخدمتك. لدينا فلاتر زيت أصلية وبديلة لتويوتا كامري 2020. هل تفضل الأصلي أم البديل؟' },
                            { role: 'user', content: 'أفضل الأصلي' },
                            { role: 'assistant', content: 'ممتاز! فلتر الزيت الأصلي لتويوتا كامري 2020 متوفر لدينا برقم القطعة 90915-YZZD4 بسعر 45 ريال. هل تريد إضافته للسلة؟' }
                        ],
                        category: 'products',
                        rating: 5,
                        enabled: true,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'conv-2',
                        title: 'استفسار عن حالة طلب',
                        messages: [
                            { role: 'user', content: 'وين وصل طلبي رقم ORD-1234؟' },
                            { role: 'assistant', content: 'مرحباً! دعني أتحقق من حالة طلبك... الطلب رقم ORD-1234 تم شحنه أمس وهو الآن في طريقه إليك. رقم التتبع: SM123456789. متوقع الوصول خلال يوم أو يومين.' },
                            { role: 'user', content: 'شكراً' },
                            { role: 'assistant', content: 'العفو! إذا احتجت أي مساعدة أخرى، أنا هنا. يومك سعيد!' }
                        ],
                        category: 'orders',
                        rating: 5,
                        enabled: true,
                        createdAt: new Date().toISOString()
                    }
                ];
                setConversations(demoConversations);
                localStorage.setItem('ai_training_conversations', JSON.stringify(demoConversations));
            }

            if (storedPrompts) {
                setSystemPrompts(JSON.parse(storedPrompts));
            } else {
                const demoPrompts: SystemPrompt[] = [
                    {
                        id: 'prompt-1',
                        name: 'Main System Prompt',
                        nameAr: 'البرومبت الأساسي',
                        description: 'The main system prompt that defines the AI personality and behavior',
                        content: 'You are a helpful AI assistant for SINI CAR B2B auto parts platform. You help customers find parts, track orders, and answer questions about products and services. Be professional, friendly, and knowledgeable.',
                        contentAr: 'أنت مساعد ذكي ودود لمنصة SINI CAR لقطع غيار السيارات B2B. ساعد العملاء في البحث عن القطع، تتبع الطلبات، والإجابة على الأسئلة. كن محترفاً وودوداً وذو معرفة واسعة.',
                        type: 'system',
                        enabled: true,
                        order: 1
                    },
                    {
                        id: 'prompt-2',
                        name: 'Personality Prompt',
                        nameAr: 'برومبت الشخصية',
                        description: 'Defines the AI personality traits',
                        content: 'Personality traits:\n- Professional but friendly\n- Patient and understanding\n- Knowledgeable about auto parts\n- Helpful and proactive\n- Bilingual (Arabic/English)',
                        contentAr: 'سمات الشخصية:\n- محترف لكن ودود\n- صبور ومتفهم\n- عارف بقطع الغيار\n- مساعد ومبادر\n- ثنائي اللغة (عربي/إنجليزي)',
                        type: 'persona',
                        enabled: true,
                        order: 2
                    },
                    {
                        id: 'prompt-3',
                        name: 'Context Prompt',
                        nameAr: 'برومبت السياق',
                        description: 'Provides business context to the AI',
                        content: 'Business context:\n- B2B auto parts platform\n- Serves mechanics and parts shops\n- Offers original and aftermarket parts\n- Saudi Arabia market focus\n- Competitive pricing',
                        contentAr: 'سياق العمل:\n- منصة B2B لقطع غيار السيارات\n- تخدم الميكانيكيين ومحلات القطع\n- توفر قطع أصلية وبديلة\n- السوق السعودي\n- أسعار تنافسية',
                        type: 'context',
                        enabled: true,
                        order: 3
                    },
                    {
                        id: 'prompt-4',
                        name: 'Safety Instructions',
                        nameAr: 'تعليمات الأمان',
                        description: 'Safety and restriction instructions',
                        content: 'Safety rules:\n- Never share customer personal data\n- Do not discuss competitors negatively\n- Refer complex issues to human support\n- Do not make unauthorized promises\n- Stay on topic (auto parts)',
                        contentAr: 'قواعد الأمان:\n- لا تشارك بيانات العملاء الشخصية\n- لا تتحدث سلباً عن المنافسين\n- حول المشاكل المعقدة للدعم البشري\n- لا تقدم وعوداً غير مصرح بها\n- ابق في الموضوع (قطع الغيار)',
                        type: 'instruction',
                        enabled: true,
                        order: 4
                    }
                ];
                setSystemPrompts(demoPrompts);
                localStorage.setItem('ai_system_prompts', JSON.stringify(demoPrompts));
            }

            if (storedTestCases) {
                setTestCases(JSON.parse(storedTestCases));
            } else {
                const demoTestCases: TestCase[] = [
                    {
                        id: 'test-1',
                        input: 'كم سعر فلتر الزيت؟',
                        expectedOutput: 'يجب أن يسأل عن نوع السيارة أو يوضح أن الأسعار تختلف حسب الموديل',
                        category: 'products',
                        passed: undefined,
                        lastTested: undefined
                    },
                    {
                        id: 'test-2',
                        input: 'أريد إرجاع منتج اشتريته من أسبوعين',
                        expectedOutput: 'يجب أن يوضح سياسة الإرجاع (7 أيام) ويقترح التواصل مع الدعم',
                        category: 'returns',
                        passed: undefined,
                        lastTested: undefined
                    },
                    {
                        id: 'test-3',
                        input: 'مرحبا',
                        expectedOutput: 'يجب أن يرد بتحية ودية ويعرض المساعدة',
                        category: 'general',
                        passed: undefined,
                        lastTested: undefined
                    }
                ];
                setTestCases(demoTestCases);
                localStorage.setItem('ai_test_cases', JSON.stringify(demoTestCases));
            }

            // Load analytics
            setAnalytics({
                totalQueries: 1247,
                successRate: 94.5,
                avgResponseTime: 1.2,
                topCategories: [
                    { category: 'products', count: 456 },
                    { category: 'orders', count: 312 },
                    { category: 'shipping', count: 189 },
                    { category: 'returns', count: 145 },
                    { category: 'support', count: 98 }
                ],
                recentActivity: [
                    { date: '2024-12-01', queries: 89, success: 85 },
                    { date: '2024-12-02', queries: 112, success: 106 },
                    { date: '2024-12-03', queries: 98, success: 92 },
                    { date: '2024-12-04', queries: 134, success: 128 },
                    { date: '2024-12-05', queries: 145, success: 137 },
                    { date: '2024-12-06', queries: 167, success: 158 },
                    { date: '2024-12-07', queries: 178, success: 169 }
                ]
            });

        } catch (error) {
            addToast(t('common.loadError', 'فشل في تحميل البيانات'), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Knowledge Base Functions
    const saveKnowledge = () => {
        if (!knowledgeForm.question.trim() || !knowledgeForm.answer.trim()) {
            addToast(isRTL ? 'السؤال والإجابة مطلوبان' : 'Question and answer are required', 'error');
            return;
        }

        const newEntry: KnowledgeEntry = {
            id: editingKnowledge?.id || `kb-${Date.now()}`,
            question: knowledgeForm.question,
            answer: knowledgeForm.answer,
            category: knowledgeForm.category,
            tags: knowledgeForm.tags.split(',').map(t => t.trim()).filter(t => t),
            priority: knowledgeForm.priority,
            enabled: knowledgeForm.enabled,
            usageCount: editingKnowledge?.usageCount || 0,
            lastUsed: editingKnowledge?.lastUsed || null,
            createdAt: editingKnowledge?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let updated: KnowledgeEntry[];
        if (editingKnowledge) {
            updated = knowledgeEntries.map(e => e.id === editingKnowledge.id ? newEntry : e);
        } else {
            updated = [...knowledgeEntries, newEntry];
        }

        setKnowledgeEntries(updated);
        localStorage.setItem('ai_knowledge_base', JSON.stringify(updated));
        resetKnowledgeForm();
        addToast(isRTL ? 'تم حفظ المعرفة بنجاح' : 'Knowledge saved successfully', 'success');
    };

    const deleteKnowledge = (id: string) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
        const updated = knowledgeEntries.filter(e => e.id !== id);
        setKnowledgeEntries(updated);
        localStorage.setItem('ai_knowledge_base', JSON.stringify(updated));
        addToast(isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully', 'success');
    };

    const resetKnowledgeForm = () => {
        setKnowledgeForm({
            question: '',
            answer: '',
            category: 'general',
            tags: '',
            priority: 5,
            enabled: true
        });
        setEditingKnowledge(null);
        setShowKnowledgeModal(false);
    };

    const editKnowledge = (entry: KnowledgeEntry) => {
        setEditingKnowledge(entry);
        setKnowledgeForm({
            question: entry.question,
            answer: entry.answer,
            category: entry.category,
            tags: entry.tags.join(', '),
            priority: entry.priority,
            enabled: entry.enabled
        });
        setShowKnowledgeModal(true);
    };

    // Conversation Functions
    const saveConversation = () => {
        if (!conversationForm.title.trim() || conversationForm.messages.length === 0) {
            addToast(isRTL ? 'العنوان والمحادثة مطلوبان' : 'Title and messages are required', 'error');
            return;
        }

        const newConv: TrainingConversation = {
            id: editingConversation?.id || `conv-${Date.now()}`,
            title: conversationForm.title,
            messages: conversationForm.messages,
            category: conversationForm.category,
            rating: conversationForm.rating,
            enabled: conversationForm.enabled,
            createdAt: editingConversation?.createdAt || new Date().toISOString()
        };

        let updated: TrainingConversation[];
        if (editingConversation) {
            updated = conversations.map(c => c.id === editingConversation.id ? newConv : c);
        } else {
            updated = [...conversations, newConv];
        }

        setConversations(updated);
        localStorage.setItem('ai_training_conversations', JSON.stringify(updated));
        resetConversationForm();
        addToast(isRTL ? 'تم حفظ المحادثة بنجاح' : 'Conversation saved successfully', 'success');
    };

    const deleteConversation = (id: string) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
        const updated = conversations.filter(c => c.id !== id);
        setConversations(updated);
        localStorage.setItem('ai_training_conversations', JSON.stringify(updated));
        addToast(isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully', 'success');
    };

    const resetConversationForm = () => {
        setConversationForm({
            title: '',
            category: 'general',
            messages: [],
            rating: 5,
            enabled: true
        });
        setEditingConversation(null);
        setShowConversationModal(false);
        setNewMessage({ role: 'user', content: '' });
    };

    const addMessageToConversation = () => {
        if (!newMessage.content.trim()) return;
        setConversationForm(prev => ({
            ...prev,
            messages: [...prev.messages, { ...newMessage }]
        }));
        setNewMessage({ role: newMessage.role === 'user' ? 'assistant' : 'user', content: '' });
    };

    const removeMessageFromConversation = (index: number) => {
        setConversationForm(prev => ({
            ...prev,
            messages: prev.messages.filter((_, i) => i !== index)
        }));
    };

    // System Prompts Functions
    const savePrompt = () => {
        if (!promptForm.name.trim() || !promptForm.content.trim()) {
            addToast(isRTL ? 'الاسم والمحتوى مطلوبان' : 'Name and content are required', 'error');
            return;
        }

        const newPrompt: SystemPrompt = {
            id: editingPrompt?.id || `prompt-${Date.now()}`,
            name: promptForm.name,
            nameAr: promptForm.nameAr,
            description: promptForm.description,
            content: promptForm.content,
            contentAr: promptForm.contentAr,
            type: promptForm.type,
            enabled: promptForm.enabled,
            order: promptForm.order
        };

        let updated: SystemPrompt[];
        if (editingPrompt) {
            updated = systemPrompts.map(p => p.id === editingPrompt.id ? newPrompt : p);
        } else {
            updated = [...systemPrompts, newPrompt];
        }

        setSystemPrompts(updated);
        localStorage.setItem('ai_system_prompts', JSON.stringify(updated));
        resetPromptForm();
        addToast(isRTL ? 'تم حفظ البرومبت بنجاح' : 'Prompt saved successfully', 'success');
    };

    const deletePrompt = (id: string) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
        const updated = systemPrompts.filter(p => p.id !== id);
        setSystemPrompts(updated);
        localStorage.setItem('ai_system_prompts', JSON.stringify(updated));
        addToast(isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully', 'success');
    };

    const resetPromptForm = () => {
        setPromptForm({
            name: '',
            nameAr: '',
            description: '',
            content: '',
            contentAr: '',
            type: 'system',
            enabled: true,
            order: systemPrompts.length + 1
        });
        setEditingPrompt(null);
        setShowPromptModal(false);
    };

    // Testing Functions
    const runTest = async () => {
        if (!testInput.trim()) {
            addToast(isRTL ? 'أدخل نص الاختبار' : 'Enter test input', 'error');
            return;
        }

        setTestingInProgress(true);
        try {
            // Simulate AI response
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate a mock response based on knowledge base
            const matchingKnowledge = knowledgeEntries.find(k => 
                k.enabled && (
                    testInput.includes(k.question.substring(0, 10)) ||
                    k.tags.some(tag => testInput.includes(tag))
                )
            );

            if (matchingKnowledge) {
                setTestOutput(matchingKnowledge.answer);
            } else {
                setTestOutput(isRTL 
                    ? 'مرحباً! أنا مساعدك الذكي في منصة SINI CAR. كيف يمكنني مساعدتك اليوم؟'
                    : 'Hello! I am your AI assistant at SINI CAR platform. How can I help you today?'
                );
            }
        } catch (error) {
            addToast(isRTL ? 'فشل في تشغيل الاختبار' : 'Failed to run test', 'error');
        } finally {
            setTestingInProgress(false);
        }
    };

    const runAllTests = async () => {
        setTestingInProgress(true);
        try {
            const updatedTests = await Promise.all(testCases.map(async (test) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Simple keyword matching for demo
                const keywords = test.expectedOutput.toLowerCase().split(' ');
                const response = isRTL 
                    ? 'هذا رد تجريبي للاختبار'
                    : 'This is a test response';
                
                const passed = Math.random() > 0.3; // Random for demo
                const score = passed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 40) + 30;
                
                return {
                    ...test,
                    actualOutput: response,
                    passed,
                    score,
                    lastTested: new Date().toISOString()
                };
            }));

            setTestCases(updatedTests);
            localStorage.setItem('ai_test_cases', JSON.stringify(updatedTests));
            addToast(isRTL ? 'تم تشغيل جميع الاختبارات' : 'All tests completed', 'success');
        } catch (error) {
            addToast(isRTL ? 'فشل في تشغيل الاختبارات' : 'Failed to run tests', 'error');
        } finally {
            setTestingInProgress(false);
        }
    };

    // Export/Import Functions
    const exportData = () => {
        const data = {
            knowledge: knowledgeEntries,
            conversations,
            prompts: systemPrompts,
            testCases,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-training-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast(isRTL ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully', 'success');
    };

    const importData = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                
                if (data.knowledge) {
                    setKnowledgeEntries(data.knowledge);
                    localStorage.setItem('ai_knowledge_base', JSON.stringify(data.knowledge));
                }
                if (data.conversations) {
                    setConversations(data.conversations);
                    localStorage.setItem('ai_training_conversations', JSON.stringify(data.conversations));
                }
                if (data.prompts) {
                    setSystemPrompts(data.prompts);
                    localStorage.setItem('ai_system_prompts', JSON.stringify(data.prompts));
                }
                if (data.testCases) {
                    setTestCases(data.testCases);
                    localStorage.setItem('ai_test_cases', JSON.stringify(data.testCases));
                }

                addToast(isRTL ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully', 'success');
            } catch (error) {
                addToast(isRTL ? 'فشل في استيراد البيانات' : 'Failed to import data', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    // Filtered Knowledge
    const filteredKnowledge = useMemo(() => {
        return knowledgeEntries.filter(entry => {
            const matchesSearch = !knowledgeSearch || 
                entry.question.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
                entry.answer.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
                entry.tags.some(tag => tag.toLowerCase().includes(knowledgeSearch.toLowerCase()));
            
            const matchesCategory = knowledgeCategoryFilter === 'all' || entry.category === knowledgeCategoryFilter;
            
            return matchesSearch && matchesCategory;
        });
    }, [knowledgeEntries, knowledgeSearch, knowledgeCategoryFilter]);

    const tabs = [
        { id: 'knowledge' as TabType, icon: BookOpen, label: isRTL ? 'قاعدة المعرفة' : 'Knowledge Base' },
        { id: 'conversations' as TabType, icon: MessageSquare, label: isRTL ? 'محادثات التدريب' : 'Training Conversations' },
        { id: 'prompts' as TabType, icon: Settings2, label: isRTL ? 'البرومبتات' : 'System Prompts' },
        { id: 'testing' as TabType, icon: TestTube, label: isRTL ? 'الاختبار والتقييم' : 'Testing & Evaluation' },
        { id: 'analytics' as TabType, icon: BarChart3, label: isRTL ? 'التحليلات' : 'Analytics' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6" dir={dir}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" data-testid="text-page-title">
                                {isRTL ? 'إدارة تدريب الذكاء الاصطناعي' : 'AI Training Management'}
                            </h1>
                            <p className="text-purple-100 text-sm">
                                {isRTL ? 'درّب وخصّص الذكاء الاصطناعي حسب احتياجاتك' : 'Train and customize AI according to your needs'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl cursor-pointer transition-colors flex items-center gap-2">
                            <Upload size={18} />
                            <span>{isRTL ? 'استيراد' : 'Import'}</span>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={importData} 
                                className="hidden" 
                                data-testid="input-import-data"
                            />
                        </label>
                        <button 
                            onClick={exportData}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2"
                            data-testid="button-export-data"
                        >
                            <Download size={18} />
                            <span>{isRTL ? 'تصدير' : 'Export'}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
                            <BookOpen size={16} />
                            <span>{isRTL ? 'قاعدة المعرفة' : 'Knowledge Base'}</span>
                        </div>
                        <p className="text-2xl font-bold" data-testid="text-knowledge-count">{knowledgeEntries.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
                            <MessageSquare size={16} />
                            <span>{isRTL ? 'المحادثات' : 'Conversations'}</span>
                        </div>
                        <p className="text-2xl font-bold" data-testid="text-conversations-count">{conversations.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
                            <Settings2 size={16} />
                            <span>{isRTL ? 'البرومبتات' : 'Prompts'}</span>
                        </div>
                        <p className="text-2xl font-bold" data-testid="text-prompts-count">{systemPrompts.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
                            <TestTube size={16} />
                            <span>{isRTL ? 'الاختبارات' : 'Test Cases'}</span>
                        </div>
                        <p className="text-2xl font-bold" data-testid="text-tests-count">{testCases.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex overflow-x-auto border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                            }`}
                            data-testid={`tab-${tab.id}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Knowledge Base Tab */}
                    {activeTab === 'knowledge' && (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex gap-3 flex-1 min-w-[300px]">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3" size={18} />
                                        <input
                                            type="text"
                                            value={knowledgeSearch}
                                            onChange={(e) => setKnowledgeSearch(e.target.value)}
                                            placeholder={isRTL ? 'بحث في قاعدة المعرفة...' : 'Search knowledge base...'}
                                            className="w-full ps-10 pe-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                                            data-testid="input-search-knowledge"
                                        />
                                    </div>
                                    <select
                                        value={knowledgeCategoryFilter}
                                        onChange={(e) => setKnowledgeCategoryFilter(e.target.value)}
                                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="select-category-filter"
                                    >
                                        <option value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {isRTL ? cat.labelAr : cat.labelEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => setShowKnowledgeModal(true)}
                                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                                    data-testid="button-add-knowledge"
                                >
                                    <Plus size={18} />
                                    {isRTL ? 'إضافة معرفة' : 'Add Knowledge'}
                                </button>
                            </div>

                            {/* Knowledge List */}
                            <div className="space-y-4">
                                {filteredKnowledge.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>{isRTL ? 'لا توجد نتائج' : 'No results found'}</p>
                                    </div>
                                ) : (
                                    filteredKnowledge.map((entry) => (
                                        <div 
                                            key={entry.id}
                                            className={`border rounded-xl p-5 transition-all ${entry.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                                            data-testid={`knowledge-entry-${entry.id}`}
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            entry.category === 'products' ? 'bg-blue-100 text-blue-700' :
                                                            entry.category === 'orders' ? 'bg-green-100 text-green-700' :
                                                            entry.category === 'shipping' ? 'bg-orange-100 text-orange-700' :
                                                            entry.category === 'returns' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {CATEGORIES.find(c => c.value === entry.category)?.[isRTL ? 'labelAr' : 'labelEn']}
                                                        </span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Star size={12} className="text-yellow-500" />
                                                            {entry.priority}
                                                        </span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <BarChart3 size={12} />
                                                            {entry.usageCount} {isRTL ? 'استخدام' : 'uses'}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-slate-800 mb-2">{entry.question}</h3>
                                                    <p className="text-sm text-slate-600 whitespace-pre-line">{entry.answer}</p>
                                                    {entry.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {entry.tags.map((tag, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editKnowledge(entry)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        data-testid={`button-edit-knowledge-${entry.id}`}
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteKnowledge(entry.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        data-testid={`button-delete-knowledge-${entry.id}`}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Training Conversations Tab */}
                    {activeTab === 'conversations' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-slate-600">
                                    {isRTL ? 'أضف محادثات نموذجية لتدريب الذكاء الاصطناعي على أسلوب الرد المطلوب' : 'Add example conversations to train the AI on desired response style'}
                                </p>
                                <button
                                    onClick={() => setShowConversationModal(true)}
                                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                                    data-testid="button-add-conversation"
                                >
                                    <Plus size={18} />
                                    {isRTL ? 'إضافة محادثة' : 'Add Conversation'}
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {conversations.map((conv) => (
                                    <div 
                                        key={conv.id}
                                        className="border border-slate-200 rounded-xl p-5 bg-white"
                                        data-testid={`conversation-${conv.id}`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-slate-800">{conv.title}</h3>
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                    {CATEGORIES.find(c => c.value === conv.category)?.[isRTL ? 'labelAr' : 'labelEn']}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            size={14} 
                                                            className={i < conv.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingConversation(conv);
                                                        setConversationForm({
                                                            title: conv.title,
                                                            category: conv.category,
                                                            messages: conv.messages,
                                                            rating: conv.rating,
                                                            enabled: conv.enabled
                                                        });
                                                        setShowConversationModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    data-testid={`button-edit-conversation-${conv.id}`}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteConversation(conv.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    data-testid={`button-delete-conversation-${conv.id}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            {conv.messages.map((msg, i) => (
                                                <div 
                                                    key={i}
                                                    className={`flex gap-3 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                                                >
                                                    {msg.role === 'assistant' && (
                                                        <div className="p-2 bg-purple-100 rounded-full h-fit">
                                                            <Bot size={16} className="text-purple-600" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                                        msg.role === 'assistant'
                                                            ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                                            : 'bg-purple-600 text-white rounded-tr-sm'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                    {msg.role === 'user' && (
                                                        <div className="p-2 bg-slate-200 rounded-full h-fit">
                                                            <User size={16} className="text-slate-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* System Prompts Tab */}
                    {activeTab === 'prompts' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-slate-600">
                                    {isRTL ? 'إدارة البرومبتات الأساسية التي تحدد سلوك وشخصية الذكاء الاصطناعي' : 'Manage core prompts that define AI behavior and personality'}
                                </p>
                                <button
                                    onClick={() => setShowPromptModal(true)}
                                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                                    data-testid="button-add-prompt"
                                >
                                    <Plus size={18} />
                                    {isRTL ? 'إضافة برومبت' : 'Add Prompt'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {systemPrompts.sort((a, b) => a.order - b.order).map((prompt) => (
                                    <div 
                                        key={prompt.id}
                                        className={`border rounded-xl p-5 transition-all ${prompt.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                                        data-testid={`prompt-${prompt.id}`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        prompt.type === 'system' ? 'bg-blue-100 text-blue-700' :
                                                        prompt.type === 'persona' ? 'bg-purple-100 text-purple-700' :
                                                        prompt.type === 'context' ? 'bg-green-100 text-green-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {prompt.type === 'system' ? (isRTL ? 'نظام' : 'System') :
                                                         prompt.type === 'persona' ? (isRTL ? 'شخصية' : 'Persona') :
                                                         prompt.type === 'context' ? (isRTL ? 'سياق' : 'Context') :
                                                         (isRTL ? 'تعليمات' : 'Instruction')}
                                                    </span>
                                                    <span className="text-xs text-slate-400">#{prompt.order}</span>
                                                    {!prompt.enabled && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                                                            {isRTL ? 'معطّل' : 'Disabled'}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-slate-800 mb-1">
                                                    {isRTL ? prompt.nameAr || prompt.name : prompt.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 mb-3">{prompt.description}</p>
                                                <pre className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
                                                    {isRTL ? prompt.contentAr || prompt.content : prompt.content}
                                                </pre>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingPrompt(prompt);
                                                        setPromptForm({
                                                            name: prompt.name,
                                                            nameAr: prompt.nameAr,
                                                            description: prompt.description,
                                                            content: prompt.content,
                                                            contentAr: prompt.contentAr,
                                                            type: prompt.type,
                                                            enabled: prompt.enabled,
                                                            order: prompt.order
                                                        });
                                                        setShowPromptModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    data-testid={`button-edit-prompt-${prompt.id}`}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deletePrompt(prompt.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    data-testid={`button-delete-prompt-${prompt.id}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Testing Tab */}
                    {activeTab === 'testing' && (
                        <div className="space-y-6">
                            {/* Live Testing */}
                            <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Wand2 size={20} className="text-purple-600" />
                                    {isRTL ? 'اختبار مباشر' : 'Live Testing'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            {isRTL ? 'رسالة الاختبار' : 'Test Message'}
                                        </label>
                                        <textarea
                                            value={testInput}
                                            onChange={(e) => setTestInput(e.target.value)}
                                            placeholder={isRTL ? 'اكتب رسالة لاختبار الذكاء الاصطناعي...' : 'Type a message to test the AI...'}
                                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                                            rows={3}
                                            data-testid="textarea-test-input"
                                        />
                                    </div>
                                    <button
                                        onClick={runTest}
                                        disabled={testingInProgress || !testInput.trim()}
                                        className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                                        data-testid="button-run-test"
                                    >
                                        {testingInProgress ? (
                                            <>
                                                <RefreshCw size={18} className="animate-spin" />
                                                {isRTL ? 'جاري الاختبار...' : 'Testing...'}
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} />
                                                {isRTL ? 'تشغيل الاختبار' : 'Run Test'}
                                            </>
                                        )}
                                    </button>
                                    {testOutput && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                {isRTL ? 'رد الذكاء الاصطناعي' : 'AI Response'}
                                            </label>
                                            <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-full">
                                                        <Bot size={18} className="text-purple-600" />
                                                    </div>
                                                    <p className="text-slate-700 flex-1" data-testid="text-test-output">{testOutput}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Test Cases */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <TestTube size={20} className="text-purple-600" />
                                        {isRTL ? 'حالات الاختبار' : 'Test Cases'}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={runAllTests}
                                            disabled={testingInProgress || testCases.length === 0}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                                            data-testid="button-run-all-tests"
                                        >
                                            {testingInProgress ? (
                                                <RefreshCw size={16} className="animate-spin" />
                                            ) : (
                                                <Play size={16} />
                                            )}
                                            {isRTL ? 'تشغيل الكل' : 'Run All'}
                                        </button>
                                        <button
                                            onClick={() => setShowTestModal(true)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                            data-testid="button-add-test-case"
                                        >
                                            <Plus size={16} />
                                            {isRTL ? 'إضافة اختبار' : 'Add Test'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {testCases.map((test) => (
                                        <div 
                                            key={test.id}
                                            className={`border rounded-xl p-4 ${
                                                test.passed === undefined ? 'border-slate-200 bg-white' :
                                                test.passed ? 'border-green-200 bg-green-50' :
                                                'border-red-200 bg-red-50'
                                            }`}
                                            data-testid={`test-case-${test.id}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {test.passed === undefined ? (
                                                            <HelpCircle size={18} className="text-slate-400" />
                                                        ) : test.passed ? (
                                                            <CheckCircle size={18} className="text-green-600" />
                                                        ) : (
                                                            <XCircle size={18} className="text-red-600" />
                                                        )}
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                            {CATEGORIES.find(c => c.value === test.category)?.[isRTL ? 'labelAr' : 'labelEn']}
                                                        </span>
                                                        {test.score !== undefined && (
                                                            <span className={`text-xs font-medium ${test.score >= 80 ? 'text-green-600' : test.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                {test.score}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-800 mb-1">{isRTL ? 'الإدخال:' : 'Input:'} {test.input}</p>
                                                    <p className="text-sm text-slate-600 mb-1">{isRTL ? 'المتوقع:' : 'Expected:'} {test.expectedOutput}</p>
                                                    {test.actualOutput && (
                                                        <p className="text-sm text-slate-500">{isRTL ? 'الفعلي:' : 'Actual:'} {test.actualOutput}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const updated = testCases.filter(t => t.id !== test.id);
                                                        setTestCases(updated);
                                                        localStorage.setItem('ai_test_cases', JSON.stringify(updated));
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    data-testid={`button-delete-test-${test.id}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-600 rounded-lg">
                                            <MessageSquare size={20} className="text-white" />
                                        </div>
                                        <span className="text-blue-700 font-medium">{isRTL ? 'إجمالي الاستفسارات' : 'Total Queries'}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-800" data-testid="text-total-queries">{analytics.totalQueries.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-600 rounded-lg">
                                            <CheckCircle size={20} className="text-white" />
                                        </div>
                                        <span className="text-green-700 font-medium">{isRTL ? 'نسبة النجاح' : 'Success Rate'}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-800" data-testid="text-success-rate">{analytics.successRate}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-600 rounded-lg">
                                            <Clock size={20} className="text-white" />
                                        </div>
                                        <span className="text-purple-700 font-medium">{isRTL ? 'متوسط وقت الرد' : 'Avg Response Time'}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-purple-800" data-testid="text-avg-response-time">{analytics.avgResponseTime}s</p>
                                </div>
                            </div>

                            {/* Top Categories */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Layers size={20} className="text-purple-600" />
                                    {isRTL ? 'أكثر الفئات استخداماً' : 'Top Categories'}
                                </h3>
                                <div className="space-y-3">
                                    {analytics.topCategories.map((cat, i) => (
                                        <div key={cat.category} className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">
                                                {i + 1}
                                            </span>
                                            <span className="flex-1 text-slate-700">
                                                {CATEGORIES.find(c => c.value === cat.category)?.[isRTL ? 'labelAr' : 'labelEn'] || cat.category}
                                            </span>
                                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="h-full bg-purple-600 rounded-full"
                                                    style={{ width: `${(cat.count / analytics.topCategories[0].count) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 w-16 text-end">
                                                {cat.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity Chart Placeholder */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-purple-600" />
                                    {isRTL ? 'النشاط الأخير (7 أيام)' : 'Recent Activity (7 days)'}
                                </h3>
                                <div className="flex items-end gap-2 h-40">
                                    {analytics.recentActivity.map((day, i) => (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex flex-col gap-0.5">
                                                <div 
                                                    className="w-full bg-purple-600 rounded-t"
                                                    style={{ height: `${(day.success / 200) * 100}px` }}
                                                    title={`${isRTL ? 'ناجح' : 'Success'}: ${day.success}`}
                                                />
                                                <div 
                                                    className="w-full bg-red-400 rounded-b"
                                                    style={{ height: `${((day.queries - day.success) / 200) * 100}px` }}
                                                    title={`${isRTL ? 'فشل' : 'Failed'}: ${day.queries - day.success}`}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">{day.date.split('-')[2]}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 mt-4 justify-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-600 rounded" />
                                        <span className="text-slate-600">{isRTL ? 'ناجح' : 'Success'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded" />
                                        <span className="text-slate-600">{isRTL ? 'فشل' : 'Failed'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Knowledge Modal */}
            {showKnowledgeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen size={24} />
                                {editingKnowledge 
                                    ? (isRTL ? 'تعديل المعرفة' : 'Edit Knowledge')
                                    : (isRTL ? 'إضافة معرفة جديدة' : 'Add New Knowledge')
                                }
                            </h2>
                            <button 
                                onClick={resetKnowledgeForm}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                data-testid="button-close-knowledge-modal"
                            >
                                <X className="text-white" size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'السؤال' : 'Question'} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    value={knowledgeForm.question}
                                    onChange={(e) => setKnowledgeForm({...knowledgeForm, question: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    placeholder={isRTL ? 'اكتب السؤال هنا...' : 'Enter the question...'}
                                    data-testid="input-knowledge-question"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'الإجابة' : 'Answer'} <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    value={knowledgeForm.answer}
                                    onChange={(e) => setKnowledgeForm({...knowledgeForm, answer: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                                    rows={4}
                                    placeholder={isRTL ? 'اكتب الإجابة هنا...' : 'Enter the answer...'}
                                    data-testid="textarea-knowledge-answer"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'الفئة' : 'Category'}
                                    </label>
                                    <select
                                        value={knowledgeForm.category}
                                        onChange={(e) => setKnowledgeForm({...knowledgeForm, category: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="select-knowledge-category"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {isRTL ? cat.labelAr : cat.labelEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'الأولوية' : 'Priority'} (1-10)
                                    </label>
                                    <input 
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={knowledgeForm.priority}
                                        onChange={(e) => setKnowledgeForm({...knowledgeForm, priority: parseInt(e.target.value) || 5})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="input-knowledge-priority"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'الوسوم' : 'Tags'} ({isRTL ? 'مفصولة بفواصل' : 'comma separated'})
                                </label>
                                <input 
                                    type="text"
                                    value={knowledgeForm.tags}
                                    onChange={(e) => setKnowledgeForm({...knowledgeForm, tags: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    placeholder={isRTL ? 'دفع, بطاقات, تحويل' : 'payment, cards, transfer'}
                                    data-testid="input-knowledge-tags"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setKnowledgeForm({...knowledgeForm, enabled: !knowledgeForm.enabled})}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        knowledgeForm.enabled ? 'bg-purple-600' : 'bg-slate-200'
                                    }`}
                                    data-testid="toggle-knowledge-enabled"
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-slate-300 transition-transform ${
                                        knowledgeForm.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <span className="text-sm text-slate-700">{isRTL ? 'مفعّل' : 'Enabled'}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-5 border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={resetKnowledgeForm}
                                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                                data-testid="button-cancel-knowledge"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                                onClick={saveKnowledge}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium flex items-center gap-2"
                                data-testid="button-save-knowledge"
                            >
                                <Save size={18} />
                                {isRTL ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversation Modal */}
            {showConversationModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare size={24} />
                                {editingConversation 
                                    ? (isRTL ? 'تعديل المحادثة' : 'Edit Conversation')
                                    : (isRTL ? 'إضافة محادثة جديدة' : 'Add New Conversation')
                                }
                            </h2>
                            <button 
                                onClick={resetConversationForm}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                data-testid="button-close-conversation-modal"
                            >
                                <X className="text-white" size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'عنوان المحادثة' : 'Conversation Title'} <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        value={conversationForm.title}
                                        onChange={(e) => setConversationForm({...conversationForm, title: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        placeholder={isRTL ? 'مثال: استفسار عن منتج' : 'Example: Product inquiry'}
                                        data-testid="input-conversation-title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'الفئة' : 'Category'}
                                    </label>
                                    <select
                                        value={conversationForm.category}
                                        onChange={(e) => setConversationForm({...conversationForm, category: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="select-conversation-category"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {isRTL ? cat.labelAr : cat.labelEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'المحادثة' : 'Conversation'} <span className="text-red-500">*</span>
                                </label>
                                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 max-h-60 overflow-y-auto">
                                    {conversationForm.messages.length === 0 ? (
                                        <p className="text-center text-slate-400 py-4">
                                            {isRTL ? 'لا توجد رسائل. أضف رسالة أدناه.' : 'No messages. Add a message below.'}
                                        </p>
                                    ) : (
                                        conversationForm.messages.map((msg, i) => (
                                            <div 
                                                key={i}
                                                className={`flex gap-2 items-start ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}
                                            >
                                                <div className={`p-1.5 rounded-full ${msg.role === 'assistant' ? 'bg-purple-100' : 'bg-slate-200'}`}>
                                                    {msg.role === 'assistant' ? <Bot size={14} className="text-purple-600" /> : <User size={14} className="text-slate-600" />}
                                                </div>
                                                <div className={`flex-1 px-3 py-2 rounded-xl text-sm ${
                                                    msg.role === 'assistant' ? 'bg-white border border-slate-200' : 'bg-purple-600 text-white'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <button
                                                    onClick={() => removeMessageFromConversation(i)}
                                                    className="p-1 text-slate-400 hover:text-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Add Message */}
                            <div className="flex gap-2">
                                <select
                                    value={newMessage.role}
                                    onChange={(e) => setNewMessage({...newMessage, role: e.target.value as 'user' | 'assistant'})}
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
                                    data-testid="select-message-role"
                                >
                                    <option value="user">{isRTL ? 'المستخدم' : 'User'}</option>
                                    <option value="assistant">{isRTL ? 'المساعد' : 'Assistant'}</option>
                                </select>
                                <input 
                                    type="text"
                                    value={newMessage.content}
                                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addMessageToConversation()}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    placeholder={isRTL ? 'اكتب الرسالة...' : 'Type message...'}
                                    data-testid="input-new-message"
                                />
                                <button
                                    onClick={addMessageToConversation}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                                    data-testid="button-add-message"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'التقييم' : 'Rating'}
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setConversationForm({...conversationForm, rating: star})}
                                                className="p-1"
                                                data-testid={`button-rating-${star}`}
                                            >
                                                <Star 
                                                    size={24} 
                                                    className={star <= conversationForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setConversationForm({...conversationForm, enabled: !conversationForm.enabled})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                conversationForm.enabled ? 'bg-purple-600' : 'bg-slate-200'
                                            }`}
                                            data-testid="toggle-conversation-enabled"
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-slate-300 transition-transform ${
                                                conversationForm.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                        <span className="text-sm text-slate-700">{isRTL ? 'مفعّل' : 'Enabled'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-5 border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={resetConversationForm}
                                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                                data-testid="button-cancel-conversation"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                                onClick={saveConversation}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium flex items-center gap-2"
                                data-testid="button-save-conversation"
                            >
                                <Save size={18} />
                                {isRTL ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt Modal */}
            {showPromptModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings2 size={24} />
                                {editingPrompt 
                                    ? (isRTL ? 'تعديل البرومبت' : 'Edit Prompt')
                                    : (isRTL ? 'إضافة برومبت جديد' : 'Add New Prompt')
                                }
                            </h2>
                            <button 
                                onClick={resetPromptForm}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                data-testid="button-close-prompt-modal"
                            >
                                <X className="text-white" size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'} <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        value={promptForm.name}
                                        onChange={(e) => setPromptForm({...promptForm, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="input-prompt-name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
                                    </label>
                                    <input 
                                        type="text"
                                        value={promptForm.nameAr}
                                        onChange={(e) => setPromptForm({...promptForm, nameAr: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        dir="rtl"
                                        data-testid="input-prompt-name-ar"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'الوصف' : 'Description'}
                                </label>
                                <input 
                                    type="text"
                                    value={promptForm.description}
                                    onChange={(e) => setPromptForm({...promptForm, description: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    data-testid="input-prompt-description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'النوع' : 'Type'}
                                    </label>
                                    <select
                                        value={promptForm.type}
                                        onChange={(e) => setPromptForm({...promptForm, type: e.target.value as any})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="select-prompt-type"
                                    >
                                        <option value="system">{isRTL ? 'نظام' : 'System'}</option>
                                        <option value="persona">{isRTL ? 'شخصية' : 'Persona'}</option>
                                        <option value="context">{isRTL ? 'سياق' : 'Context'}</option>
                                        <option value="instruction">{isRTL ? 'تعليمات' : 'Instruction'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        {isRTL ? 'الترتيب' : 'Order'}
                                    </label>
                                    <input 
                                        type="number"
                                        min="1"
                                        value={promptForm.order}
                                        onChange={(e) => setPromptForm({...promptForm, order: parseInt(e.target.value) || 1})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        data-testid="input-prompt-order"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'المحتوى (إنجليزي)' : 'Content (English)'} <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    value={promptForm.content}
                                    onChange={(e) => setPromptForm({...promptForm, content: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none font-mono text-sm"
                                    rows={5}
                                    data-testid="textarea-prompt-content"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                                </label>
                                <textarea 
                                    value={promptForm.contentAr}
                                    onChange={(e) => setPromptForm({...promptForm, contentAr: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none font-mono text-sm"
                                    rows={5}
                                    dir="rtl"
                                    data-testid="textarea-prompt-content-ar"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPromptForm({...promptForm, enabled: !promptForm.enabled})}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        promptForm.enabled ? 'bg-purple-600' : 'bg-slate-200'
                                    }`}
                                    data-testid="toggle-prompt-enabled"
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-slate-300 transition-transform ${
                                        promptForm.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <span className="text-sm text-slate-700">{isRTL ? 'مفعّل' : 'Enabled'}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-5 border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={resetPromptForm}
                                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                                data-testid="button-cancel-prompt"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                                onClick={savePrompt}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium flex items-center gap-2"
                                data-testid="button-save-prompt"
                            >
                                <Save size={18} />
                                {isRTL ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Case Modal */}
            {showTestModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <TestTube size={24} />
                                {isRTL ? 'إضافة حالة اختبار' : 'Add Test Case'}
                            </h2>
                            <button 
                                onClick={() => setShowTestModal(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                data-testid="button-close-test-modal"
                            >
                                <X className="text-white" size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'الفئة' : 'Category'}
                                </label>
                                <select
                                    id="test-category"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    data-testid="select-test-category"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {isRTL ? cat.labelAr : cat.labelEn}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'الإدخال' : 'Input'} <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    id="test-input"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                                    rows={3}
                                    placeholder={isRTL ? 'ماذا سيقول المستخدم؟' : 'What will the user say?'}
                                    data-testid="textarea-test-case-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    {isRTL ? 'المخرج المتوقع' : 'Expected Output'} <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    id="test-expected"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                                    rows={3}
                                    placeholder={isRTL ? 'ما الذي يجب أن يرد به الذكاء الاصطناعي؟' : 'What should the AI respond with?'}
                                    data-testid="textarea-test-case-expected"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-5 border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowTestModal(false)}
                                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                                data-testid="button-cancel-test"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                                onClick={() => {
                                    const input = (document.getElementById('test-input') as HTMLTextAreaElement)?.value;
                                    const expected = (document.getElementById('test-expected') as HTMLTextAreaElement)?.value;
                                    const category = (document.getElementById('test-category') as HTMLSelectElement)?.value;
                                    
                                    if (!input || !expected) {
                                        addToast(isRTL ? 'الإدخال والمخرج المتوقع مطلوبان' : 'Input and expected output are required', 'error');
                                        return;
                                    }
                                    
                                    const newTest: TestCase = {
                                        id: `test-${Date.now()}`,
                                        input,
                                        expectedOutput: expected,
                                        category
                                    };
                                    
                                    const updated = [...testCases, newTest];
                                    setTestCases(updated);
                                    localStorage.setItem('ai_test_cases', JSON.stringify(updated));
                                    setShowTestModal(false);
                                    addToast(isRTL ? 'تم إضافة حالة الاختبار' : 'Test case added', 'success');
                                }}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium flex items-center gap-2"
                                data-testid="button-save-test"
                            >
                                <Save size={18} />
                                {isRTL ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
