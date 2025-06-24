<script lang="ts">
  import type { Partner } from '$lib/types/partner';
  import { urlFor } from '$lib/sanity/image';
  
  export let partner: Partner;

  function handleWebsiteClick() {
    if (partner.website) {
      window.open(partner.website, '_blank', 'noopener,noreferrer');
    }
  }

  function handleEmailClick() {
    if (partner.email) {
      window.location.href = `mailto:${partner.email}`;
    }
  }

  function copyDiscountCode() {
    if (partner.discountCode) {
      navigator.clipboard.writeText(partner.discountCode);
      // TODO: Show toast notification
    }
  }
</script>

<div class="relative rounded-xl p-6 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors duration-200">
  <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
  <div class="relative">
    
    <!-- Partner Logo/Video Section -->
    <div class="flex justify-between items-start gap-4 mb-4">
      <div class="relative">
        {#if partner.logo}
          <div class="max-w-32 max-h-20 flex items-center justify-center bg-white/5 rounded-lg p-2">
            <img 
              src={urlFor(partner.logo).width(200).url()} 
              alt={partner.name} 
              class="max-w-full max-h-16 object-contain" 
            />
          </div>
        {:else}
          <div class="w-20 h-20 rounded-lg bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25A2.25 2.25 0 0 1 0 18.75V9.375A2.25 2.25 0 0 1 2.25 7.125h4.5m7.5 0v4.875c0 1.035-.84 1.875-1.875 1.875h-2.25" />
            </svg>
          </div>
        {/if}
        {#if partner.video}
          <div class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 text-blue-500" title="Video verfügbar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25H12" />
            </svg>
          </div>
        {/if}
      </div>
      
      <!-- Partner Badge Icon -->
      <div class="text-amber-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9 14.25 6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </div>
    </div>

    <!-- Partner Info -->
    <div class="mb-4">
      <h3 class="text-lg font-medium text-white mb-2">{partner.name}</h3>
      {#if partner.description}
        <p class="text-sm text-gray-400 mb-3">{partner.description}</p>
      {/if}
    </div>

    <!-- Discount Section -->
    {#if partner.discountCode}
      <div class="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-3 mb-4 border border-green-800/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-400 font-medium">Gutscheincode</p>
            <code class="text-green-300 font-mono text-lg">{partner.discountCode}</code>
            {#if partner.discountDescription}
              <p class="text-xs text-green-400/80 mt-1">{partner.discountDescription}</p>
            {/if}
          </div>
          <button 
            on:click={copyDiscountCode}
            class="p-2 text-green-400 hover:text-green-300 hover:bg-green-800/20 rounded-md transition-colors"
            title="Code kopieren"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
          </button>
        </div>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="flex gap-2 flex-wrap">
      {#if partner.website}
        <button 
          on:click={handleWebsiteClick}
          class="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-colors text-sm border border-blue-600/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
          Website
        </button>
      {/if}
      
      {#if partner.email}
        <div class="flex flex-col gap-1 ">
          <button
            on:click={handleEmailClick}
            class="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-md hover:bg-purple-600/30 transition-colors text-sm border border-purple-600/30 w-full justify-start"
            title="E-Mail-Programm öffnen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 flex-shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.32 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <span class="truncate text-left">{partner.email}</span>
          </button>
        </div>
      {/if}
    </div>
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