import { useState, FC } from 'react';
import { SiteSettings, StatusLabelsConfig } from '../../types';
import { MockApi } from '../../services/mockApi';
import { useToast } from '../../services/ToastContext';
import { useLanguage } from '../../services/LanguageContext';
import { 
    Tags, Save, Plus, Trash2, Check, X, ShieldCheck, 
    ShoppingCart, Warehouse, Users, DollarSign, FileText, 
    Package, Truck, Globe, Pencil, Star 
} from 'lucide-react';

export interface StatusLabelsManagerProps {
    settings: SiteSettings;
    onUpdate: (settings: SiteSettings) => void;
    onSave: () => void;
    saving: boolean;
}

interface StatusDefinition {
    label: string;
    color: string;
    bgColor: string;
    icon?: string;
    isSystem?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
}

const getStatusCategories = (t: (key: string) => string) => [
    { key: 'orderStatus', label: t('adminSettings.statusCategories.orderStatus'), icon: <ShoppingCart size={16} /> },
    { key: 'orderInternalStatus', label: t('adminSettings.statusCategories.orderInternalStatus'), icon: <Warehouse size={16} /> },
    { key: 'accountRequestStatus', label: t('adminSettings.statusCategories.accountRequestStatus'), icon: <Users size={16} /> },
    { key: 'quoteRequestStatus', label: t('adminSettings.statusCategories.quoteRequestStatus'), icon: <DollarSign size={16} /> },
    { key: 'quoteItemStatus', label: t('adminSettings.statusCategories.quoteItemStatus'), icon: <FileText size={16} /> },
    { key: 'missingStatus', label: t('adminSettings.statusCategories.missingStatus'), icon: <Package size={16} /> },
    { key: 'importRequestStatus', label: t('adminSettings.statusCategories.importRequestStatus'), icon: <Truck size={16} /> },
    { key: 'customerStatus', label: t('adminSettings.statusCategories.customerStatus'), icon: <Globe size={16} /> },
    { key: 'staffStatus', label: t('adminSettings.statusCategories.staffStatus'), icon: <Users size={16} /> }
];

