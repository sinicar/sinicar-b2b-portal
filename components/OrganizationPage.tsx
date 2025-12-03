

import React, { useState, useEffect } from 'react';
import { User, Branch, EmployeeRole, UserRole } from '../types';
import { MockApi } from '../services/mockApi';
import { 
    Building2, Users, Plus, Edit, Trash2, MapPin, 
    Phone, Shield, ShoppingCart, Lock, Search, X, Check, Eye 
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';

interface OrganizationPageProps {
    user: User;
    mainProfileUserId: string;
}

export const OrganizationPage: React.FC<OrganizationPageProps> = ({ user, mainProfileUserId }) => {
    const [activeTab, setActiveTab] = useState<'BRANCHES' | 'EMPLOYEES'>('BRANCHES');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState<string | null>(null); // To show generated code
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [branchForm, setBranchForm] = useState<Partial<Branch>>({});
    const [employeeForm, setEmployeeForm] = useState<Partial<User>>({ employeeRole: EmployeeRole.BUYER });

    const { addToast } = useToast();

    useEffect(() => {
        loadData();
    }, [mainProfileUserId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Re-fetch profile to get latest branches
            const usersWithProfile = await MockApi.getAllUsers();
            const myProfile = usersWithProfile.find(u => u.user.id === mainProfileUserId)?.profile;
            
            if (myProfile) {
                setBranches(myProfile.branches || []);
            }

            const emps = await MockApi.getEmployees(mainProfileUserId);
            setEmployees(emps);

        } catch (error) {
            console.error(error);
            addToast('حدث خطأ في تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Branch Handlers ---
    const handleSaveBranch = async () => {
        if (!branchForm.name || !branchForm.city || !branchForm.phone) {
            addToast('يرجى تعبئة الحقول المطلوبة (الاسم، المدينة، الهاتف)', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await MockApi.addBranch(mainProfileUserId, branchForm as any);
            addToast('تم إضافة الفرع بنجاح', 'success');
            setShowBranchModal(false);
            setBranchForm({});
            loadData();
        } catch (e: any) {
            addToast(e.message || 'فشل الحفظ', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;
        try {
            await MockApi.deleteBranch(mainProfileUserId, id);
            addToast('تم حذف الفرع', 'info');
            loadData();
        } catch (e) {
            addToast('فشل الحذف', 'error');
        }
    };

    // --- Employee Handlers ---
    const handleSaveEmployee = async () => {
        if (!employeeForm.name || !employeeForm.phone || !employeeForm.branchId) {
            addToast('يرجى تعبئة جميع الحقول المطلوبة', 'error');
            return;
        }
        setIsSaving(true);
        try {
            // Returns the created user object AND the plain activation code
            const result = await MockApi.addEmployee(mainProfileUserId, employeeForm);
            
            addToast('تم إضافة الموظف بنجاح', 'success');
            setShowEmployeeModal(false);
            setEmployeeForm({ employeeRole: EmployeeRole.BUYER }); // Reset
            
            // Show the code to the admin
            setShowCodeModal(result.activationCode);
            
            loadData();
        } catch (e: any) {
            addToast(e.message || 'فشل الحفظ', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await MockApi.toggleEmployeeStatus(id);
            addToast('تم تحديث حالة الموظف', 'success');
            loadData();
        } catch(e) {
            addToast('فشل التحديث', 'error');
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
        try {
            await MockApi.deleteEmployee(id);
            addToast('تم حذف حساب الموظف', 'info');
            loadData();
        } catch (e) {
            addToast('فشل الحذف', 'error');
        }
    };

    return (
        <div className="w-full animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Building2 className="text-brand-600" size={32} /> إدارة الفروع والموظفين
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">إدارة فروع المنشأة، حسابات الموظفين، وتحديد الصلاحيات.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('BRANCHES')}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'BRANCHES' ? 'bg-white text-brand-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Building2 size={18} /> الفروع ({branches.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('EMPLOYEES')}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'EMPLOYEES' ? 'bg-white text-brand-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users size={18} /> الموظفين ({employees.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'BRANCHES' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-xl text-slate-800">قائمة الفروع</h3>
                        <button onClick={() => setShowBranchModal(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-700 transition-colors">
                            <Plus size={18} /> إضافة فرع جديد
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-600 font-bold text-sm">
                                <tr>
                                    <th className="p-5">اسم الفرع</th>
                                    <th className="p-5">المدينة</th>
                                    <th className="p-5">رقم التواصل</th>
                                    <th className="p-5">العنوان / الخريطة</th>
                                    <th className="p-5 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {branches.length > 0 ? branches.map((branch, i) => (
                                    <tr key={branch.id} className="hover:bg-slate-50">
                                        <td className="p-5 font-bold text-slate-800 text-base">
                                            {branch.name}
                                            {i === 0 && <span className="mr-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">الرئيسي</span>}
                                        </td>
                                        <td className="p-5 text-slate-700 font-medium">{branch.city}</td>
                                        <td className="p-5 text-slate-700 font-mono font-bold" dir="ltr">{branch.phone}</td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-slate-600 truncate max-w-[250px]">{branch.address}</span>
                                                {branch.mapUrl && (
                                                    <a href={branch.mapUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline mt-1">
                                                        <MapPin size={12} /> عرض في الخريطة
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"><Edit size={18} /></button>
                                                {i !== 0 && (
                                                    <button onClick={() => handleDeleteBranch(branch.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="p-16 text-center text-slate-400 font-bold">لا توجد فروع مضافة</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'EMPLOYEES' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-xl text-slate-800">حسابات الموظفين</h3>
                        <button onClick={() => setShowEmployeeModal(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-700 transition-colors">
                            <Plus size={18} /> إضافة موظف
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-600 font-bold text-sm">
                                <tr>
                                    <th className="p-5">اسم الموظف</th>
                                    <th className="p-5">اسم المستخدم (الجوال)</th>
                                    <th className="p-5">الفرع التابع له</th>
                                    <th className="p-5">الصلاحية</th>
                                    <th className="p-5">الحالة</th>
                                    <th className="p-5 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.length > 0 ? employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50">
                                        <td className="p-5 font-bold text-slate-800 text-base">{emp.name}</td>
                                        <td className="p-5 font-mono font-bold text-slate-700">{emp.phone}</td>
                                        <td className="p-5 text-slate-700 font-medium">
                                            {branches.find(b => b.id === emp.branchId)?.name || <span className="text-red-400 italic">غير محدد</span>}
                                        </td>
                                        <td className="p-5">
                                            {emp.employeeRole === EmployeeRole.MANAGER ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full w-fit border border-purple-200">
                                                    <Shield size={14} /> مدير (Admin)
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-fit border border-blue-200">
                                                    <ShoppingCart size={14} /> مشتري (Buyer)
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                             <button 
                                                onClick={() => handleToggleStatus(emp.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${emp.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                                             >
                                                 {emp.isActive ? 'نشط' : 'موقوف'}
                                             </button>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleDeleteEmployee(emp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="p-16 text-center text-slate-400 font-bold">لا يوجد موظفين مسجلين</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- ADD BRANCH MODAL --- */}
            <Modal 
                isOpen={showBranchModal} 
                onClose={() => setShowBranchModal(false)} 
                title="إضافة فرع جديد"
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم الفرع</label>
                        <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="مثال: فرع الصناعية القديمة" value={branchForm.name || ''} onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">المدينة</label>
                            <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" value={branchForm.city || ''} onChange={e => setBranchForm({...branchForm, city: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">رقم الهاتف</label>
                            <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" value={branchForm.phone || ''} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">العنوان التفصيلي</label>
                        <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" value={branchForm.address || ''} onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">رابط جوجل ماب (اختياري)</label>
                        <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" value={branchForm.mapUrl || ''} onChange={e => setBranchForm({...branchForm, mapUrl: e.target.value})} />
                    </div>
                    <button 
                        onClick={handleSaveBranch}
                        disabled={isSaving}
                        className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        {isSaving ? 'جاري الحفظ...' : 'حفظ الفرع'}
                    </button>
                </div>
            </Modal>

            {/* --- ADD EMPLOYEE MODAL --- */}
            <Modal 
                isOpen={showEmployeeModal} 
                onClose={() => setShowEmployeeModal(false)} 
                title="إضافة موظف جديد"
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">الاسم الكامل</label>
                        <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" value={employeeForm.name || ''} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">رقم الجوال (اسم المستخدم للدخول)</label>
                        <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="05xxxxxxxx" value={employeeForm.phone || ''} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">الفرع التابع له</label>
                        <select 
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                            value={employeeForm.branchId || ''}
                            onChange={e => setEmployeeForm({...employeeForm, branchId: e.target.value})}
                        >
                            <option value="">اختر الفرع...</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mt-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                             <Shield size={18} className="text-brand-600"/> تحديد الصلاحيات
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${employeeForm.employeeRole === EmployeeRole.MANAGER ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    className="hidden" 
                                    checked={employeeForm.employeeRole === EmployeeRole.MANAGER} 
                                    onChange={() => setEmployeeForm({...employeeForm, employeeRole: EmployeeRole.MANAGER})}
                                />
                                <Shield className={`mb-2 ${employeeForm.employeeRole === EmployeeRole.MANAGER ? 'text-purple-600' : 'text-slate-400'}`} size={24} />
                                <span className="font-bold text-sm">مدير (Admin)</span>
                                <span className="text-xs text-center opacity-70 mt-1 font-medium">يستطيع رؤية الأسعار، إضافة موظفين، وإدارة الطلبات.</span>
                            </label>

                            <label className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${employeeForm.employeeRole === EmployeeRole.BUYER ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    className="hidden" 
                                    checked={employeeForm.employeeRole === EmployeeRole.BUYER} 
                                    onChange={() => setEmployeeForm({...employeeForm, employeeRole: EmployeeRole.BUYER})}
                                />
                                <ShoppingCart className={`mb-2 ${employeeForm.employeeRole === EmployeeRole.BUYER ? 'text-blue-600' : 'text-slate-400'}`} size={24} />
                                <span className="font-bold text-sm">مشتري (Buyer)</span>
                                <span className="text-xs text-center opacity-70 mt-1 font-medium">يستطيع البحث وإضافة للسلة فقط (يحتاج اعتماد الطلب).</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-sm flex gap-2">
                        <Lock size={16} className="shrink-0 mt-0.5" />
                        <p>سيتم توليد كود دخول تلقائي للموظف بعد الحفظ، يرجى مشاركته معه.</p>
                    </div>

                    <button 
                        onClick={handleSaveEmployee}
                        disabled={isSaving}
                        className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        {isSaving ? 'جاري الحفظ...' : 'حفظ الموظف وتوليد الكود'}
                    </button>
                </div>
            </Modal>
            
            {/* --- CODE DISPLAY MODAL --- */}
            <Modal
                isOpen={!!showCodeModal}
                onClose={() => setShowCodeModal(null)}
                title="تم إضافة الموظف بنجاح"
            >
                 <div className="text-center p-4">
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                         <Check size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 mb-2">كود الدخول الخاص بالموظف</h3>
                     <p className="text-slate-500 mb-6">يرجى نسخ هذا الكود وإرساله للموظف ليتمكن من تسجيل الدخول.</p>
                     
                     <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 mb-6">
                         <p className="text-4xl font-mono font-black text-slate-800 tracking-widest">{showCodeModal}</p>
                     </div>
                     
                     <button 
                        onClick={() => setShowCodeModal(null)}
                        className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900"
                     >
                         إغلاق
                     </button>
                 </div>
            </Modal>
        </div>
    );
};