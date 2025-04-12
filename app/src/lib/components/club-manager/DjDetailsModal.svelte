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

{#if show}
  <div 
    class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    on:click|self={close}
  >
    <div class="bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-800 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
        <h2 class="text-lg font-medium text-white">{dj.username || 'DJ Profile'}</h2>
        <button
          class="text-gray-400 hover:text-white transition-colors"
          on:click={close}
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>

      <!-- Two-column layout: DJ info + Form -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-5 p-5">
        <!-- Column 1: DJ Info -->
        <div class="md:col-span-2 space-y-5">
          <!-- Basic Info -->
          <div class="flex items-center space-x-4">
            {#if dj.avatar_url}
              <img
                src={dj.avatar_url}
                alt={dj.full_name || 'DJ'}
                class="w-16 h-16 rounded-full object-cover ring-2 ring-green-500/30"
              />
            {:else}
              <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-green-500/30">
                <svg class="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-6.627 0-12 4.373-12 9.777 0 1.223.993 2.223 2.217 2.223h19.566A2.22 2.22 0 0024 23.777C24 18.373 18.627 14 12 14z"/>
                </svg>
              </div>
            {/if}
            <div>
              <h3 class="font-medium text-white">{dj.full_name || 'Unbekannter DJ'}</h3>
              {#if dj.email}
                <p class="text-sm text-gray-300">{dj.email}</p>
              {/if}
            </div>
          </div>

          <!-- Contact Details -->
          <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 space-y-2">
            {#if dj.phone}
              <div class="flex items-center text-sm">
                <svg class="w-4 h-4 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span class="text-gray-300">{dj.phone}</span>
              </div>
            {/if}
            {#if dj.website}
              <div class="flex items-center text-sm">
                <svg class="w-4 h-4 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd" />
                </svg>
                <a href={dj.website} target="_blank" rel="noopener noreferrer" class="text-green-400 hover:text-green-300">{dj.website}</a>
              </div>
            {/if}
          </div>

          <!-- Social Media Links -->
          {#if dj.social_links}
            <div class="flex flex-wrap gap-3">
              {#if dj.social_links.instagram}
                <a
                  href={`https://instagram.com/${dj.social_links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  <svg class="w-3.5 h-3.5 mr-1.5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              {/if}
              {#if dj.social_links.facebook}
                <a
                  href={`https://facebook.com/${dj.social_links.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  <svg class="w-3.5 h-3.5 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                  Facebook
                </a>
              {/if}
              {#if dj.social_links.soundcloud}
                <a
                  href={`https://soundcloud.com/${dj.social_links.soundcloud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  <svg class="w-3.5 h-3.5 mr-1.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.1.094L0 14.479l.176 1.234c.01.06.051.097.1.097.05 0 .09-.036.1-.097l.24-1.234-.24-1.332c0-.06-.05-.098-.1-.098m1.83-1.229c-.04-.059-.08-.086-.15-.086-.073 0-.133.042-.142.1l-.21 2.563.2 2.426c.008.066.068.11.142.11.08 0 .12-.036.14-.098l.23-2.438-.23-2.576c-.01-.066-.05-.09-.08-.1m.86.049c-.067 0-.133.062-.142.152l-.21 2.564.198 2.393c.01.088.075.153.142.153.071 0 .131-.065.142-.152l.22-2.394-.22-2.564c-.011-.08-.07-.152-.142-.152m.899.163c-.081 0-.139.055-.159.165l-.198 2.4.198 2.3c.02.11.078.165.159.165.08 0 .14-.055.159-.164l.22-2.3-.22-2.415c-.02-.11-.08-.162-.159-.162m1.02.085c-.096 0-.155.071-.165.185l-.186 2.335.186 2.294c.01.101.069.183.165.183.09 0 .15-.087.17-.189l.201-2.288-.201-2.335c-.01-.108-.08-.185-.17-.185m1.042-.039c-.094 0-.18.069-.18.206l-.174 2.364.173 2.232c0 .136.086.206.181.206.094 0 .174-.063.183-.206l.2-2.232-.2-2.354c-.009-.152-.089-.215-.183-.215m1.1-.05c-.109 0-.195.063-.203.22l-.16 2.413.16 2.197c.008.165.094.228.202.228.109 0 .195-.063.2-.228l.19-2.197-.19-2.413c-.005-.156-.095-.22-.2-.22m1.12.118c-.122 0-.21.062-.22.241l-.15 2.304.15 2.175c.01.177.098.249.22.249.12 0 .218-.072.218-.249l.17-2.175-.17-2.304c0-.18-.098-.241-.218-.241m1.12.066c-.119 0-.237.058-.237.255l-.134 2.251.137 2.169c0 .195.118.255.236.255.12 0 .236-.08.236-.255l.151-2.17-.151-2.25c0-.197-.116-.255-.236-.255m1.21.123c-.13 0-.248.07-.248.279l-.137 2.169.137 2.144c0 .25.117.28.248.28.132 0 .247-.01.247-.28l.15-2.145-.15-2.168c0-.208-.115-.279-.247-.279m1.233-.013c-.02-.1-.01-.2-.01-.284-.135 0-.271.037-.271.292l-.126 2.165.126 2.133c0 .255.136.292.271.292.135 0 .36-.036.36-.339l.12-2.04-.12-2.176-.36-.043m1.21.125c-.148 0-.276.082-.276.317l-.115 2.033.115 2.112c0 .235.128.317.276.317.147 0 .273-.082.273-.317l.135-2.112-.135-2.033c0-.235-.125-.317-.273-.317m9.48-.888c-.244 0-.523.059-.523.322l-.07 2.902.07 1.718c0 .264.279.326.523.326.24 0 .534-.062.534-.326l.072-1.718-.072-2.902c0-.263-.294-.322-.534-.322m-8.224 1.105c-.164 0-.29.09-.29.349l-.104 1.838.104 1.983c0 .255.126.345.29.345.159 0 .287-.09.287-.345l.114-1.983-.114-1.838c0-.26-.128-.349-.287-.349m-3.1 6.107c-.534 0-.952.429-.952.966 0 .539.418.962.952.962.532 0 .95-.423.95-.962 0-.537-.418-.966-.95-.966m2.58-4.823c-.17 0-.31.093-.31.371l-.093 1.698.094 1.638c0 .28.14.372.309.372.171 0 .312-.092.312-.372l.103-1.638-.103-1.698c0-.278-.14-.371-.312-.371m-4.953.817c-.057 0-.112.048-.112.105l-.177 1.142.177 1.14c0 .057.055.103.112.103.054 0 .112-.046.112-.103l.201-1.14-.201-1.142c0-.057-.057-.105-.112-.105m-1.812.25c-.046 0-.093.04-.093.088l-.172 1.018.172.927c0 .048.047.088.093.088.048 0 .093-.04.093-.088l.192-.927-.192-1.018c0-.048-.045-.088-.093-.088M6.818 7.18c-.093 0-.148.05-.148.115l-.201 2.082.201 1.986c0 .068.055.116.148.116.09 0 .151-.048.151-.116l.223-1.986-.223-2.082c0-.065-.06-.115-.15-.115m16.329-3.679c-.505 0-.99.097-1.426.244-.3-3.398-3.15-6.035-6.615-6.035-1.287 0-2.42.36-3.401.93-.418.241-.539.49-.552 1.025v11.989c.013.481.36.889.876.915 20.348 0 11.804.006 11.922.006 2.317 0 4.198-1.889 4.198-4.203 0-2.32-1.881-4.19-4.198-4.19"/>
                  </svg>
                  SoundCloud
                </a>
              {/if}
            </div>
          {/if}

          <!-- DJ Mixes -->
          {#if dj.mixes && dj.mixes.length > 0}
            <div class="space-y-2">
              <h4 class="text-xs font-medium text-gray-300 uppercase tracking-wider">DJ Mixes</h4>
              <div class="space-y-2">
                {#each dj.mixes.slice(0, 3) as mix}
                  <div class="bg-gray-800 rounded-md p-2 border border-gray-700/50 flex justify-between items-center">
                    <div class="text-sm text-white truncate">{mix.title}</div>
                    {#if mix.url}
                      <a
                        href={mix.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-green-400 hover:text-green-300 ml-2 flex-shrink-0"
                      >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                      </a>
                    {/if}
                  </div>
                {/each}
                {#if dj.mixes.length > 3}
                  <div class="text-xs text-center text-gray-400">+{dj.mixes.length - 3} weitere Mixes</div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Column 2: Booking Form -->
        <div class="md:col-span-3 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <h3 class="text-sm font-medium text-white mb-4">Booking-Anfrage</h3>
          
          <div class="space-y-4">
            <!-- Club Details -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="clubName" class="block text-xs font-medium text-gray-300 mb-1">Club Name *</label>
                <input
                  type="text"
                  id="clubName"
                  bind:value={clubDetails.name}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label for="clubEmail" class="block text-xs font-medium text-gray-300 mb-1">E-Mail *</label>
                <input
                  type="email"
                  id="clubEmail"
                  bind:value={clubDetails.email}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="startDate" class="block text-xs font-medium text-gray-300 mb-1">Von *</label>
                <input
                  type="date"
                  id="startDate"
                  bind:value={clubDetails.startDate}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label for="endDate" class="block text-xs font-medium text-gray-300 mb-1">Bis *</label>
                <input
                  type="date"
                  id="endDate"
                  bind:value={clubDetails.endDate}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <!-- Additional Club Info -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label for="location" class="block text-xs font-medium text-gray-300 mb-1">Standort</label>
                <input
                  type="text"
                  id="location"
                  bind:value={clubDetails.location}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label for="capacity" class="block text-xs font-medium text-gray-300 mb-1">Kapazität</label>
                <input
                  type="text"
                  id="capacity"
                  bind:value={clubDetails.capacity}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label for="genre" class="block text-xs font-medium text-gray-300 mb-1">Genre</label>
                <input
                  type="text"
                  id="genre"
                  bind:value={clubDetails.genre}
                  class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <!-- Message Preview -->
            <div class="bg-gray-900/70 rounded-md p-2 border border-gray-700 text-xs text-gray-300">
              <div class="font-medium mb-1">Nachricht:</div>
              {getBaseMessage()}
            </div>
            
            <!-- Additional Message -->
            <div>
              <label for="additionalMessage" class="block text-xs font-medium text-gray-300 mb-1">
                Zusätzliche Nachricht
              </label>
              <textarea
                id="additionalMessage"
                bind:value={clubDetails.additionalMessage}
                rows="3"
                class="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Fügen Sie weitere Details hinzu..."
              />
            </div>
            
            <!-- Submit Button -->
            <div class="mt-6">
              {#if requestSuccess}
                <div class="p-2 rounded-md bg-green-900/50 border border-green-800 text-center mb-2">
                  <p class="text-sm text-green-300">Anfrage erfolgreich gesendet!</p>
                </div>
              {:else if requestError}
                <div class="p-2 rounded-md bg-red-900/30 border border-red-800 text-center mb-2">
                  <p class="text-sm text-red-400">{requestError}</p>
                </div>
              {/if}
              
              <button
                type="button"
                class="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-500"
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
                  DJ anfragen
                {/if}
              </button>
              
              {#if !dj.email}
                <p class="text-xs text-red-400 text-center mt-2">Keine E-Mail-Adresse für diesen DJ hinterlegt.</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}