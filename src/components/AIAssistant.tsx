import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Maximize2,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { AIConversation, AIChatMessage } from '../types';

interface AIAssistantProps {
  userId?: string;
  userName?: string;
}

export default function AIAssistant({ userId = 'guest', userName }: AIAssistantProps) {
  const { t } = useTranslation();
  const { language, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const systemPrompt = language === 'ar' 
        ? `أنت مساعد ذكي ودود لمنصة SINI CAR لقطع غيار السيارات B2B.
ساعد العملاء في:
- البحث عن قطع الغيار
- معلومات الطلبات والشحن
- مقارنة الأسعار
- استفسارات عامة
${userName ? `اسم العميل: ${userName}` : ''}
كن مختصراً ومفيداً.`
        : `You are a friendly AI assistant for SINI CAR B2B auto parts platform.
Help customers with:
- Finding auto parts
- Order and shipping information
- Price comparisons
- General inquiries
${userName ? `Customer name: ${userName}` : ''}
Be concise and helpful.`;

      const response = await MockApi.sendAIMessage({
        message: inputValue.trim(),
        conversationHistory: messages,
        systemPrompt,
        userId,
        language
      });

      const assistantMessage: AIChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!conversationId) {
        const newConvId = `conv-${Date.now()}`;
        setConversationId(newConvId);
        
        const conversation: AIConversation = {
          id: newConvId,
          userId,
          title: inputValue.trim().substring(0, 50),
          messages: [...messages, userMessage, assistantMessage],
          provider: 'openai',
          model: 'gpt-4o-mini',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalTokensUsed: response.tokensUsed || 0
        };
        await MockApi.saveAIConversation(conversation);
      }

    } catch (error: any) {
      console.error('AI Error:', error);
      addToast(t('ai.errorMessage', 'حدث خطأ في المساعد الذكي'), 'error');
      
      const errorMessage: AIChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: language === 'ar' ? 'البحث عن قطعة' : 'Find a part', query: language === 'ar' ? 'أريد البحث عن قطعة غيار' : 'I want to find an auto part' },
    { label: language === 'ar' ? 'حالة الطلب' : 'Order status', query: language === 'ar' ? 'ما حالة طلبي؟' : 'What is my order status?' },
    { label: language === 'ar' ? 'مقارنة الأسعار' : 'Compare prices', query: language === 'ar' ? 'ساعدني في مقارنة الأسعار' : 'Help me compare prices' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group`}
        data-testid="button-open-ai-assistant"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-[500px]'
      }`}
      data-testid="ai-assistant-container"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {t('ai.assistantName', 'مساعد SINI الذكي')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearChat}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title={t('ai.clearChat', 'مسح المحادثة')}
            data-testid="button-clear-chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleMinimize}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            data-testid="button-minimize-chat"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            data-testid="button-close-chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[380px] bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                <p className="text-slate-600 text-sm mb-4">
                  {t('ai.welcomeMessage', 'مرحباً! كيف يمكنني مساعدتك اليوم؟')}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputValue(action.query);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      data-testid={`button-quick-action-${idx}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <Bot className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === 'user' && (
                        <User className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500">
                      {t('ai.thinking', 'جاري التفكير...')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.inputPlaceholder', 'اكتب رسالتك...')}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                data-testid="input-ai-message"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="button-send-message"
              >
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
