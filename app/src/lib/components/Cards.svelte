<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  interface Card {
    image: string;
    tag: string;
    title: string;
    description: string;
  }

  const cards: Card[] = [
    {
      image: "assets/home_hero_2.jpg",
      tag: "DJ Workshop",
      title: "Mixing Masterclass",
      description: "Learn advanced mixing techniques from professional DJs"
    },
    {
      image: "nightsable-assets/images/cards/bg-image2.png",
      tag: "DJ Workshop",
      title: "Music Production",
      description: "Create your own tracks and remixes"
    },
    {
      image: "nightsable-assets/images/cards/bg-image3.png",
      tag: "DJ Workshop",
      title: "Live Performance",
      description: "Master the art of live DJ performance"
    },
    {
      image: "assets/home_hero_2.jpg",
      tag: "DJ Workshop",
      title: "Mixing Masterclass",
      description: "Learn advanced mixing techniques from professional DJs"
    }
  ];

  let currentIndex = 0;
  let sliderContainer: HTMLDivElement;
  let cardsPerView = 3;

  const updateCardsPerView = () => {
    if (window.innerWidth < 640) {
      cardsPerView = 1;
    } else if (window.innerWidth < 1024) {
      cardsPerView = 2;
    } else {
      cardsPerView = 3;
    }
  };

  onMount(() => {
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  });
  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % (cards.length - cardsPerView + 1);
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + cards.length) % (cards.length - cardsPerView + 1);
  };
</script>

<div class="container px-4 mx-auto">
  <div class="text-center">
    <span class="inline-block mb-4 text-sm text-purple-400 font-medium tracking-tighter">Featured Workshops</span>
    <h2 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-8xl md:max-w-md mx-auto">Master the Art of DJing</h2>
    <p class="mb-20 text-gray-300 md:max-w-md mx-auto">Join our professional workshops and take your DJ skills to the next level</p>
  </div>

  <div class="relative">
    <!-- Navigation Buttons -->
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
    <div 
      class="relative overflow-hidden"
      bind:this={sliderContainer}
      role="region"
      aria-label="Workshop slider"
    >
      <!-- Cards Container -->
      <div 
        class="flex transition-transform duration-500 ease-in-out mt-4"
        style="transform: translateX(-{currentIndex * (100 / cardsPerView)}%)"
            >
        {#each cards as card, index}
          <div 
            class="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 p-4 transition-opacity duration-500"
            class:opacity-100={index >= currentIndex && index < currentIndex + cardsPerView}
            class:opacity-0={index < currentIndex || index >= currentIndex + cardsPerView}
          >
            <div class="relative overflow-hidden rounded-5xl" in:fade={{duration: 300, easing: cubicInOut}}>
              <img 
                class="w-full h-[300px] md:h-[400px] object-cover transform hover:scale-105 transition duration-500" 
                src={card.image} 
                alt={card.title}
              >
              <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/90 to-transparent p-4 md:p-8" style="--tw-gradient-stops: var(--tw-gradient-from) 0%, var(--tw-gradient-from) 33%, var(--tw-gradient-to) 100%;">
                <span class="inline-block rounded-full bg-green-500 p-2 mb-2 text-xs text-black font-medium tracking-tighter">{card.tag}</span>
                <a class="group block max-w-sm" href="#workshops">
                  <h3 class="mb-2 text-lg md:text-xl text-white tracking-3xl hover:underline">{card.title}</h3>
                </a>
                <p class="mb-4 text-xs md:text-sm text-white/80">{card.description}</p>
                <a class="group inline-flex items-center" href="#workshops">
                  <span class="mr-3.5 text-sm text-white font-medium">Learn more</span>
                  <svg class="transform group-hover:rotate-90 transition duration-300" width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 0.75L1 11.25" stroke="white" stroke-width="1.43182" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M11.5 10.3781V0.75H1.87187" stroke="white" stroke-width="1.43182" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
          </div>
        </div>
    </div>
      {/each}
    </div>

      <!-- Slide Indicators -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {#each Array(cards.length - cardsPerView + 1) as _, index}
          <button 
            class="w-3 h-3 rounded-full transition-all duration-300 {index === currentIndex ? 'bg-purple-400 w-6' : 'bg-white/50 hover:bg-white/80'}"
            on:click={() => currentIndex = index}
          ></button>
        {/each}
  </div>
</div>
  </div>
</div>

<style>
  /* Add any additional custom styles here if needed */
</style>
