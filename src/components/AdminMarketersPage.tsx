import { useState, useEffect, ReactNode } from 'react';
import { Marketer, MarketerSettings, MarketerCommissionEntry, CustomerReferral, CommissionStatus, CommissionType } from '../types';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import { 
  Users, 
  Save, 
  Settings, 
  DollarSign, 
  Link2, 
  Plus, 
  Trash2, 
  Eye, 
  Power, 
  PowerOff,
  Copy,
  Check,
  X,
  Clock,
  TrendingUp,
  RefreshCw,
  UserPlus,
  Wallet,
  CreditCard,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  AlertCircle,
  Calendar,
  Percent,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

export const AdminMarketersPage = () => {
  const [activeTab, setActiveTab] = useState<'MARKETERS' | 'COMMISSIONS' | 'SETTINGS'>('MARKETERS');
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [commissions, setCommissions] = useState<MarketerCommissionEntry[]>([]);
  const [settings, setSettings] = useState<MarketerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMarketer, setExpandedMarketer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [newMarketer, setNewMarketer] = useState({
    name: '',
    phone: '',
    email: '',
    commissionType: 'PERCENT' as CommissionType,
    commissionValue: 0,
    notes: ''
  });

  const { addToast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [marketersData, commissionsData, settingsData] = await Promise.all([
        MockApi.getMarketers(),
        MockApi.getMarketerCommissions(),
        MockApi.getMarketerSettings()
      ]);
      setMarketers(marketersData);
      setCommissions(commissionsData);
      setSettings(settingsData);
    } catch (e) {
      addToast(language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await MockApi.saveMarketerSettings(settings);
      addToast(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully', 'success');
    } catch (e) {
      addToast(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMarketer = async () => {
    if (!newMarketer.name || !newMarketer.phone) {
      addToast(language === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Please enter name and phone', 'error');
      return;
    }
    
    try {
      await MockApi.addMarketer({
        name: newMarketer.name,
        phone: newMarketer.phone,
        email: newMarketer.email,
        commissionType: newMarketer.commissionType,
        commissionValue: newMarketer.commissionValue || (settings?.defaultCommissionValue || 2),
        active: true,
        notes: newMarketer.notes
      });
      addToast(language === 'ar' ? 'تم إضافة المسوق بنجاح' : 'Marketer added successfully', 'success');
      setShowAddForm(false);
      setNewMarketer({ name: '', phone: '', email: '', commissionType: 'PERCENT', commissionValue: 0, notes: '' });
      loadData();
    } catch (e) {
      addToast(language === 'ar' ? 'حدث خطأ أثناء الإضافة' : 'Error adding marketer', 'error');
    }
  };

  const toggleMarketerStatus = async (id: string) => {
    const marketer = marketers.find(m => m.id === id);
    if (!marketer) return;
    
    await MockApi.updateMarketer(id, { active: !marketer.active });
    setMarketers(prev => prev.map(m => 
      m.id === id ? { ...m, active: !m.active } : m
    ));
    addToast(
      marketer.active 
        ? (language === 'ar' ? 'تم تعطيل المسوق' : 'Marketer disabled')
        : (language === 'ar' ? 'تم تفعيل المسوق' : 'Marketer enabled'),
      'info'
    );
  };

  const deleteMarketer = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المسوق؟' : 'Are you sure you want to delete this marketer?')) return;
    
    await MockApi.deleteMarketer(id);
    setMarketers(prev => prev.filter(m => m.id !== id));
    addToast(language === 'ar' ? 'تم حذف المسوق' : 'Marketer deleted', 'info');
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyReferralUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied', 'success');
  };

  const updateCommissionStatus = async (id: string, status: CommissionStatus) => {
    await MockApi.updateMarketerCommissionStatus(id, status, 'admin');
    setCommissions(prev => prev.map(c => 
      c.id === id ? { ...c, status, approvedAt: status === 'APPROVED' ? new Date().toISOString() : c.approvedAt } : c
    ));
    addToast(
      language === 'ar' 
        ? `تم تحديث الحالة إلى ${status === 'APPROVED' ? 'معتمد' : status === 'PAID' ? 'مدفوع' : status}`
        : `Status updated to ${status}`,
      'success'
    );
  };

  const filteredMarketers = marketers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery) ||
    m.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !settings) {
    return (
      <div className="p-10 text-center">
        <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
        <span className="text-slate-500">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  const TabButton = ({ id, icon, label, count }: { id: 'MARKETERS' | 'COMMISSIONS' | 'SETTINGS', icon: ReactNode, label: string, count?: number }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold relative ${
        activeTab === id 
          ? 'bg-brand-600 text-white shadow-lg' 
          : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
      }`}
      data-testid={`tab-${id.toLowerCase()}`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const getStatusBadge = (status: CommissionStatus) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    const labels = {
      PENDING: language === 'ar' ? 'قيد الانتظار' : 'Pending',
      APPROVED: language === 'ar' ? 'معتمد' : 'Approved',
      PAID: language === 'ar' ? 'مدفوع' : 'Paid',
      CANCELLED: language === 'ar' ? 'ملغي' : 'Cancelled'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Users className="text-brand-600" />
            {language === 'ar' ? 'إدارة المسوقين' : 'Marketer Management'}
          </h1>
          <p className="text-slate-500 mt-1">
            {language === 'ar' 
              ? 'إدارة برنامج التسويق بالعمولة وتتبع الإحالات'
              : 'Manage affiliate marketing program and track referrals'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => settings && setSettings({ ...settings, enabled: !settings.enabled })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              settings.enabled 
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-red-100 text-red-700 border-2 border-red-300'
            }`}
            data-testid="toggle-system"
          >
            {settings.enabled ? <Power size={18} /> : <PowerOff size={18} />}
            {settings.enabled 
              ? (language === 'ar' ? 'مفعّل' : 'Enabled')
              : (language === 'ar' ? 'معطّل' : 'Disabled')}
          </button>
        </div>
      </div>

      {!settings.enabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-amber-800">
              {language === 'ar' ? 'نظام المسوقين معطّل حالياً' : 'Marketer System is Currently Disabled'}
            </p>
            <p className="text-sm text-amber-700">
              {language === 'ar' 
                ? 'قم بتفعيل النظام لتتبع الإحالات وحساب العمولات'
                : 'Enable the system to track referrals and calculate commissions'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <TabButton id="MARKETERS" icon={<Users size={18} />} label={language === 'ar' ? 'المسوقين' : 'Marketers'} count={marketers.length} />
        <TabButton id="COMMISSIONS" icon={<DollarSign size={18} />} label={language === 'ar' ? 'العمولات' : 'Commissions'} count={commissions.filter(c => c.status === 'PENDING').length} />
        <TabButton id="SETTINGS" icon={<Settings size={18} />} label={language === 'ar' ? 'الإعدادات' : 'Settings'} />
      </div>

      {activeTab === 'MARKETERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم أو الهاتف أو الكود...' : 'Search by name, phone or code...'}
                className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                dir="rtl"
                data-testid="search-marketers"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
              data-testid="btn-add-marketer"
            >
              <UserPlus size={18} />
              {language === 'ar' ? 'إضافة مسوق' : 'Add Marketer'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <UserPlus className="text-brand-600" />
                {language === 'ar' ? 'إضافة مسوق جديد' : 'Add New Marketer'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'الاسم *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    value={newMarketer.name}
                    onChange={(e) => setNewMarketer({ ...newMarketer, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'رقم الهاتف *' : 'Phone *'}
                  </label>
                  <input
                    type="tel"
                    value={newMarketer.phone}
                    onChange={(e) => setNewMarketer({ ...newMarketer, phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={newMarketer.email}
                    onChange={(e) => setNewMarketer({ ...newMarketer, email: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    dir="ltr"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'نوع العمولة' : 'Commission Type'}
                  </label>
                  <select
                    value={newMarketer.commissionType}
                    onChange={(e) => setNewMarketer({ ...newMarketer, commissionType: e.target.value as CommissionType })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    data-testid="select-commission-type"
                  >
                    <option value="PERCENT">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</option>
                    <option value="FIXED">{language === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'قيمة العمولة' : 'Commission Value'}
                  </label>
                  <input
                    type="number"
                    value={newMarketer.commissionValue || ''}
                    onChange={(e) => setNewMarketer({ ...newMarketer, commissionValue: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder={`${settings.defaultCommissionValue}${newMarketer.commissionType === 'PERCENT' ? '%' : ' SAR'}`}
                    data-testid="input-commission-value"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </label>
                  <textarea
                    value={newMarketer.notes}
                    onChange={(e) => setNewMarketer({ ...newMarketer, notes: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                    rows={2}
                    data-testid="input-notes"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddMarketer}
                  className="px-5 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center gap-2"
                  data-testid="btn-save-marketer"
                >
                  <Plus size={16} />
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {filteredMarketers.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">{language === 'ar' ? 'لا يوجد مسوقين' : 'No marketers found'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMarketers.map(marketer => (
                <div
                  key={marketer.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all ${
                    marketer.active ? 'border-slate-100' : 'border-slate-200 opacity-75'
                  }`}
                  data-testid={`marketer-${marketer.id}`}
                >
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-t-2xl transition-colors"
                    onClick={() => setExpandedMarketer(expandedMarketer === marketer.id ? null : marketer.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        marketer.active ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {marketer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{marketer.name}</h3>
                        <p className="text-sm text-slate-500">{marketer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left hidden md:block">
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'كود الإحالة' : 'Referral Code'}</p>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-brand-600">{marketer.referralCode}</code>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyReferralCode(marketer.referralCode); }}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            {copiedCode === marketer.referralCode ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="text-left hidden md:block">
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'العمولة' : 'Commission'}</p>
                        <p className="font-bold text-slate-800">
                          {marketer.commissionValue}{marketer.commissionType === 'PERCENT' ? '%' : ' SAR'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleMarketerStatus(marketer.id); }}
                          className={`p-2 rounded-lg transition-colors ${
                            marketer.active 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {marketer.active ? <Power size={18} /> : <PowerOff size={18} />}
                        </button>
                        {expandedMarketer === marketer.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {expandedMarketer === marketer.id && (
                    <div className="border-t border-slate-100 p-5 space-y-4 animate-slide-up">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                          <p className="text-sm text-slate-500 mb-1">{language === 'ar' ? 'الإحالات' : 'Referrals'}</p>
                          <p className="text-2xl font-bold text-slate-800">{marketer.totalReferrals || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                          <p className="text-sm text-green-600 mb-1">{language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}</p>
                          <p className="text-2xl font-bold text-green-700">{(marketer.totalEarnings || 0).toFixed(2)} SAR</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl">
                          <p className="text-sm text-amber-600 mb-1">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                          <p className="text-2xl font-bold text-amber-700">{(marketer.pendingEarnings || 0).toFixed(2)} SAR</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-sm text-blue-600 mb-1">{language === 'ar' ? 'المدفوع' : 'Paid'}</p>
                          <p className="text-2xl font-bold text-blue-700">{(marketer.paidEarnings || 0).toFixed(2)} SAR</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-bold text-slate-700 mb-2">{language === 'ar' ? 'رابط الإحالة' : 'Referral Link'}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={marketer.referralUrl}
                            readOnly
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-mono text-sm"
                            dir="ltr"
                          />
                          <button
                            onClick={() => copyReferralUrl(marketer.referralUrl)}
                            className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => deleteMarketer(marketer.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'COMMISSIONS' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-800">{language === 'ar' ? 'سجل العمولات' : 'Commission History'}</h2>
          </div>
          
          {commissions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">{language === 'ar' ? 'لا توجد عمولات' : 'No commissions found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'المسوق' : 'Marketer'}</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'الطلب' : 'Order'}</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'قيمة الطلب' : 'Order Value'}</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'العمولة' : 'Commission'}</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-600">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.map(commission => {
                    const marketer = marketers.find(m => m.id === commission.marketerId);
                    return (
                      <tr key={commission.id} className="hover:bg-slate-50" data-testid={`commission-${commission.id}`}>
                        <td className="px-4 py-3 font-medium text-slate-800">{marketer?.name || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{commission.orderId}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{commission.orderTotal.toFixed(2)} SAR</td>
                        <td className="px-4 py-3 font-bold text-green-600">{commission.commissionAmount.toFixed(2)} SAR</td>
                        <td className="px-4 py-3">{getStatusBadge(commission.status)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{new Date(commission.calculatedAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-4 py-3">
                          {commission.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateCommissionStatus(commission.id, 'APPROVED')}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title={language === 'ar' ? 'اعتماد' : 'Approve'}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => updateCommissionStatus(commission.id, 'CANCELLED')}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          {commission.status === 'APPROVED' && (
                            <button
                              onClick={() => updateCommissionStatus(commission.id, 'PAID')}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-bold"
                            >
                              <CreditCard size={14} />
                              {language === 'ar' ? 'دفع' : 'Pay'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">{language === 'ar' ? 'إعدادات برنامج التسويق' : 'Marketing Program Settings'}</h2>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-50"
              data-testid="btn-save-settings"
            >
              <Save size={16} />
              {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={14} />
                {language === 'ar' ? 'فترة الإحالة (أيام)' : 'Attribution Window (days)'}
              </label>
              <input
                type="number"
                value={settings.attributionWindowDays}
                onChange={(e) => setSettings({ ...settings, attributionWindowDays: parseInt(e.target.value) || 90 })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                data-testid="input-attribution-days"
              />
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar' ? 'المدة التي يحسب فيها الإحالة بعد التسجيل' : 'Period during which referral is counted after registration'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Percent size={14} />
                {language === 'ar' ? 'العمولة الافتراضية' : 'Default Commission'}
              </label>
              <div className="flex gap-2">
                <select
                  value={settings.defaultCommissionType}
                  onChange={(e) => setSettings({ ...settings, defaultCommissionType: e.target.value as CommissionType })}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  data-testid="select-default-type"
                >
                  <option value="PERCENT">{language === 'ar' ? 'نسبة' : '%'}</option>
                  <option value="FIXED">{language === 'ar' ? 'ثابت' : 'Fixed'}</option>
                </select>
                <input
                  type="number"
                  value={settings.defaultCommissionValue}
                  onChange={(e) => setSettings({ ...settings, defaultCommissionValue: parseFloat(e.target.value) || 0 })}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  data-testid="input-default-value"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Wallet size={14} />
                {language === 'ar' ? 'الحد الأدنى للسحب' : 'Min Payout Amount'}
              </label>
              <input
                type="number"
                value={settings.minPayoutAmount || ''}
                onChange={(e) => setSettings({ ...settings, minPayoutAmount: parseFloat(e.target.value) || undefined })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="500 SAR"
                data-testid="input-min-payout"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={14} />
                {language === 'ar' ? 'دورة الدفع (أيام)' : 'Payment Cycle (days)'}
              </label>
              <input
                type="number"
                value={settings.paymentCycleDays || ''}
                onChange={(e) => setSettings({ ...settings, paymentCycleDays: parseInt(e.target.value) || undefined })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="30"
                data-testid="input-payment-cycle"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">{language === 'ar' ? 'الاعتماد التلقائي' : 'Auto-Approve Commissions'}</p>
                <p className="text-xs text-slate-500">{language === 'ar' ? 'اعتماد العمولات تلقائياً' : 'Automatically approve commissions'}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoApproveCommissions: !settings.autoApproveCommissions })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.autoApproveCommissions ? 'bg-brand-600' : 'bg-slate-300'
                }`}
                data-testid="toggle-auto-approve"
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.autoApproveCommissions ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">{language === 'ar' ? 'عرض أسماء العملاء' : 'Show Customer Names'}</p>
                <p className="text-xs text-slate-500">{language === 'ar' ? 'السماح للمسوق برؤية أسماء العملاء' : 'Allow marketer to see customer names'}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, marketerCanViewCustomerNames: !settings.marketerCanViewCustomerNames })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.marketerCanViewCustomerNames ? 'bg-brand-600' : 'bg-slate-300'
                }`}
                data-testid="toggle-show-names"
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.marketerCanViewCustomerNames ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">{language === 'ar' ? 'عرض قيم الطلبات' : 'Show Order Totals'}</p>
                <p className="text-xs text-slate-500">{language === 'ar' ? 'السماح للمسوق برؤية قيم الطلبات' : 'Allow marketer to see order totals'}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, marketerCanViewOrderTotals: !settings.marketerCanViewOrderTotals })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.marketerCanViewOrderTotals ? 'bg-brand-600' : 'bg-slate-300'
                }`}
                data-testid="toggle-show-totals"
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.marketerCanViewOrderTotals ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">{language === 'ar' ? 'إشعار المسوق بالإحالة' : 'Notify on Referral'}</p>
                <p className="text-xs text-slate-500">{language === 'ar' ? 'إشعار المسوق عند تسجيل عميل جديد' : 'Notify marketer when new customer registers'}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifyMarketerOnReferral: !settings.notifyMarketerOnReferral })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.notifyMarketerOnReferral ? 'bg-brand-600' : 'bg-slate-300'
                }`}
                data-testid="toggle-notify-referral"
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.notifyMarketerOnReferral ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketersPage;
