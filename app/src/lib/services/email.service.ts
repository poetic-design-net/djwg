import type { EmailData, EmailTemplate, EmailServiceOptions } from '../types/email';
import { emailConfigs, generateEmailBody } from '../types/email';

export interface EmailOptions {
  to: string;
  subject: string;
  body?: string;
  template?: EmailTemplate;
  data?: EmailData;
}

/**
 * Sendet eine E-Mail über den konfigurierten E-Mail-Service
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Überprüfe die Konfiguration
  const { EMAIL_SERVICE, EMAIL_API_KEY, EMAIL_FROM } = process.env;
  if (!EMAIL_SERVICE || !EMAIL_API_KEY || !EMAIL_FROM) {
    throw new Error('E-Mail-Konfiguration ist unvollständig');
  }

  try {
    // Generiere den E-Mail-Body, wenn nicht explizit angegeben
    const body = options.body || (options.data 
      ? generateEmailBody(options.data)
      : options.template 
        ? emailConfigs[options.template].defaultBody
        : '');

    // Entwicklungsmodus - Logging
    if (process.env.NODE_ENV === 'development') {
      console.log('E-Mail würde gesendet werden:', {
        to: options.to,
        from: EMAIL_FROM,
        subject: options.subject,
        body,
        template: options.template,
        data: options.data
      });
      return;
    }

    // Implementiere hier den tatsächlichen E-Mail-Versand
    // z.B. mit SendGrid:
    // const msg = {
    //   to: options.to,
    //   from: EMAIL_FROM,
    //   subject: options.subject,
    //   text: body,
    //   html: await generateHtmlEmail(body, options.template)
    // };
    // await sgMail.send(msg);

    console.log('E-Mail würde gesendet werden:', {
      to: options.to,
      from: EMAIL_FROM,
      subject: options.subject,
      body
    });
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error);
    throw error;
  }
}

/**
 * Hilfsfunktion für das Senden von typisierten E-Mails
 */
export async function sendServiceEmail({ template, data }: EmailServiceOptions): Promise<void> {
  const config = emailConfigs[template];
  return sendEmail({
    to: config.recipient,
    subject: config.subject,
    template,
    data
  });
}

/**
 * Generiert eine HTML-Version der E-Mail (noch zu implementieren)
 */
async function generateHtmlEmail(text: string, template?: EmailTemplate): Promise<string> {
  // TODO: Implementiere HTML-Template-Generierung
  return `<pre>${text}</pre>`;
}