export const StatusLabelsManager: FC<StatusLabelsManagerProps> = ({ settings, onUpdate, onSave, saving }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('orderStatus');
    const [editingStatus, setEditingStatus] = useState<string | null>(null);
    const [tempLabel, setTempLabel] = useState('');
    const [tempColor, setTempColor] = useState('#000000');
    const [tempBgColor, setTempBgColor] = useState('#ffffff');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStatusKey, setNewStatusKey] = useState('');
    const [newStatusLabel, setNewStatusLabel] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#6b7280');
    const [newStatusBgColor, setNewStatusBgColor] = useState('#f3f4f6');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [checkingUsage, setCheckingUsage] = useState(false);
    const { addToast } = useToast();
    const { t } = useLanguage();

    const STATUS_CATEGORIES = getStatusCategories(t);
    const statusLabels = settings.statusLabels;
    if (!statusLabels) return null;

    const currentCategory = statusLabels[selectedCategory as keyof StatusLabelsConfig] as Record<string, StatusDefinition>;
    const categoryInfo = STATUS_CATEGORIES.find(c => c.key === selectedCategory);

    const sortedEntries = Object.entries(currentCategory).sort((a, b) => {
        const orderA = a[1].sortOrder || 999;
        const orderB = b[1].sortOrder || 999;
        return orderA - orderB;
    });

    const handleEditStart = (statusKey: string) => {
        const status = currentCategory[statusKey];
        if (status) {
            setEditingStatus(statusKey);
            setTempLabel(status.label);
            setTempColor(status.color);
            setTempBgColor(status.bgColor);
        }
    };

    const handleEditSave = async () => {
        if (!editingStatus || !tempLabel.trim()) return;
        
        const existing = currentCategory[editingStatus];
        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: {
                ...currentCategory,
                [editingStatus]: {
                    ...existing,
                    label: tempLabel.trim(),
                    color: tempColor,
                    bgColor: tempBgColor
                }
            }
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        setEditingStatus(null);
        addToast(t('adminSettings.statusUpdated'), 'success');
    };

    const handleEditCancel = () => {
        setEditingStatus(null);
    };

    const handleAddStatus = async () => {
        if (!newStatusKey.trim() || !newStatusLabel.trim()) {
            addToast(t('adminSettings.fillKeyAndName'), 'error');
            return;
        }
        
        const keyFormatted = newStatusKey.trim().toUpperCase().replace(/\s+/g, '_');
        if (currentCategory[keyFormatted]) {
            addToast(t('adminSettings.keyExists'), 'error');
            return;
        }

        const existingLabels = Object.values(currentCategory);
        const maxOrder = existingLabels.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0);

        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: {
                ...currentCategory,
                [keyFormatted]: {
                    label: newStatusLabel.trim(),
                    color: newStatusColor,
                    bgColor: newStatusBgColor,
                    isSystem: false,
                    sortOrder: maxOrder + 1
                }
            }
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        setShowAddForm(false);
        setNewStatusKey('');
        setNewStatusLabel('');
        setNewStatusColor('#6b7280');
        setNewStatusBgColor('#f3f4f6');
        addToast(t('adminSettings.statusAdded'), 'success');
    };

    const handleDeleteStatus = async (statusKey: string) => {
        const status = currentCategory[statusKey];
        if (status.isSystem) {
            addToast(t('adminSettings.cannotDeleteSystem'), 'error');
            return;
        }

        setCheckingUsage(true);
        const usageCount = await MockApi.checkStatusUsage(selectedCategory as any, statusKey);
        setCheckingUsage(false);

        if (usageCount > 0) {
            addToast(t('adminSettings.cannotDeleteInUse', { count: usageCount }), 'error');
            setDeleteConfirm(null);
            return;
        }

        const updatedCategory = { ...currentCategory };
        delete updatedCategory[statusKey];

        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: updatedCategory
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        setDeleteConfirm(null);
        addToast(t('adminSettings.statusDeleted'), 'success');
    };

    const handleSetDefault = async (statusKey: string) => {
        const updatedCategory = { ...currentCategory };
        Object.keys(updatedCategory).forEach(key => {
            updatedCategory[key] = { ...updatedCategory[key], isDefault: key === statusKey };
        });

        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: updatedCategory
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        addToast(t('adminSettings.defaultStatusSet'), 'success');
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Tags className="text-orange-500" /> {t('adminSettings.statusLabelsManagement')}
                </h2>
                <button onClick={onSave} disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2" data-testid="button-save-status-labels">
                    <Save size={18} /> {saving ? t('adminSettings.saving') : t('adminSettings.saveChanges')}
                </button>
            </div>

            <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                {t('adminSettings.statusLabelsDescription')}
            </p>

            <div className="flex flex-wrap gap-2">
                {STATUS_CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => { setSelectedCategory(cat.key); setShowAddForm(false); setEditingStatus(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            selectedCategory === cat.key 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        data-testid={`button-category-${cat.key}`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-visible">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">{categoryInfo?.icon} {categoryInfo?.label}</h3>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors"
                        data-testid="button-add-new-status"
                    >
                        <Plus size={16} /> {t('adminSettings.addNewStatus')}
                    </button>
                </div>

                {showAddForm && (
                    <div className="bg-brand-50 p-6 border-b border-brand-200 animate-slide-up">
                        <h4 className="font-bold text-brand-800 mb-4 flex items-center gap-2"><Plus size={18} /> {t('adminSettings.addNewStatus')}</h4>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-slate-500 mb-1">{t('adminSettings.statusKey')}</label>
                                <input
                                    type="text"
                                    value={newStatusKey}
                                    onChange={e => setNewStatusKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono"
                                    placeholder="NEW_STATUS"
                                    data-testid="input-new-status-key"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-slate-500 mb-1">{t('adminSettings.statusLabel')}</label>
                                <input
                                    type="text"
                                    value={newStatusLabel}
                                    onChange={e => setNewStatusLabel(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold"
                                    placeholder={t('adminSettings.newStatus')}
                                    data-testid="input-new-status-label"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500">{t('adminSettings.textColor')}:</label>
                                <input
                                    type="color"
                                    value={newStatusColor}
                                    onChange={e => setNewStatusColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                    data-testid="input-new-status-color"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500">{t('adminSettings.backgroundColor')}:</label>
                                <input
                                    type="color"
                                    value={newStatusBgColor}
                                    onChange={e => setNewStatusBgColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                    data-testid="input-new-status-bgcolor"
                                />
                            </div>
                            <div 
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ backgroundColor: newStatusBgColor, color: newStatusColor }}
                            >
                                {newStatusLabel || t('adminSettings.preview')}
                            </div>
                            <button 
                                onClick={handleAddStatus}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                                data-testid="button-confirm-add-status"
                            >
                                {t('adminSettings.add')}
                            </button>
                            <button 
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                                data-testid="button-cancel-add-status"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-slate-100">
                    {sortedEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" data-testid={`row-status-${key}`}>
                            {editingStatus === key ? (
                                <div className="flex-1 flex items-center gap-4 flex-wrap">
                                    <input
                                        type="text"
                                        value={tempLabel}
                                        onChange={e => setTempLabel(e.target.value)}
                                        className="flex-1 min-w-[150px] p-2 border border-slate-300 rounded-lg text-sm font-bold"
                                        placeholder={t('adminSettings.statusLabel')}
                                        data-testid="input-edit-status-label"
                                    />
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-500">{t('adminSettings.textColor')}:</label>
                                        <input
                                            type="color"
                                            value={tempColor}
                                            onChange={e => setTempColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                            data-testid="input-edit-status-color"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-500">{t('adminSettings.backgroundColor')}:</label>
                                        <input
                                            type="color"
                                            value={tempBgColor}
                                            onChange={e => setTempBgColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                            data-testid="input-edit-status-bgcolor"
                                        />
                                    </div>
                                    <div 
                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                        style={{ backgroundColor: tempBgColor, color: tempColor }}
                                    >
                                        {tempLabel || t('adminSettings.preview')}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleEditSave}
                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            data-testid="button-confirm-edit-status"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button 
                                            onClick={handleEditCancel}
                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            data-testid="button-cancel-edit-status"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : deleteConfirm === key ? (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-red-600 font-bold text-sm">
                                        {checkingUsage ? t('adminSettings.checkingUsage') : t('adminSettings.confirmDelete')}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleDeleteStatus(key)}
                                            disabled={checkingUsage}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                            data-testid="button-confirm-delete-status"
                                        >
                                            {t('adminSettings.yesDelete')}
                                        </button>
                                        <button 
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                                            data-testid="button-cancel-delete-status"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-500">{key}</code>
                                        <span 
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: value.bgColor, color: value.color }}
                                        >
                                            {value.label}
                                        </span>
                                        {value.isSystem && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold flex items-center gap-1">
                                                <ShieldCheck size={10} /> {t('adminSettings.systemStatus')}
                                            </span>
                                        )}
                                        {value.isDefault && (
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold flex items-center gap-1">
                                                <Star size={10} /> {t('adminSettings.defaultStatus')}
                                            </span>
                                        )}
                                        {value.sortOrder && (
                                            <span className="text-[10px] text-slate-400">#{value.sortOrder}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!value.isDefault && (
                                            <button 
                                                onClick={() => handleSetDefault(key)}
                                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                                title={t('adminSettings.setAsDefault')}
                                                data-testid={`button-set-default-${key}`}
                                            >
                                                <Star size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleEditStart(key)}
                                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                            title={t('common.edit')}
                                            data-testid={`button-edit-status-${key}`}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        {!value.isSystem && (
                                            <button 
                                                onClick={() => setDeleteConfirm(key)}
                                                className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t('common.delete')}
                                                data-testid={`button-delete-status-${key}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><ShieldCheck size={16} /> {t('adminSettings.systemStatuses')}</div>
                    {t('adminSettings.systemStatusesDesc')}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><Star size={16} /> {t('adminSettings.defaultStatusInfo')}</div>
                    {t('adminSettings.defaultStatusInfoDesc')}
                </div>
            </div>
        </div>
    );
};
