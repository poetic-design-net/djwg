<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/sanity/client';
  import { partnersQuery } from '$lib/sanity/queries/partners';
  import PartnerCard from './PartnerCard.svelte';
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  import type { Partner } from '$lib/types/partner';
  import type { User } from '$lib/types/profile';
  
  export let user: User;
  
  let partners: Partner[] = [];
  let loading = true;
  
  // Partner Badge ID
  const PARTNER_BADGE_ID = 'b83547a4-fdbf-4ff8-8bec-0ea5666a0ac5';
  
  // Check if user has partner badge
  $: hasPartnerBadge = user.badges?.some(badge => badge.badge_id === PARTNER_BADGE_ID) || false;
  
  onMount(async () => {
    try {
      partners = await client.fetch(partnersQuery);
    } catch (error) {
      console.error('Fehler beim Laden der Partner:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="partner-section">
  {#if hasPartnerBadge}
    <!-- Vollzugriff für Nutzer mit Partner Badge -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <div class="bg-gray-950 rounded-full p-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-green-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.60a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        </div>
        <h2 class="text-2xl font-medium text-white">Gute Deals!</h2>
        <div class="px-2 py-1 bg-amber-600/20 text-amber-400 rounded-full text-xs font-medium border border-amber-600/30">
          Profi Lvl 5
        </div>
      </div>
      <p class="text-gray-200 text-base">
        Exklusive Angebote und Vergünstigungen unserer Partner - nur für dich!
      </p>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    {:else if partners.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each partners as partner (partner._id)}
          <PartnerCard {partner} hasAccess={true} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25A2.25 2.25 0 0 1 0 18.75V9.375A2.25 2.25 0 0 1 2.25 7.125h4.5m7.5 0v4.875c0 1.035-.84 1.875-1.875 1.875h-2.25" />
          </svg>
        </div>
        <p class="text-gray-400">Derzeit sind keine Partner verfügbar.</p>
      </div>
    {/if}
  {:else}
    <!-- Teaser für Nutzer ohne Partner Badge -->
    <div class="space-y-6">
      <div class="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 text-center">
        <div class="mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-amber-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h3 class="text-2xl font-medium text-white mb-2">Partner Badge erforderlich</h3>
          <p class="text-gray-300 text-lg mb-4">
            Schalte exklusive Partner-Angebote und Vergünstigungen frei!
          </p>
        </div>

        {#if loading}
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div class="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        {:else if partners.length > 0}
          <!-- Partner-Ansicht ohne Badge -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each partners as partner (partner._id)}
                <PartnerCard {partner} hasAccess={false} />
              {/each}
            </div>
          </div>
        {/if}

        <!-- <div class="mt-6 flex justify-center">
          <InfoIcon
            variant="light"
            text="Das Partner Badge erhältst du ab Level 5. Erreiche dieses Level, um Zugang zu exklusiven Angeboten zu erhalten!"
            position="top"
          />
        </div> -->
      </div>
    </div>
  {/if}
</div>