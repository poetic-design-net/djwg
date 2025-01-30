import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';

// SMTP-Transporter für Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailData {
  name: string;
  email: string;
  message: string;
  subject?: string;
  formType?: 'contact' | 'artist' | 'partner';
}

export async function sendEmail(data: EmailData) {
  const { name, email, message, formType = 'contact' } = data;

  let subject = 'Neue Kontaktanfrage';
  if (formType === 'artist') {
    subject = 'Neue Artist-Bewerbung';
  } else if (formType === 'partner') {
    subject = 'Neue Partner-Anfrage';
  }

  const mailOptions: SendMailOptions = {
    from: `"${name}" <${email}>`,
    to: 'info@djworkshopgermany.de',
    subject,
    text: message,
    html: `
      <h2>${subject} von ${name}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> ${email}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: 'Failed to send email' };
  }
}