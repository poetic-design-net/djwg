import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { isAdmin } from '$lib/config/admin.server';

export const POST: RequestHandler = async ({ locals }) => {
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
    
    // Mailchimp API Client initialisieren
    const mailchimpServer = env.PRIVATE_MAILCHIMP_SERVER;
    const mailchimpListId = env.PRIVATE_MAILCHIMP_LIST_ID;
    const mailchimpApiKey = env.PRIVATE_MAILCHIMP_API_KEY;
    
    const response = await fetch(
      `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members?count=1000`,
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
    
    // Profile mit übereinstimmenden E-Mail-Adressen finden
    const { data: matchingProfiles, error: profileError } = await locals.supabase
      .from('profiles')
      .select('id')
      .in('email', subscriberEmails);
      
    if (profileError) {
      throw new Error(`Fehler beim Abfragen der Profile: ${profileError.message}`);
    }
    
    if (!matchingProfiles?.length) {
      return json({
        success: true,
        message: 'Keine übereinstimmenden Profile gefunden',
        updatedUsers: 0,
        totalSubscribers: subscriberEmails.length,
        matchingProfiles: 0,
        timestamp: new Date().toISOString()
      });
    }
    
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
    
    let updatedCount = 0;
    
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
    
    return json({
      success: true,
      message: updatedCount > 0 
        ? `Newsletter-Badges erfolgreich synchronisiert` 
        : 'Alle berechtigten Benutzer haben bereits das Newsletter-Badge',
      updatedUsers: updatedCount,
      totalSubscribers: subscriberEmails.length,
      matchingProfiles: matchingProfiles.length,
      alreadyHadBadge: matchingProfiles.length - updatedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Fehler bei der Newsletter-Badge-Synchronisation:', err);
    throw error(500, {
      message: err instanceof Error ? err.message : 'Interner Server-Fehler'
    });
  }
};