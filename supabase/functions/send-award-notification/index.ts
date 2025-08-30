import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface NotificationPayload {
  notificationId: string
  userName: string
  userEmail: string
  fileName: string
  fileType: string
  submittedAt: string
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const payload: NotificationPayload = await req.json()
    const { notificationId, userName, userEmail, fileName, fileType, submittedAt } = payload

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get all admin emails
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('role', 'admin')

    if (adminError) {
      throw new Error(`Failed to fetch admins: ${adminError.message}`)
    }

    if (!admins || admins.length === 0) {
      console.log('No admins found to notify')
      return new Response(JSON.stringify({ message: 'No admins to notify' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .submission-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #6c757d;
            }
            .value {
              color: #212529;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              color: #6c757d;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="emoji">🏆</div>
            <h1>Neue Award-Einreichung</h1>
            <p>Eine neue Einreichung für den DJ World Globe Award wurde hochgeladen</p>
          </div>
          
          <div class="content">
            <p>Hallo Admin,</p>
            
            <p>Es gibt eine neue Award-Einreichung, die deine Aufmerksamkeit benötigt:</p>
            
            <div class="submission-details">
              <div class="detail-row">
                <span class="label">Einreicher:</span>
                <span class="value">${userName}</span>
              </div>
              <div class="detail-row">
                <span class="label">E-Mail:</span>
                <span class="value">${userEmail}</span>
              </div>
              <div class="detail-row">
                <span class="label">Dateiname:</span>
                <span class="value">${fileName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Dateityp:</span>
                <span class="value">${fileType}</span>
              </div>
              <div class="detail-row">
                <span class="label">Eingereicht am:</span>
                <span class="value">${new Date(submittedAt).toLocaleString('de-DE')}</span>
              </div>
            </div>
            
            <p>Die Einreichung wartet auf deine Überprüfung. Bitte logge dich ein, um die Details anzusehen und zu bewerten.</p>
            
            <center>
              <a href="${Deno.env.get('PUBLIC_SITE_URL')}/admin/desk/awardUpload" class="cta-button">
                Zur Einreichung →
              </a>
            </center>
          </div>
          
          <div class="footer">
            <p>Diese E-Mail wurde automatisch vom DJ World Globe Award System generiert.</p>
            <p>© ${new Date().getFullYear()} DJ World Globe Awards. Alle Rechte vorbehalten.</p>
          </div>
        </body>
      </html>
    `

    const emailText = `
Neue Award-Einreichung

Eine neue Einreichung für den DJ World Globe Award wurde hochgeladen:

Einreicher: ${userName}
E-Mail: ${userEmail}
Dateiname: ${fileName}
Dateityp: ${fileType}
Eingereicht am: ${new Date(submittedAt).toLocaleString('de-DE')}

Bitte logge dich ein, um die Details anzusehen und zu bewerten:
${Deno.env.get('PUBLIC_SITE_URL')}/admin/desk/awardUpload

---
Diese E-Mail wurde automatisch vom DJ World Globe Award System generiert.
    `

    // Send email to all admins using Resend
    const emailPromises = admins.map(admin => 
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'DJ World Globe Awards <awards@djworldglobe.com>',
          to: admin.email,
          subject: `🏆 Neue Award-Einreichung von ${userName}`,
          html: emailHtml,
          text: emailText,
          reply_to: 'no-reply@djworldglobe.com',
        }),
      })
    )

    const emailResults = await Promise.allSettled(emailPromises)
    
    // Check if any emails failed
    const failedEmails = emailResults.filter(result => result.status === 'rejected')
    if (failedEmails.length > 0) {
      console.error('Some emails failed to send:', failedEmails)
    }

    // Update notification record to mark email as sent
    const { error: updateError } = await supabase
      .from('award_notifications')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        email_error: failedEmails.length > 0 ? `Failed to send to ${failedEmails.length} admins` : null
      })
      .eq('id', notificationId)

    if (updateError) {
      console.error('Failed to update notification status:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent to ${emailResults.length - failedEmails.length} admins`,
        failed: failedEmails.length
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in send-award-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})