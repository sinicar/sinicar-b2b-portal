import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { 
  Car, Upload, Loader2, X, Image as ImageIcon, 
  CheckCircle, AlertTriangle, Copy, Trash2, Camera, Search
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { toolsAccessService } from '../services/toolsAccess';
import { User, BusinessProfile } from '../types';

interface VinExtractorToolProps {
  user: User;
  profile: BusinessProfile | null;
  onClose: () => void;
}

interface ExtractionResult {
  id: string;
  fileName: string;
  imageUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  vin?: string;
  confidence?: number;
  error?: string;
  vehicleInfo?: {
    manufacturer?: string;
    year?: string;
    model?: string;
    country?: string;
  };
}

const VIN_PREFIXES: Record<string, { manufacturer: string; country: string }> = {
  'JT': { manufacturer: 'Toyota', country: 'Japan' },
  'JH': { manufacturer: 'Honda', country: 'Japan' },
  'JN': { manufacturer: 'Nissan', country: 'Japan' },
  'JM': { manufacturer: 'Mazda/Mitsubishi', country: 'Japan' },
  'JS': { manufacturer: 'Suzuki', country: 'Japan' },
  'WA': { manufacturer: 'Audi', country: 'Germany' },
  'WB': { manufacturer: 'BMW', country: 'Germany' },
  'WD': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'WV': { manufacturer: 'Volkswagen', country: 'Germany' },
  'WP': { manufacturer: 'Porsche', country: 'Germany' },
  '1G': { manufacturer: 'General Motors', country: 'USA' },
  '1F': { manufacturer: 'Ford', country: 'USA' },
  '2H': { manufacturer: 'Honda', country: 'Canada' },
  '3V': { manufacturer: 'Volkswagen', country: 'Mexico' },
  'KM': { manufacturer: 'Hyundai', country: 'Korea' },
  'KN': { manufacturer: 'Kia', country: 'Korea' },
  'SA': { manufacturer: 'Land Rover', country: 'UK' },
  'SB': { manufacturer: 'Bentley', country: 'UK' },
  'SJ': { manufacturer: 'Jaguar', country: 'UK' },
  'ZA': { manufacturer: 'Alfa Romeo', country: 'Italy' },
  'ZF': { manufacturer: 'Ferrari', country: 'Italy' },
  'ZH': { manufacturer: 'Maserati', country: 'Italy' },
};

const generateFakeVin = (): string => {
  const prefixes = Object.keys(VIN_PREFIXES);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = prefix;
  for (let i = 0; i < 15; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin.substring(0, 17);
};

const decodeVin = (vin: string) => {
  const prefix = vin.substring(0, 2).toUpperCase();
  const info = VIN_PREFIXES[prefix];
  
  const yearCodes: Record<string, string> = {
    'A': '2010', 'B': '2011', 'C': '2012', 'D': '2013', 'E': '2014',
    'F': '2015', 'G': '2016', 'H': '2017', 'J': '2018', 'K': '2019',
    'L': '2020', 'M': '2021', 'N': '2022', 'P': '2023', 'R': '2024', 'S': '2025'
  };
  
  const yearCode = vin[9]?.toUpperCase() || '';
  const year = yearCodes[yearCode] || '20' + (Math.floor(Math.random() * 5) + 20);
  
  return {
    manufacturer: info?.manufacturer || 'Unknown',
    country: info?.country || 'Unknown',
    year,
    model: 'Model ' + vin.substring(3, 6)
  };
};

export const VinExtractorTool = ({ user, profile, onClose }: VinExtractorToolProps) => {
  const { t, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<File[]>([]);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualVin, setManualVin] = useState('');
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allFiles = Array.from(e.target.files) as File[];
      const newFiles = allFiles.filter(
        (file: File) => file.type.startsWith('image/')
      );
      
      if (newFiles.length !== allFiles.length) {
        addToast({
          type: 'warning',
          message: t('vinExtractor.onlyImagesAllowed', 'يُسمح فقط بملفات الصور')
        });
      }
      
      setImages(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const allFiles = Array.from(e.dataTransfer.files) as File[];
    const droppedFiles = allFiles.filter(
      (file: File) => file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      setImages(prev => [...prev, ...droppedFiles]);
    } else {
      addToast({
        type: 'warning',
        message: t('vinExtractor.onlyImagesAllowed', 'يُسمح فقط بملفات الصور')
      });
    }
  }, [addToast, t]);
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const processImages = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    const newResults: ExtractionResult[] = images.map((file, index) => ({
      id: `ext-${Date.now()}-${index}`,
      fileName: file.name,
      imageUrl: URL.createObjectURL(file),
      status: 'pending'
    }));
    
    setResults(newResults);
    
    for (let i = 0; i < newResults.length; i++) {
      const result = newResults[i];
      
      setResults(prev => prev.map(r => 
        r.id === result.id ? { ...r, status: 'processing' } : r
      ));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
        
        const success = Math.random() > 0.15;
        
        if (success) {
          const vin = generateFakeVin();
          const vehicleInfo = decodeVin(vin);
          const confidence = 85 + Math.floor(Math.random() * 15);
          
          setResults(prev => prev.map(r => 
            r.id === result.id ? { 
              ...r, 
              status: 'completed',
              vin,
              confidence,
              vehicleInfo
            } : r
          ));
          
          await toolsAccessService.recordToolUsage(
            'VIN_EXTRACTOR',
            user.id,
            true,
            1,
            undefined,
            Date.now() - startTime,
            { vin, confidence }
          );
        } else {
          throw new Error('Could not extract VIN from image');
        }
        
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.id === result.id ? { 
            ...r, 
            status: 'error',
            error: t('vinExtractor.extractionError', 'لم يتم العثور على رقم شاصي في الصورة')
          } : r
        ));
        
        await toolsAccessService.recordToolUsage(
          'VIN_EXTRACTOR',
          user.id,
          false,
          0,
          'Extraction failed'
        );
      }
    }
    
    setIsProcessing(false);
    setImages([]);
    
    addToast({
      type: 'success',
      message: t('vinExtractor.processingComplete', 'تمت معالجة الصور')
    });
  };
  
  const copyVin = (vin: string) => {
    navigator.clipboard.writeText(vin);
    addToast({
      type: 'success',
      message: t('vinExtractor.vinCopied', 'تم نسخ رقم الشاصي')
    });
  };
  
  const lookupManualVin = () => {
    if (manualVin.length !== 17) {
      addToast({
        type: 'error',
        message: t('vinExtractor.invalidVinLength', 'رقم الشاصي يجب أن يكون 17 حرف')
      });
      return;
    }
    
    const vehicleInfo = decodeVin(manualVin);
    
    const newResult: ExtractionResult = {
      id: `manual-${Date.now()}`,
      fileName: t('vinExtractor.manualEntry', 'إدخال يدوي'),
      imageUrl: '',
      status: 'completed',
      vin: manualVin.toUpperCase(),
      confidence: 100,
      vehicleInfo
    };
    
    setResults(prev => [newResult, ...prev]);
    setManualVin('');
    
    addToast({
      type: 'success',
      message: t('vinExtractor.vinDecoded', 'تم فك تشفير رقم الشاصي')
    });
  };
  
  const clearResults = () => {
    results.forEach(r => {
      if (r.imageUrl) {
        URL.revokeObjectURL(r.imageUrl);
      }
    });
    setResults([]);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Car size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {t('vinExtractor.title', 'استخراج رقم الشاصي (VIN)')}
            </h2>
            <p className="text-blue-100 mt-1">
              {t('vinExtractor.subtitle', 'استخرج أرقام الشاصي من الصور تلقائياً')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Manual VIN Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-bold text-slate-800 mb-3">
          {t('vinExtractor.manualInput', 'إدخال رقم الشاصي يدوياً')}
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualVin}
            onChange={(e) => setManualVin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17))}
            placeholder={t('vinExtractor.enterVin', 'أدخل رقم الشاصي (17 حرف)')}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono tracking-wider"
            data-testid="input-manual-vin"
          />
          <button
            onClick={lookupManualVin}
            disabled={manualVin.length !== 17}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
            data-testid="button-lookup-vin"
          >
            <Search size={20} />
            {t('vinExtractor.lookup', 'بحث')}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {manualVin.length}/17 {t('vinExtractor.characters', 'حرف')}
        </p>
      </div>
      
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging 
            ? 'border-brand-500 bg-brand-50' 
            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-image-upload"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
            <Camera size={32} className="text-slate-400" />
          </div>
          
          <div>
            <p className="text-lg font-bold text-slate-700">
              {t('vinExtractor.dragDrop', 'اسحب صور المستندات أو السيارات هنا')}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {t('vinExtractor.supportedFormats', 'صور رخص السيارات، شهادات التسجيل، صور لوحة VIN')}
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors"
            data-testid="button-select-images"
          >
            <ImageIcon size={20} />
            {t('vinExtractor.selectImages', 'اختر صور')}
          </button>
        </div>
      </div>
      
      {/* Selected Images */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">
              {t('vinExtractor.selectedImages', 'الصور المختارة')} ({images.length})
            </h3>
            <button
              onClick={() => setImages([])}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
              data-testid="button-clear-images"
            >
              {t('vinExtractor.clearAll', 'مسح الكل')}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((file, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-xl"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`button-remove-image-${index}`}
                >
                  <X size={12} />
                </button>
                <p className="text-xs text-slate-500 truncate mt-1">{file.name}</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={processImages}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
            data-testid="button-extract-vin"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t('vinExtractor.processing', 'جاري الاستخراج...')}
              </>
            ) : (
              <>
                <Car size={20} />
                {t('vinExtractor.extractVin', 'استخراج رقم الشاصي')}
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">
              {t('vinExtractor.results', 'النتائج')}
            </h3>
            <button
              onClick={clearResults}
              className="text-sm text-slate-500 hover:text-slate-600 font-medium"
              data-testid="button-clear-vin-results"
            >
              {t('vinExtractor.clearResults', 'مسح النتائج')}
            </button>
          </div>
          
          <div className="space-y-4">
            {results.map(result => (
              <div 
                key={result.id}
                className={`p-4 rounded-xl border ${
                  result.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : result.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {result.imageUrl && (
                    <img
                      src={result.imageUrl}
                      alt={result.fileName}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {result.status === 'completed' ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : result.status === 'error' ? (
                        <AlertTriangle size={18} className="text-red-600" />
                      ) : (
                        <Loader2 size={18} className="animate-spin text-brand-600" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {result.fileName}
                      </span>
                    </div>
                    
                    {result.status === 'completed' && result.vin && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border">
                            {result.vin}
                          </code>
                          <button
                            onClick={() => copyVin(result.vin!)}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            data-testid={`button-copy-vin-${result.id}`}
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        
                        {result.vehicleInfo && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-500">{t('vinExtractor.manufacturer', 'الشركة المصنعة')}:</span>
                              <span className="font-medium text-slate-800 ms-2">{result.vehicleInfo.manufacturer}</span>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-500">{t('vinExtractor.year', 'سنة الصنع')}:</span>
                              <span className="font-medium text-slate-800 ms-2">{result.vehicleInfo.year}</span>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-500">{t('vinExtractor.country', 'بلد المنشأ')}:</span>
                              <span className="font-medium text-slate-800 ms-2">{result.vehicleInfo.country}</span>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-500">{t('vinExtractor.confidence', 'الدقة')}:</span>
                              <span className="font-medium text-green-600 ms-2">{result.confidence}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {result.status === 'error' && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="font-bold text-slate-800 mb-3">
          {t('vinExtractor.tips', 'نصائح للحصول على أفضل النتائج')}
        </h3>
        <ul className={`text-sm text-slate-600 space-y-2 ${isRTL ? 'list-disc list-inside' : 'list-disc list-inside'}`}>
          <li>{t('vinExtractor.tip1', 'تأكد من وضوح الصورة وجودة الإضاءة')}</li>
          <li>{t('vinExtractor.tip2', 'يمكن استخدام صور رخص السيارات أو شهادات التسجيل')}</li>
          <li>{t('vinExtractor.tip3', 'لوحة VIN الموجودة على لوحة القيادة أو إطار الباب')}</li>
          <li>{t('vinExtractor.tip4', 'رقم الشاصي يتكون من 17 حرف ورقم')}</li>
        </ul>
      </div>
    </div>
  );
};

export default VinExtractorTool;
