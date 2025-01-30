import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';

export interface EmailData {
  name: string;
  email: string;
  message: string;
  subject?: string;
  formType?: 'contact' | 'artist' | 'partner';
}

interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
  technical?: string;
}

// Konfigurationsobjekt für verschiedene Formulartypen
const FORM_CONFIGS = {
  contact: { subject: 'Neue Kontaktanfrage' },
  artist: { subject: 'Neue Artist-Bewerbung' },
  partner: { subject: 'Neue Partner-Anfrage' }
} as const;

// Validiere die Umgebungsvariablen beim Start
function validateEnvVariables(): void {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL', 'TO_EMAIL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Fehlende Umgebungsvariablen: ${missing.join(', ')}`);
  }
}

// Erstelle den E-Mail-Transporteur
function createTransporter() {
  const port = parseInt(process.env.SMTP_PORT ?? '465');
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      minVersion: 'TLSv1.2'
    },
    debug: process.env.NODE_ENV !== 'production'
  });
}

// Erstelle die E-Mail-Optionen
function createMailOptions(data: EmailData): SendMailOptions {
  const { name, email, message, formType = 'contact' } = data;
  const subject = FORM_CONFIGS[formType].subject;
  
  const messageText = `
${subject}
Von: ${name} <${email}>
E-Mail: ${email}
Nachricht:
${message}
  `.trim();

  const messageHtml = `
<h2>${subject}</h2>
<p><strong>Von:</strong> ${name} &lt;${email}&gt;</p>
<p><strong>E-Mail:</strong> ${email}</p>
<p><strong>Nachricht:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
  `.trim();

  return {
    from: `"${name}" <${process.env.FROM_EMAIL}>`,
    to: process.env.TO_EMAIL,
    subject,
    text: messageText,
    html: messageHtml,
    replyTo: `"${name}" <${email}>`,
    headers: {
      'Reply-To': `"${name}" <${email}>`,
      'X-Original-From': `"${name}" <${email}>`
    }
  };
}

// Hauptfunktion zum Senden von E-Mails
export async function sendEmail(data: EmailData): Promise<EmailResponse> {
  try {
    // Validiere Umgebungsvariablen
    validateEnvVariables();

    // Erstelle Transporter
    const transporter = createTransporter();
    
    // Verifiziere SMTP-Verbindung
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP connection verification failed:', verifyError);
      return {
        success: false,
        error: 'SMTP-Verbindung konnte nicht hergestellt werden.'
      };
    }

    // Sende E-Mail
    const mailOptions = createMailOptions(data);
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return { 
      success: true, 
      messageId: info.messageId 
    };

  } catch (error) {
    const typedError = error as any;
    console.error('Email sending failed:', {
      code: typedError.code,
      command: typedError.command,
      response: typedError.response,
      responseCode: typedError.responseCode
    });

    let errorMessage = 'E-Mail konnte nicht gesendet werden. ';
    
    switch ((error as any).code) {
      case 'ESOCKET':
        errorMessage += 'Verbindung zum E-Mail-Server fehlgeschlagen.';
        break;
      case 'EAUTH':
        errorMessage += 'Authentifizierung fehlgeschlagen.';
        break;
      default:
        errorMessage += 'Bitte versuchen Sie es später erneut.';
    }

    return {
      success: false,
      error: errorMessage,
      technical: process.env.NODE_ENV !== 'production' ? (error as any).message : undefined
    };
  }
}