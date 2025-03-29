<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import type { Testimonial } from '$lib/sanity/queries';
  import OptimizedImage from './OptimizedImage.svelte';

  export let testimonials: { data?: Testimonial[] } | null = null;

  let activeSlide = 0;
  const slideWidth = tweened(0, {
    duration: 500,
    easing: cubicOut
  });

  $: testimonialsData = testimonials?.data || [];

  function nextSlide() {
    if (activeSlide < testimonialsData.length - 1) {
      activeSlide++;
      slideWidth.set(activeSlide * 100);
    }
  }

  function prevSlide() {
    if (activeSlide > 0) {
      activeSlide--;
      slideWidth.set(activeSlide * 100);
    }
  }

  $: currentTestimonial = testimonialsData[activeSlide];
  $: hasImage = !!currentTestimonial?.image?.asset;
</script>

{#if testimonialsData.length > 0}
  <div class="container px-4 mx-auto">
    <div class="mb-10 md:mb-16 md:max-w-3xl text-center mx-auto">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span>
      <h2 class="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tighter-xl">Was unsere Teilnehmer sagen</h2>
    </div>
    <div class="relative p-2 sm:p-3 bg-gradient-radial-dark overflow-hidden border border-gray-900 border-opacity-30 rounded-5xl">
      <div class="relative z-10 flex flex-wrap lg:flex-nowrap">
        
        <div class="w-full {hasImage ? 'lg:w-3/4' : 'lg:w-full'} p-3 sm:p-4 md:p-6">
          <div class="overflow-hidden">
            <div style="transform: translateX(-{$slideWidth}%)" class="flex transition-transform duration-500 ease-in-out">
              {#each testimonialsData as testimonial, i}
                <div class="flex-shrink-0 w-full">
                  <h3 class="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl lg:text-3xl text-white tracking-tighter leading-snug">{testimonial.quote}</h3>
                  <h4 class="text-white font-medium tracking-tighter">{testimonial.name}</h4>
                  <span class="mb-4 sm:mb-6 inline-block text-sm text-white">{testimonial.role}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="flex justify-end mt-3 sm:mt-4 -m-1 sm:-m-2">
            <div class="w-auto p-1 sm:p-2">
              <button 
                on:click={prevSlide} 
                class="group inline-block"
                disabled={activeSlide === 0}
              >
                <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.7041 7.12817L4.15635 13.6759L10.7041 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M22.4941 13.6759H4.33949" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
              </button>
            </div>
            <div class="w-auto p-1 sm:p-2">
              <button 
                on:click={nextSlide} 
                class="group inline-block"
                disabled={activeSlide === testimonialsData.length - 1}
              >
                <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.2959 7.12817L22.8437 13.6759L16.2959 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M4.50586 13.6759H22.6605" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <img class="absolute bottom-0 left-1/2 transform -translate-x-1/2" src="nightsable-assets/images/testimonials/blur.png" alt="">
    </div>
    <div class="flex justify-end mt-4 sm:mt-6 md:mt-8">
      <div class="w-full sm:w-auto">
        <a class="inline-block w-full py-4 px-6 text-sm text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200 text-center" href="/feedback">
          Zum Feedback der Teilnehmer
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  button:disabled .hover\:border-green-500:hover {
    border-color: inherit;
  }
</style>
