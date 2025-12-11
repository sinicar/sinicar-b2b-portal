import { useState, useRef, useCallback, useEffect, MouseEvent, FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ZoomIn, ChevronLeft, ChevronRight, Eye, EyeOff, Package, ImageIcon, X } from 'lucide-react';

interface ProductImageViewerProps {
  mainImageUrl?: string | null;
  imageGallery?: string[];
  productName: string;
  partNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// Storage key for uploaded images
const IMAGES_STORAGE_KEY = 'sini_product_images';

// Interface for stored image - supports both naming conventions
interface StoredProductImage {
  id: string;
  partNumber: string;
  // AdminProductImagesPage uses these field names
  fileUrl?: string;
  thumbnailUrl?: string;
  // Alternative field names
  fullImage?: string;
  thumbnail?: string;
  status: string;
  isLinkedToProduct: boolean;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PHJlY3QgZmlsbD0iI2YzZjRmNiIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiLz48cGF0aCBmaWxsPSIjOWNhM2FmIiBkPSJNNjAgMzBjLTIwIDAtMzUgMTUtMzUgMzVzMTUgMzUgMzUgMzUgMzUtMTUgMzUtMzUtMTUtMzUtMzUtMzV6bTAgNjBjLTE0IDAtMjUtMTEtMjUtMjVzMTEtMjUgMjUtMjUgMjUgMTEgMjUgMjUtMTEgMjUtMjUgMjV6Ii8+PHBhdGggZmlsbD0iIzljYTNhZiIgZD0iTTYwIDQ1Yy0xMCAwLTIwIDgtMjAgMjBzMTAgMjAgMjAgMjAgMjAtOCAyMC0yMC0xMC0yMC0yMC0yMHptMCAzMGMtNSAwLTEwLTQtMTAtMTBzNS0xMCAxMC0xMCAxMCA0IDEwIDEwLTUgMTAtMTAgMTB6Ii8+PC9zdmc+';

// Helper function to get image for a part number from localStorage
const getUploadedImageForPartNumber = (partNumber: string): string | null => {
  if (!partNumber) return null;
  try {
    const storedImages = localStorage.getItem(IMAGES_STORAGE_KEY);
    if (storedImages) {
      const images: StoredProductImage[] = JSON.parse(storedImages);
      // Find matching image - check status and linked status
      const matchingImage = images.find(
        img => img.partNumber?.toUpperCase() === partNumber.toUpperCase() &&
          (img.status === 'APPROVED' || img.status === 'AUTO_MATCHED') &&
          img.isLinkedToProduct
      );
      if (matchingImage) {
        // Return the image URL - check both naming conventions
        return matchingImage.fileUrl || matchingImage.fullImage ||
          matchingImage.thumbnailUrl || matchingImage.thumbnail || null;
      }
    }
  } catch (e) {
    console.error('Error reading product images from localStorage:', e);
  }
  return null;
};



const ProductImageViewer: FC<ProductImageViewerProps> = ({
  mainImageUrl,
  imageGallery = [],
  productName,
  partNumber,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [animate, setAnimate] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check localStorage for uploaded images if no mainImageUrl provided
  const effectiveMainImage = useMemo(() => {
    if (mainImageUrl) return mainImageUrl;
    if (partNumber) return getUploadedImageForPartNumber(partNumber);
    return null;
  }, [mainImageUrl, partNumber]);

  const allImages = [effectiveMainImage, ...(imageGallery || [])].filter(Boolean) as string[];
  const hasImages = allImages.length > 0;
  const currentImage = allImages[currentImageIndex] || PLACEHOLDER_IMAGE;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const handleOpenModal = useCallback(() => {
    if (hasImages) {
      setIsModalOpen(true);
      setCurrentImageIndex(0);
      setImageLoaded(false);
      setImageError(false);
      setTimeout(() => setAnimate(true), 10);
    }
  }, [hasImages]);

  const handleCloseModal = useCallback(() => {
    setAnimate(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setShowMagnifier(false);
    }, 200);
  }, []);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setImageLoaded(false);
    setImageError(false);
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setImageLoaded(false);
    setImageError(false);
  }, [allImages.length]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current || !imageLoaded) return;

    const container = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;

    const clampedX = Math.max(12, Math.min(88, x));
    const clampedY = Math.max(12, Math.min(88, y));

