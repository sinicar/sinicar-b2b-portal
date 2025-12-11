/**
 * خدمة معالجة الصور والعلامات المائية
 * Image Processing and Watermark Service
 */

import {
    ProductImage,
    WatermarkSettings,
    ImageStats,
    ImageStatus,
    UploaderType,
    ACCEPTED_IMAGE_FORMATS,
    MAX_COMPRESSED_SIZE_BYTES,
    DEFAULT_WATERMARK_SETTINGS,
    WATERMARK_FONT_SIZE_LABELS
} from '../utils/imageConstants';

/**
 * ضغط الصورة إلى الحجم المطلوب
 */
export const compressImage = async (
    file: File,
    maxSizeBytes: number = MAX_COMPRESSED_SIZE_BYTES,
    quality: number = 0.8
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // تصغير الأبعاد إذا كانت كبيرة جداً
                const maxDimension = 2000;
                if (width > maxDimension || height > maxDimension) {
                    const ratio = Math.min(maxDimension / width, maxDimension / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // ضغط تدريجي حتى الوصول للحجم المطلوب
                let currentQuality = quality;
                const compress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Could not compress image'));
                                return;
                            }

                            if (blob.size > maxSizeBytes && currentQuality > 0.1) {
                                currentQuality -= 0.1;
                                compress();
                            } else {
                                const dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                                resolve({ blob, dataUrl, width, height });
                            }
                        },
                        'image/jpeg',
                        currentQuality
                    );
                };

                compress();
            };
            img.onerror = () => reject(new Error('Could not load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * إنشاء صورة مصغرة
 */
export const createThumbnail = async (
    dataUrl: string,
    maxSize: number = 150
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error('Could not create thumbnail'));
        img.src = dataUrl;
    });
};

/**
 * تطبيق العلامة المائية على الصورة
 */
