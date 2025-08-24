<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import groq from 'groq';
  import { client } from '$lib/sanity/client';
  
  export let userId: string;
  export let onShowAll: () => void;
  
  interface Registration {
    _id: string;
    eventTitle: string;
    sessionTitle: string;
    sessionTime: string;
    status: 'confirmed' | 'waitlist' | 'cancelled';
    eventDate: string;
  }
  
  let registrations: Registration[] = [];
  let isLoading = true;
  
  onMount(() => {
    loadRegistrations();
  });
  
  async function loadRegistrations() {
    try {
      isLoading = true;
      
      // Fetch only the next 3 confirmed registrations from Sanity
      const query = groq`*[_type == "scheduleRegistration" && userId == $userId && status == "confirmed"] {
        _id,
        "eventTitle": event->title,
        sessionTitle,
        sessionTime,
        status,
        "eventDate": event->date
      } | order(createdAt desc)[0...3]`;
      
      const data = await client.fetch(query, { userId });
      registrations = data || [];
      
    } catch (err) {
      console.error('Error loading registrations preview:', err);
      registrations = [];
    } finally {
      isLoading = false;
    }
  }
  
  function formatDateTime(dateStr: string | undefined, timeStr: string | undefined): string {
    if (!timeStr) return '';
    
    // Wenn kein valides Datum vorhanden ist, zeige nur die Zeit
    if (!dateStr || dateStr === 'Invalid Date') {
      return timeStr;
    }
    
    try {
      const date = new Date(dateStr);
      // Prüfe ob das Datum valide ist
      if (isNaN(date.getTime())) {
        return timeStr;
      }
      
      const day = date.getDate();
      const month = date.toLocaleDateString('de-DE', { month: 'short' });
      return `${day}. ${month}, ${timeStr}`;
    } catch {
      return timeStr;
    }
  }
</script>

<!-- Subtile kompakte Anzeige -->
<div class="bg-black/40 border border-gray-800 rounded-xl p-5">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-medium text-gray-300">Anstehende Events</h3>
    {#if registrations.length > 0 && !isLoading}
      <button
        on:click={onShowAll}
        class="text-xs text-green-400/80 hover:text-green-400 transition-colors"
      >
        Alle anzeigen →
      </button>
    {/if}
  </div>
  
  {#if isLoading}
    <div class="flex items-center gap-2 text-gray-500 text-xs">
      <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Lade...</span>
    </div>
  {:else if registrations.length === 0}
    <p class="text-xs text-gray-500">
      Keine anstehenden Events. 
      <button on:click={onShowAll} class="text-green-400/80 hover:text-green-400">
        Jetzt anmelden →
      </button>
    </p>
  {:else}
    <div class="space-y-2.5">
      {#each registrations as registration (registration._id)}
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white/90 truncate font-medium">
              {registration.sessionTitle || 'Session'}
            </p>
            <p class="text-gray-500 text-xs mt-0.5">
              {#if registration.eventTitle}
                <span class="text-gray-400">{registration.eventTitle}</span>
                {#if formatDateTime(registration.eventDate, registration.sessionTime)}
                  <span class="text-gray-600"> • </span>
                  <span>{formatDateTime(registration.eventDate, registration.sessionTime)}</span>
                {/if}
              {:else if formatDateTime(registration.eventDate, registration.sessionTime)}
                {formatDateTime(registration.eventDate, registration.sessionTime)}
              {/if}
            </p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>