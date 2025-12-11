/**
 * صفحة إدارة صور المنتجات - النسخة المحسنة
 * Admin Product Images Management Page - Enhanced Version
 * 
 * الميزات:
 * - رفع ملفات ZIP (10,000+ صورة)
 * - أرشفة دائمة (لا يمكن للمورد الحذف)
 * - كشف التكرار (رقم القطعة له صورة مسبقة)
 * - تعديل/إلغاء ربط الصور
 * - ترقيم صفحات للآلاف من الصور
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import {
    Image, Upload, Search, Eye, Check, X, Trash2, Edit3,
    Settings, RefreshCw, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight,
    FileImage, Package, BarChart3, Loader2, ZoomIn, Link2, Unlink,
    Archive, FileArchive, AlertCircle, CheckCircle
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';
import {
    ProductImage,
    WatermarkSettings,
    ImageStats,
    IMAGE_STATUS_LABELS,
    UPLOADER_TYPE_LABELS,
    WATERMARK_POSITION_LABELS,
    WATERMARK_FONT_SIZE_LABELS,
    DEFAULT_WATERMARK_SETTINGS,
    ACCEPTED_IMAGE_EXTENSIONS
} from '../utils/imageConstants';
import {
    compressImage,
    createThumbnail,
    extractPartNumberFromFileName,
    isValidImageFormat,
    formatFileSize,
    generateImageId,
    createWatermarkPreviewCanvas
} from '../services/imageService';
import { MockApi } from '../services/mockApi';

// Tab type
type TabType = 'IMAGES' | 'UPLOAD' | 'WATERMARK' | 'REPORTS' | 'PRODUCTS' | 'APPROVALS';

// عدد الصور في الصفحة الواحدة
const IMAGES_PER_PAGE = 50;

export const AdminProductImagesPage: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkInputRef = useRef<HTMLInputElement>(null);
    const zipInputRef = useRef<HTMLInputElement>(null);
    const watermarkPreviewRef = useRef<HTMLCanvasElement>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('IMAGES');

    // Data states
    const [images, setImages] = useState<ProductImage[]>([]);
    const [stats, setStats] = useState<ImageStats | null>(null);
    const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
    const [products, setProducts] = useState<any[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');  // New: for products tab
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Upload progress
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; phase: string } | null>(null);

    // Single image upload
    const [singlePartNumber, setSinglePartNumber] = useState('');

    // Edit modal
    const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
    const [editPartNumber, setEditPartNumber] = useState('');

    // Existing part numbers with images (for duplicate detection)
    const existingPartNumbersWithImages = useMemo(() => {
        return new Set(images.filter(img => img.partNumber && img.isLinkedToProduct).map(img => img.partNumber.toUpperCase()));
    }, [images]);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const storedImages = localStorage.getItem('sini_product_images');
            const storedSettings = localStorage.getItem('sini_watermark_settings');
            const allProducts = await MockApi.searchProducts('');

            setImages(storedImages ? JSON.parse(storedImages) : []);
            setWatermarkSettings(storedSettings ? JSON.parse(storedSettings) : DEFAULT_WATERMARK_SETTINGS);
            setProducts(allProducts);

            calculateStats(storedImages ? JSON.parse(storedImages) : [], allProducts);
        } catch (error) {
            console.error('Failed to load data:', error);
            addToast('حدث خطأ أثناء تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (imgs: ProductImage[], prods: any[]) => {
        const approvedImages = imgs.filter(i => i.status === 'APPROVED' || i.status === 'AUTO_MATCHED');
        const linkedPartNumbers = new Set(approvedImages.filter(i => i.isLinkedToProduct).map(i => i.partNumber));

        const newStats: ImageStats = {
            totalProducts: prods.length,
            productsWithImages: linkedPartNumbers.size,
            productsWithoutImages: prods.length - linkedPartNumbers.size,
            coveragePercent: prods.length > 0 ? Math.round((linkedPartNumbers.size / prods.length) * 100) : 0,
            pendingApproval: imgs.filter(i => i.status === 'PENDING').length,
            totalImages: imgs.length,
            imagesByUploader: {
                admin: imgs.filter(i => i.uploaderType === 'ADMIN').length,
                supplierLocal: imgs.filter(i => i.uploaderType === 'SUPPLIER_LOCAL').length,
                supplierInternational: imgs.filter(i => i.uploaderType === 'SUPPLIER_INTERNATIONAL').length,
                marketer: imgs.filter(i => i.uploaderType === 'MARKETER').length
            },
            unmatchedImages: imgs.filter(i => !i.isLinkedToProduct).length
        };

        setStats(newStats);
    };

    const saveImages = (newImages: ProductImage[]) => {
        localStorage.setItem('sini_product_images', JSON.stringify(newImages));
        setImages(newImages);
        calculateStats(newImages, products);
    };

    const saveWatermarkSettings = (settings: WatermarkSettings) => {
        localStorage.setItem('sini_watermark_settings', JSON.stringify(settings));
        setWatermarkSettings(settings);
        addToast('تم حفظ إعدادات العلامة المائية', 'success');
    };

    // Check if part number already has image
    const hasExistingImage = (partNumber: string): boolean => {
        return existingPartNumbersWithImages.has(partNumber.toUpperCase());
    };

    // Process single image file
    const processImageFile = async (file: File, partNumber?: string): Promise<ProductImage | null> => {
        try {
            const { dataUrl, width, height, blob } = await compressImage(file);
            const thumbnail = await createThumbnail(dataUrl);

            const pn = (partNumber?.trim().toUpperCase()) || extractPartNumberFromFileName(file.name) || '';
            const matchedProduct = products.find(p => p.partNumber?.toUpperCase() === pn);
            const hasPreviousImage = hasExistingImage(pn);

            return {
                id: generateImageId(),
                partNumber: pn,
                fileName: file.name,
                fileUrl: dataUrl,
                thumbnailUrl: thumbnail,
                originalSize: file.size,
                compressedSize: blob.size,
                width,
                height,
                status: 'AUTO_MATCHED',
                uploadedBy: 'admin',
                uploaderType: 'ADMIN',
                uploaderName: 'مدير النظام',
                isAutoMatched: !partNumber,
                isLinkedToProduct: !!matchedProduct,
                createdAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                approvedBy: 'admin',
                adminNotes: hasPreviousImage ? `تحديث صورة - كان يوجد صورة سابقة` : undefined
            };
        } catch (error) {
            console.error(`Failed to process ${file.name}:`, error);
            return null;
        }
    };

    // Handle single file upload
    const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isValidImageFormat(file)) {
            addToast('صيغة الملف غير مدعومة', 'error');
            return;
        }

        const partNumber = singlePartNumber.trim().toUpperCase();
        const hasPrevious = hasExistingImage(partNumber);

        setUploading(true);
        const newImage = await processImageFile(file, singlePartNumber);

        if (newImage) {
            saveImages([newImage, ...images]);
            addToast(
                hasPrevious
                    ? `تم رفع الصورة (تحديث للصورة السابقة لـ ${partNumber})`
                    : newImage.isLinkedToProduct
                        ? 'تم رفع الصورة وربطها بالمنتج'
                        : 'تم رفع الصورة (غير مربوطة بمنتج)',
                'success'
            );
        }

        setSinglePartNumber('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploading(false);
    };

    // Handle bulk upload (images)
    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList).filter(f => isValidImageFormat(f));
        if (files.length === 0) {
            addToast('لا توجد ملفات صور صالحة', 'error');
            return;
        }

        setUploading(true);
        setUploadProgress({ current: 0, total: files.length, phase: 'جاري معالجة الصور...' });

        const newImages: ProductImage[] = [];
        let matched = 0, unmatched = 0, updated = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress({ current: i + 1, total: files.length, phase: `معالجة: ${file.name}` });

            const partNumber = extractPartNumberFromFileName(file.name) || '';
            if (hasExistingImage(partNumber)) updated++;

            const newImage = await processImageFile(file);
            if (newImage) {
                if (newImage.isLinkedToProduct) matched++;
                else unmatched++;
                newImages.push(newImage);
            }
        }

        saveImages([...newImages, ...images]);
        addToast(
            `تم رفع ${newImages.length} صورة (${matched} مربوطة، ${unmatched} أرشيف${updated > 0 ? `، ${updated} تحديث` : ''})`,
            'success'
        );

        setUploadProgress(null);
        setUploading(false);
        if (bulkInputRef.current) bulkInputRef.current.value = '';
    };

    // Handle ZIP upload
    const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.zip')) {
            addToast('يرجى اختيار ملف ZIP', 'error');
            return;
        }

        setUploading(true);
        setUploadProgress({ current: 0, total: 100, phase: 'جاري فك الضغط...' });

        try {
            const zip = await JSZip.loadAsync(file);
            const imageFiles: { name: string; data: Blob }[] = [];

            // Extract images from ZIP
            const entries = Object.entries(zip.files);
            let processed = 0;

            for (const [path, zipEntry] of entries) {
                if (zipEntry.dir) continue;

                const ext = path.toLowerCase().split('.').pop();
                if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '')) {
                    const blob = await zipEntry.async('blob');
                    const fileName = path.split('/').pop() || path;
                    imageFiles.push({ name: fileName, data: blob });
                }

                processed++;
                setUploadProgress({
                    current: Math.round((processed / entries.length) * 30),
                    total: 100,
                    phase: `فك الضغط: ${processed}/${entries.length}`
                });
            }

            if (imageFiles.length === 0) {
                addToast('لا توجد صور في الملف المضغوط', 'error');
                setUploadProgress(null);
                setUploading(false);
                return;
            }

            // Process images
            const newImages: ProductImage[] = [];
            let matched = 0, unmatched = 0, updated = 0;

            for (let i = 0; i < imageFiles.length; i++) {
                const { name, data } = imageFiles[i];
                setUploadProgress({
                    current: 30 + Math.round((i / imageFiles.length) * 70),
                    total: 100,
                    phase: `معالجة: ${i + 1}/${imageFiles.length} - ${name}`
                });

                // Create File from Blob
                const imageFile = new File([data], name, { type: data.type || 'image/jpeg' });

                const partNumber = extractPartNumberFromFileName(name) || '';
                if (hasExistingImage(partNumber)) updated++;

                const newImage = await processImageFile(imageFile);
                if (newImage) {
                    if (newImage.isLinkedToProduct) matched++;
                    else unmatched++;
                    newImages.push(newImage);
                }
            }

            saveImages([...newImages, ...images]);
            addToast(
                `تم رفع ${newImages.length} صورة من ZIP (${matched} مربوطة، ${unmatched} أرشيف${updated > 0 ? `، ${updated} تحديث` : ''})`,
                'success'
            );

        } catch (error) {
            console.error('ZIP processing failed:', error);
            addToast('فشل في معالجة الملف المضغوط', 'error');
        } finally {
            setUploadProgress(null);
            setUploading(false);
            if (zipInputRef.current) zipInputRef.current.value = '';
        }
    };

    // Approve/Reject image
    const handleApprove = (imageId: string) => {
        const updated = images.map(img =>
            img.id === imageId
                ? { ...img, status: 'APPROVED' as const, approvedAt: new Date().toISOString(), approvedBy: 'admin' }
                : img
        );
        saveImages(updated);
        addToast('تم الموافقة على الصورة', 'success');
    };

    const handleReject = (imageId: string) => {
        const updated = images.map(img =>
            img.id === imageId
                ? { ...img, status: 'REJECTED' as const }
                : img
        );
        saveImages(updated);
        addToast('تم رفض الصورة', 'info');
    };

    // Archive delete (Admin only - soft delete, images stay)
    const handleArchiveDelete = (imageId: string) => {
        if (!confirm('هل أنت متأكد؟ سيتم نقل الصورة للأرشيف')) return;
        const updated = images.map(img =>
            img.id === imageId
                ? { ...img, status: 'REJECTED' as const, adminNotes: 'محذوف - مؤرشف' }
                : img
        );
        saveImages(updated);
        addToast('تم نقل الصورة للأرشيف', 'success');
    };

    // Permanent delete (Admin only)
    const handlePermanentDelete = (imageId: string) => {
        if (!confirm('⚠️ هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع!')) return;
        saveImages(images.filter(img => img.id !== imageId));
        addToast('تم حذف الصورة نهائياً', 'success');
    };

    // Edit image - open modal
    const openEditModal = (image: ProductImage) => {
        setEditingImage(image);
        setEditPartNumber(image.partNumber);
    };

    // Save edit
    const saveEdit = () => {
        if (!editingImage) return;

        const newPartNumber = editPartNumber.trim().toUpperCase();
        const matchedProduct = products.find(p => p.partNumber?.toUpperCase() === newPartNumber);
        const hasPrevious = newPartNumber && hasExistingImage(newPartNumber) && newPartNumber !== editingImage.partNumber.toUpperCase();

        const updated = images.map(img =>
            img.id === editingImage.id
                ? {
                    ...img,
                    partNumber: newPartNumber,
                    isLinkedToProduct: !!matchedProduct,
                    isAutoMatched: false,
                    adminNotes: hasPrevious ? `تم تعديل الربط - كان هناك صورة سابقة لـ ${newPartNumber}` : img.adminNotes
                }
                : img
        );
        saveImages(updated);
        addToast(
            matchedProduct
                ? `تم ربط الصورة بالمنتج ${newPartNumber}`
                : newPartNumber
                    ? `تم حفظ رقم القطعة (غير موجود في المنتجات)`
                    : 'تم إلغاء ربط الصورة',
            'success'
        );
        setEditingImage(null);
    };

    // Unlink image
    const unlinkImage = () => {
        if (!editingImage) return;
        setEditPartNumber('');
    };

    // Filter and paginate images
    const filteredImages = useMemo(() => {
        return images.filter(img => {
            const matchesSearch = searchTerm === '' ||
                img.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                img.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                img.uploaderName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || img.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [images, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
    const paginatedImages = useMemo(() => {
        const start = (currentPage - 1) * IMAGES_PER_PAGE;
        return filteredImages.slice(start, start + IMAGES_PER_PAGE);
    }, [filteredImages, currentPage]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // NEW: Filter products for PRODUCTS tab
    const filteredProducts = useMemo(() => {
        if (!productSearchTerm.trim()) return [];
        const term = productSearchTerm.toLowerCase();
        return products.filter(p =>
            p.partNumber?.toLowerCase().includes(term) ||
            p.name?.toLowerCase().includes(term)
        ).slice(0, 50);  // Limit to 50 results
    }, [products, productSearchTerm]);

    // NEW: Render Approvals Tab
    const renderApprovalsTab = () => {
        const pendingImages = images.filter(img => img.status === 'PENDING');

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Loader2 className="text-orange-500 animate-spin-slow" />
                        طلبات بانتظار الموافقة ({pendingImages.length})
                    </h3>
                    <div className="flex gap-2">
                        {/* Bulk actions could go here */}
                    </div>
                </div>

                {pendingImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <h4 className="text-lg font-bold text-slate-700">لا توجد طلبات معلقة</h4>
                        <p className="text-slate-500">جميع الصور تمت مراجعتها</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pendingImages.map(img => {
                            const matchedProduct = products.find(p => p.partNumber?.toUpperCase() === img.partNumber?.toUpperCase());

                            return (
                                <div key={img.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="flex h-32">
                                        <div className="w-32 h-32 bg-slate-100 flex-shrink-0 cursor-pointer" onClick={() => setPreviewImage(img.fileUrl)}>
                                            <img
                                                src={img.thumbnailUrl || img.fileUrl}
                                                alt={img.fileName}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 p-3 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-xs text-slate-500">رقم القطعة المقترح</p>
                                                        <p className="font-bold text-slate-800 dir-ltr text-left" title={img.partNumber}>
                                                            {img.partNumber || <span className="text-red-500 italic">غير محدد</span>}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => openEditModal(img)} className="p-1 hover:bg-slate-100 rounded text-blue-600" title="تعديل">
                                                        <Edit3 size={14} />
                                                    </button>
                                                </div>

                                                {matchedProduct ? (
                                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 w-fit">
                                                        <CheckCircle size={10} />
                                                        <span>منتج موجود</span>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit">
                                                        <AlertCircle size={10} />
                                                        <span>منتج غير موجود</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-[10px] text-slate-400">
                                                من: {img.uploaderName || 'مجهول'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex border-t border-slate-100 divide-x divide-slate-100 divide-x-reverse">
                                        <button
                                            onClick={() => handleApprove(img.id)}
                                            className="flex-1 py-2 flex items-center justify-center gap-2 text-green-600 hover:bg-green-50 font-medium text-sm transition-colors"
                                        >
                                            <Check size={16} /> موافقة
                                        </button>
                                        <button
                                            onClick={() => handleReject(img.id)}
                                            className="flex-1 py-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors"
                                        >
                                            <X size={16} /> رفض
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Watermark preview
    useEffect(() => {
        if (activeTab === 'WATERMARK' && watermarkPreviewRef.current) {
            const previewCanvas = createWatermarkPreviewCanvas(watermarkSettings, 400, 300);
            const ctx = watermarkPreviewRef.current.getContext('2d');
            if (ctx) {
                watermarkPreviewRef.current.width = 400;
                watermarkPreviewRef.current.height = 300;
                ctx.drawImage(previewCanvas, 0, 0);
            }
        }
    }, [watermarkSettings, activeTab]);

    // Render tabs
    const renderTabs = () => (
        <div className="flex gap-2 border-b border-slate-200 mb-6">
            {[
                { id: 'PRODUCTS', icon: <Package size={18} />, label: 'المنتجات', count: products.length },
                { id: 'APPROVALS', icon: <CheckCircle size={18} />, label: 'الموافقات', count: stats?.pendingApproval || 0 },
                { id: 'IMAGES', icon: <Image size={18} />, label: 'كل الصور', count: images.length },
                { id: 'UPLOAD', icon: <Upload size={18} />, label: 'رفع صور' },
                { id: 'WATERMARK', icon: <Settings size={18} />, label: 'العلامة المائية' },
                { id: 'REPORTS', icon: <BarChart3 size={18} />, label: 'التقارير' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {tab.icon} {tab.label}
                    {tab.count !== undefined && <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
                </button>
            ))}
        </div>
    );

    // Render stats cards
    const renderStatsCards = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><Archive size={20} className="text-purple-600" /></div>
                    <div>
                        <p className="text-xs text-slate-500">إجمالي الصور</p>
                        <p className="text-xl font-black text-purple-600">{stats?.totalImages || 0}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><Link2 size={20} className="text-green-600" /></div>
                    <div>
                        <p className="text-xs text-slate-500">مربوطة بمنتجات</p>
                        <p className="text-xl font-black text-green-600">{stats?.productsWithImages || 0}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg"><FileImage size={20} className="text-amber-600" /></div>
                    <div>
                        <p className="text-xs text-slate-500">أرشيف (غير مربوطة)</p>
                        <p className="text-xl font-black text-amber-600">{stats?.unmatchedImages || 0}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg"><BarChart3 size={20} className="text-cyan-600" /></div>
                    <div>
                        <p className="text-xs text-slate-500">التغطية</p>
                        <p className="text-xl font-black text-cyan-600">{stats?.coveragePercent || 0}%</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle size={20} className="text-red-600" /></div>
                    <div>
                        <p className="text-xs text-slate-500">بدون صور</p>
                        <p className="text-xl font-black text-red-600">{stats?.productsWithoutImages || 0}</p>
                    </div>
                </div>
            </div>
            <div
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm cursor-pointer hover:border-orange-300 transition-colors"
                onClick={() => setActiveTab('APPROVALS')}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg"><Loader2 size={20} className="text-orange-600" /></div>
                    <div>
                        <p className="text-xs text-slate-500">معلقة للموافقة</p>
                        <p className="text-xl font-black text-orange-600">{stats?.pendingApproval || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render pagination
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600">
                    عرض {((currentPage - 1) * IMAGES_PER_PAGE) + 1} - {Math.min(currentPage * IMAGES_PER_PAGE, filteredImages.length)} من {filteredImages.length} صورة
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let page: number;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                                <span className="px-1">...</span>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="w-8 h-8 rounded-lg text-sm font-bold hover:bg-slate-100 text-slate-600"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            </div>
        );
    };

    // Render images tab
    const renderImagesTab = () => (
        <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="بحث برقم القطعة أو اسم الملف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg"
                >
                    <option value="ALL">جميع الحالات ({images.length})</option>
                    {Object.entries(IMAGE_STATUS_LABELS).map(([key, val]) => (
                        <option key={key} value={key}>{val.ar}</option>
                    ))}
                </select>
                <button onClick={loadData} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2">
                    <RefreshCw size={18} /> تحديث
                </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {paginatedImages.map(img => (
                    <div
                        key={img.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="relative aspect-square bg-slate-100">
                            <img
                                src={img.thumbnailUrl || img.fileUrl}
                                alt={img.partNumber}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {/* Status Badge */}
                            <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${img.status === 'APPROVED' || img.status === 'AUTO_MATCHED' ? 'bg-green-500' :
                                img.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                                }`}>
                                {IMAGE_STATUS_LABELS[img.status].ar}
                            </div>
                            {/* Link indicator */}
                            {img.isLinkedToProduct ? (
                                <div className="absolute top-1 right-1 p-1 bg-blue-500 rounded-full" title="مربوطة بمنتج">
                                    <Link2 size={10} className="text-white" />
                                </div>
                            ) : (
                                <div className="absolute top-1 right-1 p-1 bg-amber-500 rounded-full" title="أرشيف - غير مربوطة">
                                    <Archive size={10} className="text-white" />
                                </div>
                            )}
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <button onClick={() => setPreviewImage(img.fileUrl)} className="p-1.5 bg-white rounded-full hover:bg-slate-100" title="معاينة">
                                    <ZoomIn size={14} className="text-slate-700" />
                                </button>
                                <button onClick={() => openEditModal(img)} className="p-1.5 bg-blue-500 rounded-full hover:bg-blue-600" title="تعديل">
                                    <Edit3 size={14} className="text-white" />
                                </button>
                                {img.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleApprove(img.id)} className="p-1.5 bg-green-500 rounded-full hover:bg-green-600" title="موافقة">
                                            <Check size={14} className="text-white" />
                                        </button>
                                        <button onClick={() => handleReject(img.id)} className="p-1.5 bg-red-500 rounded-full hover:bg-red-600" title="رفض">
                                            <X size={14} className="text-white" />
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleArchiveDelete(img.id)} className="p-1.5 bg-slate-700 rounded-full hover:bg-slate-800" title="أرشفة">
                                    <Trash2 size={14} className="text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-2">
                            <p className="font-bold text-xs text-slate-800 truncate">{img.partNumber || 'غير مربوط'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{img.fileName}</p>
                        </div>
                    </div>
                ))}

                {paginatedImages.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-400">
                        <FileImage size={48} className="mx-auto mb-4 opacity-50" />
                        <p>لا توجد صور مطابقة</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {renderPagination()}
        </div>
    );

    // Render upload tab
    const renderUploadTab = () => (
        <div className="space-y-6">
            {/* ZIP Upload - Featured */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6">
                <h3 className="font-bold text-lg text-blue-800 mb-4 flex items-center gap-2">
                    <FileArchive size={24} className="text-blue-600" /> رفع ملف مضغوط (ZIP)
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">موصى به</span>
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                    رفع آلاف الصور دفعة واحدة! سيتم ربط الصور تلقائياً إذا كان اسم الملف مطابقاً لرقم القطعة.
                </p>
                <div
                    className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-white/50"
                    onClick={() => zipInputRef.current?.click()}
                >
                    {uploadProgress ? (
                        <div className="space-y-3">
                            <Loader2 size={40} className="mx-auto text-blue-600 animate-spin" />
                            <p className="text-lg font-bold text-blue-800">{uploadProgress.phase}</p>
                            <div className="w-64 mx-auto bg-blue-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${uploadProgress.current}%` }}
                                />
                            </div>
                            <p className="text-sm text-blue-600">{uploadProgress.current}%</p>
                        </div>
                    ) : (
                        <>
                            <FileArchive size={48} className="mx-auto text-blue-400 mb-3" />
                            <p className="text-lg font-bold text-blue-800 mb-2">اسحب ملف ZIP هنا أو انقر للاختيار</p>
                            <p className="text-sm text-blue-600">يدعم حتى 10,000+ صورة</p>
                        </>
                    )}
                    <input
                        ref={zipInputRef}
                        type="file"
                        accept=".zip"
                        onChange={handleZipUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </div>
            </div>

            {/* Single Upload */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-green-600" /> رفع صورة واحدة
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="رقم القطعة"
                            value={singlePartNumber}
                            onChange={(e) => setSinglePartNumber(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg"
                        />
                        {singlePartNumber && hasExistingImage(singlePartNumber) && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <AlertCircle size={18} className="text-amber-500" title="يوجد صورة سابقة لهذا الرقم" />
                            </div>
                        )}
                    </div>
                    <label className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold cursor-pointer hover:bg-green-700 flex items-center gap-2">
                        <Upload size={18} /> اختر صورة
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_IMAGE_EXTENSIONS.join(',')}
                            onChange={handleSingleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
                {singlePartNumber && hasExistingImage(singlePartNumber) && (
                    <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle size={14} /> يوجد صورة سابقة لـ {singlePartNumber} - سيتم إضافة صورة جديدة
                    </p>
                )}
            </div>

            {/* Bulk Upload */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <FileImage size={20} className="text-purple-600" /> رفع عدة صور
                </h3>
                <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => bulkInputRef.current?.click()}
                >
                    <Upload size={40} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-lg font-bold text-slate-700 mb-2">اسحب الصور أو انقر للاختيار</p>
                    <p className="text-sm text-slate-500">سيتم ربط الصور تلقائياً بناءً على اسم الملف</p>
                    <input
                        ref={bulkInputRef}
                        type="file"
                        accept={ACCEPTED_IMAGE_EXTENSIONS.join(',')}
                        multiple
                        onChange={handleBulkUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </div>
            </div>
        </div>
    );

    // Render watermark tab
    const renderWatermarkTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Settings size={20} className="text-purple-600" /> إعدادات العلامة المائية
                </h3>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={watermarkSettings.enabled}
                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600"
                    />
                    <span className="font-bold text-slate-700">تفعيل العلامة المائية</span>
                </label>

                {watermarkSettings.enabled && (
                    <>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">نوع العلامة</label>
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setWatermarkSettings({ ...watermarkSettings, type: 'TEXT' })}
                                    className={`flex-1 py-2 rounded-lg font-bold ${watermarkSettings.type === 'TEXT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                                >
                                    نص فقط
                                </button>
                                <button
                                    onClick={() => setWatermarkSettings({ ...watermarkSettings, type: 'LOGO' })}
                                    className={`flex-1 py-2 rounded-lg font-bold ${watermarkSettings.type === 'LOGO' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                                >
                                    شعار فقط
                                </button>
                                <button
                                    onClick={() => setWatermarkSettings({ ...watermarkSettings, type: 'BOTH' })}
                                    className={`flex-1 py-2 rounded-lg font-bold ${watermarkSettings.type === 'BOTH' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                                >
                                    نص وشعار
                                </button>
                            </div>

                            {(watermarkSettings.type === 'LOGO' || watermarkSettings.type === 'BOTH') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-600 mb-2">الشعار</label>
                                    <div className="flex items-center gap-4">
                                        {watermarkSettings.logoUrl ? (
                                            <div className="relative w-16 h-16 bg-slate-100 rounded-lg border border-slate-200">
                                                <img src={watermarkSettings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                                                <button
                                                    onClick={() => setWatermarkSettings({ ...watermarkSettings, logoUrl: '' })}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                                <Image size={24} />
                                            </div>
                                        )}
                                        <label className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200">
                                            رفع شعار
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            setWatermarkSettings({ ...watermarkSettings, logoUrl: e.target?.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {(watermarkSettings.type === 'TEXT' || watermarkSettings.type === 'BOTH') && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">نص العلامة</label>
                                    <input
                                        type="text"
                                        value={watermarkSettings.text}
                                        onChange={(e) => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">الموقع</label>
                            <select
                                value={watermarkSettings.position}
                                onChange={(e) => setWatermarkSettings({ ...watermarkSettings, position: e.target.value as any })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                            >
                                {Object.entries(WATERMARK_POSITION_LABELS).map(([key, val]) => (
                                    <option key={key} value={key}>{val.ar}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">الشفافية: {Math.round(watermarkSettings.opacity * 100)}%</label>
                            <input
                                type="range"
                                min="0.1"
                                max="0.9"
                                step="0.1"
                                value={watermarkSettings.opacity}
                                onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">حجم الخط</label>
                            <div className="flex gap-2">
                                {Object.entries(WATERMARK_FONT_SIZE_LABELS).map(([key, val]) => (
                                    <button
                                        key={key}
                                        onClick={() => setWatermarkSettings({ ...watermarkSettings, fontSize: key as any })}
                                        className={`px-4 py-2 rounded-lg font-bold ${watermarkSettings.fontSize === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        {val.ar}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">لون النص</label>
                            <input
                                type="color"
                                value={watermarkSettings.textColor}
                                onChange={(e) => setWatermarkSettings({ ...watermarkSettings, textColor: e.target.value })}
                                className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                            />
                        </div>
                    </>
                )}

                <button
                    onClick={() => saveWatermarkSettings(watermarkSettings)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                    <Check size={18} /> حفظ
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <Eye size={20} className="text-cyan-600" /> معاينة
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <canvas ref={watermarkPreviewRef} className="w-full" />
                </div>
            </div>
        </div>
    );

    // Render reports tab
    const renderReportsTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4">تغطية صور المنتجات</h3>
                <div className="flex items-center gap-8">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8"
                                strokeDasharray={`${(stats?.coveragePercent || 0) * 2.51} 251.2`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-black text-slate-800">{stats?.coveragePercent || 0}%</span>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-bold">منتجات بصور</span>
                            <span className="text-2xl font-black text-green-600">{stats?.productsWithImages || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <span className="text-red-700 font-bold">منتجات بدون صور</span>
                            <span className="text-2xl font-black text-red-600">{stats?.productsWithoutImages || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                            <span className="text-amber-700 font-bold">صور في الأرشيف</span>
                            <span className="text-2xl font-black text-amber-600">{stats?.unmatchedImages || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4">الصور حسب المصدر</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-3xl font-black text-blue-600">{stats?.imagesByUploader.admin || 0}</p>
                        <p className="text-sm font-bold text-blue-700">الإدارة</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                        <p className="text-3xl font-black text-green-600">{stats?.imagesByUploader.supplierLocal || 0}</p>
                        <p className="text-sm font-bold text-green-700">موردين محليين</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                        <p className="text-3xl font-black text-purple-600">{stats?.imagesByUploader.supplierInternational || 0}</p>
                        <p className="text-sm font-bold text-purple-700">موردين دوليين</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl text-center">
                        <p className="text-3xl font-black text-amber-600">{stats?.imagesByUploader.marketer || 0}</p>
                        <p className="text-sm font-bold text-amber-700">مسوقين</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render products tab - for searching products and linking images
    const renderProductsTab = () => (
        <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            placeholder="ابحث برقم الصنف أو الاسم..."
                            className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Products List */}
            {productSearchTerm.trim() ? (
                filteredProducts.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-right p-4 font-bold text-slate-600">رقم الصنف</th>
                                    <th className="text-right p-4 font-bold text-slate-600">اسم الصنف</th>
                                    <th className="text-right p-4 font-bold text-slate-600">الماركة</th>
                                    <th className="text-right p-4 font-bold text-slate-600">حالة الصورة</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => {
                                    const hasImage = existingPartNumbersWithImages.has(product.partNumber?.toUpperCase());
                                    return (
                                        <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-slate-800">{product.partNumber}</span>
                                            </td>
                                            <td className="p-4 text-slate-600">{product.name}</td>
                                            <td className="p-4 text-slate-500">{product.brand || '-'}</td>
                                            <td className="p-4">
                                                {hasImage ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold">
                                                        <CheckCircle size={14} /> يوجد صورة
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold">
                                                        <AlertTriangle size={14} /> بدون صورة
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <label className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-sm cursor-pointer transition-colors">
                                                    <Upload size={16} />
                                                    {hasImage ? 'تغيير الصورة' : 'رفع صورة'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const newImage = await processImageFile(file, product.partNumber);
                                                                if (newImage) {
                                                                    saveImages([...images, { ...newImage, isLinkedToProduct: true }]);
                                                                    addToast(`تم رفع صورة للصنف ${product.partNumber}`, 'success');
                                                                    setProductSearchTerm('');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Search size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">لم يتم العثور على منتجات مطابقة</p>
                        <p className="text-sm text-slate-400 mt-1">جرب البحث برقم صنف آخر</p>
                    </div>
                )
            ) : (
                <div className="text-center py-12 bg-blue-50 rounded-xl border border-dashed border-blue-200">
                    <Package size={48} className="mx-auto text-blue-300 mb-4" />
                    <p className="text-blue-600 font-bold">ابحث عن منتج لربط صورة به</p>
                    <p className="text-sm text-blue-400 mt-1">إجمالي المنتجات: {products.length} منتج</p>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <FileImage size={28} className="text-blue-600" />
                    إدارة صور المنتجات
                    <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{images.length} صورة</span>
                </h2>
            </div>

            {/* Stats */}
            {renderStatsCards()}

            {/* Tabs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                {renderTabs()}

                {activeTab === 'PRODUCTS' && renderProductsTab()}
                {activeTab === 'APPROVALS' && renderApprovalsTab()}
                {activeTab === 'IMAGES' && renderImagesTab()}
                {activeTab === 'UPLOAD' && renderUploadTab()}
                {activeTab === 'WATERMARK' && renderWatermarkTab()}
                {activeTab === 'REPORTS' && renderReportsTab()}
            </div>

            {/* Preview Modal */}
            {previewImage && (
                <Modal onClose={() => setPreviewImage(null)} title="معاينة الصورة">
                    <div className="p-4">
                        <img src={previewImage} alt="Preview" className="max-w-full max-h-[70vh] mx-auto rounded-lg" />
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {editingImage && (
                <Modal onClose={() => setEditingImage(null)} title="تعديل ربط الصورة">
                    <div className="p-6 space-y-4">
                        <div className="flex gap-4">
                            <img
                                src={editingImage.thumbnailUrl || editingImage.fileUrl}
                                alt={editingImage.partNumber}
                                className="w-24 h-24 object-cover rounded-lg border"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-slate-500">اسم الملف</p>
                                <p className="font-bold text-slate-800 truncate">{editingImage.fileName}</p>
                                <p className="text-sm text-slate-500 mt-2">الحجم</p>
                                <p className="font-bold text-slate-800">{formatFileSize(editingImage.compressedSize)}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">رقم القطعة</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={editPartNumber}
                                    onChange={(e) => setEditPartNumber(e.target.value)}
                                    placeholder="أدخل رقم القطعة أو اتركه فارغاً للأرشيف"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg"
                                />
                                {editPartNumber && hasExistingImage(editPartNumber) && editPartNumber.toUpperCase() !== editingImage.partNumber.toUpperCase() && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <AlertCircle size={18} className="text-amber-500" />
                                    </div>
                                )}
                            </div>
                            {editPartNumber && hasExistingImage(editPartNumber) && editPartNumber.toUpperCase() !== editingImage.partNumber.toUpperCase() && (
                                <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                                    <AlertCircle size={14} /> يوجد صورة سابقة لهذا الرقم
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={saveEdit}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> حفظ
                            </button>
                            <button
                                onClick={unlinkImage}
                                className="px-4 py-3 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Unlink size={18} /> إلغاء الربط
                            </button>
                            <button
                                onClick={() => {
                                    handlePermanentDelete(editingImage.id);
                                    setEditingImage(null);
                                }}
                                className="px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
                            >
                                <Trash2 size={18} /> حذف نهائي
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminProductImagesPage;
