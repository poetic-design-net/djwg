import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { isAdmin } from '$lib/config/admin.server';

// Batch-Größe für die Verarbeitung
const BATCH_SIZE = 50;

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    // Authentifizierung prüfen
    const session = await locals.supabase.auth.getSession();
    if (!session.data.session?.user) {
      throw error(401, 'Nicht authentifiziert');
    }
    
    // Admin-Berechtigung prüfen
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('email')
      .eq('id', session.data.session.user.id)
      .single();
      
    if (!profile?.email || !isAdmin(profile.email)) {
      throw error(403, 'Keine Administrator-Berechtigung');
    }

    // Request-Body parsen, um den aktuellen Offset zu erhalten
    const { offset = 0 } = await request.json();
    
    // Mailchimp API Client initialisieren
    const mailchimpServer = env.PRIVATE_MAILCHIMP_SERVER;
    const mailchimpListId = env.PRIVATE_MAILCHIMP_LIST_ID;
    const mailchimpApiKey = env.PRIVATE_MAILCHIMP_API_KEY;
    
    // Prüfen, ob alle erforderlichen Umgebungsvariablen gesetzt sind
    if (!mailchimpServer || !mailchimpListId || !mailchimpApiKey) {
      throw error(500, 'Mailchimp-Konfiguration fehlt');
    }

    // Abonnenten in Batches abrufen
    const response = await fetch(
      `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members?count=${BATCH_SIZE}&offset=${offset}`,
      {
        headers: {
          Authorization: `apikey ${mailchimpApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Mailchimp API Fehler: ${response.statusText}`);
    }
    
    const data = await response.json();
    const subscriberEmails = data.members
      .filter((member: any) => member.status === 'subscribed')
      .map((member: any) => member.email_address.toLowerCase());
    
    // Wenn keine Abonnenten in diesem Batch, sind wir fertig
    if (subscriberEmails.length === 0) {
      return json({
        success: true,
        message: 'Synchronisierung abgeschlossen',
        done: true,
        totalProcessed: offset,
        batchProcessed: 0,
        updatedUsers: 0,
        totalSubscribers: data.total_items,
        nextOffset: null
      });
    }
    
    // Profile mit übereinstimmenden E-Mail-Adressen finden
    const { data: matchingProfiles, error: profileError } = await locals.supabase
      .from('profiles')
      .select('id')
      .in('email', subscriberEmails);
      
    if (profileError) {
      throw new Error(`Fehler beim Abfragen der Profile: ${profileError.message}`);
    }
    
    let updatedCount = 0;
    
    if (matchingProfiles?.length) {
      const userIds = matchingProfiles.map(profile => profile.id);
      const newsletterBadgeId = '023cc4ab-9a20-45db-82d5-c248aacefe0a';
      
      // Existierende Badge-Zuweisungen prüfen
      const { data: existingBadges } = await locals.supabase
        .from('user_badges')
        .select('user_id')
        .eq('badge_id', newsletterBadgeId)
        .in('user_id', userIds);
      
      // Nur Benutzer ohne das Badge filtern
      const existingUserIds = new Set(existingBadges?.map(badge => badge.user_id) || []);
      const newUserIds = userIds.filter(id => !existingUserIds.has(id));
      
      if (newUserIds.length > 0) {
        const { error: badgeError } = await locals.supabase
          .from('user_badges')
          .insert(newUserIds.map(userId => ({
            user_id: userId,
            badge_id: newsletterBadgeId
          })));
          
        if (badgeError) {
          throw new Error(`Fehler beim Zuweisen der Badges: ${badgeError.message}`);
        }
        
        updatedCount = newUserIds.length;
      }
    }
    
    // Berechnen des nächsten Offsets
    const nextOffset = offset + BATCH_SIZE;
    const done = nextOffset >= data.total_items;
    
    return json({
      success: true,
      message: `Batch ${offset / BATCH_SIZE + 1} verarbeitet`,
      done,
      totalProcessed: offset + subscriberEmails.length,
      batchProcessed: subscriberEmails.length,
      updatedUsers: updatedCount,
      totalSubscribers: data.total_items,
      nextOffset: done ? null : nextOffset
    });
    
  } catch (err) {
    console.error('Fehler bei der Newsletter-Badge-Synchronisation (Batch):', err);
    throw error(500, {
      message: err instanceof Error ? err.message : 'Interner Server-Fehler'
    });
  }
};