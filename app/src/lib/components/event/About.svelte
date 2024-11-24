<script lang="ts">
  import { fade } from 'svelte/transition';

  export let description: string;
  export let features: string[] = [];
  export let highlights: {
    title: string;
    description: string;
    icon: string;
  }[] = [];
</script>

<div class="container mx-auto px-4 py-20">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
    <!-- Left Column -->
    <div>
      <h2 class="text-4xl text-white mb-6">Über das Event</h2>
      <p class="text-gray-300 mb-8">{description}</p>

      {#if features.length > 0}
        <h3 class="text-2xl text-white mb-4">Was dich erwartet</h3>
        <ul class="space-y-4">
          {#each features as feature}
            <li class="flex items-start">
              <svg class="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="text-gray-300">{feature}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Right Column -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {#each highlights as highlight}
        <div
          class="p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300"
          in:fade
        >
          <svg class="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={highlight.icon}/>
          </svg>
          <h4 class="text-xl text-white mb-2">{highlight.title}</h4>
          <p class="text-gray-300">{highlight.description}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
