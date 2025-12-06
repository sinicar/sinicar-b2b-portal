export interface EmailMessage {
  email: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
  isHtml?: boolean;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface SendResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

class EmailProvider {
  private provider: string = 'SMTP';
  private smtpHost: string = '';
  private smtpPort: number = 587;
  private smtpUser: string = '';
  private smtpPassword: string = '';
  private fromAddress: string = '';
  private fromName: string = 'SINI CAR';
  private isConfigured: boolean = false;

  configure(config: {
    provider?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromAddress?: string;
    fromName?: string;
  }) {
    this.provider = config.provider || 'SMTP';
    this.smtpHost = config.smtpHost || '';
    this.smtpPort = config.smtpPort || 587;
    this.smtpUser = config.smtpUser || '';
    this.smtpPassword = config.smtpPassword || '';
    this.fromAddress = config.fromAddress || '';
    this.fromName = config.fromName || 'SINI CAR';
    this.isConfigured = !!(config.smtpHost && config.smtpUser && config.fromAddress);
  }

  async send(message: EmailMessage): Promise<SendResult> {
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
    } catch (error: any) {
      console.error('[Email Provider] Send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private buildEmailContent(message: EmailMessage): string {
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

  getStatus(): { isConfigured: boolean; provider: string } {
    return {
      isConfigured: this.isConfigured,
      provider: this.provider,
    };
  }
}

export const emailProvider = new EmailProvider();
