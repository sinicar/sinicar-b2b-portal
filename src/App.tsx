

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SupplierPortal } from './components/SupplierPortal';
import { MockApi } from './services/mockApi';
import { User, BusinessProfile, SiteSettings } from './types';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck, Box, Server, Activity, Database, CheckCircle2, Globe, Zap, Package, Percent, Truck, Phone } from 'lucide-react';
import { LanguageProvider, useLanguage } from './services/LanguageContext';
import { ToastProvider, useToast } from './services/ToastContext';
import { OrganizationProvider } from './services/OrganizationContext';
import { CustomerPortalSettingsProvider } from './services/CustomerPortalSettingsContext';
import { ToastContainer } from './components/Toast';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { getDirection } from './services/i18n';
import AIAssistant from './components/AIAssistant';
import './services/i18n';

const getLoginLoadingSteps = (t: (key: string) => string) => [
    { icon: <Lock size={32} />, titleKey: "loading.verifyingCredentials" },
    { icon: <Server size={32} />, titleKey: "loading.connectingWarehouse" },
    { icon: <Package size={32} />, titleKey: "loading.loadingCatalog" },
    { icon: <Percent size={32} />, titleKey: "loading.applyingDiscounts" },
    { icon: <Database size={32} />, titleKey: "loading.syncingInventory" },
    { icon: <Truck size={32} />, titleKey: "loading.optimizingLogistics" },
    { icon: <Activity size={32} />, titleKey: "loading.finalizingSetup" },
    { icon: <CheckCircle2 size={32} />, titleKey: "loading.accessGranted" }
];

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<BusinessProfile | null>(null);
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(true);

  // Login Mode: Owner or Staff
  const [loginType, setLoginType] = useState<'OWNER' | 'STAFF'>('OWNER');

  // Cinematic Intro State (First Load)
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);

  // Login Loading State (After Click)
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [loginStepIndex, setLoginStepIndex] = useState(0);
  const [loginProgress, setLoginProgress] = useState(0);

  // Login Form State
  const [identifier, setIdentifier] = useState(''); // ClientId or Phone
  const [secret, setSecret] = useState(''); // Password or Activation Code
  const [rememberMe, setRememberMe] = useState(false); // Persistent login
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null); // Site settings for guest mode

  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const dir = getDirection(i18n.language);
  const { addToast } = useToast();

  // Load site settings for guest mode check
  useEffect(() => {
    MockApi.getSettings().then(setSiteSettings);
  }, []);

  // Session Restore (Check both current session and persistent session)
  useEffect(() => {
    const restoreSession = async () => {
      // First try to restore from current session
      const user = await MockApi.getCurrentSession();
      if (user) {
        try {
            // Determine type for re-login (simplified)
            const type = user.role === 'CUSTOMER_STAFF' ? 'STAFF' : 'OWNER';
            const id = type === 'STAFF' ? user.phone! : user.clientId;
            const pwd = type === 'STAFF' ? user.activationCode! : user.password || '1';
            
            const res = await MockApi.login(id, pwd, type); 
            setCurrentUser(res.user);
            setCurrentProfile(res.profile);
            setShowIntro(false); // Skip intro if already logged in
            setLoading(false);
            return;
        } catch (e) {
            console.error("Session restore failed", e);
            MockApi.logout();
        }
      }
      
      // If no current session, check for persistent session token (Remember Me)
      const persistentData = localStorage.getItem('sini_car_persistent_session');
      if (persistentData) {
        try {
          const session = JSON.parse(persistentData);
          // Check if session is not expired and token is valid
          if (session.expiresAt && session.expiresAt > Date.now() && session.sessionToken && session.userId) {
            // Validate the token is still valid (invalidated on password change)
            if (MockApi.validateSessionToken(session.userId, session.sessionToken)) {
              // Get user by ID (not replaying credentials)
              const user = await MockApi.getUserById(session.userId);
              if (user && user.isActive) {
                // Get profile for customer users
                let profile: BusinessProfile | null = null;
                if (user.role !== 'SUPER_ADMIN') {
                  const allUsers = await MockApi.getAllUsers();
                  const mainProfileUserId = user.parentId || user.id;
                  const found = allUsers.find(u => u.user.id === mainProfileUserId);
                  profile = found?.profile || null;
                }
                // Store as current session
                localStorage.setItem('sini_car_current_user', JSON.stringify(user));
                setCurrentUser(user);
                setCurrentProfile(profile);
                setShowIntro(false);
                setLoading(false);
                return;
              }
            }
            // Token invalid, user inactive, or password changed - remove persistent session
            localStorage.removeItem('sini_car_persistent_session');
          } else {
            // Session expired, remove it
            localStorage.removeItem('sini_car_persistent_session');
          }
        } catch (e) {
          console.error("Persistent session restore failed", e);
          localStorage.removeItem('sini_car_persistent_session');
        }
      }
      
      setLoading(false);
    };
    
    restoreSession();
  }, []);

  // Function to refresh user state (e.g. when credits are used)
  const refreshUser = async () => {
      const updatedUser = await MockApi.getCurrentSession();
      if (updatedUser) {
          setCurrentUser(updatedUser);
      }
  };

  // Cinematic Intro Sequence Logic (First Load only - faster)
  useEffect(() => {
    if (!currentUser && !loading && !isLoginProcessing) {
      setTimeout(() => setIntroStep(1), 300);
      setTimeout(() => setIntroStep(2), 1000);
      setTimeout(() => setIntroStep(3), 1700);
      setTimeout(() => setShowIntro(false), 2500);
    }
  }, [loading, currentUser, isLoginProcessing]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validate credentials first quietly
    try {
        const res = await MockApi.login(identifier, secret, loginType);
        
        // 2. Start the 4-second cinematic loading
        setIsLoginProcessing(true);
        setLoginStepIndex(0);
        setLoginProgress(0);

        const totalDuration = 4000; // 4 seconds (faster login experience)
        const loginSteps = getLoginLoadingSteps(t);
        const stepDuration = totalDuration / loginSteps.length;
        
        let currentStep = 0;
        
        // Timer for steps text
        const stepInterval = setInterval(() => {
            currentStep++;
            if (currentStep < loginSteps.length) {
                setLoginStepIndex(currentStep);
            }
        }, stepDuration);

        // Timer for progress bar (smoother)
        const progressInterval = setInterval(() => {
            setLoginProgress(old => Math.min(old + 1, 100));
        }, totalDuration / 100);

        // 3. Finalize after 4 seconds
        setTimeout(() => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
            
            // Store persistent session token if rememberMe is checked (secure approach)
            if (rememberMe) {
                // Generate a secure random token (not storing actual credentials)
                const sessionToken = `${res.user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                const persistentSession = {
                    sessionToken: sessionToken,
                    userId: res.user.id,
                    loginType: loginType,
                    createdAt: Date.now(), // Non-secret timestamp for session creation
                    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
                };
                localStorage.setItem('sini_car_persistent_session', JSON.stringify(persistentSession));
                // Store token in user's active sessions (token invalidation handles password changes)
                MockApi.storeSessionToken(res.user.id, sessionToken);
            }
            
            setIsLoginProcessing(false);
            setCurrentUser(res.user);
            setCurrentProfile(res.profile);
            addToast(`${t('welcome')} ${res.user.name}`, 'success');
        }, totalDuration);

    } catch (err: any) {
        addToast(err.message, 'error');
    }
  };

  const handleLogout = async () => {
    await MockApi.logout();
    // Clear persistent session on logout
    localStorage.removeItem('sini_car_persistent_session');
    setCurrentUser(null);
    setCurrentProfile(null);
    setAuthView('LOGIN');
    setIdentifier('');
    setSecret('');
    setRememberMe(false);
    setShowIntro(false);
    setIsLoginProcessing(false);
    addToast(t('logout'), 'info');
  };

  // Guest Mode Login Handler
  const handleGuestLogin = () => {
    // Create a guest user with restricted permissions
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      clientId: 'GUEST',
      name: t('login.guest'),
      email: '',
      phone: '',
      role: 'CUSTOMER_OWNER' as const,
      isActive: true,
      password: '',
      isGuest: true, // Special flag for guest users
    };
    
    setCurrentUser(guestUser);
    setCurrentProfile(null);
    addToast(t('login.guestWelcome'), 'info');
  };

  // --- RENDER HELPERS ---

  if (loading && !showIntro) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050A14]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
  }

  // --- LOGGED IN VIEWS ---
  if (currentUser) {
    if (currentUser.role === 'SUPER_ADMIN') {
        return <AdminDashboard onLogout={handleLogout} />;
    }
    // Check if user is a supplier
    if (currentUser.isSupplier || currentUser.extendedRole === 'SUPPLIER_LOCAL' || currentUser.extendedRole === 'SUPPLIER_INTERNATIONAL') {
        return <SupplierPortal user={currentUser} onLogout={handleLogout} />;
    }
    return (
        <CustomerPortalSettingsProvider>
            <Dashboard user={currentUser} profile={currentProfile} onLogout={handleLogout} onRefreshUser={refreshUser} />
        </CustomerPortalSettingsProvider>
    );
  }

  if (authView === 'REGISTER') {
    return <Register onSuccess={() => setAuthView('LOGIN')} onSwitchToLogin={() => setAuthView('LOGIN')} />;
  }

  // --- LOGIN LOADING SCREEN (10 Seconds Animation) ---
  if (isLoginProcessing) {
      const loginSteps = getLoginLoadingSteps(t);
      const currentStepData = loginSteps[loginStepIndex];
      
      return (
          <div className="fixed inset-0 bg-[#050A14] text-white flex flex-col items-center justify-center font-sans overflow-hidden z-50">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050A14] to-[#050A14]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
              
              <div className="relative z-10 w-full max-w-lg px-8 text-center">
                  
                  {/* Central Icon Animation */}
                  <div className="mb-12 relative h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)] transform transition-all duration-500 hover:scale-105">
                          {currentStepData.icon}
                      </div>
                      
                      {/* Orbiting Particles */}
                      <div className="absolute inset-0 animate-spin-slow">
                          <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                      </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3 mb-12 min-h-[100px]">
                      <h2 className="text-2xl font-bold text-white tracking-tight animate-fade-in key={loginStepIndex}">
                          {t(currentStepData.titleKey)}
                      </h2>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300 transition-all duration-300 ease-out shadow-[0_0_10px_#22d3ee]"
                          style={{ width: `${loginProgress}%` }}
                      ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
                      <span>{t('loading.systemInitialization')}</span>
                      <span>{Math.round(loginProgress)}%</span>
                  </div>
              </div>
          </div>
      );
  }

  // --- CINEMATIC INTRO VIEW (First Load) ---
  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-[#050A14] text-white flex flex-col items-center justify-center font-sans overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050A14] to-[#050A14]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,232,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,232,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="flex justify-center mb-12">
             <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <Box size={64} className="text-cyan-400 relative z-10" strokeWidth={1} />
             </div>
          </div>

          <div className="space-y-6">
             {/* Step 1 */}
             <div className={`flex items-center gap-4 transition-all duration-700 ${introStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${introStep > 1 ? 'border-green-500 text-green-500' : 'border-cyan-500/30 text-cyan-400 animate-pulse'}`}>
                   {introStep > 1 ? <CheckCircle2 size={16} /> : <Server size={16} />}
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-slate-200">{t('intro.mainServer')}</p>
                   <p className="text-xs text-slate-500 font-mono">{t('intro.connectingServer')}</p>
                </div>
             </div>

             {/* Step 2 */}
             <div className={`flex items-center gap-4 transition-all duration-700 delay-100 ${introStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${introStep > 2 ? 'border-green-500 text-green-500' : 'border-cyan-500/30 text-cyan-400 animate-pulse'}`}>
                   {introStep > 2 ? <CheckCircle2 size={16} /> : <Database size={16} />}
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-slate-200">{t('intro.dataSync')}</p>
                   <p className="text-xs text-slate-500 font-mono">{t('intro.syncingData')}</p>
                </div>
             </div>

             {/* Step 3 */}
             <div className={`flex items-center gap-4 transition-all duration-700 delay-200 ${introStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${introStep >= 3 ? 'border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-slate-700 text-slate-600'}`}>
                   <Globe size={16} className={introStep >= 3 ? 'animate-spin-slow' : ''} />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-slate-200">{t('intro.logistics')}</p>
                   <p className="text-xs text-slate-500 font-mono">{t('intro.connectingWarehouses')}</p>
                </div>
             </div>
          </div>

          <div className="mt-12 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-[4000ms] ease-out" style={{ width: introStep > 0 ? '100%' : '0%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIN VIEW (CINEMATIC) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] relative overflow-hidden font-sans" dir={dir}>
      
      {/* Language Switcher - Top Right/Left Corner */}
      <div className={`absolute top-4 z-50 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}>
          <LanguageSwitcher variant="floating" size="md" />
      </div>
      
      {/* 1. Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,232,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,232,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
          
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
          
          {/* Animated Particles (CSS Animation simulation) */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-[2px] animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full blur-[1px] animate-ping"></div>
      </div>

      {/* 2. Login Container */}
      <div className="relative z-10 w-full max-w-lg px-4 animate-fade-in-up">
          
          {/* Card Wrapper with Hologram Border */}
          <div className="group relative">
              {/* Glowing Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-[#0B1221]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-6 shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl animate-pulse"></div>
                          <Box size={40} className="text-cyan-400 relative z-10" strokeWidth={1.5} />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight" data-testid="text-login-title">
                          {siteSettings?.authPageTexts?.loginTitle || t('login.wholesaleLogin')}
                      </h1>
                      <h2 className="text-lg text-cyan-400 font-bold mb-3">{t('common.siniCar')}</h2>
                      <div className="flex items-center justify-center gap-2 text-cyan-500/80 text-sm font-mono tracking-wider">
                          <Activity size={14} />
                          <span>{siteSettings?.authPageTexts?.loginSubtitle || t('login.b2bPortal')}</span>
                      </div>
                  </div>

                  {/* Login Type Switch */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-lg mb-8 border border-slate-700">
                      <button
                          onClick={() => { setLoginType('OWNER'); setIdentifier(''); setSecret(''); }}
                          className={`py-2 rounded-md text-sm font-bold transition-all ${loginType === 'OWNER' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                          data-testid="button-login-owner"
                      >
                          {t('login.ownerLogin')}
                      </button>
                      <button
                          onClick={() => { setLoginType('STAFF'); setIdentifier(''); setSecret(''); }}
                          className={`py-2 rounded-md text-sm font-bold transition-all ${loginType === 'STAFF' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                          data-testid="button-login-staff"
                      >
                          {t('login.staffLogin')}
                      </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {loginType === 'OWNER' ? (siteSettings?.authPageTexts?.loginClientIdLabel || t('login.clientId')) : t('login.phoneNumber')}
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]"></span>
                          </label>
                          <div className="relative group/input">
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                                  {loginType === 'OWNER' ? <UserIcon size={20} /> : <Phone size={20} />}
                              </div>
                              <input
                                  type={loginType === 'OWNER' ? "text" : "tel"}
                                  required
                                  className="block w-full pr-12 pl-4 py-4 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                  placeholder={loginType === 'OWNER' ? (siteSettings?.authPageTexts?.loginClientIdPlaceholder || "C-100200") : "05xxxxxxxx"}
                                  value={identifier}
                                  onChange={(e) => setIdentifier(e.target.value)}
                                  data-testid="input-identifier"
                              />
                              {/* Tech Corners */}
                              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {loginType === 'OWNER' ? (siteSettings?.authPageTexts?.loginPasswordLabel || t('login.password')) : t('login.activationCode')}
                          </label>
                          <div className="relative group/input">
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                                  {loginType === 'OWNER' ? <Lock size={20} /> : <ShieldCheck size={20} />}
                              </div>
                              <input
                                  type={loginType === 'OWNER' ? "password" : "text"}
                                  required
                                  className="block w-full pr-12 pl-4 py-4 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                  placeholder={loginType === 'OWNER' ? (siteSettings?.authPageTexts?.loginPasswordPlaceholder || "••••••••") : "123456"}
                                  value={secret}
                                  onChange={(e) => setSecret(e.target.value)}
                                  data-testid="input-password"
                              />
                               {/* Tech Corners */}
                               <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                               <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center justify-center w-5 h-5 border border-slate-600 rounded bg-slate-900/50 group-hover:border-cyan-500 transition-colors">
                                  <input 
                                      type="checkbox" 
                                      className="peer appearance-none w-full h-full cursor-pointer" 
                                      checked={rememberMe}
                                      onChange={(e) => setRememberMe(e.target.checked)}
                                      data-testid="checkbox-remember-me"
                                  />
                                  <CheckCircle2 size={12} className="text-cyan-400 opacity-0 peer-checked:opacity-100 absolute" />
                              </div>
                              <span className="text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">{t('login.rememberMe')}</span>
                          </label>
                          {loginType === 'OWNER' && (
                              <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors" data-testid="link-forgot-password">{siteSettings?.authPageTexts?.loginForgotPasswordText || t('login.forgotPassword')}</a>
                          )}
                      </div>

                      <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wide rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                          data-testid="button-login"
                      >
                          {loading ? (
                             <span className="animate-pulse">{t('login.verifying')}</span>
                          ) : (
                             <>
                                <span className="relative z-10">{siteSettings?.authPageTexts?.loginButtonText || t('login.enter')}</span>
                                <ArrowRight className="w-5 h-5 rtl:rotate-180 relative z-10 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                             </>
                          )}
                          {/* Shine Effect */}
                          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover/btn:animate-shine"></div>
                      </button>
                  </form>

                  {/* Footer Security Seal */}
                  <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-3 text-center">
                      <div className="flex items-center gap-2 text-emerald-500/80 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-bold tracking-wider">{t('login.secureConnection')}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                          {t('login.securityNote')}
                      </p>
                      
                      {loginType === 'OWNER' && (
                          <button 
                              onClick={() => setAuthView('REGISTER')}
                              className="mt-4 text-cyan-500 text-sm font-bold hover:text-cyan-400 hover:underline transition-all"
                              data-testid="button-open-account-request"
                          >
                              {siteSettings?.authPageTexts?.loginRegisterLinkText || t('login.openNewAccount')}
                          </button>
                      )}
                      
                      {/* Guest Login Button - Only shown when enabled in settings */}
                      {siteSettings?.guestModeEnabled && (
                          <button 
                              onClick={handleGuestLogin}
                              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-600 text-slate-300 rounded-lg font-bold hover:bg-slate-700/50 hover:border-cyan-500/50 hover:text-white transition-all group"
                              data-testid="button-guest-login"
                          >
                              <Globe size={18} className="group-hover:text-cyan-400 transition-colors" />
                              <span>{t('login.enterAsGuest')}</span>
                          </button>
                      )}

                      {/* Quick Login Buttons - For Testing */}
                      <div className="mt-6 pt-4 border-t border-white/5">
                          <p className="text-[10px] text-slate-500 text-center mb-3">{t('login.quickLoginForTesting')}</p>
                          <div className="grid grid-cols-3 gap-2">
                              <button
                                  type="button"
                                  onClick={() => { setIdentifier('1@sinicar.com'); setSecret('1'); setLoginType('OWNER'); }}
                                  className="px-2 py-2 bg-red-600/20 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-600/40 transition-all"
                                  data-testid="quick-login-admin"
                              >
                                  {t('login.quickAdmin')}
                              </button>
                              <button
                                  type="button"
                                  onClick={() => { setIdentifier('3@sinicar.com'); setSecret('3'); setLoginType('OWNER'); }}
                                  className="px-2 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs rounded hover:bg-blue-600/40 transition-all"
                                  data-testid="quick-login-staff"
                              >
                                  {t('login.quickStaff')}
                              </button>
                              <button
                                  type="button"
                                  onClick={() => { setIdentifier('4@sinicar.com'); setSecret('4'); setLoginType('OWNER'); }}
                                  className="px-2 py-2 bg-green-600/20 border border-green-500/30 text-green-400 text-xs rounded hover:bg-green-600/40 transition-all"
                                  data-testid="quick-login-customer"
                              >
                                  {t('login.quickCustomer')}
                              </button>
                              <button
                                  type="button"
                                  onClick={() => { setIdentifier('5@sinicar.com'); setSecret('5'); setLoginType('OWNER'); }}
                                  className="px-2 py-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 text-xs rounded hover:bg-orange-600/40 transition-all"
                                  data-testid="quick-login-supplier"
                              >
                                  {t('login.quickSupplier')}
                              </button>
                              <button
                                  type="button"
                                  onClick={() => { setIdentifier('6@sinicar.com'); setSecret('6'); setLoginType('OWNER'); }}
                                  className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs rounded hover:bg-purple-600/40 transition-all"
                                  data-testid="quick-login-marketer"
                              >
                                  {t('login.quickMarketer')}
                              </button>
                              <button
                                  type="button"
                                  onClick={() => { setIdentifier('2@sinicar.com'); setSecret('2'); setLoginType('OWNER'); }}
                                  className="px-2 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 text-xs rounded hover:bg-yellow-600/40 transition-all"
                                  data-testid="quick-login-manager"
                              >
                                  {t('login.quickManager')}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Bottom Copyright */}
          <div className="text-center mt-6 text-slate-600 text-xs font-mono">
              &copy; 2025 SINI CAR WHOLESALE SYSTEMS. V2.5.0
          </div>
      </div>
    </div>
  );
}

export default function App() {
    return (
        <LanguageProvider>
            <ToastProvider>
              <OrganizationProvider>
                <ToastContainer />
                <AppContent />
                <AIAssistant />
              </OrganizationProvider>
            </ToastProvider>
        </LanguageProvider>
    );
}