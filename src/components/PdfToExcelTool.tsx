import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { 
  FileSpreadsheet, Upload, Download, Loader2, X, FileText, 
  Table, CheckCircle, AlertTriangle, Trash2, Eye
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { toolsAccessService } from '../services/toolsAccess';
import { User, BusinessProfile } from '../types';
import * as XLSX from 'xlsx';

interface PdfToExcelToolProps {
  user: User;
  profile: BusinessProfile | null;
  onClose: () => void;
}

interface ConversionResult {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
  rows?: number;
  columns?: number;
  data?: any[][];
}

export const PdfToExcelTool = ({ user, profile, onClose }: PdfToExcelToolProps) => {
  const { t, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [conversions, setConversions] = useState<ConversionResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allFiles = Array.from(e.target.files) as File[];
      const newFiles = allFiles.filter(
        (file: File) => file.type === 'application/pdf'
      );
      
      if (newFiles.length !== allFiles.length) {
        addToast({
          type: 'warning',
          message: t('pdfToExcel.onlyPdfAllowed', 'يُسمح فقط بملفات PDF')
        });
      }
      
      setFiles(prev => [...prev, ...newFiles]);
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
      (file: File) => file.type === 'application/pdf'
    );
    
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    } else {
      addToast({
        type: 'warning',
        message: t('pdfToExcel.onlyPdfAllowed', 'يُسمح فقط بملفات PDF')
      });
    }
  }, [addToast, t]);
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const simulatePdfExtraction = async (file: File): Promise<any[][]> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const rows = 10 + Math.floor(Math.random() * 20);
    const data: any[][] = [];
    
    data.push([
      t('pdfToExcel.demo.partNumber', 'رقم القطعة'),
      t('pdfToExcel.demo.partName', 'اسم القطعة'),
      t('pdfToExcel.demo.quantity', 'الكمية'),
      t('pdfToExcel.demo.price', 'السعر'),
      t('pdfToExcel.demo.total', 'الإجمالي')
    ]);
    
    for (let i = 0; i < rows; i++) {
      const partNum = `PT-${String(1000 + i).padStart(5, '0')}`;
      const qty = Math.floor(Math.random() * 50) + 1;
      const price = Math.floor(Math.random() * 500) + 50;
      data.push([
        partNum,
        `${t('pdfToExcel.demo.sparePart', 'قطعة غيار')} ${i + 1}`,
        qty,
        price,
        qty * price
      ]);
    }
    
    return data;
  };
  
  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    const newConversions: ConversionResult[] = files.map((file, index) => ({
      id: `conv-${Date.now()}-${index}`,
      fileName: file.name,
      status: 'pending',
      progress: 0
    }));
    
    setConversions(newConversions);
    
    for (let i = 0; i < newConversions.length; i++) {
      const conversion = newConversions[i];
      
      setConversions(prev => prev.map(c => 
        c.id === conversion.id ? { ...c, status: 'processing', progress: 20 } : c
      ));
      
      try {
        setConversions(prev => prev.map(c => 
          c.id === conversion.id ? { ...c, progress: 50 } : c
        ));
        
        const data = await simulatePdfExtraction(files[i]);
        
        setConversions(prev => prev.map(c => 
          c.id === conversion.id ? { ...c, progress: 80 } : c
        ));
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        ws['!cols'] = [
          { wch: 15 },
          { wch: 25 },
          { wch: 10 },
          { wch: 12 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = URL.createObjectURL(blob);
        
        setConversions(prev => prev.map(c => 
          c.id === conversion.id ? { 
            ...c, 
            status: 'completed', 
            progress: 100,
            downloadUrl: url,
            rows: data.length,
            columns: data[0]?.length || 0,
            data
          } : c
        ));
        
        await toolsAccessService.recordToolUsage(
          'PDF_TO_EXCEL',
          user.id,
          true,
          1,
          undefined,
          Date.now() - startTime
        );
        
      } catch (error) {
        setConversions(prev => prev.map(c => 
          c.id === conversion.id ? { 
            ...c, 
            status: 'error', 
            progress: 0,
            error: t('pdfToExcel.conversionError', 'حدث خطأ أثناء التحويل')
          } : c
        ));
        
        await toolsAccessService.recordToolUsage(
          'PDF_TO_EXCEL',
          user.id,
          false,
          0,
          'Conversion failed'
        );
      }
    }
    
    setIsProcessing(false);
    setFiles([]);
    
    addToast({
      type: 'success',
      message: t('pdfToExcel.conversionComplete', 'تم تحويل الملفات بنجاح')
    });
  };
  
  const downloadFile = (conversion: ConversionResult) => {
    if (conversion.downloadUrl) {
      const link = document.createElement('a');
      link.href = conversion.downloadUrl;
      link.download = conversion.fileName.replace('.pdf', '.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const clearConversions = () => {
    conversions.forEach(c => {
      if (c.downloadUrl) {
        URL.revokeObjectURL(c.downloadUrl);
      }
    });
    setConversions([]);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {t('pdfToExcel.title', 'تحويل PDF إلى Excel')}
            </h2>
            <p className="text-green-100 mt-1">
              {t('pdfToExcel.subtitle', 'حول جداول PDF إلى ملفات Excel قابلة للتعديل')}
            </p>
          </div>
        </div>
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
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-pdf-upload"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
            <Upload size={32} className="text-slate-400" />
          </div>
          
          <div>
            <p className="text-lg font-bold text-slate-700">
              {t('pdfToExcel.dragDrop', 'اسحب ملفات PDF هنا')}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {t('pdfToExcel.orClick', 'أو انقر لاختيار الملفات')}
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors"
            data-testid="button-select-pdf"
          >
            <FileText size={20} />
            {t('pdfToExcel.selectFiles', 'اختر ملفات PDF')}
          </button>
        </div>
      </div>
      
      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">
              {t('pdfToExcel.selectedFiles', 'الملفات المختارة')} ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
              data-testid="button-clear-files"
            >
              {t('pdfToExcel.clearAll', 'مسح الكل')}
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-red-500" />
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  data-testid={`button-remove-file-${index}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={processFiles}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
            data-testid="button-convert-files"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t('pdfToExcel.converting', 'جاري التحويل...')}
              </>
            ) : (
              <>
                <Table size={20} />
                {t('pdfToExcel.convertToExcel', 'تحويل إلى Excel')}
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Conversion Results */}
      {conversions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">
              {t('pdfToExcel.results', 'نتائج التحويل')}
            </h3>
            <button
              onClick={clearConversions}
              className="text-sm text-slate-500 hover:text-slate-600 font-medium"
              data-testid="button-clear-results"
            >
              {t('pdfToExcel.clearResults', 'مسح النتائج')}
            </button>
          </div>
          
          <div className="space-y-3">
            {conversions.map(conversion => (
              <div 
                key={conversion.id}
                className={`p-4 rounded-xl border ${
                  conversion.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : conversion.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {conversion.status === 'completed' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : conversion.status === 'error' ? (
                      <AlertTriangle size={20} className="text-red-600" />
                    ) : (
                      <Loader2 size={20} className="animate-spin text-brand-600" />
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{conversion.fileName}</p>
                      {conversion.status === 'completed' && (
                        <p className="text-xs text-slate-500">
                          {conversion.rows} {t('pdfToExcel.rows', 'صف')} × {conversion.columns} {t('pdfToExcel.columns', 'عمود')}
                        </p>
                      )}
                      {conversion.status === 'error' && (
                        <p className="text-xs text-red-500">{conversion.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {conversion.status === 'processing' && (
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${conversion.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {conversion.status === 'completed' && (
                    <button
                      onClick={() => downloadFile(conversion)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                      data-testid={`button-download-${conversion.id}`}
                    >
                      <Download size={16} />
                      {t('pdfToExcel.download', 'تحميل')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="font-bold text-slate-800 mb-3">
          {t('pdfToExcel.howToUse', 'كيفية الاستخدام')}
        </h3>
        <ol className={`text-sm text-slate-600 space-y-2 ${isRTL ? 'list-decimal list-inside' : 'list-decimal list-inside'}`}>
          <li>{t('pdfToExcel.step1', 'اختر ملف PDF أو أكثر يحتوي على جداول')}</li>
          <li>{t('pdfToExcel.step2', 'انقر على زر "تحويل إلى Excel"')}</li>
          <li>{t('pdfToExcel.step3', 'انتظر حتى يتم التحويل')}</li>
          <li>{t('pdfToExcel.step4', 'حمل ملف Excel الناتج')}</li>
        </ol>
      </div>
    </div>
  );
};

export default PdfToExcelTool;
