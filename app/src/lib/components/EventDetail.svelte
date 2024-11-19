<script lang="ts">
  import Pricing from './Pricing.svelte';
  import ArtistsSlider from './ArtistsSlider.svelte';
  import { fade } from 'svelte/transition';
  import type { Artist } from '$lib/sanity/queries';

  export let event: {
    title: string;
    subtitle: string;
    description: string;
    date: string;
    location: string;
    features: string[];
    image: string;
    highlights: {
      title: string;
      description: string;
      icon: string;
    }[];
    gallery?: string[];
    locationDetails?: {
      name: string;
      description: string;
      image: string;
    };
    isLocationSecret?: boolean;
    isArtistsSecret?: boolean;
  };

  export let artists: Artist[] = [];
</script>

<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative h-[80vh] overflow-hidden">
    <div class="absolute inset-0">
      <img src={event.image} alt={event.title} class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>
    
    <div class="relative container mx-auto px-4 h-full flex items-center">
      <div class="max-w-3xl">
        <span class="inline-block mb-4 text-sm text-green-500 font-medium tracking-tighter">{event.date}</span>
        <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">{event.title}</h1>
        <p class="text-2xl text-white/80 mb-8">{event.subtitle}</p>
        <div class="flex items-center space-x-4">
          <div class="flex items-center text-white/80">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {event.location}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Content Section -->
  <div class="container mx-auto px-4 py-20">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
      <!-- Left Column -->
      <div>
        <h2 class="text-4xl text-white mb-6">Über das Event</h2>
        <p class="text-gray-300 mb-8">{event.description}</p>
        
        <h3 class="text-2xl text-white mb-4">Was dich erwartet</h3>
        <ul class="space-y-4">
          {#each event.features as feature}
            <li class="flex items-start">
              <svg class="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="text-gray-300">{feature}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Right Column -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each event.highlights as highlight}
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

  <!-- Artists Section -->
  <div class="py-20 bg-black/40">
    <ArtistsSlider {artists} isLineupRevealed={!event.isArtistsSecret} />
  </div>

  <!-- Location Section -->
  {#if event.locationDetails}
    <div class="py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl text-white mb-12 text-center">Location</h2>
        <div class="relative">
          {#if event.isLocationSecret}
            <div class="absolute inset-0 backdrop-blur-xl bg-black/40 z-10 flex items-center justify-center">
              <div class="text-center">
                <span class="text-2xl text-white font-medium">Location wird bald bekannt gegeben</span>
                <p class="text-gray-400 mt-2">Bleib gespannt!</p>
              </div>
            </div>
          {/if}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <img 
                src={event.locationDetails.image} 
                alt={event.locationDetails.name}
                class="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div class="flex flex-col justify-center">
              <h3 class="text-3xl text-white mb-4">{event.locationDetails.name}</h3>
              <p class="text-gray-300">{event.locationDetails.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Pricing Section -->
  <div class="py-20 bg-black/40">
    <Pricing />
  </div>

  <!-- Gallery Section -->
  {#if event.gallery}
    <div class="py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl text-white mb-12 text-center">Impressionen</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#each event.gallery as image, i}
            <div 
              class="relative aspect-square rounded-3xl overflow-hidden group"
              in:fade={{delay: i * 100}}
            >
              <img 
                src={image} 
                alt="Event impression" 
                class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
