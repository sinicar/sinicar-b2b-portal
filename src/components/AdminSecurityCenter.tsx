/**
 * مركز الأمان والنسخ الاحتياطي
 * Security Center & Backup Settings
 */

import React, { useState, useEffect } from 'react';
import { 
    Shield, Lock, Key, Clock, Users, AlertTriangle, 
    Download, Upload, Calendar, CheckCircle, XCircle,
    RefreshCw, Eye, EyeOff, Trash2, FileArchive, History,
    Settings, Database, HardDrive, Activity
} from 'lucide-react';
import Api from '../services/api';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';

// Security Settings Types
interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
}

interface SessionSettings {
    maxConcurrentSessions: number;
    sessionTimeoutMinutes: number;
    rememberMeDays: number;
    enforceLogoutOnPasswordChange: boolean;
}

interface AccountLockSettings {
    maxFailedAttempts: number;
    lockDurationMinutes: number;
    autoUnlock: boolean;
    notifyAdminOnLock: boolean;
}

interface BackupConfig {
    id: string;
    name: string;
    type: 'FULL' | 'PARTIAL' | 'INCREMENTAL';
    entities: string[];
    schedule: 'MANUAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    lastBackupAt?: string;
    nextScheduledAt?: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';
    size?: string;
}

interface AuditLogEntry {
    id: string;
    action: string;
    user: string;
    ip: string;
    timestamp: string;
    details?: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

// مخزن مؤقت للإعدادات
const defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expiryDays: 90,
    preventReuse: 5
};

const defaultSessionSettings: SessionSettings = {
    maxConcurrentSessions: 3,
    sessionTimeoutMinutes: 30,
    rememberMeDays: 14,
    enforceLogoutOnPasswordChange: true
};

const defaultAccountLockSettings: AccountLockSettings = {
    maxFailedAttempts: 5,
    lockDurationMinutes: 30,
    autoUnlock: true,
    notifyAdminOnLock: true
};

// بيانات تجريبية للنسخ الاحتياطية
const mockBackups: BackupConfig[] = [
    {
        id: 'bk_001',
        name: 'نسخة يومية كاملة',
        type: 'FULL',
        entities: ['products', 'orders', 'customers', 'settings'],
        schedule: 'DAILY',
        lastBackupAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        nextScheduledAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        status: 'SUCCESS',
        size: '45.2 MB'
    },
    {
        id: 'bk_002',
        name: 'نسخة أسبوعية',
        type: 'FULL',
        entities: ['products', 'orders', 'customers', 'settings', 'logs'],
        schedule: 'WEEKLY',
        lastBackupAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SUCCESS',
        size: '128.5 MB'
    }
];

// بيانات تجريبية لسجل الأمان
const mockAuditLogs: AuditLogEntry[] = [
    {
        id: 'log_001',
        action: 'تسجيل دخول ناجح',
        user: 'admin@sinicar.com',
        ip: '192.168.1.100',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: 'INFO'
    },
    {
        id: 'log_002',
        action: 'محاولة دخول فاشلة (3 مرات)',
        user: 'unknown',
        ip: '45.33.32.156',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        details: 'محاولات متكررة من عنوان IP غير معروف',
        severity: 'WARNING'
    },
    {
        id: 'log_003',
        action: 'تغيير كلمة مرور',
        user: 'staff@sinicar.com',
        ip: '192.168.1.105',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        severity: 'INFO'
    },
    {
        id: 'log_004',
        action: 'تصدير بيانات العملاء',
        user: 'admin@sinicar.com',
        ip: '192.168.1.100',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        details: 'تم تصدير 1,500 سجل عميل',
        severity: 'WARNING'
    },
    {
        id: 'log_005',
        action: 'حساب مقفل تلقائياً',
        user: 'test@example.com',
        ip: '203.0.113.50',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        details: 'تجاوز عدد محاولات الدخول المسموحة',
        severity: 'CRITICAL'
    }
];