export const applyWatermark = async (
    imageDataUrl: string,
    settings: WatermarkSettings
): Promise<string> => {
    if (!settings.enabled) return imageDataUrl;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // 1. Draw Original Image
            ctx.drawImage(img, 0, 0);

            // 2. Prepare Logo (if exists)
            let logoImg: HTMLImageElement | null = null;
            if ((settings.type === 'LOGO' || settings.type === 'BOTH') && settings.logoUrl) {
                try {
                    logoImg = await new Promise((res, rej) => {
                        const l = new Image();
                        l.crossOrigin = 'Anonymous';
                        l.onload = () => res(l);
                        l.onerror = () => res(null);
                        l.src = settings.logoUrl!;
                    });
                } catch (e) {
                    console.warn('Failed to load watermark logo', e);
                }
            }

            // 3. Setup Context
            ctx.globalAlpha = settings.opacity;
            const fontSize = WATERMARK_FONT_SIZE_LABELS[settings.fontSize].px;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = settings.textColor;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            // Measurements
            const text = settings.text || '';
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const lineHeight = fontSize * 1.5;

            // Calculate Logo Size
            const logoSize = Math.min(canvas.width, canvas.height) * 0.15; // 15% of min dimension
            const spacing = 10; // Spacing between logo and text

            // 4. Draw Logic
            if (settings.position === 'TILE') {
                // --- TILING PATTERN ---
                ctx.save();
                ctx.rotate((settings.rotation * Math.PI) / 180);

                // Calculate pattern cell size (enough to fit text + logo)
                const cellWidth = Math.max(textWidth, logoImg ? logoSize : 0) + (settings.margin * 4);
                const cellHeight = (logoImg ? logoSize : 0) + lineHeight + (settings.margin * 4);

                // Overscan to cover rotation
                const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

                for (let y = -diag; y < diag; y += cellHeight) {
                    for (let x = -diag; x < diag; x += cellWidth) {
                        // Offset every other row for brick pattern
                        const offsetX = (Math.floor(y / cellHeight) % 2 === 0) ? 0 : cellWidth / 2;

                        const drawX = x + offsetX;
                        const drawY = y;

                        // Draw Logo
                        if (logoImg && (settings.type === 'LOGO' || settings.type === 'BOTH')) {
                            const lx = drawX - (logoSize / 2);
                            const ly = drawY - (logoSize / 2) - (settings.type === 'BOTH' ? lineHeight / 2 : 0);
                            ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
                        }

                        // Draw Text
                        if (settings.type === 'TEXT' || settings.type === 'BOTH') {
                            const ty = logoImg && settings.type === 'BOTH'
                                ? drawY + (logoSize / 2)
                                : drawY;

                            // Shadow for better visibility
                            ctx.shadowColor = 'rgba(0,0,0,0.5)';
                            ctx.shadowBlur = 4;
                            ctx.fillText(text, drawX, ty);
                            ctx.shadowColor = 'transparent'; // Reset shadow
                        }
                    }
                }
                ctx.restore();

            } else {
                // --- FIXED POSITION ---
                let x = 0, y = 0;

                // Determine anchor point
                const margin = settings.margin;
                switch (settings.position) {
                    case 'TOP_LEFT': x = margin; y = margin; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; break;
                    case 'TOP_RIGHT': x = canvas.width - margin; y = margin; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; break;
                    case 'BOTTOM_LEFT': x = margin; y = canvas.height - margin; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; break;
                    case 'BOTTOM_RIGHT': x = canvas.width - margin; y = canvas.height - margin; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; break;
                    case 'CENTER':
                    default:
                        x = canvas.width / 2;
                        y = canvas.height / 2;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        break;
                }

                ctx.save();

                // Rotation for fixed position (usually around center of the element)
                const isCenter = settings.position === 'CENTER';
                if (settings.rotation !== 0) {
                    ctx.translate(x, y);
                    ctx.rotate((settings.rotation * Math.PI) / 180);
                    x = 0; y = 0; // Reset coords as we translated
                }

                // Draw Cluster (Logo + Text)
                // If it's not center, we need to adjust drawing offset based on alignment
                // But simplified: effectively we draw at (x,y)

                if (logoImg && (settings.type === 'LOGO' || settings.type === 'BOTH')) {
                    let lx = x;
                    let ly = y;

                    if (isCenter) {
                        lx = -logoSize / 2;
                        ly = -logoSize / 2 - (settings.type === 'BOTH' ? lineHeight / 2 : 0);
                    } else if (settings.position.includes('LEFT')) {
                        lx = x;
                    } else { // RIGHT
                        lx = x - logoSize;
                    }

                    // Vertical adjustment for top/bottom
                    if (!isCenter) {
                        if (settings.position.includes('BOTTOM')) ly = y - logoSize - (settings.type === 'BOTH' ? lineHeight : 0);
                        // TOP is default y
                    }

                    ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
                }

                if (settings.type === 'TEXT' || settings.type === 'BOTH') {
                    let tx = x;
                    let ty = y;

                    if (isCenter) {
                        tx = 0;
                        ty = logoImg && settings.type === 'BOTH' ? (logoSize / 2 + spacing) : 0;
                    } else {
                        // Adjust based on logo presence
                        if (logoImg && settings.type === 'BOTH') {
                            if (settings.position.includes('BOTTOM')) ty = y; // Text at bottom
                            else ty = y + logoSize + spacing; // Text below logo
                        }
                    }

                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(text, tx, ty);
                }

                ctx.restore();
            }

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('Could not apply watermark'));
        img.src = imageDataUrl;
    });
};

/**
 * استخراج رقم القطعة من اسم الملف
 */
export const extractPartNumberFromFileName = (fileName: string): string | null => {
    // إزالة الامتداد
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

    // تنظيف الاسم من الأحرف الخاصة
    const cleanName = nameWithoutExt
        .replace(/[^a-zA-Z0-9\-_]/g, '')
        .trim()
        .toUpperCase();

    // إذا كان الاسم فارغاً بعد التنظيف
    if (!cleanName || cleanName.length < 3) return null;

    return cleanName;
};

/**
 * التحقق من صيغة الصورة
 */
export const isValidImageFormat = (file: File): boolean => {
    return ACCEPTED_IMAGE_FORMATS.includes(file.type);
};

/**
 * تنسيق حجم الملف
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * إنشاء معرف فريد
 */
