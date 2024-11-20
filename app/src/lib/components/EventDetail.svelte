<script lang="ts">
  import Pricing from './Pricing.svelte';
  import ArtistsSlider from './ArtistsSlider.svelte';
  import TimeTable from './TimeTable.svelte';
  import OpenStage from './OpenStage.svelte';
  import { fade, slide } from 'svelte/transition';
  import type { Artist, TimeSlot } from '$lib/sanity/queries';

  export let event: {
    _id: string;
    title: string;
    tag: string;
    subtitle: string;
    description: string;
    date: string;
    location: string;
    features?: string[];
    image: string;
    highlights: {
      title: string;
      description: string;
      icon: string;
    }[];
    schedule?: {
      time: string;
      title: string;
      description?: string;
      instructor?: string;
      icon?: string;
    }[];
    gallery?: string[];
    locationDetails?: {
      name: string;
      description: string;
      image: string;
    };
    isLocationSecret?: boolean;
    isArtistsSecret?: boolean;
    hasOpenStage?: boolean;
    isOpenStageSecret?: boolean;
  };

  export let artists: Artist[] = [];
  export let timeSlots: TimeSlot[] = [];

  // Ensure features is always an array
  $: features = event.features || [];

  let showShareMenu = false;

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }

  type SharePlatform = 'facebook' | 'x' | 'whatsapp' | 'telegram';

  function share(platform: SharePlatform) {
    const url = window.location.href;
    const text = `Check out ${event.title} - ${event.subtitle}`;
    
    const shareUrls: Record<SharePlatform, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.share-menu')) {
      showShareMenu = false;
    }
  }
</script>

<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative h-[80dvh]">
    <div class="absolute inset-0">
      <img src={event.image} alt={event.title} class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>
    
    <div class="relative container mx-auto px-4 h-full flex items-center">
      <div class="max-w-3xl">
        <span class="inline-block px-3 py-1 mb-4 text-sm text-black font-medium tracking-tighter bg-green-400 rounded-full">
          {event.tag}
        </span>
        <span class="block mb-4 text-sm text-green-500 font-medium tracking-tighter">{event.date}</span>
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

          <!-- Share Button -->
          <div class="relative share-menu">
            <button 
              class="flex items-center justify-center w-10 h-10 rounded-full bg-green-400 hover:bg-green-500 transition-all duration-300 transform hover:scale-110"
              on:click|stopPropagation={toggleShareMenu}
              aria-label="Share event"
            >
              <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
            </button>

            {#if showShareMenu}
              <div 
                class="absolute right-0 mt-2 w-48 rounded-xl bg-black border border-gray-800 shadow-xl z-50"
                transition:slide={{ duration: 200 }}
              >
                <div class="py-2">
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('facebook')}
                  >
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('x')}
                  >
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X</span>
                  </button>
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('whatsapp')}
                  >
                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('telegram')}
                  >
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                    </svg>
                    <span>Telegram</span>
                  </button>
                </div>
              </div>
            {/if}
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

  <!-- Schedule Section -->
  {#if event.schedule}
    <TimeTable schedule={event.schedule} />
  {/if}

  <!-- Open Stage Section -->
  {#if event.hasOpenStage}
    <OpenStage 
      eventId={event._id} 
      {timeSlots}
      isAdmin={false}
      isSecret={event.isOpenStageSecret}
    />
  {/if}

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

<svelte:window on:click={handleClickOutside} />
