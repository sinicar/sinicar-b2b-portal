/**
 * Unified Login Demo Page
 * صفحة اختبار لبوابة الدخول الموحدة
 * 
 * يمكن الوصول إليها من: /login-demo أو باستخدام ?demo=login
 */

import React from 'react';
import { UnifiedLoginPage } from './UnifiedLoginPage';
import { User, BusinessProfile } from '../types';

interface UnifiedLoginDemoProps {
    onLoginSuccess: (user: User, profile: BusinessProfile | null) => void;
    onRegister: () => void;
    onPartnerRegister: () => void;
    siteSettings?: any;
}

export const UnifiedLoginDemo: React.FC<UnifiedLoginDemoProps> = ({
    onLoginSuccess,
    onRegister,
    onPartnerRegister,
    siteSettings
}) => {
    return (
        <UnifiedLoginPage
            onLoginSuccess={onLoginSuccess}
            onRegister={onRegister}
            onPartnerRegister={onPartnerRegister}
            siteSettings={siteSettings}
        />
    );
};

export default UnifiedLoginDemo;
