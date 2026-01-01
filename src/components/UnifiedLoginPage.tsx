/**
 * UnifiedLoginPage - بوابة الدخول الموحدة
 * 
 * تصميم متوافق مع الصفحة الحالية + OTP
 * جميع المستخدمين يدخلون من نفس البوابة:
 * - موظفي المنصة
 * - العملاء وموظفيهم
 * - الموردين وموظفيهم
 * - المسوقين
 * - المعلنين
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Phone, Lock, ArrowRight, ShieldCheck, Box, CheckCircle2,
    Activity, RefreshCw, AlertCircle, Eye, EyeOff, Smartphone,
    ArrowLeft, Loader2, User as UserIcon, Handshake
} from 'lucide-react';
import { otpService } from '../services/otpService';
import { authApi } from '../services/mock-api';

// ==================== TYPES ====================

interface UnifiedLoginPageProps {
    onLoginSuccess: (user: any, profile: any) => void;
    onRegister: () => void;
    onPartnerRegister: () => void;
    siteSettings?: any;
}

type LoginStep = 'CREDENTIALS' | 'OTP';
type LoginType = 'OWNER' | 'STAFF';

// ==================== COMPONENT ====================

export const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
    onLoginSuccess,
    onRegister,
    onPartnerRegister,
    siteSettings
}) => {
    const { t, i18n } = useTranslation();
    const dir = i18n.dir();

    // Login type (Owner / Staff)
    const [loginType, setLoginType] = useState<LoginType>('OWNER');

    // Form state
    const [identifier, setIdentifier] = useState('');
    const [secret, setSecret] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // OTP state
    const [step, setStep] = useState<LoginStep>('CREDENTIALS');
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

    // Pending login data (stored between credential verification and OTP)
    const [pendingUser, setPendingUser] = useState<any>(null);
    const [pendingProfile, setPendingProfile] = useState<any>(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP input refs
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Reset form when switching login type
    const handleLoginTypeChange = (type: LoginType) => {
        setLoginType(type);
        setIdentifier('');
        setSecret('');
        setError('');
    };

    // Get user phone for OTP (from identifier if phone, or from user data)
    const getUserPhone = (): string => {
        if (loginType === 'STAFF') {
            return identifier; // Staff uses phone directly
        }
        // For owner, try to get phone from pending user
        return pendingUser?.phone || identifier;
    };

    // Handle credentials submit
    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!identifier) {
            setError(loginType === 'OWNER' ? 'رقم العميل مطلوب' : 'رقم الجوال مطلوب');
            return;
        }

        if (!secret) {
            setError(loginType === 'OWNER' ? 'كلمة المرور مطلوبة' : 'كود التفعيل مطلوب');
            return;
        }

        setLoading(true);

        try {
            // For STAFF - use phone-based login
            if (loginType === 'STAFF') {
                const result = await authApi.loginByPhone(identifier, secret);

                if (!result.success) {
                    setError(result.message || 'بيانات الدخول غير صحيحة');
                    setLoading(false);
                    return;
                }

                // Store pending data
                setPendingUser(result.user);
                setPendingProfile(result.profile);

                // Send OTP
                const phone = result.user?.phone || identifier;
                const otpResult = await otpService.sendOTP(phone);

                if (!otpResult.success) {
                    setError(otpResult.message);
                    setLoading(false);
                    return;
                }

                if (otpResult.code) {
                    setDevOtpCode(otpResult.code);
                }

                setStep('OTP');
                setResendCooldown(60);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);

            } else {
                // For OWNER - use existing login with clientId
                const result = await authApi.loginByPhone(identifier, secret);

                if (!result.success) {
                    // Try traditional login with clientId if phone-based fails
                    try {
                        const { authApi: auth } = await import('../services/mock-api');
                        const legacyResult = await auth.login(identifier, secret, 'OWNER');
                        if (legacyResult.user) {
                            setPendingUser(legacyResult.user);
                            setPendingProfile(legacyResult.profile);

                            // Send OTP
                            const phone = legacyResult.user.phone || identifier;
                            if (phone && phone.length >= 10) {
                                const otpResult = await otpService.sendOTP(phone);
                                if (otpResult.success) {
                                    if (otpResult.code) setDevOtpCode(otpResult.code);
                                    setStep('OTP');
                                    setResendCooldown(60);
                                    setTimeout(() => otpRefs.current[0]?.focus(), 100);
                                } else {
                                    // No phone or OTP failed - proceed without OTP for backward compatibility
                                    onLoginSuccess(legacyResult.user, legacyResult.profile);
                                }
                            } else {
                                // No valid phone - proceed without OTP
                                onLoginSuccess(legacyResult.user, legacyResult.profile);
                            }
                            setLoading(false);
                            return;
                        }
                    } catch (legacyErr: any) {
                        setError(legacyErr.message || 'بيانات الدخول غير صحيحة');
                        setLoading(false);
                        return;
                    }
                } else {
                    setPendingUser(result.user);
                    setPendingProfile(result.profile);

                    // Send OTP
                    const phone = result.user?.phone || identifier;
                    if (phone && phone.length >= 10) {
                        const otpResult = await otpService.sendOTP(phone);
                        if (otpResult.success) {
                            if (otpResult.code) setDevOtpCode(otpResult.code);
                            setStep('OTP');
                            setResendCooldown(60);
                            setTimeout(() => otpRefs.current[0]?.focus(), 100);
                        } else {
                            // OTP failed - proceed without
                            onLoginSuccess(result.user, result.profile);
                        }
                    } else {
                        // No valid phone - proceed without OTP
                        onLoginSuccess(result.user, result.profile);
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1);
        setOtpCode(newOtp);
        setError('');

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        if (value && index === 5) {
            const fullCode = [...newOtp.slice(0, 5), value.slice(-1)].join('');
            if (fullCode.length === 6) {
                verifyOtpCode(fullCode);
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtpCode(newOtp);

        if (pastedData.length === 6) {
            verifyOtpCode(pastedData);
        }
    };

    const verifyOtpCode = async (code: string) => {
        setLoading(true);
        setError('');

        const phone = getUserPhone();
        const result = otpService.verifyOTP(phone, code);

        if (!result.success) {
            setError(result.message);
            setOtpCode(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
            setLoading(false);
            return;
        }

        // Complete login
        if (pendingUser) {
            onLoginSuccess(pendingUser, pendingProfile);
        }
        setLoading(false);
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        const phone = getUserPhone();
        const result = await otpService.sendOTP(phone);

        if (result.success) {
            setResendCooldown(60);
            if (result.code) setDevOtpCode(result.code);
            setOtpCode(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleBack = () => {
        setStep('CREDENTIALS');
        setOtpCode(['', '', '', '', '', '']);
        setError('');
        setDevOtpCode(null);
    };

    // ==================== RENDER ====================

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050A14] relative overflow-hidden font-sans" dir={dir}>
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Cyber Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,232,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,232,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

                {/* Ambient Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>

                {/* Animated Particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-[2px] animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full blur-[1px] animate-ping"></div>
            </div>

            {/* Login Container */}
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
                                {step === 'CREDENTIALS' ? (
                                    <Box size={40} className="text-cyan-400 relative z-10" strokeWidth={1.5} />
                                ) : (
                                    <Smartphone size={40} className="text-cyan-400 relative z-10" strokeWidth={1.5} />
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                                {step === 'CREDENTIALS'
                                    ? (siteSettings?.authPageTexts?.loginTitle || t('login.wholesaleLogin'))
                                    : 'رمز التحقق'
                                }
                            </h1>
                            {step === 'CREDENTIALS' && (
                                <>
                                    <h2 className="text-lg text-cyan-400 font-bold mb-3">{t('common.siniCar')}</h2>
                                    <div className="flex items-center justify-center gap-2 text-cyan-500/80 text-sm font-mono tracking-wider">
                                        <Activity size={14} />
                                        <span>{siteSettings?.authPageTexts?.loginSubtitle || t('login.b2bPortal')}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 animate-shake">
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {/* Step 1: Credentials */}
                        {step === 'CREDENTIALS' && (
                            <>
                                {/* Login Type Switch */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-lg mb-8 border border-slate-700">
                                    <button
                                        onClick={() => handleLoginTypeChange('OWNER')}
                                        className={`py-2 rounded-md text-sm font-bold transition-all ${loginType === 'OWNER' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {t('login.ownerLogin')}
                                    </button>
                                    <button
                                        onClick={() => handleLoginTypeChange('STAFF')}
                                        className={`py-2 rounded-md text-sm font-bold transition-all ${loginType === 'STAFF' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {t('login.staffLogin')}
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                                    {/* Identifier Input */}
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
                                                dir="ltr"
                                            />
                                            {/* Tech Corners */}
                                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                                        </div>
                                    </div>

                                    {/* Password/Code Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            {loginType === 'OWNER' ? (siteSettings?.authPageTexts?.loginPasswordLabel || t('login.password')) : t('login.activationCode')}
                                        </label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                                                {loginType === 'OWNER' ? <Lock size={20} /> : <ShieldCheck size={20} />}
                                            </div>
                                            <input
                                                type={loginType === 'OWNER' && !showPassword ? "password" : "text"}
                                                required
                                                className="block w-full pr-12 pl-12 py-4 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                                placeholder={loginType === 'OWNER' ? (siteSettings?.authPageTexts?.loginPasswordPlaceholder || "••••••••") : "123456"}
                                                value={secret}
                                                onChange={(e) => setSecret(e.target.value)}
                                            />
                                            {loginType === 'OWNER' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            )}
                                            {/* Tech Corners */}
                                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600 group-focus-within/input:border-cyan-500 transition-colors"></div>
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5 border border-slate-600 rounded bg-slate-900/50 group-hover:border-cyan-500 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="peer appearance-none w-full h-full cursor-pointer"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                />
                                                <CheckCircle2 size={12} className="text-cyan-400 opacity-0 peer-checked:opacity-100 absolute" />
                                            </div>
                                            <span className="text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">{t('login.rememberMe')}</span>
                                        </label>
                                        {loginType === 'OWNER' && (
                                            <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                                                {siteSettings?.authPageTexts?.loginForgotPasswordText || t('login.forgotPassword')}
                                            </a>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wide rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
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
                            </>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 'OTP' && (
                            <div className="space-y-6">
                                {/* Back Button */}
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                                >
                                    <ArrowLeft size={16} className="rtl:rotate-180" />
                                    رجوع
                                </button>

                                {/* Info */}
                                <div className="text-center py-4">
                                    <p className="text-slate-400 text-sm">تم إرسال رمز التحقق إلى</p>
                                    <p className="text-cyan-400 font-mono text-lg font-bold mt-1" dir="ltr">
                                        {otpService.maskPhone(getUserPhone())}
                                    </p>
                                </div>

                                {/* Dev Mode OTP Display */}
                                {devOtpCode && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                                        <p className="text-emerald-400 text-xs mb-1">🧪 رمز الاختبار:</p>
                                        <p className="text-emerald-300 font-mono text-2xl font-bold tracking-[0.3em]">{devOtpCode}</p>
                                    </div>
                                )}

                                {/* OTP Input */}
                                <div className="flex justify-center gap-2 rtl:flex-row-reverse" onPaste={handleOtpPaste}>
                                    {otpCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-slate-900/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                {/* Resend */}
                                <div className="text-center">
                                    {resendCooldown > 0 ? (
                                        <p className="text-slate-500 text-sm">
                                            إعادة الإرسال بعد <span className="text-cyan-400 font-mono">{resendCooldown}</span> ثانية
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                            إعادة إرسال الرمز
                                        </button>
                                    )}
                                </div>

                                {/* Verify Button */}
                                <button
                                    onClick={() => verifyOtpCode(otpCode.join(''))}
                                    disabled={loading || otpCode.join('').length !== 6}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wide rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <ShieldCheck size={20} />
                                            <span>تأكيد</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Footer Security Seal */}
                        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-3 text-center">
                            <div className="flex items-center gap-2 text-emerald-500/80 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-bold tracking-wider">{t('login.secureConnection')}</span>
                            </div>
                            <p className="text-xs text-slate-500">{t('login.securityNote')}</p>

                            {step === 'CREDENTIALS' && loginType === 'OWNER' && (
                                <>
                                    <button
                                        onClick={onRegister}
                                        className="mt-4 text-cyan-500 text-sm font-bold hover:text-cyan-400 hover:underline transition-all"
                                    >
                                        {siteSettings?.authPageTexts?.loginRegisterLinkText || t('login.openNewAccount')}
                                    </button>

                                    <button
                                        onClick={onPartnerRegister}
                                        className="mt-3 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold hover:bg-emerald-600/30 hover:border-emerald-400/50 hover:text-emerald-300 transition-all group"
                                    >
                                        <Handshake size={18} className="group-hover:scale-110 transition-transform" />
                                        <span>كن شريكنا</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center mt-6 text-slate-600 text-xs font-mono">
                    &copy; 2025 SINI CAR WHOLESALE SYSTEMS. V2.5.0
                </div>
            </div>
        </div>
    );
};

export default UnifiedLoginPage;