    setMagnifierPosition({ x: clampedX, y: clampedY });
    setShowMagnifier(true);
  }, [imageLoaded]);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isModalOpen) return;
    if (e.key === 'Escape') handleCloseModal();
    if (e.key === 'ArrowLeft') isRtl ? handleNextImage() : handlePrevImage();
    if (e.key === 'ArrowRight') isRtl ? handlePrevImage() : handleNextImage();
  }, [isModalOpen, handleCloseModal, handlePrevImage, handleNextImage, isRtl]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!showIcon && !hasImages) return null;

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={!hasImages}
        className={`
          relative flex items-center justify-center rounded-lg transition-all overflow-hidden border border-slate-200 dark:border-slate-700
          ${hasImages
            ? 'bg-white hover:border-brand-400 hover:shadow-sm'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }
          ${sizeClasses[size]}
          ${className}
        `}
        aria-label={hasImages ? t('productImages.viewImage', 'عرض الصورة') : t('productImages.noImage', 'لا توجد صورة')}
        title={hasImages ? t('productImages.viewImage', 'عرض الصورة') : t('productImages.noImage', 'لا توجد صورة')}
        data-testid={`button-view-image-${partNumber || 'product'}`}
      >
        {hasImages ? (
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.classList.add('bg-slate-100', 'text-slate-400');
            }}
          />
        ) : (
          <EyeOff className="w-1/2 h-1/2" />
        )}
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-image-viewer-title"
        >
          <div
            className={`absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity duration-200 ${animate ? 'opacity-100' : 'opacity-0'
              }`}
            onClick={handleCloseModal}
          />

          <div
            className={`
              relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden
              transform transition-all duration-200
              ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-lg">
                  <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h3
                    id="product-image-viewer-title"
                    className="font-semibold text-slate-900 dark:text-white truncate max-w-md"
                  >
                    {productName}
                  </h3>
                  {partNumber && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {partNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {allImages.length > 1 && (
                  <span className="text-sm text-slate-500 dark:text-slate-400 px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                    {currentImageIndex + 1} / {allImages.length}
                  </span>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  aria-label={t('productImages.closeViewer', 'إغلاق')}
                  data-testid="button-close-image-modal"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                ref={containerRef}
                className="relative aspect-square max-h-[60vh] w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 cursor-crosshair overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                role="img"
                aria-label={`${productName} ${t('productImages.image', 'صورة')} ${currentImageIndex + 1} / ${allImages.length}`}
              >
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <img
                  ref={imageRef}
                  src={currentImage}
                  alt={productName}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  draggable={false}
                />

                {showMagnifier && imageLoaded && !imageError && (
                  <div
                    className="absolute pointer-events-none w-36 h-36 border-4 border-white dark:border-slate-600 rounded-full overflow-hidden"
                    style={{
                      left: `calc(${magnifierPosition.x}% - 72px)`,
                      top: `calc(${magnifierPosition.y}% - 72px)`,
                      backgroundImage: `url(${currentImage})`,
                      backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                      backgroundSize: '300%',
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-px h-full bg-white/30 absolute" />
                      <div className="w-full h-px bg-white/30 absolute" />
                    </div>
                  </div>
                )}

                {imageError && (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon className="w-16 h-16" />
                    <span>{t('productImages.loadError', 'فشل تحميل الصورة')}</span>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={isRtl ? handleNextImage : handlePrevImage}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-2' : 'left-2'} p-3 bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600 rounded-full shadow-lg transition-colors`}
                    aria-label={t('productImages.prevImage', 'الصورة السابقة')}
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </button>
                  <button
                    onClick={isRtl ? handlePrevImage : handleNextImage}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2' : 'right-2'} p-3 bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600 rounded-full shadow-lg transition-colors`}
                    aria-label={t('productImages.nextImage', 'الصورة التالية')}
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div
                  className={`flex gap-2 overflow-x-auto pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}
                  role="tablist"
                  aria-label={t('productImages.thumbnailList', 'قائمة الصور المصغرة')}
                >
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setImageLoaded(false);
                        setImageError(false);
                      }}
                      className={`
                        flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors
                        ${idx === currentImageIndex
                          ? 'border-brand-500 ring-2 ring-brand-300'
                          : 'border-slate-200 dark:border-slate-600 hover:border-brand-300'
                        }
                      `}
                      role="tab"
                      aria-selected={idx === currentImageIndex}
                      aria-label={`${t('productImages.thumbnail', 'صورة مصغرة')} ${idx + 1}`}
                      data-testid={`button-thumbnail-${idx}`}
                    >
                      <img
                        src={img}
                        alt={`${productName} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              <div className={`flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <ZoomIn className="w-4 h-4" />
                <span>{t('productImages.magnifierHint', 'حرك الماوس على الصورة للتكبير')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageViewer;

export const ProductImageThumbnail: FC<{
  mainImageUrl?: string | null;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}> = ({
  mainImageUrl,
  productName,
  size = 'md',
  onClick,
  className = ''
}) => {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-14 h-14',
      lg: 'w-20 h-20'
    };

    if (!mainImageUrl || imageError) {
      return (
        <div
          className={`${sizeClasses[size]} flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg ${className}`}
        >
          <Package className="w-1/2 h-1/2 text-slate-400" />
        </div>
      );
    }

    return (
      <button
        onClick={onClick}
        className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:border-brand-400 transition-colors ${className}`}
        aria-label={`View ${productName} image`}
      >
        <img
          src={mainImageUrl}
          alt={productName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </button>
    );
  };
