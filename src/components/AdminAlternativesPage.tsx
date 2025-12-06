import { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { AlternativePart } from '../types';
import { useToast } from '../services/ToastContext';
import { formatDateTime } from '../utils/dateUtils';
import { Search, Trash2, Loader2, Package, ChevronLeft, ChevronRight, RefreshCw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AdminAlternativesPageProps {
    onRefresh?: () => void;
}

export const AdminAlternativesPage: FC<AdminAlternativesPageProps> = ({ onRefresh }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();

    const [alternatives, setAlternatives] = useState<AlternativePart[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const PAGE_SIZE = 20;

    useEffect(() => {
        loadAlternatives();
    }, [currentPage]);

    const loadAlternatives = async () => {
        setLoading(true);
        try {
            const result = await MockApi.getAllAlternatives(currentPage, PAGE_SIZE);
            setAlternatives(result.data);
            setTotalCount(result.total);
        } catch (error) {
            console.error('Error loading alternatives:', error);
            addToast(t('admin.alternatives.loadError', 'خطأ في تحميل البدائل'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadAlternatives();
            return;
        }

        setLoading(true);
        try {
            const results = await MockApi.searchAlternatives(searchQuery.trim());
            setAlternatives(results);
            setTotalCount(results.length);
            setCurrentPage(1);
        } catch (error) {
            console.error('Search error:', error);
            addToast(t('admin.alternatives.searchError', 'خطأ في البحث'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.alternatives.confirmDelete', 'هل أنت متأكد من حذف هذا البديل؟'))) {
            return;
        }

        setDeletingId(id);
        try {
            await MockApi.deleteAlternative(id);
            addToast(t('admin.alternatives.deleteSuccess', 'تم حذف البديل بنجاح'), 'success');
            loadAlternatives();
            onRefresh?.();
        } catch (error) {
            console.error('Delete error:', error);
            addToast(t('admin.alternatives.deleteError', 'خطأ في حذف البديل'), 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = () => {
        try {
            const exportData = alternatives.map(alt => ({
                'الرقم الأصلي': alt.mainPartNumber,
                'الرقم البديل': alt.altPartNumber,
                'الوصف': alt.description || '',
                'العلامة': alt.brand || '',
                'المصدر': alt.sourceType === 'CUSTOMER_UPLOAD' ? 'العميل' : 'النظام',
                'رفع بواسطة': alt.sourceUserName || '-',
                'تاريخ الإنشاء': formatDateTime(alt.createdAt)
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, 'Alternatives');
            XLSX.writeFile(wb, `alternatives_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            addToast(t('admin.alternatives.exportSuccess', 'تم تصدير البيانات بنجاح'), 'success');
        } catch (error) {
            console.error('Export error:', error);
            addToast(t('admin.alternatives.exportError', 'خطأ في تصدير البيانات'), 'error');
        }
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Filter locally for quick filtering
    const filteredAlternatives = searchQuery.trim()
        ? alternatives
        : alternatives;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('admin.alternatives.title', 'إدارة البدائل')}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {t('admin.alternatives.subtitle', 'عرض وإدارة بدائل الأصناف المرفوعة')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={alternatives.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover-elevate disabled:opacity-50"
                        data-testid="button-export"
                    >
                        <Download className="w-4 h-4" />
                        {t('admin.alternatives.export', 'تصدير')}
                    </button>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setCurrentPage(1);
                            loadAlternatives();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover-elevate"
                        data-testid="button-refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('admin.alternatives.refresh', 'تحديث')}
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('admin.alternatives.totalCount', 'إجمالي البدائل')}</p>
                        <p className="text-2xl font-bold" data-testid="text-total-count">{totalCount}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('admin.alternatives.searchPlaceholder', 'بحث برقم القطعة...')}
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="input-search"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-elevate flex items-center gap-2"
                    data-testid="button-search"
                >
                    <Search className="w-4 h-4" />
                    {t('admin.alternatives.search', 'بحث')}
                </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredAlternatives.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('admin.alternatives.noData', 'لا توجد بدائل')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="table-alternatives">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.mainPart', 'الرقم الأصلي')}
                                    </th>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.altPart', 'الرقم البديل')}
                                    </th>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.description', 'الوصف')}
                                    </th>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.brand', 'العلامة')}
                                    </th>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.source', 'المصدر')}
                                    </th>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.uploadedBy', 'رفع بواسطة')}
                                    </th>
                                    <th className="text-start p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.createdAt', 'تاريخ الإضافة')}
                                    </th>
                                    <th className="text-center p-3 font-medium text-muted-foreground">
                                        {t('admin.alternatives.actions', 'الإجراءات')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAlternatives.map((alt) => (
                                    <tr
                                        key={alt.id}
                                        className="border-t border-border/50 hover:bg-muted/30"
                                        data-testid={`row-alternative-${alt.id}`}
                                    >
                                        <td className="p-3 font-mono">{alt.mainPartNumber}</td>
                                        <td className="p-3 font-mono text-primary">{alt.altPartNumber}</td>
                                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                                            {alt.description || '-'}
                                        </td>
                                        <td className="p-3">{alt.brand || '-'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                alt.sourceType === 'CUSTOMER_UPLOAD' 
                                                    ? 'bg-blue-500/10 text-blue-600' 
                                                    : 'bg-green-500/10 text-green-600'
                                            }`}>
                                                {alt.sourceType === 'CUSTOMER_UPLOAD' ? 'العميل' : 'النظام'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-muted-foreground">{alt.sourceUserName || '-'}</td>
                                        <td className="p-3 text-muted-foreground text-xs">
                                            {formatDateTime(alt.createdAt)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleDelete(alt.id)}
                                                disabled={deletingId === alt.id}
                                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50"
                                                data-testid={`button-delete-${alt.id}`}
                                            >
                                                {deletingId === alt.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            {t('admin.alternatives.showing', 'عرض')} {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} {t('admin.alternatives.of', 'من')} {totalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover-elevate disabled:opacity-50"
                                data-testid="button-prev-page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <span className="text-sm">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover-elevate disabled:opacity-50"
                                data-testid="button-next-page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAlternativesPage;
