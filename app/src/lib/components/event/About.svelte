<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import PortableTextContent from '$lib/components/PortableTextContent.svelte';
  import type { PortableTextBlock } from '@portabletext/types';

  export let description: PortableTextBlock[] | string = [];
  export let features: string[] = [];
  export let highlights: {
    title: string;
    description: string;
    icon: string;
  }[] = [];

  let expandedHighlights: Record<number, boolean> = {};
  let contentRefs: HTMLElement[] = [];

  function hasOverflow(element: HTMLElement | null): boolean {
    if (!element) return false;
    return element.scrollHeight > 100; // 100px ist die max-height
  }

  function handleExpandClick(index: number) {
    expandedHighlights = {
      ...expandedHighlights,
      [index]: !expandedHighlights[index],
    };
  }

</script>

<div class="container mx-auto px-4 py-20">
  <div class="grid grid-cols-1 md:grid-cols-12 gap-16">
    <!-- Left Column -->
    <div class="md:col-span-8 md:sticky md:top-24 md:self-start">
      <h2 class="text-4xl text-white mb-6">Über das Event</h2>
      {#if typeof description === 'string'}
        <div class="text-gray-300">
          {description}
        </div>
      {:else}
        <PortableTextContent value={description} className="text-gray-300" />
      {/if}

      {#if features.length > 0}
        <h3 class="text-2xl text-white mt-8 mb-4">Was dich erwartet</h3>
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
    <div class="md:col-span-4 grid grid-cols-1 gap-4 auto-rows-fr">
      {#each highlights as highlight, i}
        <div
          class="p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300"
          in:fade
        >
          {#if highlight.icon}
            <svg class="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d={highlight.icon}/>
            </svg>
          {/if}
          <h4 class="text-xl text-white mb-2">{highlight.title}</h4>
          
          <div class="relative text-gray-300">
            <div
              class="overflow-hidden"
              class:max-h-[100px]={!expandedHighlights[i]}
              class:max-h-none={expandedHighlights[i]}
              class:transition-all={true}
              class:duration-300={true}
              bind:this={contentRefs[i]}
            >
              <p>{highlight.description}</p>
            </div>
            
            {#if hasOverflow(contentRefs[i])}
              <div
                class="flex items-center gap-1 mt-2 text-green-500 hover:text-green-400 text-sm transition-colors duration-200 cursor-pointer"
                on:click={() => handleExpandClick(i)}
                on:keydown={(e) => e.key === 'Enter' && handleExpandClick(i)}
                role="button"
                tabindex="0"
              >
                <span>{expandedHighlights[i] ? 'Weniger anzeigen' : 'Mehr anzeigen'}</span>
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  class:rotate-180={expandedHighlights[i]}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
