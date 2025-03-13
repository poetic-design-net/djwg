<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import type { Testimonial } from '$lib/sanity/queries';
  import { enhancedUrlFor } from '$lib/sanity/image';

  export let testimonials: { data: Testimonial[] };

  let visibleCount = 6; // Initial number of visible testimonials
  let isLoading = false;
  let expandedQuotes = new Set<string>();

  $: visibleTestimonials = testimonials.data.slice(0, visibleCount);
  $: hasMore = visibleCount < testimonials.data.length;

  function truncateQuote(quote: string, maxLength: number = 200): string {
    if (!quote) return '';
    if (quote.length <= maxLength) return quote;
    return quote.substring(0, maxLength) + '...';
  }

  function toggleQuote(id: string) {
    if (expandedQuotes.has(id)) {
      expandedQuotes.delete(id);
    } else {
      expandedQuotes.add(id);
    }
    expandedQuotes = expandedQuotes; // Trigger reactivity
  }

  async function loadMore() {
    isLoading = true;
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    visibleCount += 6;
    isLoading = false;
  }

  function isInLastThree(index: number): boolean {
    return index >= visibleCount - 3 && index < visibleCount && hasMore;
  }

  function getImageUrls(testimonial: Testimonial) {
    if (testimonial.image) {
      return enhancedUrlFor(testimonial.image);
    }
    return null;
  }
</script>

<div class="container px-4 mx-auto">
  <div class="mb-20 md:max-w-3xl text-center mx-auto">
    <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Feedback</span>
    <h2 class="font-heading text-7xl lg:text-8xl text-white tracking-tighter-xl">Was unsere Teilnehmer sagen</h2>
  </div>
  
  <div class="relative">
    <div class="flex flex-wrap -m-5">
      {#each visibleTestimonials as testimonial, index (testimonial._id)}
        <div 
          class="w-full md:w-1/2 lg:w-1/3 p-5"
          in:fade={{duration: 300, delay: index % 3 * 100}}
        >
          <div class="relative px-9 py-10 h-full bg-gradient-radial-dark border border-green-400 border-opacity-50 rounded-3xl">
            {#if isInLastThree(index)}
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black rounded-3xl pointer-events-none"></div>
            {/if}
            
            <div class="mb-6">
              {#if expandedQuotes.has(testimonial._id)}
                <div transition:slide>
                  <h3 class="text-xl text-white tracking-tighter leading-tight">{testimonial.quote}</h3>
                  <button 
                    class="mt-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                    on:click={() => toggleQuote(testimonial._id)}
                  >
                    Weniger anzeigen
                  </button>
                </div>
              {:else}
                <div>
                  <h3 class="text-xl text-white tracking-tighter leading-tight">
                    {truncateQuote(testimonial.quote)}
                  </h3>
                  {#if testimonial.quote.length > 50}
                    <button 
                      class="mt-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                      on:click={() => toggleQuote(testimonial._id)}
                    >
                      Mehr anzeigen
                    </button>
                  {/if}
                </div>
              {/if}
            </div>

            <div class="flex flex-wrap items-center -m-3">
              {#if testimonial.image}
                <div class="w-auto p-3">
                  <picture>
                    <source 
                      srcset={getImageUrls(testimonial)?.webp} 
                      type="image/webp"
                    >
                    <img
                      src={getImageUrls(testimonial)?.fallback}
                      alt={testimonial.name}
                      class="w-12 h-12 object-cover rounded-full"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
              {/if}
              <div class="flex-1 p-3">
                <h4 class="text-white font-medium tracking-tighter">{testimonial.name}</h4>
                <span class="inline-block text-sm text-white">{testimonial.role}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    {#if hasMore}
      <div class="text-center mt-12">
        <button
          on:click={loadMore}
          class="inline-flex items-center px-8 py-4 text-sm text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Wird geladen...
          {:else}
            Mehr anzeigen
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .bg-gradient-radial-dark {
    background: radial-gradient(circle at center, rgba(31, 31, 31, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
  }
</style>
