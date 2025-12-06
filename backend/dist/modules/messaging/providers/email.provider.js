"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailProvider = void 0;
class EmailProvider {
    provider = 'SMTP';
    smtpHost = '';
    smtpPort = 587;
    smtpUser = '';
    smtpPassword = '';
    fromAddress = '';
    fromName = 'SINI CAR';
    isConfigured = false;
    configure(config) {
        this.provider = config.provider || 'SMTP';
        this.smtpHost = config.smtpHost || '';
        this.smtpPort = config.smtpPort || 587;
        this.smtpUser = config.smtpUser || '';
        this.smtpPassword = config.smtpPassword || '';
        this.fromAddress = config.fromAddress || '';
        this.fromName = config.fromName || 'SINI CAR';
        this.isConfigured = !!(config.smtpHost && config.smtpUser && config.fromAddress);
    }
    async send(message) {
        console.log('[Email Provider] Sending email:', {
            to: message.email,
            subject: message.subject,
            bodyLength: message.body.length,
            isHtml: message.isHtml,
            timestamp: new Date().toISOString(),
        });
        if (!this.isConfigured) {
            console.log('[Email Provider] Not configured - email logged but not sent');
            console.log('[Email Provider] Email content:', {
                to: message.email,
                subject: message.subject,
                body: message.body.substring(0, 200) + '...',
            });
            return {
                success: true,
                externalId: `mock_email_${Date.now()}`,
            };
        }
        try {
            const emailContent = this.buildEmailContent(message);
            console.log('[Email Provider] Would send via SMTP:', {
                host: this.smtpHost,
                port: this.smtpPort,
                from: `${this.fromName} <${this.fromAddress}>`,
                to: message.email,
                subject: message.subject,
            });
            return {
                success: true,
                externalId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
        }
        catch (error) {
            console.error('[Email Provider] Send error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    buildEmailContent(message) {
        if (message.isHtml) {
            return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${message.subject}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SINI CAR</h1>
    </div>
    <div class="content">
      ${message.body}
    </div>
    <div class="footer">
      <p>SINI CAR - منصة قطع غيار السيارات B2B</p>
    </div>
  </div>
</body>
</html>`;
        }
        return message.body;
    }
    getStatus() {
        return {
            isConfigured: this.isConfigured,
            provider: this.provider,
        };
    }
}
exports.emailProvider = new EmailProvider();
//# sourceMappingURL=email.provider.js.map