export interface WhatsAppMessage {
  phone: string;
  body: string;
  templateName?: string;
  mediaUrl?: string;
}

export interface SendResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

class WhatsAppProvider {
  private apiUrl: string = '';
  private apiKey: string = '';
  private phoneNumberId: string = '';
  private isConfigured: boolean = false;

  configure(config: { apiUrl: string; apiKey: string; phoneNumberId: string }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.phoneNumberId = config.phoneNumberId;
    this.isConfigured = !!(config.apiUrl && config.apiKey && config.phoneNumberId);
  }

  async send(message: WhatsAppMessage): Promise<SendResult> {
    console.log('[WhatsApp Provider] Sending message:', {
      phone: message.phone,
      bodyLength: message.body.length,
      templateName: message.templateName,
      timestamp: new Date().toISOString(),
    });

    if (!this.isConfigured) {
      console.log('[WhatsApp Provider] Not configured - message logged but not sent');
      return {
        success: true,
        externalId: `mock_wa_${Date.now()}`,
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.phone.replace(/\D/g, ''),
          type: 'text',
          text: { body: message.body },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[WhatsApp Provider] API error:', error);
        return { success: false, error };
      }

      const data = await response.json();
      return {
        success: true,
        externalId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('[WhatsApp Provider] Send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendTemplate(params: {
    phone: string;
    templateName: string;
    languageCode: string;
    components?: any[];
  }): Promise<SendResult> {
    console.log('[WhatsApp Provider] Sending template:', {
      phone: params.phone,
      templateName: params.templateName,
      languageCode: params.languageCode,
      timestamp: new Date().toISOString(),
    });

    if (!this.isConfigured) {
      console.log('[WhatsApp Provider] Not configured - template logged but not sent');
      return {
        success: true,
        externalId: `mock_wa_tpl_${Date.now()}`,
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: params.phone.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: params.templateName,
            language: { code: params.languageCode },
            components: params.components,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[WhatsApp Provider] Template API error:', error);
        return { success: false, error };
      }

      const data = await response.json();
      return {
        success: true,
        externalId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('[WhatsApp Provider] Template send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getStatus(): { isConfigured: boolean; provider: string } {
    return {
      isConfigured: this.isConfigured,
      provider: 'WhatsApp Business API',
    };
  }
}

export const whatsappProvider = new WhatsAppProvider();
