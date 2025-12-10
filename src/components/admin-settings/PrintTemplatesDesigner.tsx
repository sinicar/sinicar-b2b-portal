import { FC, useState } from 'react';
import { DocumentTemplate } from '../../types';
import { 
    Printer, Plus, Eye, Check, X, Settings, Layout, Palette,
    AlignLeft, AlignCenter, AlignRight, Copy, Trash2, Zap
} from 'lucide-react';

export interface PrintTemplatesDesignerProps {
    t: (key: string, fallback?: string) => string;
}

export const PrintTemplatesDesigner: FC<PrintTemplatesDesignerProps> = ({ t }) => {
    const [templates, setTemplates] = useState<DocumentTemplate[]>([
        { id: 'INVOICE', name: 'فاتورة', nameEn: 'Invoice', type: 'invoice', isDefault: true,
          pageSize: 'A4', orientation: 'portrait', margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: { enabled: true, height: 80, showLogo: true, logoPosition: 'right', showCompanyInfo: true },
          footer: { enabled: true, height: 40, showPageNumbers: true, customText: 'شكراً لتعاملكم معنا' },
          columns: ['productName', 'sku', 'quantity', 'unitPrice', 'total'],
          fonts: { heading: 'Cairo', body: 'Cairo', size: { heading: 16, body: 12 } },
          colors: { primary: '#1e3a5f', secondary: '#f59e0b', text: '#1f2937', border: '#e5e7eb' } },
        { id: 'QUOTE', name: 'عرض سعر', nameEn: 'Quotation', type: 'quote', isDefault: false,
          pageSize: 'A4', orientation: 'portrait', margins: { top: 25, right: 25, bottom: 25, left: 25 },
          header: { enabled: true, height: 100, showLogo: true, logoPosition: 'center', showCompanyInfo: true },
          footer: { enabled: true, height: 50, showPageNumbers: true, customText: 'عرض السعر ساري لمدة 7 أيام' },
          columns: ['productName', 'sku', 'quantity', 'unitPrice', 'discount', 'total'],
          fonts: { heading: 'Cairo', body: 'Cairo', size: { heading: 18, body: 11 } },
          colors: { primary: '#059669', secondary: '#fbbf24', text: '#374151', border: '#d1d5db' } },
        { id: 'PACKING_LIST', name: 'قائمة التعبئة', nameEn: 'Packing List', type: 'packing', isDefault: false,
          pageSize: 'A4', orientation: 'portrait', margins: { top: 15, right: 15, bottom: 15, left: 15 },
          header: { enabled: true, height: 60, showLogo: true, logoPosition: 'left', showCompanyInfo: false },
          footer: { enabled: false, height: 0, showPageNumbers: false, customText: '' },
          columns: ['productName', 'sku', 'quantity', 'location', 'notes'],
          fonts: { heading: 'Cairo', body: 'Cairo', size: { heading: 14, body: 10 } },
          colors: { primary: '#7c3aed', secondary: '#a78bfa', text: '#4b5563', border: '#e5e7eb' } },
        { id: 'DELIVERY_NOTE', name: 'إذن تسليم', nameEn: 'Delivery Note', type: 'delivery', isDefault: false,
          pageSize: 'A4', orientation: 'portrait', margins: { top: 20, right: 20, bottom: 20, left: 20 },
          header: { enabled: true, height: 70, showLogo: true, logoPosition: 'right', showCompanyInfo: true },
          footer: { enabled: true, height: 60, showPageNumbers: false, customText: 'توقيع المستلم: ____________' },
          columns: ['productName', 'quantity', 'notes'],
          fonts: { heading: 'Cairo', body: 'Cairo', size: { heading: 15, body: 11 } },
          colors: { primary: '#0891b2', secondary: '#06b6d4', text: '#1f2937', border: '#cbd5e1' } },
    ]);
    const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

    const pageSizes = [
        { value: 'A4', label: 'A4 (210 × 297 mm)' },
        { value: 'A5', label: 'A5 (148 × 210 mm)' },
        { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
        { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
    ];

    const availableColumns = [
        { value: 'productName', label: t('adminSettings.colProductName', 'اسم المنتج') },
        { value: 'sku', label: t('adminSettings.colSku', 'رمز المنتج') },
        { value: 'quantity', label: t('adminSettings.colQuantity', 'الكمية') },
        { value: 'unitPrice', label: t('adminSettings.colUnitPrice', 'سعر الوحدة') },
        { value: 'discount', label: t('adminSettings.colDiscount', 'الخصم') },
        { value: 'total', label: t('adminSettings.colTotal', 'الإجمالي') },
        { value: 'location', label: t('adminSettings.colLocation', 'الموقع') },
        { value: 'notes', label: t('adminSettings.colNotes', 'ملاحظات') },
    ];

    const updateTemplate = (id: string, updates: Partial<DocumentTemplate>) => {
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const toggleColumn = (id: string, column: string) => {
        const tmpl = templates.find(t => t.id === id);
        if (!tmpl) return;
        const columns = tmpl.columns.includes(column)
            ? tmpl.columns.filter(c => c !== column)
            : [...tmpl.columns, column];
        updateTemplate(id, { columns });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Printer className="text-brand-600" /> {t('adminSettings.printTemplateDesigner', 'مصمم قوالب الطباعة')}
                </h2>
                <button className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 flex items-center gap-2">
                    <Plus size={18} /> {t('adminSettings.addTemplate', 'إضافة قالب')}
                </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-start gap-3">
                    <Layout className="text-purple-500 mt-0.5" size={20} />
                    <div>
                        <p className="font-bold text-purple-800">{t('adminSettings.templateDesignerDesc', 'مصمم قوالب احترافي')}</p>
                        <p className="text-sm text-purple-600">{t('adminSettings.templateDesignerDescDetail', 'تحكم كامل في الشعار، الحقول، الهوامش، الألوان، والتخطيط لجميع مستندات الطباعة')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(tmpl => (
                    <div 
                        key={tmpl.id}
                        className={`p-4 rounded-xl border-2 transition-all ${editingTemplate === tmpl.id ? 'border-brand-500 bg-brand-50 md:col-span-2' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        {editingTemplate === tmpl.id ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-slate-800 text-lg">{t('adminSettings.editTemplate', 'تعديل القالب')}: {tmpl.name}</h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPreviewTemplate(tmpl)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-2">
                                            <Eye size={16} /> {t('adminSettings.preview', 'معاينة')}
                                        </button>
                                        <button onClick={() => setEditingTemplate(null)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                            <Check size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <h5 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={16} /> {t('adminSettings.pageSettings', 'إعدادات الصفحة')}</h5>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">{t('adminSettings.pageSize', 'حجم الصفحة')}</label>
                                            <select 
                                                value={tmpl.pageSize}
                                                onChange={e => updateTemplate(tmpl.id, { pageSize: e.target.value as any })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                            >
                                                {pageSizes.map(ps => <option key={ps.value} value={ps.value}>{ps.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">{t('adminSettings.orientation', 'الاتجاه')}</label>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => updateTemplate(tmpl.id, { orientation: 'portrait' })}
                                                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${tmpl.orientation === 'portrait' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                                                >
                                                    <div className="w-6 h-8 border-2 border-current mx-auto mb-1"></div>
                                                    <span className="text-xs">{t('adminSettings.portrait', 'عمودي')}</span>
                                                </button>
                                                <button 
                                                    onClick={() => updateTemplate(tmpl.id, { orientation: 'landscape' })}
                                                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${tmpl.orientation === 'landscape' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                                                >
                                                    <div className="w-8 h-6 border-2 border-current mx-auto mb-1"></div>
                                                    <span className="text-xs">{t('adminSettings.landscape', 'أفقي')}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">{t('adminSettings.margins', 'الهوامش (mm)')}</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs text-slate-500">{t('adminSettings.top', 'أعلى')}</label>
                                                    <input type="number" value={tmpl.margins.top}
                                                        onChange={e => updateTemplate(tmpl.id, { margins: { ...tmpl.margins, top: Number(e.target.value) } })}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">{t('adminSettings.bottom', 'أسفل')}</label>
                                                    <input type="number" value={tmpl.margins.bottom}
                                                        onChange={e => updateTemplate(tmpl.id, { margins: { ...tmpl.margins, bottom: Number(e.target.value) } })}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">{t('adminSettings.right', 'يمين')}</label>
                                                    <input type="number" value={tmpl.margins.right}
                                                        onChange={e => updateTemplate(tmpl.id, { margins: { ...tmpl.margins, right: Number(e.target.value) } })}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">{t('adminSettings.left', 'يسار')}</label>
                                                    <input type="number" value={tmpl.margins.left}
                                                        onChange={e => updateTemplate(tmpl.id, { margins: { ...tmpl.margins, left: Number(e.target.value) } })}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="font-bold text-slate-700 flex items-center gap-2"><Layout size={16} /> {t('adminSettings.headerFooter', 'الرأس والتذييل')}</h5>
                                        <div className="p-3 bg-slate-50 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm">{t('adminSettings.header', 'الرأس')}</span>
                                                <button 
                                                    onClick={() => updateTemplate(tmpl.id, { header: { ...tmpl.header, enabled: !tmpl.header.enabled } })}
                                                    className={`p-2 rounded-lg ${tmpl.header.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}
                                                >
                                                    {tmpl.header.enabled ? <Check size={14} /> : <X size={14} />}
                                                </button>
                                            </div>
                                            {tmpl.header.enabled && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={tmpl.header.showLogo}
                                                            onChange={e => updateTemplate(tmpl.id, { header: { ...tmpl.header, showLogo: e.target.checked } })}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{t('adminSettings.showLogo', 'إظهار الشعار')}</span>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500">{t('adminSettings.logoPosition', 'موقع الشعار')}</label>
                                                        <div className="flex gap-1">
                                                            {['left', 'center', 'right'].map(pos => (
                                                                <button key={pos}
                                                                    onClick={() => updateTemplate(tmpl.id, { header: { ...tmpl.header, logoPosition: pos as any } })}
                                                                    className={`flex-1 p-2 rounded border ${tmpl.header.logoPosition === pos ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                                                                >
                                                                    {pos === 'left' && <AlignLeft size={14} className="mx-auto" />}
                                                                    {pos === 'center' && <AlignCenter size={14} className="mx-auto" />}
                                                                    {pos === 'right' && <AlignRight size={14} className="mx-auto" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={tmpl.header.showCompanyInfo}
                                                            onChange={e => updateTemplate(tmpl.id, { header: { ...tmpl.header, showCompanyInfo: e.target.checked } })}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{t('adminSettings.showCompanyInfo', 'معلومات الشركة')}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm">{t('adminSettings.footer', 'التذييل')}</span>
                                                <button 
                                                    onClick={() => updateTemplate(tmpl.id, { footer: { ...tmpl.footer, enabled: !tmpl.footer.enabled } })}
                                                    className={`p-2 rounded-lg ${tmpl.footer.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}
                                                >
                                                    {tmpl.footer.enabled ? <Check size={14} /> : <X size={14} />}
                                                </button>
                                            </div>
                                            {tmpl.footer.enabled && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={tmpl.footer.showPageNumbers}
                                                            onChange={e => updateTemplate(tmpl.id, { footer: { ...tmpl.footer, showPageNumbers: e.target.checked } })}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{t('adminSettings.showPageNumbers', 'أرقام الصفحات')}</span>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500">{t('adminSettings.customText', 'نص مخصص')}</label>
                                                        <input type="text" value={tmpl.footer.customText}
                                                            onChange={e => updateTemplate(tmpl.id, { footer: { ...tmpl.footer, customText: e.target.value } })}
                                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="font-bold text-slate-700 flex items-center gap-2"><Palette size={16} /> {t('adminSettings.colorsAndFonts', 'الألوان والخطوط')}</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-slate-500">{t('adminSettings.primaryColor', 'اللون الرئيسي')}</label>
                                                <div className="flex items-center gap-1">
                                                    <input type="color" value={tmpl.colors.primary}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, primary: e.target.value } })}
                                                        className="w-8 h-8 rounded cursor-pointer"
                                                    />
                                                    <input type="text" value={tmpl.colors.primary}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, primary: e.target.value } })}
                                                        className="flex-1 p-1 text-xs bg-slate-50 border border-slate-200 rounded font-mono" dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">{t('adminSettings.secondaryColor', 'اللون الثانوي')}</label>
                                                <div className="flex items-center gap-1">
                                                    <input type="color" value={tmpl.colors.secondary}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, secondary: e.target.value } })}
                                                        className="w-8 h-8 rounded cursor-pointer"
                                                    />
                                                    <input type="text" value={tmpl.colors.secondary}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, secondary: e.target.value } })}
                                                        className="flex-1 p-1 text-xs bg-slate-50 border border-slate-200 rounded font-mono" dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">{t('adminSettings.textColor', 'لون النص')}</label>
                                                <div className="flex items-center gap-1">
                                                    <input type="color" value={tmpl.colors.text}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, text: e.target.value } })}
                                                        className="w-8 h-8 rounded cursor-pointer"
                                                    />
                                                    <input type="text" value={tmpl.colors.text}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, text: e.target.value } })}
                                                        className="flex-1 p-1 text-xs bg-slate-50 border border-slate-200 rounded font-mono" dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">{t('adminSettings.borderColor', 'لون الحدود')}</label>
                                                <div className="flex items-center gap-1">
                                                    <input type="color" value={tmpl.colors.border}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, border: e.target.value } })}
                                                        className="w-8 h-8 rounded cursor-pointer"
                                                    />
                                                    <input type="text" value={tmpl.colors.border}
                                                        onChange={e => updateTemplate(tmpl.id, { colors: { ...tmpl.colors, border: e.target.value } })}
                                                        className="flex-1 p-1 text-xs bg-slate-50 border border-slate-200 rounded font-mono" dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">{t('adminSettings.columns', 'الأعمدة المعروضة')}</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {availableColumns.map(col => (
                                                    <button key={col.value}
                                                        onClick={() => toggleColumn(tmpl.id, col.value)}
                                                        className={`px-2 py-1 text-xs rounded border transition-all ${tmpl.columns.includes(col.value) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
                                                    >
                                                        {col.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: tmpl.colors.primary }}>
                                        <Printer size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800">{tmpl.name}</h4>
                                            {tmpl.isDefault && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">{t('adminSettings.default', 'افتراضي')}</span>}
                                        </div>
                                        <p className="text-sm text-slate-500">{tmpl.nameEn} • {tmpl.pageSize} • {tmpl.orientation === 'portrait' ? t('adminSettings.portrait', 'عمودي') : t('adminSettings.landscape', 'أفقي')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setEditingTemplate(tmpl.id)}
                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                        <Copy size={16} />
                                    </button>
                                    {!tmpl.isDefault && (
                                        <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-800 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><Printer size={16} /> {t('adminSettings.printTip', 'نصيحة الطباعة')}</div>
                    {t('adminSettings.printTipDesc', 'استخدم معاينة الطباعة للتأكد من أن المستند يظهر بالشكل المطلوب قبل الطباعة الفعلية')}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><Zap size={16} /> {t('adminSettings.pdfExport', 'تصدير PDF')}</div>
                    {t('adminSettings.pdfExportDesc', 'جميع القوالب تدعم التصدير المباشر إلى ملفات PDF عالية الجودة')}
                </div>
            </div>
        </div>
    );
};
