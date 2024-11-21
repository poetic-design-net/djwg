<script lang="ts">
  import { fade } from 'svelte/transition';
  import Team from '$lib/components/Team.svelte';
  import FounderSection from '$lib/components/Founder.svelte';
  import PortableTextContent from '$lib/components/PortableTextContent.svelte';
  import type { TeamMember, AboutUs, Founder } from '$lib/sanity/queries';

  export let data: {
    teamMembers: TeamMember[];
    aboutUs: AboutUs | null;
    founder: Founder | null;
  };

  const defaultContent = {
    history: {
      title: 'Unsere Geschichte',
      content: [{
        _type: 'block',
        children: [{
          _type: 'span',
          text: 'DJ Workshop Germany wurde von einer Gruppe leidenschaftlicher DJs und Musikproduzenten gegründet, die ihre jahrelange Erfahrung in der elektronischen Musikszene weitergeben möchten. Was als kleine Workshop-Reihe begann, hat sich zu einer der führenden DJ-Schulen Deutschlands entwickelt.'
        }]
      }]
    },
    philosophy: {
      title: 'Unsere Philosophie',
      items: [
        {
          title: 'Praxisorientiert',
          description: 'Wir glauben an Learning by Doing. In unseren Workshops arbeitest du von Anfang an mit professionellem Club-Equipment und erhältst direktes Feedback von erfahrenen DJs.'
        },
        {
          title: 'Individuell',
          description: 'Jeder DJ entwickelt seinen eigenen Stil. Wir unterstützen dich dabei, deinen persönlichen Sound zu finden und deine künstlerische Vision umzusetzen.'
        },
        {
          title: 'Vernetzt',
          description: 'Als Teil unserer Community profitierst du von einem starken Netzwerk in der Club- und Festival-Szene. Wir öffnen dir Türen und schaffen Möglichkeiten.'
        },
        {
          title: 'Professionell',
          description: 'Unsere Trainer sind aktive DJs mit jahrelanger Erfahrung. Sie teilen nicht nur ihr Wissen, sondern auch wertvolle Einblicke in die Industrie.'
        }
      ]
    }
  };

  $: content = data?.aboutUs ?? defaultContent;
</script>

<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative py-20 overflow-hidden">
    <div class="container px-4 mx-auto">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Über uns</span>
        <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">DJ Workshop Germany</h1>
        <p class="text-2xl text-white/80 mb-8">Deine professionelle DJ-Ausbildung in Deutschland</p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container px-4 mx-auto py-20">
    <div class="max-w-4xl mx-auto">
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">{content.history.title}</h2>
        <div class="text-xl text-gray-300">
          <PortableTextContent value={content.history.content} />
        </div>
      </div>

      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">{content.philosophy.title}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each content.philosophy.items as item}
            <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
              <h3 class="text-2xl text-white mb-4">{item.title}</h3>
              <p class="text-gray-300">{item.description}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Founder Section -->
  <div class="bg-black/40">
    <FounderSection data={data.founder} />
  </div>

  <!-- Team Section -->
  <div class="py-20 bg-black/40">
    <Team teamMembers={data.teamMembers ?? []} />
  </div>

  <!-- Call to Action -->
  <div class="container px-4 mx-auto py-20">
    <div class="max-w-4xl mx-auto">
      <div class="text-center">
        <h2 class="text-4xl text-white mb-8">Bereit für den nächsten Schritt?</h2>
        <a 
          href="/events" 
          class="inline-block px-8 py-4 text-lg text-black font-medium tracking-tighter bg-green-400 hover:bg-green-500 rounded-full transition duration-200"
        >
          Workshops entdecken
        </a>
      </div>
    </div>
  </div>
</div>