export const generateImageId = (): string => {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * معاينة العلامة المائية (بدون تطبيقها فعلياً)
 */
export const createWatermarkPreviewCanvas = (
    settings: WatermarkSettings,
    width: number = 400,
    height: number = 300
): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    if (!settings.enabled) return canvas;

    // Main Draw Logic
    const draw = (logoImg: HTMLImageElement | null) => {
        ctx.globalAlpha = settings.opacity;
        const fontSize = WATERMARK_FONT_SIZE_LABELS[settings.fontSize].px;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = settings.textColor;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const text = settings.text || '';
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const lineHeight = fontSize * 1.5;
        const logoSize = Math.min(width, height) * 0.15;
        const spacing = 10;

        if (settings.position === 'TILE') {
            ctx.save();
            ctx.rotate((settings.rotation * Math.PI) / 180);

            const cellWidth = Math.max(textWidth, logoImg ? logoSize : 0) + (settings.margin * 4);
            const cellHeight = (logoImg ? logoSize : 0) + lineHeight + (settings.margin * 4);
            const diag = Math.sqrt(width ** 2 + height ** 2);

            for (let y = -diag; y < diag; y += cellHeight) {
                for (let x = -diag; x < diag; x += cellWidth) {
                    const offsetX = (Math.floor(y / cellHeight) % 2 === 0) ? 0 : cellWidth / 2;
                    const drawX = x + offsetX;
                    const drawY = y;

                    if (logoImg && (settings.type === 'LOGO' || settings.type === 'BOTH')) {
                        const lx = drawX - (logoSize / 2);
                        const ly = drawY - (logoSize / 2) - (settings.type === 'BOTH' ? lineHeight / 2 : 0);
                        ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
                    }

                    if (settings.type === 'TEXT' || settings.type === 'BOTH') {
                        const ty = logoImg && settings.type === 'BOTH'
                            ? drawY + (logoSize / 2)
                            : drawY;
                        ctx.fillText(text, drawX, ty);
                    }
                }
            }
            ctx.restore();
        } else {
            // Preview fixed position (Simplified - just centers for preview usually, but let's try to honor pos)
            // Actually, for preview box (400x300), we can just place it relative to center or corners
            // But to keep it simple and visible, we'll draw it in the center or relative corners
            let x = 0, y = 0;
            const m = settings.margin;
            switch (settings.position) {
                case 'TOP_LEFT': x = m; y = m; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; break;
                case 'TOP_RIGHT': x = width - m; y = m; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; break;
                case 'BOTTOM_LEFT': x = m; y = height - m; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; break;
                case 'BOTTOM_RIGHT': x = width - m; y = height - m; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; break;
                default:
                    x = width / 2; y = height / 2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    break;
            }

            ctx.save();
            const isCenter = settings.position === 'CENTER';
            if (settings.rotation !== 0) {
                ctx.translate(x, y);
                ctx.rotate((settings.rotation * Math.PI) / 180);
                x = 0; y = 0;
            }

            if (logoImg && (settings.type === 'LOGO' || settings.type === 'BOTH')) {
                let lx = x;
                let ly = y;
                if (isCenter) {
                    lx = -logoSize / 2;
                    ly = -logoSize / 2 - (settings.type === 'BOTH' ? lineHeight / 2 : 0);
                } else if (settings.position.includes('LEFT')) {
                    lx = x;
                } else {
                    lx = x - logoSize;
                }
                if (!isCenter && settings.position.includes('BOTTOM')) ly = y - logoSize - (settings.type === 'BOTH' ? lineHeight : 0);

                ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
            }

            if (settings.type === 'TEXT' || settings.type === 'BOTH') {
                let tx = x;
                let ty = y;
                if (isCenter) {
                    tx = 0;
                    ty = logoImg && settings.type === 'BOTH' ? (logoSize / 2 + spacing) : 0;
                } else if (!isCenter && logoImg && settings.type === 'BOTH') {
                    if (!settings.position.includes('BOTTOM')) ty = y + logoSize + spacing;
                    else ty = y; // Bottom aligned text, logo above (handled by logo Y shift)
                }

                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(text, tx, ty);
            }
            ctx.restore();
        }
    };

    // Load Logo if needed
    if ((settings.type === 'LOGO' || settings.type === 'BOTH') && settings.logoUrl) {
        const logo = new Image();
        logo.crossOrigin = 'Anonymous';
        logo.onload = () => draw(logo);
        logo.onerror = () => draw(null);
        logo.src = settings.logoUrl;
    } else {
        draw(null);
    }

    return canvas;
};

export default {
    compressImage,
    createThumbnail,
    applyWatermark,
    extractPartNumberFromFileName,
    isValidImageFormat,
    formatFileSize,
    generateImageId,
    createWatermarkPreviewCanvas
};
