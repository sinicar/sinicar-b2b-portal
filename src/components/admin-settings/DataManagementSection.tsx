import { useState, FC, ChangeEvent } from 'react';
import { SiteSettings } from '../../types';
import Api from '../../services/api';
import { useToast } from '../../services/ToastContext';
import { useLanguage } from '../../services/LanguageContext';
import { 
    Database, ArrowUpCircle, ArrowDownCircle, 
    AlertTriangle, ShieldAlert, Trash2, RefreshCcw, CheckCircle2 
} from 'lucide-react';

export interface DataManagementSectionProps {
    settings: SiteSettings;
    onUpdate: (settings: SiteSettings) => void;
    onSave: () => void;
    saving: boolean;
}

export const DataManagementSection: FC<DataManagementSectionProps> = ({ settings, onUpdate, onSave, saving }) => {
    const [backupUploaded, setBackupUploaded] = useState(false);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetStep, setResetStep] = useState<'initial' | 'confirm' | 'final'>('initial');
    const [resetLoading, setResetLoading] = useState(false);
    const { addToast } = useToast();
    const { t } = useLanguage();

    const handleBackupUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const fileContent = await file.text();
                const data = JSON.parse(fileContent);
                
                const requiredKeys = ['products', 'orders', 'customers', 'settings'];
                const missingKeys = requiredKeys.filter(key => !(key in data));
                
                if (missingKeys.length > 0) {
                    addToast(`ملف النسخة الاحتياطية غير صالح. المفاتيح المفقودة: ${missingKeys.join(', ')}`, 'error');
                    return;
                }
                
                const hasData = 
                    (Array.isArray(data.products) && data.products.length > 0) ||
                    (Array.isArray(data.orders) && data.orders.length > 0) ||
                    (Array.isArray(data.customers) && data.customers.length > 0);
                
                if (!hasData) {
                    addToast('ملف النسخة الاحتياطية فارغ أو لا يحتوي على بيانات كافية', 'error');
                    return;
                }
                
                if (!data.exportDate) {
                    addToast('ملف النسخة الاحتياطية غير صالح - يجب أن يكون ملف مصدر من النظام', 'error');
                    return;
                }
                
                setBackupFile(file);
                setBackupUploaded(true);
                addToast('تم التحقق من ملف النسخة الاحتياطية وقبوله بنجاح', 'success');
            } catch (error) {
                addToast('ملف النسخة الاحتياطية غير صالح - تأكد من أنه ملف JSON صحيح', 'error');
            }
        }
    };

    const handleExportBackup = async () => {
        try {
            const backup = await Api.exportAllData();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sinicar_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            addToast('تم تصدير النسخة الاحتياطية بنجاح', 'success');
        } catch (error) {
            addToast('حدث خطأ أثناء تصدير النسخة الاحتياطية', 'error');
        }
    };

    const handleResetAllData = async () => {
        if (!backupUploaded) {
            addToast('يجب رفع نسخة احتياطية أولاً قبل الفورمات', 'error');
            return;
        }

        setResetLoading(true);
        try {
            await Api.resetAllData();
            addToast('تم مسح جميع البيانات بنجاح', 'success');
            setShowResetConfirm(false);
            setResetStep('initial');
            setBackupUploaded(false);
            setBackupFile(null);
            window.location.reload();
        } catch (error) {
            addToast('حدث خطأ أثناء مسح البيانات', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="text-brand-600" /> إدارة البيانات
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">النسخ الاحتياطي وإعادة ضبط البيانات</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <ArrowUpCircle size={20} className="text-green-500" /> النسخ الاحتياطي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleExportBackup}
                        className="p-6 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all text-right"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <ArrowDownCircle size={24} className="text-green-600" />
                            <span className="font-bold text-green-800">تصدير نسخة احتياطية</span>
                        </div>
                        <p className="text-sm text-green-600">حفظ جميع البيانات في ملف JSON</p>
                    </button>

                    <label className="p-6 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all cursor-pointer text-right block">
                        <div className="flex items-center gap-3 mb-2">
                            <ArrowUpCircle size={24} className="text-blue-600" />
                            <span className="font-bold text-blue-800">رفع نسخة احتياطية</span>
                            {backupUploaded && <CheckCircle2 size={20} className="text-green-500" />}
                        </div>
                        <p className="text-sm text-blue-600">
                            {backupFile ? `تم رفع: ${backupFile.name}` : 'استيراد البيانات من ملف JSON'}
                        </p>
                        <input 
                            type="file" 
                            accept=".json"
                            onChange={handleBackupUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500" /> إعادة ضبط البيانات (فورمات)
                </h3>

                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <ShieldAlert size={24} className="text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-red-800">تحذير: هذا الإجراء لا يمكن التراجع عنه!</h4>
                            <p className="text-sm text-red-600 mt-1">
                                سيتم مسح جميع البيانات بشكل نهائي: الطلبات، الأصناف، العملاء، السجلات، وجميع المعاملات.
                            </p>
                            <p className="text-sm text-red-700 font-bold mt-2">
                                يجب رفع نسخة احتياطية أولاً قبل السماح بالفورمات.
                            </p>
                        </div>
                    </div>
                </div>

                {!showResetConfirm ? (
                    <button 
                        onClick={() => setShowResetConfirm(true)}
                        disabled={!backupUploaded}
                        className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            backupUploaded 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <Trash2 size={20} />
                        {backupUploaded ? 'بدء عملية الفورمات' : 'ارفع نسخة احتياطية أولاً'}
                    </button>
                ) : (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        {resetStep === 'initial' && (
                            <div className="space-y-4">
                                <p className="text-slate-700 font-bold">هل أنت متأكد من أنك تريد مسح جميع البيانات؟</p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setResetStep('confirm')}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
                                    >
                                        نعم، متأكد
                                    </button>
                                    <button 
                                        onClick={() => {setShowResetConfirm(false); setResetStep('initial');}}
                                        className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}

                        {resetStep === 'confirm' && (
                            <div className="space-y-4">
                                <p className="text-red-700 font-bold">⚠️ تأكيد نهائي: سيتم مسح كل شيء!</p>
                                <p className="text-sm text-slate-600">اكتب "فورمات" للتأكيد:</p>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-slate-300 rounded-lg text-center font-bold"
                                    placeholder="اكتب فورمات"
                                    onChange={(e) => {
                                        if (e.target.value === 'فورمات') {
                                            setResetStep('final');
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => {setShowResetConfirm(false); setResetStep('initial');}}
                                    className="w-full bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        )}

                        {resetStep === 'final' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center">
                                    <AlertTriangle size={48} className="text-red-600 mx-auto mb-2" />
                                    <p className="text-red-800 font-bold">آخر فرصة للتراجع!</p>
                                </div>
                                <button 
                                    onClick={handleResetAllData}
                                    disabled={resetLoading}
                                    className="w-full bg-red-700 text-white py-4 rounded-lg font-bold hover:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {resetLoading ? (
                                        <>
                                            <RefreshCcw size={20} className="animate-spin" />
                                            جاري المسح...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={20} />
                                            تنفيذ الفورمات النهائي
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => {setShowResetConfirm(false); setResetStep('initial');}}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                                >
                                    ألغيت رأيي - لا تمسح
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
