<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { TransformedEvent } from '$lib/sanity/queries/events';
  import OptimizedImage from './OptimizedImage.svelte';

  export let events: TransformedEvent[] = [];
  export let title: string = "DJ Workshop Germany";
  export let description: string = "Sei dabei bei unseren exklusiven DJ Events in 2025";

  let currentIndex = 0;
  let sliderContainer: HTMLDivElement;
  let cardsPerView = 2;
  let touchStartX = 0;
  let touchEndX = 0;
  let isMobile = false;
  let showSlider = false;
  let mounted = false;

  const updateCardsPerView = () => {
    if (!browser) return;
    
    isMobile = window.innerWidth < 640;
    cardsPerView = isMobile ? 1 : 2;
    showSlider = isMobile ? events.length > 1 : events.length > 2;
  };

  onMount(() => {
    mounted = true;
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  });
  
  const nextSlide = () => {
    if (!mounted) return;
    currentIndex = (currentIndex + 1) % (events.length - cardsPerView + 1);
  };

  const prevSlide = () => {
    if (!mounted) return;
    currentIndex = (currentIndex - 1 + events.length) % (events.length - cardsPerView + 1);
  };

  let touchStartTime = 0;
  let touchStartY = 0;
  let isSwiping = false;
  
  let initialTouchDistance = 0;
  
  const handleTouchStart = (e: TouchEvent) => {
    if (!mounted) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].pageY;
    touchStartTime = Date.now();
    initialTouchDistance = 0;
    isSwiping = false;
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!mounted) return;
    const touchMoveX = e.touches[0].clientX;
    const touchMoveY = e.touches[0].pageY;
    const deltaX = touchMoveX - touchStartX;
    const deltaY = touchMoveY - touchStartY;
    
    // Aktualisiere die zurückgelegte Distanz
    initialTouchDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
    // Setze isSwiping nur, wenn die horizontale Bewegung signifikant größer ist
    if (Math.abs(deltaX) > Math.abs(deltaY) && initialTouchDistance > 15) {
      isSwiping = true;
    }
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!mounted) return;
    
    // Wenn keine signifikante Bewegung stattgefunden hat oder es kein Swipe war,
    // erlaube das normale Link-Verhalten
    if (initialTouchDistance < 15 || !isSwiping) {
      return;
    }
    
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    const swipeThreshold = 100;
    const swipeDistance = e.changedTouches[0].clientX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold && touchDuration < 300) {
      if (swipeDistance > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

  $: if (mounted && events.length) {
    updateCardsPerView();
  }
</script>

<div class="container px-4 mx-auto">
  <div class="text-center">
    <span class="inline-block mb-4 text-sm text-purple-400 font-medium tracking-tighter">Kommende Events</span>
    <h2 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-8xl md:max-w-md mx-auto">{title}</h2>
    <p class="mb-20 text-gray-300 md:max-w-md mx-auto">{description}</p>
  </div>

  <div class="relative">
    <!-- Navigation Buttons -->
    {#if mounted && showSlider}
      <div class="absolute -top-16 right-0 flex space-x-2 z-10">
        <button on:click={prevSlide}>
          <div class="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200">
            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7041 7.12817L4.15635 13.6759L10.7041 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M22.4941 13.6759H4.33949" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </button>
      
        <button on:click={nextSlide}>
          <div class="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200">
            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.2959 7.12817L22.8437 13.6759L16.2959 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M4.50586 13.6759H22.6605" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </button>
      </div>
    {/if}

    <div 
      class="relative overflow-hidden"
      bind:this={sliderContainer}
      role="region"
      aria-label="Event slider"
      on:touchstart={handleTouchStart}
      on:touchmove={(e) => {
        if (isSwiping) e.preventDefault();
        handleTouchMove(e);
      }}
      on:touchend={handleTouchEnd}
    >
      <!-- Cards Container -->
      <div 
        class="flex transition-transform duration-500 ease-in-out mt-4"
        style="transform: translateX(-{currentIndex * (100 / cardsPerView)}%)"
      >
        {#each events as event, index}
          <div 
            class="w-full sm:w-1/2 flex-shrink-0 p-4 transition-opacity duration-500"
            class:opacity-100={!showSlider || (index >= currentIndex && index < currentIndex + cardsPerView)}
            class:opacity-0={showSlider && (index < currentIndex || index >= currentIndex + cardsPerView)}
          >
            <a 
              href="/events/{event.slug.current}" 
              class="block relative overflow-hidden rounded-5xl group"
              in:fade={{duration: 300, easing: cubicInOut}}
            >
              <div class="w-full h-[300px] md:h-[400px] overflow-hidden">
                <OptimizedImage 
                  image={event.image}
                  alt={event.title}
                  maxWidth={1200}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                />
              </div>
              <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/90 to-transparent p-4 md:p-8" style="--tw-gradient-stops: var(--tw-gradient-from) 0%, var(--tw-gradient-from) 33%, var(--tw-gradient-to) 100%;">
                <span class="inline-block rounded-full bg-green-500 p-2 mb-2 text-xs text-black font-medium tracking-tighter">{event.tag}</span>
                <h3 class="mb-2 text-lg md:text-xl text-white tracking-3xl group-hover:text-green-400 transition duration-300">{event.title}</h3>
                <div class="mb-4">
                  <p class="text-sm text-green-500 font-medium">{event.date}</p>
                </div>
                <p class="mb-4 text-xs md:text-sm text-white/80">{event.subtitle}</p>
                <div class="inline-flex items-center">
                  <span class="mr-3.5 text-sm text-white font-medium group-hover:text-green-400 transition duration-300">Tickets & Info</span>
                  <svg class="transform group-hover:rotate-90 transition duration-300" width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 0.75L1 11.25" stroke="white" stroke-width="1.43182" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M11.5 10.3781V0.75H1.87187" stroke="white" stroke-width="1.43182" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>

      <!-- Slide Indicators -->
      {#if mounted && showSlider}
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {#each Array(events.length - cardsPerView + 1) as _, index}
            <button 
              class="w-3 h-3 rounded-full transition-all duration-300 {index === currentIndex ? 'bg-purple-400 w-6' : 'bg-white/50 hover:bg-white/80'}"
              on:click={() => currentIndex = index}
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .rounded-5xl {
    border-radius: 2rem;
  }
</style>
