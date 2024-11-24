<script lang="ts">
  import FAQ from '$lib/components/FAQ.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import type { PageData } from './$types';

  export let data: { faqs: Array<{
    _type: 'faq';
    question: string;
    answer: string;
    category: 'workshop' | 'equipment' | 'booking' | 'general';
    order: number;
  }> };

  // Default SEO for FAQ page
  const seo = {
    metaTitle: 'Häufig gestellte Fragen | DJ Workshop Germany',
    metaDescription: 'Finde Antworten auf die wichtigsten Fragen zu unseren DJ Workshops, Equipment, Buchungen und mehr. Alles was du über unsere DJ Kurse wissen musst.',
    ogImage: '/assets/home_hero.jpg'
  };
</script>

<Seo {seo} />

<div class="min-h-screen bg-black">
  <div class="container mx-auto px-4 py-20">
    <div class="text-center mb-16">
      <h1 class="font-heading text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter mb-6">
        Häufig gestellte Fragen
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto">
        Hier findest du Antworten auf die wichtigsten Fragen zu unseren DJ Workshops und Kursen.
      </p>
    </div>
    
    <div class="max-w-4xl mx-auto">
      <FAQ faqs={data.faqs} />
    </div>
  </div>
</div>
