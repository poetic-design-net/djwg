<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '$lib/supabase';

  const supabase = getContext<SupabaseClient>('supabase');

  export let user: Database['public']['Tables']['profiles']['Row'];

  const HOLIDAY_BADGE_ID = '551d9015-aa13-4117-8776-b59f1aaade9b';

  async function hasHolidayBadge(): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user.id)
      .eq('badge_id', HOLIDAY_BADGE_ID)
      .single();

    if (error) {
      console.error('Fehler beim Prüfen des Holiday-Badges:', error);
      return false;
    }

    return data !== null;
  }

  interface Notification {
    id: string;
    created_at: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    archived?: boolean;
    metadata: {
      clubName: string;
      clubManagerId?: string;
      clubManagerEmail?: string;
      originalMessage?: string;
      club: string;
      clubDetails?: {
        location?: string;
        capacity?: string;
        genre?: string;
        [key: string]: any;
      };
      startDate?: string;
      endDate?: string;
      status: string;
      availability_id?: string;
    };
  }

  let notifications: Notification[] = [];
  let hasBadge = false;
  let loading = false;
  let showArchived = false;

  async function reloadNotifications() {
    if (!hasBadge) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', showArchived)
        .or('archived.is.null,archived.eq.' + showArchived)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      notifications = data || [];
      console.log('Geladene Benachrichtigungen:', notifications);
    } catch (err) {
      console.error('Fehler beim Laden der Benachrichtigungen:', err);
    }
  }
  
  // Ursprüngliche loadNotifications Funktion als Wrapper
  async function loadNotifications() {
    await reloadNotifications();
  }

  async function archiveNotification(id: string) {
    if (!hasBadge) return;
    
    try {
      const notification = notifications.find(n => n.id === id);
      if (!notification) {
        console.error('Benachrichtigung nicht gefunden:', id);
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({
          archived: true,
          metadata: notification.metadata // Behalte die Metadaten bei
        })
        .eq('id', id);
      
      if (error) {
        console.error('Fehler beim Archivieren:', error);
        return;
      }
      
      await reloadNotifications();
    } catch (err) {
      console.error('Fehler beim Archivieren:', err);
    }
  }

  async function markAsRead(id: string) {
    if (!hasBadge) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ id });

    if (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
      return;
    }

    notifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
  }

  async function deleteNotification(id: string) {
    if (!confirm('Möchtest du diese Benachrichtigung wirklich löschen? Dies kann nicht rückgängig gemacht werden.')) return;
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .match({ id });
    
    if (error) {
      console.error('Fehler beim Löschen:', error);
      return;
    }
    
    notifications = notifications.filter(n => n.id !== id);
  }

  async function handleClubRequest(notification: Notification, newStatus: 'Angefragt' | 'Angenommen' | 'Abgelehnt') {
    if (!hasBadge || loading) return;
    
    // Bestätigungsdialog
    let confirmMessage = '';
    if (newStatus === 'Angefragt') {
      confirmMessage = 'Möchtest du die Entscheidung wirklich zurücksetzen? Dies sendet keine neue E-Mail.';
    } else if (newStatus === 'Angenommen') {
      confirmMessage = 'Möchtest du die Anfrage annehmen? Dies sendet eine Bestätigungs-E-Mail.';
    } else {
      confirmMessage = 'Möchtest du die Anfrage ablehnen? Dies sendet eine Ablehnungs-E-Mail.';
    }
    
    if (!confirm(confirmMessage)) return;
    
    loading = true;
    
    try {
      // Wenn wir zum "Angefragt" Status zurückkehren, keine E-Mail senden
      if (newStatus !== 'Angefragt') {
        const response = await fetch('/api/club-manager/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'response',
            data: {
              clubManagerId: notification.metadata.clubManagerId,
              clubManagerEmail: notification.metadata.clubManagerEmail,
              clubManagerName: notification.metadata.clubName,
              djName: user.full_name || 'DJ',
              accepted: newStatus === 'Angenommen',
              message: newStatus === 'Angenommen'
                ? 'Ich freue mich auf die Zusammenarbeit!'
                : 'Leider kann ich zum angefragten Zeitraum nicht.',
              availabilityId: notification.metadata.availability_id
            }
          })
        });

        if (!response.ok) {
          throw new Error('Fehler beim Senden der Antwort');
        }
      }

      // Aktualisiere den Status in der Notification
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          metadata: {
            ...notification.metadata,
            status: newStatus
          }
        })
        .match({ id: notification.id });

      if (updateError) throw updateError;
      
      await loadNotifications();
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Anfrage:', error);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    hasBadge = await hasHolidayBadge();
    if (hasBadge) {
      await loadNotifications();
    }
  });

  // Reaktiver Ausdruck für showArchived und hasBadge
  $: if (hasBadge) {
    showArchived, reloadNotifications();
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

{#if hasBadge}
  <div class="relative rounded-xl p-6 border border-gray-800 overflow-hidden">
    <div class="absolute inset-0 mix-blend-overlay noise-filter" />
    <div class="relative">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-medium text-white">Benachrichtigungen</h3>
        <div class="flex items-center gap-2">
          <button
            on:click={reloadNotifications}
            class="text-green-500 hover:text-green-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          <div class="flex space-x-4">
            <button
              class="text-sm font-medium {!showArchived ? 'text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}"
              on:click={() => showArchived = false}
            >
              Aktiv
            </button>
            <button
              class="text-sm font-medium {showArchived ? 'text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}"
              on:click={() => showArchived = true}
            >
              Archiviert
            </button>
          </div>
        </div>
      </div>

      {#if notifications.length === 0}
        <div class="text-gray-400 text-center py-4">
          <p>Keine {showArchived ? 'archivierten' : 'aktiven'} Benachrichtigungen</p>
          <p class="text-xs text-gray-500 mt-2">Debug: showArchived = {showArchived}</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each notifications as notification}
            <div class="relative p-4 rounded-lg border transition-colors {notification.read ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-800/50 border-green-900'}">
              <div class="flex justify-between items-start gap-4">
                <div class="space-y-2 flex-grow">
                  <h4 class="font-medium text-white">{notification.title}</h4>
                  <p class="text-gray-400 text-sm">{notification.message}</p>
                  
                  {#if notification.type === 'club_manager_request' && notification.metadata}
                    <div class="space-y-2 mt-3 bg-gray-900/50 p-3 rounded-lg">
                      <div class="flex flex-col gap-1">
                        <p class="text-gray-400 text-sm">
                          <span class="font-medium text-white">Club:</span> {notification.metadata.club}
                        </p>
                        {#if notification.metadata.clubManagerEmail}
                        <p class="text-gray-400 text-sm">
                          <span class="font-medium text-white">E-Mail:</span> {notification.metadata.clubManagerEmail}
                        </p>
                      {/if}
                        {#if notification.metadata.startDate && notification.metadata.endDate}
                          <p class="text-gray-400 text-sm">
                            <span class="font-medium text-white">Zeitraum:</span> {formatDate(notification.metadata.startDate)} - {formatDate(notification.metadata.endDate)}
                          </p>
                        {/if}
                        {#if notification.metadata.clubDetails}
                          {#if notification.metadata.clubDetails.location}
                            <p class="text-gray-400 text-sm">
                              <span class="font-medium text-white">Ort:</span> {notification.metadata.clubDetails.location}
                            </p>
                          {/if}
                          {#if notification.metadata.clubDetails.capacity}
                            <p class="text-gray-400 text-sm">
                              <span class="font-medium text-white">Kapazität:</span> {notification.metadata.clubDetails.capacity}
                            </p>
                          {/if}
                          {#if notification.metadata.clubDetails.genre}
                            <p class="text-gray-400 text-sm">
                              <span class="font-medium text-white">Genre:</span> {notification.metadata.clubDetails.genre}
                            </p>
                          {/if}
                        {/if}
   
                        {#if notification.metadata.originalMessage}
                          <p class="text-gray-400 text-sm mt-2">
                            <span class="font-medium text-white">Nachricht:</span><br>
                            {notification.metadata.originalMessage}
                          </p>
                        {/if}
                      </div>

                      <div class="flex items-center justify-between mt-4">
                        <div class="flex items-center gap-2">
                          <span class="inline-block px-2 py-1 text-xs rounded-full {notification.metadata.status === 'Angefragt' ? 'bg-yellow-900/50 text-yellow-500' : notification.metadata.status === 'Angenommen' ? 'bg-green-900/50 text-green-500' : 'bg-red-900/50 text-red-500'}">
                            {notification.metadata.status}
                          </span>
                          
                          {#if notification.metadata.status !== 'Angefragt'}
                            <button
                              on:click={() => handleClubRequest(notification, 'Angefragt')}
                              disabled={loading}
                              class="text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-1 disabled:opacity-50"
                            >
                              {#if loading}
                                <svg class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              {:else}
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              {/if}
                              Zurücksetzen
                            </button>
                          {/if}
                        </div>
                        
                        <div class="flex items-center gap-2">
                          {#if !notification.archived}
                            <button
                              on:click={() => archiveNotification(notification.id)}
                              disabled={loading}
                              class="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 disabled:opacity-50"
                            >
                              {#if loading}
                                <svg class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              {:else}
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                              {/if}
                              Archivieren
                            </button>
                          {:else}
                            <button
                              on:click={() => deleteNotification(notification.id)}
                              class="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                            >
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Löschen
                            </button>
                          {/if}
                        </div>
                      </div>
                      
                      {#if notification.metadata.status === 'Angefragt'}
                        <div class="flex gap-2 mt-3">
                          <button
                            on:click={() => handleClubRequest(notification, 'Angenommen')}
                            disabled={loading}
                            class="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50"
                          >
                            Annehmen
                          </button>
                          <button
                            on:click={() => handleClubRequest(notification, 'Abgelehnt')}
                            disabled={loading}
                            class="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded transition-colors disabled:opacity-50"
                          >
                            Ablehnen
                          </button>
                        </div>
                      {/if}
                    </div>
                  {/if}
                  
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString('de-DE')}
                    </span>
                    {#if !notification.read && !showArchived}
                      <button
                        class="text-xs text-green-500 hover:text-green-400"
                        on:click={() => markAsRead(notification.id)}
                      >
                        Als gelesen markieren
                      </button>
                    {/if}
                    <!-- Diese Buttons wurden in den Status-Bereich verschoben -->
                  </div>
                </div>
                {#if !notification.read}
                  <div class="h-2 w-2 rounded-full bg-green-500" />
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}