import { useState, useRef, FC, ChangeEvent, KeyboardEvent } from 'react';
import { Upload, Search, FileSpreadsheet, Loader2, Download, Trash2, ArrowLeft, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { MockApi } from '../services/mockApi';
import { User, AlternativePart, AlternativeUploadResult } from '../types';
import { useToast } from '../services/ToastContext';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

interface AlternativesPageProps {
    user: User;
    onBack?: () => void;
}

export const AlternativesPage: FC<AlternativesPageProps> = ({ user, onBack }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<AlternativeUploadResult | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<AlternativePart[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max

    const handleDownloadTemplate = async () => {
        try {
            const wb = XLSX.utils.book_new();
            const ws_data = [
                ["MAIN_PART", "ALT_PART", "DESCRIPTION", "BRAND"],
                ["CN-102030", "CN-102030-ALT", "فحمات فرامل بديلة", "OEM"],
                ["MG-998877", "MG-998877-AF", "فلتر زيت بديل", "Aftermarket"],
                ["GL-COOL-01", "GL-COOL-02", "راديتر بديل", "OEM"]
            ];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, "Alternatives");
            XLSX.writeFile(wb, "SiniCar_Alternatives_Template.xlsx");
            addToast(t('alternatives.templateDownloaded', 'تم تحميل النموذج'), 'success');
        } catch (e) {
            addToast(t('alternatives.templateError', 'حدث خطأ أثناء تحميل النموذج'), 'error');
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
            addToast(t('alternatives.invalidFileType', 'صيغة الملف غير مدعومة. استخدم Excel أو CSV'), 'error');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            addToast(t('alternatives.fileTooLarge', 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'), 'error');
            return;
        }

        setUploadFile(file);
        setUploadResult(null);
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

        setIsUploading(true);
        setUploadResult(null);

        try {
            const data = await uploadFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

            if (jsonData.length < 2) {
                addToast(t('alternatives.emptyFile', 'الملف فارغ أو لا يحتوي على بيانات'), 'error');
                setIsUploading(false);
                return;
            }

            // Parse headers
            const headers = jsonData[0].map((h: unknown) => String(h).toLowerCase().trim());
            const mainIdx = headers.findIndex((h: string) => h.includes('main') || h.includes('رقم') || h.includes('الرئيسي'));
            const altIdx = headers.findIndex((h: string) => h.includes('alt') || h.includes('بديل'));
            const descIdx = headers.findIndex((h: string) => h.includes('desc') || h.includes('وصف'));
            const brandIdx = headers.findIndex((h: string) => h.includes('brand') || h.includes('ماركة') || h.includes('علامة'));

            if (mainIdx === -1 || altIdx === -1) {
                addToast(t('alternatives.missingColumns', 'الملف يجب أن يحتوي على عمودي MAIN_PART و ALT_PART'), 'error');
                setIsUploading(false);
                return;
            }

            // Parse rows
            const rows: Array<{ mainPart: string; altPart: string; description?: string; brand?: string }> = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;

                rows.push({
                    mainPart: String(row[mainIdx] || ''),
                    altPart: String(row[altIdx] || ''),
                    description: descIdx >= 0 ? String(row[descIdx] || '') : undefined,
                    brand: brandIdx >= 0 ? String(row[brandIdx] || '') : undefined
                });
            }

            if (rows.length === 0) {
                addToast(t('alternatives.noDataRows', 'لا توجد بيانات صالحة في الملف'), 'error');
                setIsUploading(false);
                return;
            }

            // Upload to API
            const result = await MockApi.uploadAlternatives(rows, user.id, user.name);
            setUploadResult(result);

            if (result.rowsInserted > 0) {
                addToast(t('alternatives.uploadSuccess', `تم إضافة ${result.rowsInserted} بديل بنجاح`), 'success');
            }
            if (result.rowsSkipped > 0) {
                addToast(t('alternatives.someSkipped', `تم تخطي ${result.rowsSkipped} صف`), 'warning');
            }

            setUploadFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            addToast(t('alternatives.uploadError', 'حدث خطأ أثناء رفع الملف'), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            addToast(t('alternatives.enterPartNumber', 'أدخل رقم القطعة للبحث'), 'warning');
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const results = await MockApi.searchAlternatives(searchQuery.trim());
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            addToast(t('alternatives.searchError', 'حدث خطأ أثناء البحث'), 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover-elevate"
                        data-testid="button-back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('alternatives.title', 'بدائل الأصناف')}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {t('alternatives.subtitle', 'ارفع ملف البدائل أو ابحث عن بدائل قطعة معينة')}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Upload className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">
                            {t('alternatives.uploadTitle', 'رفع ملف البدائل')}
                        </h2>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {t('alternatives.uploadDescription', 'ارفع ملف Excel يحتوي على أرقام القطع الأصلية والبديلة')}
                    </p>

                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                        data-testid="button-download-template"
                    >
                        <Download className="w-4 h-4" />
                        {t('alternatives.downloadTemplate', 'تحميل نموذج Excel')}
                    </button>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="alternatives-file-input"
                            data-testid="input-file-upload"
                        />
                        <label
                            htmlFor="alternatives-file-input"
                            className="cursor-pointer flex flex-col items-center gap-2"
                        >
                            <FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {uploadFile ? uploadFile.name : t('alternatives.selectFile', 'اختر ملف Excel أو اسحبه هنا')}
                            </span>
                        </label>
                    </div>

                    {uploadFile && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover-elevate disabled:opacity-50"
                                data-testid="button-upload"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('alternatives.uploading', 'جاري الرفع...')}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        {t('alternatives.uploadButton', 'رفع الملف')}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setUploadFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="p-2 text-muted-foreground hover:text-destructive hover-elevate rounded-lg"
                                data-testid="button-clear-file"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Upload Result */}
                    {uploadResult && (
                        <div className={`p-4 rounded-lg ${uploadResult.rowsInserted > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {uploadResult.rowsInserted > 0 ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                                )}
                                <span className="font-medium">
                                    {t('alternatives.uploadResult', 'نتيجة الرفع')}
                                </span>
                            </div>
                            <div className="text-sm space-y-1">
                                <p>{t('alternatives.rowsProcessed', 'الصفوف المعالجة')}: {uploadResult.rowsProcessed}</p>
                                <p>{t('alternatives.rowsInserted', 'البدائل المضافة')}: {uploadResult.rowsInserted}</p>
                                <p>{t('alternatives.rowsSkipped', 'الصفوف المتخطاة')}: {uploadResult.rowsSkipped}</p>
                            </div>
                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div className="mt-2 text-xs text-destructive">
                                    {uploadResult.errors.slice(0, 3).map((err, i) => (
                                        <p key={i}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Search Section */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">
                            {t('alternatives.searchTitle', 'البحث عن البدائل')}
                        </h2>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {t('alternatives.searchDescription', 'أدخل رقم القطعة للعثور على البدائل المتاحة')}
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('alternatives.searchPlaceholder', 'رقم القطعة...')}
                            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            data-testid="input-search-part"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-primary text-primary-foreground py-2 px-4 rounded-lg flex items-center gap-2 hover-elevate disabled:opacity-50"
                            data-testid="button-search"
                        >
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            {t('alternatives.searchButton', 'بحث')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {hasSearched && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {t('alternatives.searchResults', 'نتائج البحث')}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({searchResults.length} {t('alternatives.results', 'نتيجة')})
                        </span>
                    </h3>

                    {searchResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm" data-testid="table-results">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-start p-3 font-medium text-muted-foreground">
                                            {t('alternatives.mainPart', 'الرقم الأصلي')}
                                        </th>
                                        <th className="text-start p-3 font-medium text-muted-foreground">
                                            {t('alternatives.altPart', 'الرقم البديل')}
                                        </th>
                                        <th className="text-start p-3 font-medium text-muted-foreground">
                                            {t('alternatives.description', 'الوصف')}
                                        </th>
                                        <th className="text-start p-3 font-medium text-muted-foreground">
                                            {t('alternatives.brand', 'العلامة')}
                                        </th>
                                        <th className="text-start p-3 font-medium text-muted-foreground">
                                            {t('alternatives.source', 'المصدر')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((alt) => (
                                        <tr
                                            key={alt.id}
                                            className="border-b border-border/50 hover:bg-muted/50"
                                            data-testid={`row-alternative-${alt.id}`}
                                        >
                                            <td className="p-3 font-mono">{alt.mainPartNumber}</td>
                                            <td className="p-3 font-mono text-primary">{alt.altPartNumber}</td>
                                            <td className="p-3 text-muted-foreground">{alt.description || '-'}</td>
                                            <td className="p-3">{alt.brand || '-'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    alt.sourceType === 'CUSTOMER_UPLOAD' 
                                                        ? 'bg-blue-500/10 text-blue-600' 
                                                        : 'bg-green-500/10 text-green-600'
                                                }`}>
                                                    {alt.sourceType === 'CUSTOMER_UPLOAD' 
                                                        ? t('alternatives.customerUpload', 'العميل') 
                                                        : t('alternatives.system', 'النظام')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t('alternatives.noResults', 'لا توجد بدائل لهذه القطعة')}</p>
                            <p className="text-sm mt-1">
                                {t('alternatives.noResultsHint', 'جرب رفع ملف البدائل لإضافة بيانات جديدة')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlternativesPage;
