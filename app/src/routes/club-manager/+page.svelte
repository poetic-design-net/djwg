<script lang="ts">
  import DjCalendar from '$lib/components/club-manager/DjCalendar.svelte';
  import PasswordProtection from '$lib/components/club-manager/PasswordProtection.svelte';
  import DjDetailsModal from '$lib/components/club-manager/DjDetailsModal.svelte'; // Importiere das Modal
  import type { PageData } from './$types';
  import type { EnrichedProfile } from '$lib/types/profile';
  import { page } from '$app/stores';

  export let data: PageData;
  
  $: error = $page.form?.error;

  // State für das Modal
  let selectedDj: EnrichedProfile | null = null;
  let showModal = false;

  function openDjDetails(dj: EnrichedProfile) {
    selectedDj = dj;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedDj = null;
  }

  // DJ-Liste Funktionen
  function getStatusBadgeColor(badges: Array<{ badge_id: string }> | undefined): string {
    if (!badges || badges.length === 0) return 'bg-gray-500';
    const urlaubBadge = badges.find(b => b.badge_id === '551d9015-aa13-4117-8776-b59f1aaade9b');
    return urlaubBadge ? 'bg-yellow-500' : 'bg-green-500';
  }
</script>

{#if !data.isAuthenticated}
  <PasswordProtection {error} />
{:else}
  <div class="container mx-auto px-4 py-12 max-w-7xl">
    <div class="max-w-none mb-12">
      <h1 class="text-4xl font-medium text-white mb-4">Club Manager Dashboard</h1>
      <p class="text-lg text-gray-400">
        Willkommen im Club Manager Bereich. Hier kannst du die Verfügbarkeiten aller DJs einsehen und verwalten.
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Hauptbereich: Kalender -->
      <div class="lg:flex-grow">
        <DjCalendar djs={data.djs} />
      </div>

      <!-- Seitenleiste: DJ-Liste -->
      <div class="lg:w-80 flex-shrink-0">
        <div class="sticky top-24 bg-gray-900/50 rounded-xl p-6 border border-gray-800/60 space-y-6">
          <div class="border-b border-gray-800/60 pb-4 mb-6">
            <h2 class="text-xl font-semibold text-white">DJ Übersicht</h2>
            <p class="text-sm text-gray-400 mt-1">Aktuelle Verfügbarkeiten</p>
          </div>
          <div class="space-y-3">
            {#each data.djs as dj}
              <div 
                class="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-colors"
                on:click={() => openDjDetails(dj)}
                on:keydown={(e) => e.key === 'Enter' && openDjDetails(dj)}
                role="button"
                tabindex="0"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="font-medium text-white">{dj.full_name || dj.email || 'Unbekannter DJ'}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="inline-block w-2 h-2 rounded-full {getStatusBadgeColor(dj.badges)}"></span>
                      <span class="text-sm text-gray-400">
                        {dj.badges?.some(b => b.badge_id === '551d9015-aa13-4117-8776-b59f1aaade9b')
                          ? 'Im Urlaub'
                          : 'Verfügbar'}
                      </span>
                    </div>
                  </div>
                  <!-- Kontakt-Button entfernt, da Klick auf Karte das Modal öffnet -->
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- DJ Details Modal -->
  {#if showModal && selectedDj}
    <DjDetailsModal dj={selectedDj} show={showModal} on:close={closeModal} />
  {/if}
{/if}

<style>
  /* Responsive Layout Anpassungen */
  @media (min-width: 1024px) {
    .lg\:w-80 {
      width: 20rem;
    }
  }
</style>