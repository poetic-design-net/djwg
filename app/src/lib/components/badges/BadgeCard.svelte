<script lang="ts">
  import type { Badge } from '$lib/types/badge';
  import { createEventDispatcher } from 'svelte';
  import { urlFor } from '$lib/sanity/image';

  export let badge: Badge;
  export let locked = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('openVideos');
  }
</script>

<div 
  class="relative rounded-xl p-6 border {locked ? 'border-gray-800/50' : 'border-gray-800'} overflow-hidden cursor-pointer hover:border-gray-700 transition-colors duration-200"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
  <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
  <div class="relative">
    <div class="flex justify-between items-start gap-4 text-green-400">

      {#if badge.icon}
      <div class="relative">
        <!-- Main image -->
        <img src={urlFor(badge.icon).width(128).height(128).url()} alt="" class="w-20 h-20 object-contain rounded-lg" />
        
        <!-- Green indicator showing videos are available -->
        <div
          class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 text-green-500"
          title="Videos verfügbar">

        </div>
        
        
      </div>
      {:else}
        <div class="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
          </svg>
          
        </div>

      {/if}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25H12" />
      </svg>
    </div>

    <div class="mt-4">
      <h3 class="text-lg font-medium text-white mb-2">{badge.name}</h3>
      {#if badge.description}
        <p class="text-sm text-gray-400">{badge.description}</p>
      {/if}
    </div>

    {#if locked}
      <div class="mt-4 flex items-center space-x-1 text-yellow-500 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Noch nicht freigeschaltet</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .noise-filter {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
  }
</style>
