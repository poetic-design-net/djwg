<script lang="ts">
  import DjCalendar from '$lib/components/club-manager/DjCalendar.svelte';
  import PasswordProtection from '$lib/components/club-manager/PasswordProtection.svelte';
  import DjDetailsModal from '$lib/components/club-manager/DjDetailsModal.svelte';
  import DjList from '$lib/components/club-manager/DjList.svelte';
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
        <DjList djs={data.djs} onDjClick={openDjDetails} />
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