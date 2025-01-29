<script lang="ts">
  import { fade, slide } from 'svelte/transition';

  export let description: string;
  export let features: string[] = [];
  export let highlights: {
    title: string;
    description: string;
    icon: string;
  }[] = [];

  const maxWords = 15; // Kürzere Wortanzahl für Highlights
  let expandedHighlights: Record<number, boolean> = {};

  function getDisplayText(text: string, index: number): string {
    const words = text.split(/\s+/);
    const hasMore = words.length > maxWords;
    return hasMore && !expandedHighlights[index]
      ? words.slice(0, maxWords).join(' ') + '...'
      : text;
  }

  function hasMore(text: string): boolean {
    return text.split(/\s+/).length > maxWords;
  }

  function handleExpandClick(index: number) {
    expandedHighlights = {
      ...expandedHighlights,
      [index]: !expandedHighlights[index]
    };
  }
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
      {#each highlights as highlight, i}
        <div
          class="p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300"
          in:fade
        >
          {#if highlight.icon}
            <svg class="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={highlight.icon}/>
            </svg>
          {/if}
          <h4 class="text-xl text-white mb-2">{highlight.title}</h4>
          
          <div class="relative text-gray-300">
           {#if hasMore(highlight.description)}
             <div
               class="cursor-pointer hover:text-gray-200 transition-colors duration-200"
               on:click={() => handleExpandClick(i)}
               role="button"
               tabindex="0"
             >
               <div class="overflow-hidden">
                 {#key expandedHighlights[i]}
                   <p transition:slide|local={{duration: 0, axis: 'y', easing: t => t}}>
                     {expandedHighlights[i] ? highlight.description : getDisplayText(highlight.description, i)}
                   </p>
                 {/key}
               </div>
               <div class="flex items-center gap-1 mt-2 text-green-500 hover:text-green-400 text-sm transition-colors duration-200">
                 <span>{expandedHighlights[i] ? 'Weniger anzeigen' : 'Mehr anzeigen'}</span>
                 <svg
                   class="w-4 h-4 transition-transform duration-200"
                   class:rotate-180={expandedHighlights[i]}
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                 >
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
           {:else}
             <p>{highlight.description}</p>
           {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
