<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import groq from 'groq';
  import { client } from '$lib/sanity/client';
  
  export let userId: string;
  
  interface Registration {
    _id: string;
    eventId: string;
    eventTitle: string;
    sessionTitle: string;
    sessionTime: string;
    dayIndex: number;
    stageIndex: number;
    itemIndex: number;
    status: 'confirmed' | 'waitlist' | 'cancelled';
    createdAt: string;
  }
  
  interface GroupedRegistrations {
    upcoming: Registration[];
    past: Registration[];
    waitlist: Registration[];
  }
  
  let registrations: Registration[] = [];
  let groupedRegistrations: GroupedRegistrations = {
    upcoming: [],
    past: [],
    waitlist: []
  };
  let isLoading = true;
  let error: string | null = null;
  let activeTab: 'upcoming' | 'past' | 'waitlist' = 'upcoming';
  
  onMount(() => {
    loadRegistrations();
  });
  
  async function loadRegistrations() {
    try {
      isLoading = true;
      error = null;
      
      // Fetch registrations from Sanity
      const query = groq`*[_type == "scheduleRegistration" && userId == $userId] {
        _id,
        "eventId": event->_id,
        "eventTitle": event->title,
        sessionTitle,
        sessionTime,
        dayIndex,
        stageIndex,
        itemIndex,
        status,
        createdAt,
        "eventDate": event->date,
        "eventLocation": event->location,
        "eventImage": event->image.asset->url,
        "eventSlug": event->slug.current
      } | order(createdAt desc)`;
      
      const data = await client.fetch(query, { userId });
      registrations = data || [];
      
      // Group registrations
      const now = new Date();
      groupedRegistrations = {
        upcoming: [],
        past: [],
        waitlist: []
      };
      
      registrations.forEach(reg => {
        if (reg.status === 'waitlist') {
          groupedRegistrations.waitlist.push(reg);
        } else if (reg.status === 'cancelled') {
          // Skip cancelled registrations
        } else {
          // For now, put all confirmed in upcoming
          // You could check event dates here if available
          groupedRegistrations.upcoming.push(reg);
        }
      });
      
    } catch (err) {
      console.error('Error loading registrations:', err);
      error = 'Fehler beim Laden der Registrierungen';
    } finally {
      isLoading = false;
    }
  }
  
  async function cancelRegistration(registrationId: string) {
    if (!confirm('Möchtest du diese Anmeldung wirklich stornieren?')) return;
    
    try {
      const response = await fetch(`/api/schedule-registrations/${registrationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadRegistrations();
      } else {
        throw new Error('Failed to cancel registration');
      }
    } catch (err) {
      console.error('Error cancelling registration:', err);
      alert('Fehler beim Stornieren der Anmeldung');
    }
  }
  
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  $: currentRegistrations = groupedRegistrations[activeTab];
  $: hasRegistrations = currentRegistrations.length > 0;
</script>

<div class="bg-black/40 border border-gray-800 rounded-3xl p-6 mb-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-2xl font-heading text-white mb-2">Meine Event-Anmeldungen</h2>
      <p class="text-gray-400">Verwalte deine Workshop- und Session-Anmeldungen</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {groupedRegistrations.upcoming.length} Anstehend
      </span>
      {#if groupedRegistrations.waitlist.length > 0}
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {groupedRegistrations.waitlist.length} Warteliste
        </span>
      {/if}
    </div>
  </div>
  
  <!-- Tabs -->
  <div class="flex gap-2 mb-6 border-b border-gray-800">
    <button
      class="px-4 py-2 text-sm font-medium transition-all duration-200 {activeTab === 'upcoming' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}"
      on:click={() => activeTab = 'upcoming'}
    >
      Anstehend ({groupedRegistrations.upcoming.length})
    </button>
    <button
      class="px-4 py-2 text-sm font-medium transition-all duration-200 {activeTab === 'waitlist' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}"
      on:click={() => activeTab = 'waitlist'}
    >
      Warteliste ({groupedRegistrations.waitlist.length})
    </button>
    <button
      class="px-4 py-2 text-sm font-medium transition-all duration-200 {activeTab === 'past' ? 'text-gray-300 border-b-2 border-gray-300' : 'text-gray-400 hover:text-white'}"
      on:click={() => activeTab = 'past'}
    >
      Vergangen ({groupedRegistrations.past.length})
    </button>
  </div>
  
  <!-- Content -->
  {#if isLoading}
    <div class="flex items-center justify-center py-12">
      <div class="text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Lade Registrierungen...
      </div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-red-400">{error}</p>
      <button 
        on:click={loadRegistrations}
        class="mt-4 px-4 py-2 bg-green-500 text-black rounded-full hover:bg-green-600 transition-colors duration-200"
      >
        Erneut versuchen
      </button>
    </div>
  {:else if !hasRegistrations}
    <div class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-gray-400 mb-2">
        {#if activeTab === 'upcoming'}
          Keine anstehenden Anmeldungen
        {:else if activeTab === 'waitlist'}
          Keine Wartelisten-Einträge
        {:else}
          Keine vergangenen Anmeldungen
        {/if}
      </p>
      <p class="text-sm text-gray-500">
        Melde dich für Workshops und Sessions an, um sie hier zu sehen.
      </p>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each currentRegistrations as registration (registration._id)}
        <div 
          class="group relative bg-black/20 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all duration-200"
          in:slide={{ duration: 300, easing: quintOut }}
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Event Title -->
              {#if registration.eventTitle}
                <a 
                  href="/events/{registration.eventSlug || '#'}"
                  class="text-sm text-green-400 hover:text-green-300 transition-colors duration-200"
                >
                  {registration.eventTitle}
                </a>
              {/if}
              
              <!-- Session Title -->
              <h3 class="text-lg font-medium text-white mb-2">
                {registration.sessionTitle}
              </h3>
              
              <!-- Time & Date -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {registration.sessionTime}
                </span>
                {#if registration.eventLocation}
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {registration.eventLocation}
                  </span>
                {/if}
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Angemeldet am {formatDate(registration.createdAt)}
                </span>
              </div>
              
              <!-- Status Badge -->
              {#if registration.status === 'waitlist'}
                <div class="mt-3">
                  <span class="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Auf Warteliste
                  </span>
                </div>
              {/if}
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2 ml-4">
              {#if registration.eventSlug}
                <a
                  href="/events/{registration.eventSlug}"
                  class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Event ansehen"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </a>
              {/if}
              
              {#if activeTab !== 'past'}
                <button
                  on:click={() => cancelRegistration(registration._id)}
                  class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  title="Anmeldung stornieren"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar for better aesthetics */
  :global(.registration-list::-webkit-scrollbar) {
    width: 8px;
  }
  
  :global(.registration-list::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  :global(.registration-list::-webkit-scrollbar-thumb) {
    background: rgba(74, 222, 128, 0.3);
    border-radius: 4px;
  }
  
  :global(.registration-list::-webkit-scrollbar-thumb:hover) {
    background: rgba(74, 222, 128, 0.5);
  }
</style>