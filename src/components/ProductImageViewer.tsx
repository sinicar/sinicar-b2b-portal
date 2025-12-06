import { useState, useRef, useCallback, useEffect, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, X, ZoomIn, ChevronLeft, ChevronRight, Eye, EyeOff, Package } from 'lucide-react';

interface ProductImageViewerProps {
  mainImageUrl?: string | null;
  imageGallery?: string[];
  productName: string;
  partNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PHJlY3QgZmlsbD0iI2YzZjRmNiIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiLz48cGF0aCBmaWxsPSIjOWNhM2FmIiBkPSJNNjAgMzBjLTIwIDAtMzUgMTUtMzUgMzVzMTUgMzUgMzUgMzUgMzUtMTUgMzUtMzUtMTUtMzUtMzUtMzV6bTAgNjBjLTE0IDAtMjUtMTEtMjUtMjVzMTEtMjUgMjUtMjUgMjUgMTEgMjUgMjUtMTEgMjUtMjUgMjV6Ii8+PHBhdGggZmlsbD0iIzljYTNhZiIgZD0iTTYwIDQ1Yy0xMCAwLTIwIDgtMjAgMjBzMTAgMjAgMjAgMjAgMjAtOCAyMC0yMC0xMC0yMC0yMC0yMHptMCAzMGMtNSAwLTEwLTQtMTAtMTBzNS0xMCAxMC0xMCAxMCA0IDEwIDEwLTUgMTAtMTAgMTB6Ii8+PC9zdmc+';

export default function ProductImageViewer({
  mainImageUrl,
  imageGallery = [],
  productName,
  partNumber,
  size = 'md',
  showIcon = true,
  className = ''
}: ProductImageViewerProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const allImages = [mainImageUrl, ...(imageGallery || [])].filter(Boolean) as string[];
  const hasImages = allImages.length > 0;
  const currentImage = allImages[currentImageIndex] || PLACEHOLDER_IMAGE;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleOpenModal = useCallback(() => {
    if (hasImages) {
      setIsModalOpen(true);
      setCurrentImageIndex(0);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [hasImages]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setShowMagnifier(false);
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
    
    setMagnifierPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
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
          flex items-center justify-center rounded-lg transition-all duration-200
          ${hasImages 
            ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 cursor-pointer hover:scale-105 active:scale-95' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
          ${sizeClasses[size]}
          ${className}
        `}
        title={hasImages ? t('productImages.viewImage', 'عرض الصورة') : t('productImages.noImage', 'لا توجد صورة')}
        data-testid={`button-view-image-${partNumber || 'product'}`}
      >
        {hasImages ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleCloseModal}
          data-testid="modal-product-image"
        >
          <div 
            className="relative max-w-4xl w-full mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-md">
                    {productName}
                  </h3>
                  {partNumber && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {partNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {allImages.length > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    {currentImageIndex + 1} / {allImages.length}
                  </span>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  data-testid="button-close-image-modal"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div 
                ref={containerRef}
                className="relative aspect-square max-h-[60vh] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-crosshair overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                    className="absolute pointer-events-none w-48 h-48 border-4 border-white shadow-2xl rounded-full overflow-hidden"
                    style={{
                      left: `calc(${magnifierPosition.x}% - 96px)`,
                      top: `calc(${magnifierPosition.y}% - 96px)`,
                      backgroundImage: `url(${currentImage})`,
                      backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                      backgroundSize: '400%',
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0 0 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.2)'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[2px] h-full bg-white/30 absolute" />
                      <div className="w-full h-[2px] bg-white/30 absolute" />
                    </div>
                  </div>
                )}

                {imageError && (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Image className="w-16 h-16" />
                    <span>{t('productImages.loadError', 'فشل تحميل الصورة')}</span>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={isRtl ? handleNextImage : handlePrevImage}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-2' : 'left-2'} p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg transition-all hover:scale-110`}
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  </button>
                  <button
                    onClick={isRtl ? handlePrevImage : handleNextImage}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2' : 'right-2'} p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg transition-all hover:scale-110`}
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className={`flex gap-2 overflow-x-auto pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setImageLoaded(false);
                        setImageError(false);
                      }}
                      className={`
                        flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                        ${idx === currentImageIndex 
                          ? 'border-blue-500 ring-2 ring-blue-300' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }
                      `}
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

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
              <div className={`flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <ZoomIn className="w-4 h-4" />
                <span>{t('productImages.magnifierHint', 'حرك الماوس على الصورة للتكبير')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProductImageThumbnail({
  mainImageUrl,
  productName,
  size = 'md',
  onClick,
  className = ''
}: {
  mainImageUrl?: string | null;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (!mainImageUrl || imageError) {
    return (
      <div 
        className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg ${className}`}
      >
        <Package className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-all hover:scale-105 ${className}`}
    >
      <img
        src={mainImageUrl}
        alt={productName}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </button>
  );
}
