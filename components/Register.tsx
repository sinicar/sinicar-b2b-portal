
import React, { useState, useRef } from 'react';
import { CustomerCategory, AccountOpeningRequest, UploadedDocument } from '../types';
import { MockApi } from '../services/mockApi';
import { CheckCircle, ArrowRight, ArrowLeft, Building2, User, FileText, Briefcase, Car, Shield, Send, Upload, X, File, Image, AlertCircle } from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

// Document type configurations
const DOCUMENT_TYPES = {
  CR_CERTIFICATE: { label: 'صورة السجل التجاري', required: true, forCategory: ['SPARE_PARTS_SHOP', 'INSURANCE_COMPANY', 'RENTAL_COMPANY'] },
  VAT_CERTIFICATE: { label: 'شهادة الرقم الضريبي', required: true, forCategory: ['SPARE_PARTS_SHOP', 'INSURANCE_COMPANY', 'RENTAL_COMPANY'] },
  NATIONAL_ID: { label: 'صورة الهوية الوطنية', required: true, forCategory: ['SALES_REP'] },
  AUTHORIZATION_LETTER: { label: 'خطاب تفويض (اختياري)', required: false, forCategory: ['SPARE_PARTS_SHOP', 'INSURANCE_COMPANY', 'RENTAL_COMPANY'] },
};

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState<CustomerCategory>('SPARE_PARTS_SHOP');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { addToast } = useToast();

  const [formData, setFormData] = useState<Partial<AccountOpeningRequest>>({
      // Common Defaults
      phone: '',
      notes: '',
      email: '',
      // Shop/Company Defaults
      businessName: '',
      city: '',
      country: 'السعودية',
      branchesCount: 1,
      commercialRegNumber: '',
      vatNumber: '',
      nationalAddress: '',
      contactPerson: '',
      // Sales Rep Defaults
      fullName: '',
      representativeRegion: '',
      representativeClientsType: '',
      approximateClientsCount: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Get required documents for current category
  const getRequiredDocuments = () => {
    return Object.entries(DOCUMENT_TYPES)
      .filter(([_, config]) => config.forCategory.includes(category))
      .map(([key, config]) => ({ key, ...config }));
  };

  // Handle file selection
  const handleFileSelect = async (docType: string, file: File) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      addToast('نوع الملف غير مدعوم. يرجى استخدام PDF أو صور (JPEG, PNG, WebP)', 'error');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      addToast('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
      return;
    }

    // Convert to base64 for demo
    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: UploadedDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: docType as UploadedDocument['type'],
        fileType: file.type,
        fileSize: file.size,
        base64Data: reader.result as string,
        uploadedAt: new Date().toISOString()
      };

      // Replace existing doc of same type
      setUploadedDocs(prev => {
        const filtered = prev.filter(d => d.type !== docType);
        return [...filtered, newDoc];
      });

      addToast(`تم رفع ${DOCUMENT_TYPES[docType as keyof typeof DOCUMENT_TYPES]?.label || 'المستند'} بنجاح`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded document
  const handleRemoveDoc = (docType: string) => {
    setUploadedDocs(prev => prev.filter(d => d.type !== docType));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validate = (): boolean => {
      if (!formData.phone) { addToast('رقم الجوال مطلوب', 'error'); return false; }

      if (category === 'SALES_REP') {
          if (!formData.fullName) { addToast('الاسم الكامل مطلوب', 'error'); return false; }
          if (!formData.representativeRegion) { addToast('المنطقة التي تغطيها مطلوبة', 'error'); return false; }
      } else {
          // Shop / Insurance / Rental
          if (!formData.businessName) { addToast('اسم المنشأة مطلوب', 'error'); return false; }
          if (!formData.city) { addToast('المدينة مطلوبة', 'error'); return false; }
          if (!formData.contactPerson) { addToast('اسم المسؤول مطلوب', 'error'); return false; }
          if (!formData.commercialRegNumber) { addToast('السجل التجاري مطلوب', 'error'); return false; }
          if (!formData.vatNumber) { addToast('الرقم الضريبي مطلوب', 'error'); return false; }
          if (!formData.nationalAddress) { addToast('العنوان الوطني مطلوب', 'error'); return false; }
      }

      // Validate required documents
      const requiredDocs = getRequiredDocuments().filter(d => d.required);
      for (const doc of requiredDocs) {
        if (!uploadedDocs.find(d => d.type === doc.key)) {
          addToast(`${doc.label} مطلوب`, 'error');
          return false;
        }
      }

      return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
        await MockApi.createAccountOpeningRequest({
            category,
            ...formData,
            phone: formData.phone || '', // Ensure strings
            documents: uploadedDocs, // Include uploaded documents
        } as any);
        
        setSuccess(true);
        addToast('تم إرسال الطلب بنجاح', 'success');
    } catch (err: any) {
        addToast('حدث خطأ أثناء الإرسال', 'error');
    } finally {
        setLoading(false);
    }
  };

  // Document upload component
  const DocumentUploadField = ({ docKey, label, required }: { docKey: string; label: string; required: boolean }) => {
    const uploadedDoc = uploadedDocs.find(d => d.type === docKey);
    const isImage = uploadedDoc?.fileType.startsWith('image/');

    return (
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {!uploadedDoc ? (
          <div 
            className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-brand-400 transition-all cursor-pointer text-center"
            onClick={() => fileInputRefs.current[docKey]?.click()}
            data-testid={`upload-${docKey}`}
          >
            <Upload className="mx-auto mb-2 text-slate-400" size={28} />
            <p className="text-sm text-slate-500 font-medium">اضغط لرفع الملف</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPEG, PNG, WebP (حد أقصى 5MB)</p>
            <input 
              type="file"
              ref={el => fileInputRefs.current[docKey] = el}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(docKey, file);
                e.target.value = ''; // Reset input
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              {isImage ? <Image size={20} /> : <File size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{uploadedDoc.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(uploadedDoc.fileSize)}</p>
            </div>
            <button 
              type="button"
              onClick={() => handleRemoveDoc(docKey)}
              className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors"
              data-testid={`remove-doc-${docKey}`}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
      <div className="mb-4">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">{props.label} {props.required && <span className="text-red-500">*</span>}</label>
          <input {...props} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" />
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {!success ? (
            <div className="flex flex-col md:flex-row">
                {/* Side Info Panel */}
                <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                     <div className="relative z-10">
                         <h2 className="text-2xl font-black mb-6">فتح حساب جديد</h2>
                         <p className="text-slate-300 text-sm leading-relaxed mb-6">
                             انضم إلى شبكة صيني كار المعتمدة واستفد من أسعار الجملة، خدمات الشحن السريع، والدعم الفني المتخصص.
                         </p>
                         <div className="space-y-4">
                             <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                                 <CheckCircle className="text-brand-500" size={18} />
                                 <span>أسعار جملة حصرية</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                                 <CheckCircle className="text-brand-500" size={18} />
                                 <span>وصول فوري للمخزون</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                                 <CheckCircle className="text-brand-500" size={18} />
                                 <span>فواتير ضريبية معتمدة</span>
                             </div>
                         </div>
                     </div>
                     <div className="relative z-10 mt-8 pt-8 border-t border-slate-800">
                         <button onClick={onSwitchToLogin} className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                             <ArrowRight size={16} /> العودة لتسجيل الدخول
                         </button>
                     </div>
                </div>

                {/* Main Form */}
                <div className="p-8 md:p-10 md:w-2/3">
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">اختر نوع النشاط <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <button 
                                onClick={() => setCategory('SPARE_PARTS_SHOP')}
                                className={`p-3 rounded-xl border text-center transition-all ${category === 'SPARE_PARTS_SHOP' ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Building2 size={24} className="mx-auto mb-1.5" />
                                <span className="text-xs font-bold block">محل قطع غيار</span>
                            </button>
                            <button 
                                onClick={() => setCategory('INSURANCE_COMPANY')}
                                className={`p-3 rounded-xl border text-center transition-all ${category === 'INSURANCE_COMPANY' ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Shield size={24} className="mx-auto mb-1.5" />
                                <span className="text-xs font-bold block">شركة تأمين</span>
                            </button>
                            <button 
                                onClick={() => setCategory('RENTAL_COMPANY')}
                                className={`p-3 rounded-xl border text-center transition-all ${category === 'RENTAL_COMPANY' ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Car size={24} className="mx-auto mb-1.5" />
                                <span className="text-xs font-bold block">تأجير سيارات</span>
                            </button>
                            <button 
                                onClick={() => setCategory('SALES_REP')}
                                className={`p-3 rounded-xl border text-center transition-all ${category === 'SALES_REP' ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Briefcase size={24} className="mx-auto mb-1.5" />
                                <span className="text-xs font-bold block">مندوب مبيعات</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={e => e.preventDefault()} className="space-y-6 animate-fade-in">
                        {category === 'SALES_REP' ? (
                             <>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="الاسم الكامل" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                    <InputField label="رقم الجوال" name="phone" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="المنطقة / المدن المغطاة" name="representativeRegion" value={formData.representativeRegion} onChange={handleChange} required />
                                    <InputField label="البريد الإلكتروني (اختياري)" name="email" type="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="نوع العملاء (ورش، محلات...)" name="representativeClientsType" value={formData.representativeClientsType} onChange={handleChange} />
                                    <InputField label="عدد العملاء التقريبي" name="approximateClientsCount" value={formData.approximateClientsCount} onChange={handleChange} />
                                </div>
                             </>
                        ) : (
                             // Shop / Company Fields
                             <>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="اسم المنشأة" name="businessName" value={formData.businessName} onChange={handleChange} required />
                                    <InputField label="عدد الفروع" name="branchesCount" type="number" min={1} value={formData.branchesCount} onChange={handleChange} required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="المدينة" name="city" value={formData.city} onChange={handleChange} required />
                                    <InputField label="العنوان الوطني المختصر" name="nationalAddress" value={formData.nationalAddress} onChange={handleChange} placeholder="مثال: RDJ2929" required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="السجل التجاري" name="commercialRegNumber" value={formData.commercialRegNumber} onChange={handleChange} required />
                                    <InputField label="الرقم الضريبي" name="vatNumber" value={formData.vatNumber} onChange={handleChange} required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="اسم المسؤول" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
                                    <InputField label="رقم الجوال" name="phone" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" required />
                                </div>
                                <InputField label="البريد الإلكتروني (اختياري)" name="email" type="email" value={formData.email} onChange={handleChange} />
                             </>
                        )}

                        {/* Document Uploads Section */}
                        <div className="border-t border-slate-200 pt-6 mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-brand-600" size={20} />
                                <h3 className="text-lg font-bold text-slate-800">المستندات المطلوبة</h3>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-amber-800">
                                    يرجى رفع المستندات التالية بصيغة PDF أو صورة واضحة. سيتم مراجعتها من قبل فريق الاعتماد.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {getRequiredDocuments().map((doc) => (
                                    <div key={doc.key}>
                                        <DocumentUploadField 
                                            docKey={doc.key} 
                                            label={doc.label} 
                                            required={doc.required} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">ملاحظات إضافية</label>
                            <textarea 
                                name="notes"
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                rows={3}
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={loading} 
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? 'جاري الإرسال...' : 'إرسال طلب فتح الحساب'} <Send size={18} className="rtl:rotate-180" />
                        </button>
                    </form>
                </div>
            </div>
        ) : (
            <div className="text-center py-20 px-8 animate-fade-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 shadow-sm animate-bounce">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">تم استلام طلبك بنجاح!</h2>
                <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                    شكراً لاهتمامكم. سيقوم فريق علاقات العملاء في صيني كار بمراجعة البيانات والتواصل معكم لتفعيل الحساب وإرسال بيانات الدخول.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onSwitchToLogin} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-md">
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
