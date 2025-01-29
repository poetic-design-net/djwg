<script lang="ts">
  import { onMount } from 'svelte';
  import type { TransformedArtist } from '$lib/sanity/queries/artists';
  import OptimizedImage from './OptimizedImage.svelte';
  import Soundcloud from './icons/Soundcloud.svelte';
  
  export let artists: TransformedArtist[] = [];
  export let isLineupRevealed = false;
  
  console.log('Artists data:', artists);
  
  let currentHighlight = 0;
  let sliderContainer: HTMLDivElement;

  onMount(() => {
    if (artists.length > 0) {
      const interval = setInterval(() => {
        currentHighlight = (currentHighlight + 1) % artists.length;
      }, 2000);

      return () => clearInterval(interval);
    }
  });
</script>

<!-- Header with container alignment -->
<div class="container px-4 mx-auto">
  <div class="mb-20 text-center">
    <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Unsere Artists</span>
    <h2 class="font-heading text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">DJ Line-Up</h2>
  </div>
</div>

<div class="relative">
  {#if !isLineupRevealed}
    <div class="absolute inset-0 px-4 sm:px-0 backdrop-blur-xl bg-black/40 z-10 flex items-center justify-center">
      <div class="text-center">
        <span class="text-2xl text-white font-medium">Line-Up wird bald bekannt gegeben</span>
        <p class="text-gray-400 mt-2">Bleib gespannt!</p>
      </div>
    </div>
  {/if}

  <!-- Full width slider with left padding matching container -->
  <div class="w-full pl-[max(1rem,calc((100vw-1280px)/2+1rem))]">
    <div 
      bind:this={sliderContainer}
      class="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory"
    >
      {#each artists as artist, i}
        <div 
          class="flex-none w-[85vw] md:w-[45vw] lg:w-[35vw] pr-8 snap-start"
        >
          <div 
            class="relative group rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl aspect-[3/4]"
          >
            {#if artist.image}
              <OptimizedImage
                image={artist.image}
                alt={artist.name}
                maxWidth={800}
                sizes="(max-width: 768px) 85vw, 35vw"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            {:else}
              <img 
                src="/assets/home_hero_2.jpg" 
                alt={artist.name}
                class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            {/if}
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <span class="inline-block mb-1.5 text-gray-300">{artist.role}</span>
              <h3 class="mb-4 text-3xl text-white tracking-3xl">{artist.name}</h3>
              <div class="flex flex-wrap -m-2">
                {#if artist.socials?.instagram}
                  <div class="w-auto p-2">
                    <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer" class="text-white hover:text-green-500 transition-colors">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                {/if}
                {#if artist.socials?.soundcloud}
                  <div class="w-auto p-2">
                    <a href={artist.socials.soundcloud} target="_blank" rel="noopener noreferrer" class="text-white hover:text-green-500 transition-colors">
                      <Soundcloud size={24} class_name="w-6 h-6" />
                    </a>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
