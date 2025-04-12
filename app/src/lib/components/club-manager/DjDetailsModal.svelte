<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EnrichedProfile } from '$lib/types/profile';

  export let dj: EnrichedProfile;
  export let show = false;

  const dispatch = createEventDispatcher();

  let requesting = false;
  let requestError: string | null = null;
  let requestSuccess = false;

  // Club Manager Formular
  let clubDetails = {
    name: '',
    email: '',
    location: '',
    capacity: '',
    genre: '',
    startDate: '',
    endDate: '',
    additionalMessage: ''
  };

  function generateTempClubId(name: string, email: string): string {
    return `${name}-${email}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getBaseMessage(): string {
    const dateRange = clubDetails.startDate && clubDetails.endDate
      ? ` vom ${formatDate(clubDetails.startDate)} bis ${formatDate(clubDetails.endDate)}`
      : '';
    return `Hallo ${dj.full_name || 'DJ'}, wir würden gerne mit dir${dateRange} zusammenarbeiten.`;
  }

  function getFullMessage(): string {
    const base = getBaseMessage();
    return clubDetails.additionalMessage 
      ? `${base}\n\n${clubDetails.additionalMessage}`
      : base;
  }

  function close() {
    dispatch('close');
  }

  async function sendRequest() {
    if (!dj.email) {
      requestError = 'DJ hat keine E-Mail-Adresse hinterlegt.';
      return;
    }

    if (!clubDetails.startDate || !clubDetails.endDate) {
      requestError = 'Bitte Start- und Enddatum angeben.';
      return;
    }

    if (!clubDetails.name || !clubDetails.email) {
      requestError = 'Bitte Club-Name und E-Mail-Adresse angeben.';
      return;
    }

    requesting = true;
    requestError = null;
    requestSuccess = false;

    try {
      const tempClubId = generateTempClubId(clubDetails.name, clubDetails.email);

      const response = await fetch('/api/club-manager/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'request',
          data: {
            djId: dj.id,
            djEmail: dj.email,
            djName: dj.full_name || 'DJ',
            clubName: clubDetails.name,
            clubManagerId: tempClubId,
            clubManagerEmail: clubDetails.email,
            startDate: clubDetails.startDate,
            endDate: clubDetails.endDate,
            message: getFullMessage(),
            clubDetails: {
              location: clubDetails.location,
              capacity: clubDetails.capacity,
              genre: clubDetails.genre
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP-Fehler ${response.status}`);
      }

      requestSuccess = true;

    } catch (err: any) {
      console.error('Fehler beim Senden der Anfrage:', err);
      requestError = err.message || 'Anfrage konnte nicht gesendet werden.';
    } finally {
      requesting = false;
    }
  }
</script>

