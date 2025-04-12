/**
 * Newsletter-Service für die Anmeldung bei Mailchimp
 */

/**
 * Meldet eine E-Mail-Adresse beim Mailchimp-Newsletter an
 * @param email Die E-Mail-Adresse, die angemeldet werden soll
 * @returns Ein Promise, das erfüllt wird, wenn die Anmeldung erfolgreich war
 */
export async function subscribeEmailToMailchimp(email: string): Promise<void> {
  // Verwende den lokalen API-Endpunkt anstatt direkt mit Mailchimp zu kommunizieren
  const url = '/api/newsletter';

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Newsletter-Anmeldung Fehler:', errorData);
    throw new Error('Newsletter Anmeldung fehlgeschlagen');
  }
  
  const data = await response.json();
  
  // Wenn die E-Mail bereits abonniert ist, betrachten wir das nicht als Fehler
  if (data.alreadySubscribed) {
    console.log('E-Mail ist bereits für den Newsletter angemeldet');
    return;
  }
  
  console.log('Erfolgreich für den Newsletter angemeldet');
}