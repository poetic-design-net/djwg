import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { type, data } = await req.json()

    // Validiere den API-Key
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('EDGE_FUNCTION_API_KEY')}`) {
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (type === 'club_manager_request') {
      const { djEmail, djName, clubName, message } = data
      
      // Sende E-Mail über Supabase
      await supabaseClient.functions.invoke('resend-email', {
        body: {
          to: djEmail,
          subject: 'Neue Club-Anfrage',
          html: `
            <h2>Neue Anfrage von einem Club-Manager</h2>
            <p>Hallo ${djName},</p>
            <p>${clubName} möchte mit dir zusammenarbeiten!</p>
            <p>Nachricht: ${message}</p>
          `
        }
      })
    } else if (type === 'club_manager_response') {
      const { clubManagerEmail, clubManagerName, djName, accepted, message } = data
      
      await supabaseClient.functions.invoke('resend-email', {
        body: {
          to: clubManagerEmail,
          subject: 'Antwort auf deine DJ-Anfrage',
          html: `
            <h2>Antwort auf deine DJ-Anfrage</h2>
            <p>Hallo ${clubManagerName},</p>
            <p>${djName} hat deine Anfrage ${accepted ? 'angenommen' : 'abgelehnt'}.</p>
            ${message ? `<p>Nachricht: ${message}</p>` : ''}
          `
        }
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})