<!-- Modal Overlay -->
{#if show}
  <div
    class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20"
    on:click|self={close}
  >
    <!-- Modal Content -->
    <div class="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-3xl max-h-[67vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 border-b border-gray-800 flex items-start justify-between sticky top-0 bg-gray-900 z-10">
        <h2 class="text-xl font-semibold text-white">DJ {dj.full_name || 'Details'}</h2>
        <button
          class="text-gray-200 hover:text-gray-200 transition-colors"
          on:click={close}
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-16 space-y-8">
        <!-- Club Manager Anfrage Formular -->
        <div class="bg-gray-700/50 rounded-xl p-6 border border-gray-700/50">
          <h4 class="text-lg font-medium text-white mb-4">Anfrage senden</h4>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Club Name -->
              <div>
                <label for="clubName" class="block text-sm font-medium text-gray-200 mb-1">Club Name *</label>
                <input
                  type="text"
                  id="clubName"
                  bind:value={clubDetails.name}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Club Email -->
              <div>
                <label for="clubEmail" class="block text-sm font-medium text-gray-200 mb-1">Club E-Mail *</label>
                <input
                  type="email"
                  id="clubEmail"
                  bind:value={clubDetails.email}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Zeitraum -->
              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-200 mb-1">Von *</label>
                <input
                  type="date"
                  id="startDate"
                  bind:value={clubDetails.startDate}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-200 mb-1">Bis *</label>
                <input
                  type="date"
                  id="endDate"
                  bind:value={clubDetails.endDate}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <!-- Club Details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Location -->
              <div>
                <label for="location" class="block text-sm font-medium text-gray-200 mb-1">Standort</label>
                <input
                  type="text"
                  id="location"
                  bind:value={clubDetails.location}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Capacity -->
              <div>
                <label for="capacity" class="block text-sm font-medium text-gray-200 mb-1">Kapazität</label>
                <input
                  type="text"
                  id="capacity"
                  bind:value={clubDetails.capacity}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Genre -->
              <div>
                <label for="genre" class="block text-sm font-medium text-gray-200 mb-1">Genre</label>
                <input
                  type="text"
                  id="genre"
                  bind:value={clubDetails.genre}
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Message -->
            <div class="space-y-2">
              <div class="rounded-lg bg-gray-900/50 p-3 border border-gray-700/50">
                <p class="text-sm text-gray-200">Standardnachricht:</p>
                <p class="text-sm text-gray-200 mt-1">{getBaseMessage()}</p>
              </div>
              <div>
                <label for="additionalMessage" class="block text-sm font-medium text-gray-200 mb-1">
                  Zusätzliche Nachricht (optional)
                </label>
                <textarea
                  id="additionalMessage"
                  bind:value={clubDetails.additionalMessage}
                  rows="4"
                  class="w-full bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Fügen Sie weitere Details oder Informationen hinzu..."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- DJ Info -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0">
              {#if dj.avatar_url}
                <img
                  src={dj.avatar_url}
                  alt={dj.full_name || 'DJ Profilbild'}
                  class="w-24 h-24 rounded-full object-cover"
                />
              {:else}
                <div class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg class="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-6.627 0-12 4.373-12 9.777 0 1.223.993 2.223 2.217 2.223h19.566A2.22 2.22 0 0024 23.777C24 18.373 18.627 14 12 14z"/>
                  </svg>
                </div>
              {/if}
            </div>

            <!-- Contact Info -->
            <div class="flex-grow space-y-2">
              <h3 class="text-lg font-medium text-white">{dj.full_name || 'Unbekannter DJ'}</h3>
              {#if dj.phone}
                <div class="text-gray-200">
                  <span class="font-medium">Telefon:</span> {dj.phone}
                </div>
              {/if}
              {#if dj.email}
                <div class="text-gray-200">
                  <span class="font-medium">E-Mail:</span> {dj.email}
                </div>
              {/if}
              {#if dj.website}
                <div class="text-gray-200">
                  <span class="font-medium">Website:</span>
                  <a href={dj.website} target="_blank" rel="noopener noreferrer" class="text-green-400 hover:text-green-300">{dj.website}</a>
                </div>
              {/if}
            </div>
          </div>

          <!-- Social Media Links -->
          {#if dj.social_links}
            <div>
              <h4 class="text-sm font-medium text-gray-200 mb-2">Social Media</h4>
              <div class="flex gap-4">
                {#if dj.social_links.instagram}
                   <a
                     href={`https://instagram.com/${dj.social_links.instagram}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     class="text-green-400 hover:text-green-300 transition-colors"
                   >
                     Instagram
                   </a>
                 {/if}
               {#if dj.social_links.facebook}
                   <a
                     href={`https://facebook.com/${dj.social_links.facebook}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     class="text-green-400 hover:text-green-300 transition-colors"
                   >
                     Facebook
                   </a>
                 {/if}
                {#if dj.social_links.soundcloud}
                   <a
                     href={`https://soundcloud.com/${dj.social_links.soundcloud}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     class="text-green-400 hover:text-green-300 transition-colors"
                   >
                     SoundCloud
                   </a>
                 {/if}
              </div>
            </div>
          {/if}

          <!-- Vorhandene Mixes anzeigen -->
          {#if dj.mixes && dj.mixes.length > 0}
            <div class="border-t border-gray-800 pt-6">
              <h4 class="text-sm font-medium text-gray-200 mb-4">DJ Mixes</h4>
              <div class="space-y-3">
                {#each dj.mixes as mix}
                  <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div class="text-white mb-2">{mix.title}</div>
                    {#if mix.url}
                      <a
                        href={mix.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center text-green-400 hover:text-green-300"
                      >
                        <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                        Mix anhören
                      </a>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer mit Anfrage-Button -->
      <div class="p-6 border-t border-gray-800 sticky bottom-0 bg-gray-900 z-10">
        {#if requestSuccess}
          <div class="p-3 rounded-md bg-green-900/50 border border-green-800 text-center">
            <p class="text-sm text-green-300">Anfrage erfolgreich gesendet!</p>
          </div>
        {:else if requestError}
          <div class="p-3 rounded-md bg-red-900/30 border border-red-800 text-center">
            <p class="text-sm text-red-400">{requestError}</p>
          </div>
        {:else}
          <button
            type="button"
            class="w-full inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={sendRequest}
            disabled={requesting || !dj.email || !clubDetails.name || !clubDetails.email || !clubDetails.startDate || !clubDetails.endDate}
          >
            {#if requesting}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Wird gesendet...
            {:else}
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              DJ Anfragen
            {/if}
          </button>
          {#if !dj.email}
            <p class="text-xs text-red-400 text-center mt-2">Keine E-Mail-Adresse für diesen DJ hinterlegt.</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}