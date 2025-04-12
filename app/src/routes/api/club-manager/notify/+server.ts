import { json } from '@sveltejs/kit';
import { generateClubManagerRequestEmail, generateClubManagerResponseEmail } from '$lib/email-templates/club-manager-request';
import { sendEmail } from '$lib/server/email';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Erstelle einen Service-Role-Client für administrative Operationen
const serviceRoleClient = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

export async function POST({ request, locals }) {
  try {
    const { type, data } = await request.json();

    // Validiere den Cookie
    const clubManagerAuth = request.headers.get('cookie')?.includes('club_manager_auth=cm_djwg_2025');
    if (!clubManagerAuth) {
      return json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    if (type === 'request') {
      const { djId, djEmail, djName, clubName, message, startDate, endDate, clubDetails, clubManagerId, clubManagerEmail } = data;
 
       // Erstelle eine Benachrichtigung für den DJ mit dem Service-Role-Client
       await serviceRoleClient.from('notifications').insert({
         user_id: djId,
         type: 'club_manager_request',
         title: 'Neue Club-Anfrage',
         message: `${clubName} möchte mit dir vom ${new Date(startDate).toLocaleDateString('de-DE')} bis ${new Date(endDate).toLocaleDateString('de-DE')} zusammenarbeiten`,
         metadata: {
           clubName,
           clubManagerId, // Hinzugefügt
           clubManagerEmail, // Hinzugefügt
           originalMessage: message,
           club: clubName,
           clubDetails,
           startDate,
           endDate,
           status: 'Angefragt',
           availability_id: data.availabilityId // ID des Verfügbarkeitszeitraums
         }
       });

      // Ändere den Status des DJs auf "requested" für den angefragten Zeitraum
      if (data.availabilityId) {
        await locals.supabase.from('dj_availability')
          .update({ status: 'requested' })
          .eq('id', data.availabilityId)
          .eq('user_id', djId);
      }

      // Sende E-Mail über SMTP
      await sendEmail({
        name: clubName,
        email: djEmail,
        subject: 'Neue Club-Anfrage',
        message: message,
        html: generateClubManagerRequestEmail(djName, clubName, message)
      });

    } else if (type === 'response') {
      const { clubManagerId, clubManagerEmail, clubManagerName, djName, accepted, message, availabilityId } = data;
      
      // Erstelle eine Benachrichtigung für den Club-Manager mit dem Service-Role-Client
      await serviceRoleClient.from('notifications').insert({
        user_id: clubManagerId,
        type: 'dj_response',
        title: 'Antwort auf deine Anfrage',
        message: `${djName} hat deine Anfrage ${accepted ? 'angenommen' : 'abgelehnt'}`,
        metadata: {
          djName,
          accepted,
          response: message,
          availability_id: availabilityId
        }
      });

      // Aktualisiere den Status in der Verfügbarkeitstabelle
      if (availabilityId) {
        await locals.supabase.from('dj_availability')
          .update({
            status: accepted ? 'booked' : 'available'
          })
          .eq('id', availabilityId);
      }

      // Sende E-Mail über SMTP
      await sendEmail({
        name: djName,
        email: clubManagerEmail,
        subject: 'Antwort auf deine DJ-Anfrage',
        message: message || `${djName} hat deine Anfrage ${accepted ? 'angenommen' : 'abgelehnt'}`,
        html: generateClubManagerResponseEmail(clubManagerName, djName, accepted, message)
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Fehler beim Senden der Benachrichtigung:', error);
    return json({ error: 'Interner Server-Fehler' }, { status: 500 });
  }
}