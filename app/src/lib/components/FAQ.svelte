<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { FAQ } from '$lib/sanity/queries';

  interface FAQSection {
    title?: string;
    description?: string;
    faqs: FAQ[];
    showCategories?: boolean;
  }

  export let title: string = 'Häufig gestellte Fragen';
  export let description: string | undefined = undefined;
  export let faqs: FAQ[] = [];
  export let showCategories: boolean = true;

  let activeIndex: number | null = null;
  let selectedCategory: string = 'all';

  const categories = [
    { value: 'all', label: 'Alle' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'booking', label: 'Booking' },
    { value: 'general', label: 'Allgemein' }
  ];

  // Filter out categories that don't have any FAQs
  $: availableCategories = categories.filter(category => 
    category.value === 'all' || faqs.some(faq => faq.category === category.value)
  );

  $: filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  function toggleQuestion(index: number) {
    activeIndex = activeIndex === index ? null : index;
  }
</script>

<section class="relative py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="mb-20 text-center">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">FAQ</span>
      <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">
        {title}
      </h2>
      {#if description}
        <p class="mt-4 text-xl text-gray-300">{description}</p>
      {/if}
    </div>

    <!-- Category Filter -->
    {#if showCategories && availableCategories.length > 1}
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        {#each availableCategories as category}
          <button
            class="px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 {selectedCategory === category.value ? 'bg-green-400 text-black' : 'bg-black/40 text-white border border-gray-800 hover:border-green-500'}"
            on:click={() => {
              selectedCategory = category.value;
              activeIndex = null;
            }}
          >
            {category.label}
          </button>
        {/each}
      </div>
    {/if}

    <div class="max-w-3xl mx-auto">
      {#each filteredFaqs as faq, index}
        <div class="mb-4">
          <button
            class="w-full p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-colors duration-300 {activeIndex === index ? 'rounded-b-none' : ''}"
            on:click={() => toggleQuestion(index)}
          >
            <div class="flex items-center justify-between">
              <h3 class="text-xl text-white">{faq.question}</h3>
              <svg
                class="w-6 h-6 text-green-400 transform transition-transform duration-300 {activeIndex === index ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {#if activeIndex === index}
            <div
              class="p-6 bg-black/20 border-x border-b border-gray-800 rounded-b-3xl"
              transition:slide={{ duration: 300, easing: quintOut }}
            >
              <div class="text-gray-300 whitespace-pre-wrap">{faq.answer}</div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  button {
    text-align: left;
  }
</style>