export const AdminSecurityCenter: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'password' | 'sessions' | 'lockout' | 'backup' | 'audit'>('password');
    const [saving, setSaving] = useState(false);
    
    // State
    const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(defaultPasswordPolicy);
    const [sessionSettings, setSessionSettings] = useState<SessionSettings>(defaultSessionSettings);
    const [accountLockSettings, setAccountLockSettings] = useState<AccountLockSettings>(defaultAccountLockSettings);
    const [backups, setBackups] = useState<BackupConfig[]>(mockBackups);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
    const [backupInProgress, setBackupInProgress] = useState(false);
    
    // Modal State
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [newBackup, setNewBackup] = useState<Partial<BackupConfig>>({
        name: '',
        type: 'FULL',
        entities: [],
        schedule: 'MANUAL'
    });
    
    const saveSettings = async () => {
        setSaving(true);
        try {
            // محاكاة الحفظ
            await new Promise(resolve => setTimeout(resolve, 1000));
            addToast('تم حفظ إعدادات الأمان', 'success');
        } catch (err) {
            addToast('فشل في حفظ الإعدادات', 'error');
        } finally {
            setSaving(false);
        }
    };
    
    const runManualBackup = async () => {
        setBackupInProgress(true);
        addToast('جاري إنشاء النسخة الاحتياطية...', 'info');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const newBackupEntry: BackupConfig = {
                id: `bk_${Date.now()}`,
                name: 'نسخة يدوية',
                type: 'FULL',
                entities: ['products', 'orders', 'customers', 'settings'],
                schedule: 'MANUAL',
                lastBackupAt: new Date().toISOString(),
                status: 'SUCCESS',
                size: `${(Math.random() * 50 + 20).toFixed(1)} MB`
            };
            
            setBackups(prev => [newBackupEntry, ...prev]);
            addToast('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
        } catch (err) {
            addToast('فشل في إنشاء النسخة الاحتياطية', 'error');
        } finally {
            setBackupInProgress(false);
        }
    };
    
    const downloadBackup = (backup: BackupConfig) => {
        addToast(`جاري تحميل ${backup.name}...`, 'info');
        // محاكاة التحميل
        setTimeout(() => {
            addToast('تم بدء التحميل', 'success');
        }, 1000);
    };
    
    const deleteBackup = (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) return;
        setBackups(prev => prev.filter(b => b.id !== id));
        addToast('تم حذف النسخة الاحتياطية', 'info');
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getSeverityColor = (severity: AuditLogEntry['severity']) => {
        switch (severity) {
            case 'INFO': return 'bg-blue-100 text-blue-700';
            case 'WARNING': return 'bg-amber-100 text-amber-700';
            case 'CRITICAL': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };
    
    const availableEntities = [
        { value: 'products', label: 'المنتجات' },
        { value: 'orders', label: 'الطلبات' },
        { value: 'customers', label: 'العملاء' },
        { value: 'settings', label: 'الإعدادات' },
        { value: 'quotes', label: 'طلبات التسعير' },
        { value: 'imports', label: 'طلبات الاستيراد' },
        { value: 'logs', label: 'السجلات' }
    ];
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="text-[#C8A04F]" size={24} />
                            مركز الأمان والنسخ الاحتياطي
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            إدارة سياسات الأمان والنسخ الاحتياطي وسجلات النظام
                        </p>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-[#C8A04F] hover:bg-[#b8904a] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        data-testid="button-save-security"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
                        حفظ الإعدادات
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex flex-wrap border-b border-slate-200">
                    {[
                        { id: 'password', label: 'كلمات المرور', icon: Lock },
                        { id: 'sessions', label: 'الجلسات', icon: Clock },
                        { id: 'lockout', label: 'قفل الحساب', icon: Key },
                        { id: 'backup', label: 'النسخ الاحتياطي', icon: HardDrive },
                        { id: 'audit', label: 'سجل الأمان', icon: Activity }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
                                activeTab === tab.id
                                    ? 'text-[#C8A04F] border-[#C8A04F]'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                            data-testid={`tab-${tab.id}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Password Policy Tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Lock size={20} />
                        سياسة كلمات المرور
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Min Length */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                الحد الأدنى لطول كلمة المرور
                            </label>
                            <input
                                type="number"
                                min="6"
                                max="32"
                                value={passwordPolicy.minLength}
                                onChange={(e) => setPasswordPolicy({ ...passwordPolicy, minLength: parseInt(e.target.value) || 8 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-min-length"
                            />
                        </div>
                        
                        {/* Expiry Days */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                انتهاء الصلاحية (بالأيام)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="365"
                                value={passwordPolicy.expiryDays}
                                onChange={(e) => setPasswordPolicy({ ...passwordPolicy, expiryDays: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-expiry-days"
                            />
                            <p className="text-xs text-slate-500">0 = لا انتهاء صلاحية</p>
                        </div>
                        
                        {/* Prevent Reuse */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                منع إعادة استخدام آخر (عدد)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="24"
                                value={passwordPolicy.preventReuse}
                                onChange={(e) => setPasswordPolicy({ ...passwordPolicy, preventReuse: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-prevent-reuse"
                            />
                            <p className="text-xs text-slate-500">0 = السماح بإعادة الاستخدام</p>
                        </div>
                    </div>
                    
                    {/* Requirements */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">متطلبات كلمة المرور</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { key: 'requireUppercase', label: 'حرف كبير (A-Z)' },
                                { key: 'requireLowercase', label: 'حرف صغير (a-z)' },
                                { key: 'requireNumbers', label: 'رقم (0-9)' },
                                { key: 'requireSpecialChars', label: 'رمز خاص (!@#$)' }
                            ].map((req) => (
                                <button
                                    key={req.key}
                                    onClick={() => setPasswordPolicy({
                                        ...passwordPolicy,
                                        [req.key]: !passwordPolicy[req.key as keyof PasswordPolicy]
                                    })}
                                    className={`p-4 rounded-xl border-2 text-center transition-colors ${
                                        passwordPolicy[req.key as keyof PasswordPolicy]
                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="font-bold text-sm">{req.label}</span>
                                    <div className="mt-2">
                                        {passwordPolicy[req.key as keyof PasswordPolicy] ? (
                                            <CheckCircle className="mx-auto text-emerald-500" size={18} />
                                        ) : (
                                            <XCircle className="mx-auto text-slate-300" size={18} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Clock size={20} />
                        إعدادات الجلسات
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                الحد الأقصى للجلسات المتزامنة
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={sessionSettings.maxConcurrentSessions}
                                onChange={(e) => setSessionSettings({ ...sessionSettings, maxConcurrentSessions: parseInt(e.target.value) || 3 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-max-sessions"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                مهلة انتهاء الجلسة (دقائق)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="480"
                                value={sessionSettings.sessionTimeoutMinutes}
                                onChange={(e) => setSessionSettings({ ...sessionSettings, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-session-timeout"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                مدة "تذكرني" (أيام)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="90"
                                value={sessionSettings.rememberMeDays}
                                onChange={(e) => setSessionSettings({ ...sessionSettings, rememberMeDays: parseInt(e.target.value) || 14 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-remember-days"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <h4 className="font-bold text-slate-700">تسجيل الخروج عند تغيير كلمة المرور</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                إنهاء جميع الجلسات النشطة عند تغيير كلمة المرور
                            </p>
                        </div>
                        <button
                            onClick={() => setSessionSettings({ ...sessionSettings, enforceLogoutOnPasswordChange: !sessionSettings.enforceLogoutOnPasswordChange })}
                            className={`relative w-14 h-7 rounded-full transition-colors ${
                                sessionSettings.enforceLogoutOnPasswordChange ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                sessionSettings.enforceLogoutOnPasswordChange ? 'translate-x-1' : 'translate-x-8'
                            }`} />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Account Lockout Tab */}
            {activeTab === 'lockout' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Key size={20} />
                        إعدادات قفل الحساب
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                عدد المحاولات الفاشلة المسموحة
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="10"
                                value={accountLockSettings.maxFailedAttempts}
                                onChange={(e) => setAccountLockSettings({ ...accountLockSettings, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-max-attempts"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                مدة القفل (دقائق)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="1440"
                                value={accountLockSettings.lockDurationMinutes}
                                onChange={(e) => setAccountLockSettings({ ...accountLockSettings, lockDurationMinutes: parseInt(e.target.value) || 30 })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                data-testid="input-lock-duration"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-slate-700">فتح القفل تلقائياً</h4>
                                <p className="text-sm text-slate-500 mt-1">
                                    فتح الحساب تلقائياً بعد انتهاء مدة القفل
                                </p>
                            </div>
                            <button
                                onClick={() => setAccountLockSettings({ ...accountLockSettings, autoUnlock: !accountLockSettings.autoUnlock })}
                                className={`relative w-14 h-7 rounded-full transition-colors ${
                                    accountLockSettings.autoUnlock ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    accountLockSettings.autoUnlock ? 'translate-x-1' : 'translate-x-8'
                                }`} />
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-slate-700">إشعار المسؤول عند القفل</h4>
                                <p className="text-sm text-slate-500 mt-1">
                                    إرسال إشعار للمسؤول عند قفل أي حساب
                                </p>
                            </div>
                            <button
                                onClick={() => setAccountLockSettings({ ...accountLockSettings, notifyAdminOnLock: !accountLockSettings.notifyAdminOnLock })}
                                className={`relative w-14 h-7 rounded-full transition-colors ${
                                    accountLockSettings.notifyAdminOnLock ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    accountLockSettings.notifyAdminOnLock ? 'translate-x-1' : 'translate-x-8'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Backup Tab */}
            {activeTab === 'backup' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <HardDrive size={20} />
                            النسخ الاحتياطي
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={runManualBackup}
                                disabled={backupInProgress}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                                data-testid="button-manual-backup"
                            >
                                {backupInProgress ? (
                                    <RefreshCw className="animate-spin" size={16} />
                                ) : (
                                    <FileArchive size={16} />
                                )}
                                نسخة يدوية الآن
                            </button>
                            <button
                                onClick={() => setShowBackupModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#C8A04F] hover:bg-[#b8904a] text-white rounded-lg font-bold text-sm transition-colors"
                                data-testid="button-schedule-backup"
                            >
                                <Calendar size={16} />
                                جدولة نسخة
                            </button>
                        </div>
                    </div>
                    
                    {backups.length === 0 ? (
                        <div className="text-center py-12">
                            <HardDrive size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">لا توجد نسخ احتياطية</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {backups.map((backup) => (
                                <div
                                    key={backup.id}
                                    className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800">{backup.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    backup.type === 'FULL' ? 'bg-blue-100 text-blue-700' :
                                                    backup.type === 'PARTIAL' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {backup.type === 'FULL' ? 'كاملة' : backup.type === 'PARTIAL' ? 'جزئية' : 'تزايدية'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    backup.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                                                    backup.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    backup.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {backup.status === 'SUCCESS' ? 'ناجحة' :
                                                     backup.status === 'FAILED' ? 'فاشلة' :
                                                     backup.status === 'IN_PROGRESS' ? 'جارية' : 'معلقة'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                {backup.lastBackupAt && (
                                                    <span className="flex items-center gap-1">
                                                        <History size={14} />
                                                        آخر نسخة: {formatDate(backup.lastBackupAt)}
                                                    </span>
                                                )}
                                                {backup.size && (
                                                    <span className="flex items-center gap-1">
                                                        <Database size={14} />
                                                        الحجم: {backup.size}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {backup.schedule === 'MANUAL' ? 'يدوي' :
                                                     backup.schedule === 'DAILY' ? 'يومي' :
                                                     backup.schedule === 'WEEKLY' ? 'أسبوعي' : 'شهري'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {backup.entities.map((entity) => (
                                                    <span
                                                        key={entity}
                                                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold"
                                                    >
                                                        {availableEntities.find(e => e.value === entity)?.label || entity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => downloadBackup(backup)}
                                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="تحميل"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteBackup(backup.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Activity size={20} />
                        سجل الأمان
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600">
                                    <th className="px-4 py-3 text-right font-bold rounded-tr-xl">الحدث</th>
                                    <th className="px-4 py-3 text-right font-bold">المستخدم</th>
                                    <th className="px-4 py-3 text-right font-bold">IP</th>
                                    <th className="px-4 py-3 text-right font-bold">التاريخ</th>
                                    <th className="px-4 py-3 text-center font-bold rounded-tl-xl">الخطورة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-800">{log.action}</div>
                                            {log.details && (
                                                <div className="text-xs text-slate-500 mt-0.5">{log.details}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{log.user}</td>
                                        <td className="px-4 py-3 font-mono text-slate-500 text-xs">{log.ip}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(log.timestamp)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getSeverityColor(log.severity)}`}>
                                                {log.severity === 'INFO' ? 'عادي' :
                                                 log.severity === 'WARNING' ? 'تحذير' : 'حرج'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Backup Schedule Modal */}
            {showBackupModal && (
                <Modal
                    isOpen={showBackupModal}
                    onClose={() => setShowBackupModal(false)}
                    title="جدولة نسخة احتياطية"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">اسم النسخة</label>
                            <input
                                type="text"
                                value={newBackup.name || ''}
                                onChange={(e) => setNewBackup({ ...newBackup, name: e.target.value })}
                                placeholder="مثال: نسخة يومية"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">نوع النسخة</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['FULL', 'PARTIAL', 'INCREMENTAL'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setNewBackup({ ...newBackup, type: type as any })}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-colors ${
                                            newBackup.type === type
                                                ? 'bg-[#C8A04F]/10 border-[#C8A04F] text-[#C8A04F]'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {type === 'FULL' ? 'كاملة' : type === 'PARTIAL' ? 'جزئية' : 'تزايدية'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">الجدولة</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: 'MANUAL', label: 'يدوي' },
                                    { value: 'DAILY', label: 'يومي' },
                                    { value: 'WEEKLY', label: 'أسبوعي' },
                                    { value: 'MONTHLY', label: 'شهري' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setNewBackup({ ...newBackup, schedule: option.value as any })}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-colors ${
                                            newBackup.schedule === option.value
                                                ? 'bg-[#C8A04F]/10 border-[#C8A04F] text-[#C8A04F]'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">البيانات المشمولة</label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableEntities.map((entity) => (
                                    <label
                                        key={entity.value}
                                        className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={newBackup.entities?.includes(entity.value) || false}
                                            onChange={(e) => {
                                                const entities = newBackup.entities || [];
                                                if (e.target.checked) {
                                                    setNewBackup({ ...newBackup, entities: [...entities, entity.value] });
                                                } else {
                                                    setNewBackup({ ...newBackup, entities: entities.filter(v => v !== entity.value) });
                                                }
                                            }}
                                            className="rounded text-[#C8A04F] focus:ring-[#C8A04F]"
                                        />
                                        <span className="text-sm font-bold text-slate-700">{entity.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    if (!newBackup.name) {
                                        addToast('الرجاء إدخال اسم النسخة', 'error');
                                        return;
                                    }
                                    const backup: BackupConfig = {
                                        id: `bk_${Date.now()}`,
                                        name: newBackup.name,
                                        type: newBackup.type || 'FULL',
                                        entities: newBackup.entities || [],
                                        schedule: newBackup.schedule || 'MANUAL',
                                        status: 'PENDING'
                                    };
                                    setBackups(prev => [backup, ...prev]);
                                    setShowBackupModal(false);
                                    addToast('تمت جدولة النسخة الاحتياطية', 'success');
                                }}
                                className="flex-1 py-3 bg-[#C8A04F] hover:bg-[#b8904a] text-white rounded-xl font-bold transition-colors"
                            >
                                حفظ الجدولة
                            </button>
                            <button
                                onClick={() => setShowBackupModal(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminSecurityCenter;
