import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Mailchimp API-Konfiguration aus Umgebungsvariablen
const MAILCHIMP_API_KEY = env.PRIVATE_MAILCHIMP_API_KEY || "";
const MAILCHIMP_SERVER = env.PRIVATE_MAILCHIMP_SERVER || "";
const MAILCHIMP_LIST_ID = env.PRIVATE_MAILCHIMP_LIST_ID || "";

export const POST: RequestHandler = async ({ request }) => {
  // Debug: Umgebungsvariablen ausgeben
  console.log('Umgebungsvariablen:', {
    PRIVATE_MAILCHIMP_API_KEY: process.env.PRIVATE_MAILCHIMP_API_KEY,
    PRIVATE_MAILCHIMP_SERVER: process.env.PRIVATE_MAILCHIMP_SERVER,
    PRIVATE_MAILCHIMP_LIST_ID: process.env.PRIVATE_MAILCHIMP_LIST_ID
  });

  // Überprüfen, ob alle erforderlichen Umgebungsvariablen gesetzt sind
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER || !MAILCHIMP_LIST_ID) {
    console.error('Mailchimp-Konfiguration fehlt. Bitte überprüfen Sie die Umgebungsvariablen.', {
      apiKeyExists: !!MAILCHIMP_API_KEY,
      serverExists: !!MAILCHIMP_SERVER,
      listIdExists: !!MAILCHIMP_LIST_ID
    });
    return json({
      success: false,
      message: 'Server-Konfigurationsfehler. Bitte kontaktieren Sie den Administrator.'
    }, { status: 500 });
  }
  try {
    // E-Mail-Adresse aus der Anfrage extrahieren
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return json({ success: false, message: 'E-Mail-Adresse ist erforderlich' }, { status: 400 });
    }

    // URL für die Mailchimp API
    const url = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

    // Daten für die Anfrage
    const data = {
      email_address: email,
      status: "subscribed"
    };

    // Anfrage an Mailchimp senden
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')}`
      },
      body: JSON.stringify(data)
    });
// Antwort von Mailchimp verarbeiten
const responseData = await response.json();

if (!response.ok) {
  // Detaillierte Fehlerprotokollierung
  console.error('Mailchimp API-Fehler:', {
    status: response.status,
    statusText: response.statusText,
    data: responseData,
    email: email.replace(/[^@]+@/, '***@') // E-Mail-Adresse aus Datenschutzgründen maskieren
  });
  
      
      // Wenn die E-Mail bereits abonniert ist, betrachten wir das als Erfolg
      if (responseData.title === 'Member Exists') {
        return json({ 
          success: true, 
          message: 'E-Mail ist bereits abonniert',
          alreadySubscribed: true
        });
      }
      
      return json({ 
        success: false, 
        message: 'Newsletter-Anmeldung fehlgeschlagen', 
        error: responseData.title || 'Unbekannter Fehler'
      }, { status: 400 });
    }

    return json({ success: true, message: 'Erfolgreich für den Newsletter angemeldet' });
  } catch (error) {
    // Detaillierte Fehlerprotokollierung
    console.error('Server-Fehler bei Newsletter-Anmeldung:', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error
    });
    
    // Fehler in Supabase Error-Logs speichern, falls verfügbar
    try {
      // Hier könnte man den Fehler in einer Datenbank oder einem Logging-Service speichern
      // z.B. await logErrorToDatabase('newsletter_subscription_error', error);
    } catch (logError) {
      console.error('Fehler beim Protokollieren des Fehlers:', logError);
    }
    
    return json({
      success: false,
      message: 'Ein Fehler ist aufgetreten bei der Newsletter-Anmeldung',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};
