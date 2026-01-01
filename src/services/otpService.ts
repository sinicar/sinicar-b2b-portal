/**
 * OTP Service - خدمة رموز التحقق
 * 
 * جاهزة للربط مع مزود SMS مثل:
 * - Unifonic (السعودية)
 * - Twilio
 * - AWS SNS
 * - Msegat
 */

// ==================== TYPES ====================

export interface SMSProvider {
    name: string;
    sendSMS(phone: string, message: string): Promise<boolean>;
}

export interface OTPRecord {
    phone: string;
    code: string;
    createdAt: number;
    expiresAt: number;
    attempts: number;
    verified: boolean;
}

export interface OTPConfig {
    codeLength: number;
    expiryMinutes: number;
    maxAttempts: number;
    resendCooldownSeconds: number;
}

// ==================== CONSTANTS ====================

const DEFAULT_CONFIG: OTPConfig = {
    codeLength: 6,
    expiryMinutes: 5,
    maxAttempts: 3,
    resendCooldownSeconds: 60
};

const STORAGE_KEY = 'sinicar_otp_records';

// ==================== MOCK SMS PROVIDER ====================

/**
 * Mock SMS Provider للتطوير والاختبار
 * يحفظ الرسائل في console ويعرضها كـ toast
 */
const MockSMSProvider: SMSProvider = {
    name: 'MockSMS',
    async sendSMS(phone: string, message: string): Promise<boolean> {
        console.log(`📱 [MockSMS] Sending to ${phone}:`);
        console.log(`   Message: ${message}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Store in localStorage for demo purposes
        const sentMessages = JSON.parse(localStorage.getItem('sinicar_sms_log') || '[]');
        sentMessages.push({
            phone,
            message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('sinicar_sms_log', JSON.stringify(sentMessages));

        return true;
    }
};

// ==================== UNIFONIC PROVIDER (TEMPLATE) ====================

/**
 * Unifonic SMS Provider - جاهز للربط
 * يحتاج: UNIFONIC_APP_SID, UNIFONIC_SENDER_ID
 */
const UnifonicProvider: SMSProvider = {
    name: 'Unifonic',
    async sendSMS(phone: string, message: string): Promise<boolean> {
        // TODO: Replace with actual API call when ready
        const UNIFONIC_APP_SID = process.env.UNIFONIC_APP_SID || '';
        const UNIFONIC_SENDER_ID = process.env.UNIFONIC_SENDER_ID || 'SINICAR';

        if (!UNIFONIC_APP_SID) {
            console.warn('⚠️ Unifonic not configured, using MockSMS');
            return MockSMSProvider.sendSMS(phone, message);
        }

        try {
            const response = await fetch('https://el.cloud.unifonic.com/rest/SMS/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    AppSid: UNIFONIC_APP_SID,
                    SenderID: UNIFONIC_SENDER_ID,
                    Recipient: phone.replace(/^0/, '966'), // Convert 05xx to 9665xx
                    Body: message
                })
            });

            const result = await response.json();
            return result.success === true;
        } catch (error) {
            console.error('Unifonic SMS failed:', error);
            return false;
        }
    }
};

// ==================== TWILIO PROVIDER (TEMPLATE) ====================

/**
 * Twilio SMS Provider - جاهز للربط
 * يحتاج: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
const TwilioProvider: SMSProvider = {
    name: 'Twilio',
    async sendSMS(phone: string, message: string): Promise<boolean> {
        // TODO: Replace with actual API call when ready
        const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
        const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
        const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

        if (!TWILIO_ACCOUNT_SID) {
            console.warn('⚠️ Twilio not configured, using MockSMS');
            return MockSMSProvider.sendSMS(phone, message);
        }

        try {
            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
                    },
                    body: new URLSearchParams({
                        To: phone.replace(/^0/, '+966'),
                        From: TWILIO_PHONE_NUMBER,
                        Body: message
                    })
                }
            );

            const result = await response.json();
            return result.sid !== undefined;
        } catch (error) {
            console.error('Twilio SMS failed:', error);
            return false;
        }
    }
};

// ==================== MAIN OTP SERVICE ====================

class OTPService {
    private config: OTPConfig;
    private provider: SMSProvider;

    constructor(config: Partial<OTPConfig> = {}, provider?: SMSProvider) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.provider = provider || MockSMSProvider;
    }

    /**
     * تغيير مزود SMS
     */
    setProvider(provider: SMSProvider): void {
        this.provider = provider;
        console.log(`📱 SMS Provider changed to: ${provider.name}`);
    }

    /**
     * الحصول على مزود SMS الحالي
     */
    getProvider(): SMSProvider {
        return this.provider;
    }

    /**
     * توليد رمز OTP عشوائي
     */
    generateCode(): string {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < this.config.codeLength; i++) {
            code += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        return code;
    }

    /**
     * الحصول على جميع سجلات OTP
     */
    private getRecords(): OTPRecord[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    /**
     * حفظ سجلات OTP
     */
    private saveRecords(records: OTPRecord[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    /**
     * البحث عن سجل OTP برقم الهاتف
     */
    private findRecord(phone: string): OTPRecord | undefined {
        const records = this.getRecords();
        return records.find(r => r.phone === phone && !r.verified && r.expiresAt > Date.now());
    }

    /**
     * إرسال OTP جديد
     */
    async sendOTP(phone: string): Promise<{ success: boolean; message: string; code?: string }> {
        // Normalize phone number
        const normalizedPhone = phone.replace(/\s/g, '').replace(/^00/, '+');

        // Check if there's a recent OTP (cooldown)
        const existingRecord = this.findRecord(normalizedPhone);
        if (existingRecord) {
            const timeSinceCreated = (Date.now() - existingRecord.createdAt) / 1000;
            if (timeSinceCreated < this.config.resendCooldownSeconds) {
                const remainingSeconds = Math.ceil(this.config.resendCooldownSeconds - timeSinceCreated);
                return {
                    success: false,
                    message: `يرجى الانتظار ${remainingSeconds} ثانية قبل إعادة الإرسال`
                };
            }
        }

        // Generate new code
        const code = this.generateCode();
        const now = Date.now();

        // Create OTP record
        const newRecord: OTPRecord = {
            phone: normalizedPhone,
            code,
            createdAt: now,
            expiresAt: now + (this.config.expiryMinutes * 60 * 1000),
            attempts: 0,
            verified: false
        };

        // Save record
        const records = this.getRecords().filter(r => r.phone !== normalizedPhone);
        records.push(newRecord);
        this.saveRecords(records);

        // Send SMS
        const message = `رمز التحقق الخاص بك في صيني كار: ${code}\nصالح لمدة ${this.config.expiryMinutes} دقائق`;
        const sent = await this.provider.sendSMS(normalizedPhone, message);

        if (sent) {
            return {
                success: true,
                message: 'تم إرسال رمز التحقق بنجاح',
                code: this.provider.name === 'MockSMS' ? code : undefined // Only return code in dev mode
            };
        } else {
            return {
                success: false,
                message: 'فشل في إرسال الرسالة. يرجى المحاولة لاحقاً'
            };
        }
    }

    /**
     * التحقق من رمز OTP
     */
    verifyOTP(phone: string, code: string): { success: boolean; message: string } {
        const normalizedPhone = phone.replace(/\s/g, '').replace(/^00/, '+');
        const records = this.getRecords();
        const recordIndex = records.findIndex(r => r.phone === normalizedPhone && !r.verified);

        if (recordIndex === -1) {
            return {
                success: false,
                message: 'لا يوجد رمز تحقق لهذا الرقم. يرجى طلب رمز جديد'
            };
        }

        const record = records[recordIndex];

        // Check expiry
        if (record.expiresAt < Date.now()) {
            records.splice(recordIndex, 1);
            this.saveRecords(records);
            return {
                success: false,
                message: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد'
            };
        }

        // Check attempts
        if (record.attempts >= this.config.maxAttempts) {
            records.splice(recordIndex, 1);
            this.saveRecords(records);
            return {
                success: false,
                message: 'تجاوزت الحد الأقصى للمحاولات. يرجى طلب رمز جديد'
            };
        }

        // Verify code
        if (record.code !== code) {
            record.attempts++;
            this.saveRecords(records);
            const remaining = this.config.maxAttempts - record.attempts;
            return {
                success: false,
                message: `رمز التحقق غير صحيح. متبقي ${remaining} محاولات`
            };
        }

        // Mark as verified
        record.verified = true;
        this.saveRecords(records);

        return {
            success: true,
            message: 'تم التحقق بنجاح'
        };
    }

    /**
     * الحصول على الوقت المتبقي لإعادة الإرسال
     */
    getResendCooldown(phone: string): number {
        const normalizedPhone = phone.replace(/\s/g, '').replace(/^00/, '+');
        const record = this.findRecord(normalizedPhone);

        if (!record) return 0;

        const timeSinceCreated = (Date.now() - record.createdAt) / 1000;
        const remaining = this.config.resendCooldownSeconds - timeSinceCreated;

        return Math.max(0, Math.ceil(remaining));
    }

    /**
     * إخفاء رقم الهاتف للعرض
     */
    maskPhone(phone: string): string {
        if (phone.length < 6) return phone;
        const visible = 4;
        const start = phone.slice(0, 3);
        const end = phone.slice(-visible);
        const masked = '*'.repeat(phone.length - 3 - visible);
        return start + masked + end;
    }

    /**
     * مسح جميع سجلات OTP (للتطوير)
     */
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('sinicar_sms_log');
        console.log('🗑️ All OTP records cleared');
    }
}

// ==================== SINGLETON INSTANCE ====================

export const otpService = new OTPService();

// Export providers for configuration
export const SMSProviders = {
    Mock: MockSMSProvider,
    Unifonic: UnifonicProvider,
    Twilio: TwilioProvider
};

export default otpService;
