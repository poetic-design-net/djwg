<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/sanity/client';
  import { partnersQuery } from '$lib/sanity/queries/partners';
  import { hasPartnerAccess } from '$lib/utils/badge-utils';
  import PartnerCard from './PartnerCard.svelte';
  import type { Partner } from '$lib/types/partner';
  import type { User } from '$lib/types/profile';
  
  export let user: User;
  
  let partners: Partner[] = [];
  let loading = true;
  
  // Reactive statement to check partner access using user badges
  $: hasAccess = hasPartnerAccess(user.badges || []);
  
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

{#if hasAccess}
  <div class="partner-section">
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
          <PartnerCard {partner} />
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
  </div>
{/if}