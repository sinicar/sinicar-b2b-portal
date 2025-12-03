
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { User, UserRole, DeviceAccess } from './types';
import { db } from './services/storage';

// Pages
import Home from './pages/mobile/Home';
import ReceiveGoods from './pages/mobile/ReceiveGoods';
import Putaway from './pages/mobile/Putaway';
import Transfers from './pages/mobile/Transfers';
import StocktakePage from './pages/mobile/Stocktake';
import MobilePreparationRequests from './pages/mobile/MobilePreparationRequests'; 

import AdminDashboard from './pages/admin/AdminDashboard';
import BranchesWarehouses from './pages/admin/BranchesWarehouses';
import UsersManagement from './pages/admin/UsersManagement';
import BarcodeDesignerAndPrint from './pages/admin/BarcodeDesignerAndPrint'; 
import PreparationRequestsPage from './pages/admin/PreparationRequestsPage'; 
import InventoryControlPage from './pages/admin/InventoryControlPage';
import ItemsMasterPage from './pages/admin/ItemsMasterPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const checkAccess = (user: User): string | null => {
    if (!user.isActive) return "هذا الحساب موقوف. يرجى مراجعة الإدارة.";
    const isMobile = window.innerWidth < 768; 
    if (user.deviceAccess === DeviceAccess.MOBILE_ONLY && !isMobile) return "هذا الحساب مخصص للدخول من الجوال فقط.";
    if (user.deviceAccess === DeviceAccess.DESKTOP_ONLY && isMobile) return "هذا الحساب مخصص للدخول من الكمبيوتر فقط.";
    const today = new Date().getDay(); 
    if (user.allowedDays && user.allowedDays.length > 0 && !user.allowedDays.includes(today)) return "غير مسموح لك بالدخول في هذا اليوم.";
    if (user.allowedTimeFrom && user.allowedTimeTo) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [h1, m1] = user.allowedTimeFrom.split(':').map(Number);
        const [h2, m2] = user.allowedTimeTo.split(':').map(Number);
        const startMinutes = h1 * 60 + m1;
        const endMinutes = h2 * 60 + m2;
        if (currentMinutes < startMinutes || currentMinutes > endMinutes) return `الدخول مسموح فقط بين الساعة ${user.allowedTimeFrom} و ${user.allowedTimeTo}`;
    }
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = db.getUserByUsername(username);
    if (!user || user.password !== password) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      return;
    }
    const accessError = checkAccess(user);
    if (accessError) {
      setError(accessError);
      return;
    }
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-primary mb-2 text-center">نظام مخازن الفروع</h1>
          <p className="text-gray-500 mb-6 text-center">تسجيل الدخول</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم</label>
               <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border rounded p-3 focus:border-primary focus:ring-1 focus:ring-primary" placeholder="username" />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
               <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded p-3 focus:border-primary focus:ring-1 focus:ring-primary" placeholder="******" />
            </div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}
            <button type="submit" className="w-full bg-primary text-white p-4 rounded-lg font-bold hover:bg-teal-800 transition">دخول</button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
             <p>حسابات تجريبية:</p>
             <p>1 / 1 (مدير)</p>
             <p>2 / 2 (موبايل فقط)</p>
          </div>
        </div>
      </div>
    );
  }

  const isMobileRole = [UserRole.WAREHOUSE_KEEPER, UserRole.STOCK_TAKER].includes(currentUser.role);

  return (
    <HashRouter>
      <Layout currentUser={currentUser} logout={logout}>
        <Routes>
          {isMobileRole ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/receive" element={<ReceiveGoods currentUser={currentUser} />} />
              <Route path="/putaway" element={<Putaway currentUser={currentUser} />} />
              <Route path="/transfers" element={<Transfers currentUser={currentUser} />} />
              <Route path="/stocktake" element={<StocktakePage currentUser={currentUser} />} />
              <Route path="/prepare-requests" element={<MobilePreparationRequests />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<AdminDashboard currentUser={currentUser} />} />
              <Route path="/alerts" element={<AdminDashboard currentUser={currentUser} />} />
              {/* Updated Items Route */}
              <Route path="/items" element={<ItemsMasterPage />} />
              
              <Route path="/admin/branches-warehouses" element={<BranchesWarehouses currentUser={currentUser} />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              
              <Route path="/admin/barcode-print" element={<BarcodeDesignerAndPrint />} />
              
              <Route path="/admin/preparation-requests" element={<PreparationRequestsPage currentUser={currentUser} />} />
              
              <Route path="/admin/inventory-control" element={<InventoryControlPage />} />

              <Route path="/reports" element={<div className="p-8 font-bold text-gray-400">التقارير (قيد التطوير)</div>} />
              
              {/* Admins can see mobile views */}
              <Route path="/receive" element={<ReceiveGoods currentUser={currentUser} />} />
              <Route path="/putaway" element={<Putaway currentUser={currentUser} />} />
              <Route path="/transfers" element={<Transfers currentUser={currentUser} />} />
              <Route path="/stocktake" element={<StocktakePage currentUser={currentUser} />} />
              <Route path="/prepare-requests" element={<MobilePreparationRequests />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
