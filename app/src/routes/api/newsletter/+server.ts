import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { email, firstName, phoneNumber, smsConsent } = data;

    // Prepare member data according to Mailchimp API specs
    const memberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        PHONE: phoneNumber || '',
      },
      ...(smsConsent && phoneNumber && {
        marketing_permissions: [{
          marketing_permission_id: "SMSPHONE",
          enabled: true
        }]
      })
    };

    const response = await fetch(
      `https://${env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // If email already exists, don't treat it as an error
      if (result.title === 'Member Exists') {
        // Try to update the existing member
        const subscriberHash = Buffer.from(email.toLowerCase()).toString('hex');
        const updateResponse = await fetch(
          `https://${env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `apikey ${env.MAILCHIMP_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              merge_fields: memberData.merge_fields,
              ...(memberData.marketing_permissions && { marketing_permissions: memberData.marketing_permissions })
            }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Failed to update existing member');
        }

        return json({ 
          success: true, 
          message: 'Deine Daten wurden erfolgreich aktualisiert!' 
        });
      }
      throw new Error(result.detail || 'Subscription failed');
    }

    return json({ 
      success: true, 
      message: 'Erfolgreich zum Newsletter angemeldet!' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return json(
      { 
        success: false, 
        message: 'Newsletter-Anmeldung fehlgeschlagen. Bitte versuche es später erneut.' 
      },
      { status: 400 }
    );
  }
}
