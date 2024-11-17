<script lang="ts">
  import { onMount } from 'svelte';

  let toggle = true;
  onMount(() => {
    // Any initialization code can go here
  });

  function toggleBilling() {
    toggle = !toggle;
  }
</script>

  <div class="container px-4 mx-auto">

    <div class="container px-4 mx-auto">
      <div class="mb-20 md:max-w-2xl text-center mx-auto">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span>
      <h2 class="font-heading mb-8 text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">Unsere Kursangebote</h2>
      <p class="mb-12 text-gray-300 max-w-sm mx-auto">DJ Workshop Germany bietet professionelle DJ-Kurse für Anfänger und Fortgeschrittene an</p>
<div
        role="region"
  aria-label="pricing-slider"
  class="relative p-1 max-w-max mx-auto bg-gradient-radial-dark-light rounded-full"
>
  <button
    type="button"
    on:click={toggleBilling}
    on:keydown={(e) => e.key === 'Enter' && toggleBilling()}
    class="w-full h-full absolute top-0 left-0 z-10 opacity-0 cursor-pointer"
    aria-label="Toggle billing cycle"
  ></button>
        <div class="flex flex-wrap items-center">
            <div class="relative w-full sm:w-auto">
      <span class="block py-5 px-9 text-center {toggle ? 'bg-white text-black' : 'text-gray-300'} font-medium rounded-full transition-all duration-200">
        Monatliche Zahlung
      </span>
            </div>
            <div class="relative flex-1">
      <span class="flex flex-wrap items-center justify-center py-3.5 px-9 text-center rounded-full transition-all duration-200 {!toggle ? 'bg-white' : ''}">
                <p class="mr-2.5 {!toggle ? 'text-black' : 'text-gray-300'} font-medium">Jährliche Zahlung</p>
                <span class="px-3 py-1.5 text-sm font-medium text-center {!toggle ? 'bg-green-500' : ''} uppercase border border-green-400 rounded-full {!toggle ? 'text-black' : 'text-green-400'}">20% sparen</span>
      </span>
    </div>
  </div>
</div>
            </div>
      <div class="flex flex-wrap -m-4">
        <div class="w-full md:w-1/2 p-4">
        <div class="px-8 pt-12 pb-12 h-full bg-gradient-radial-dark border-2 border-gray-900 border-opacity-30 overflow-hidden rounded-5xl">
          <div class="flex flex-wrap items-center -m-2 mb-7">
            <div class="w-full md:w-1/2 p-2">
                <p class="mb-2 text-xl text-white font-light">Einsteigerkurs</p>
              <p class="text-gray-300">Grundlagen des DJing für Anfänger, inklusive Beatmatching und Mixing-Techniken</p>
            </div>
            <div class="w-full md:w-1/2 p-2">
              <div class="max-w-max md:ml-auto">
                <p class="flex flex-col text-white font-medium text-5xl">
                    {#if toggle}
                      <span class="mb-1.5">€50</span>
                      <span class="text-base font-medium text-gray-300">/ Monat</span>
                    {:else}
                      <span class="mb-1.5">€500</span>
                      <span class="text-base font-medium text-gray-300">/ Jahr</span>
                    {/if}
                  </p>
            </div>
          </div>
                </div>
                <p class="mb-6 text-xs text-gray-300 font-light uppercase">Kursinhalt</p>
                <ul class="flex flex-wrap mb-10">
                  <li class="flex items-center w-full sm:w-1/2 mb-4">
                    <div class="w-auto">
                      <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                        <img src="nightsable-assets/images/modals/check.svg" alt="">
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="text-white">Grundlagen des Beatmatching</p>
                    </div>
                  </li>
                  <li class="flex items-center w-full sm:w-1/2 mb-4">
                    <div class="w-auto">
                      <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                        <img src="nightsable-assets/images/modals/check.svg" alt="">
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="text-white">Einführung in Mixing-Techniken</p>
                    </div>
                  </li>
                  <li class="flex items-center w-full sm:w-1/2 mb-4 md:mb-0">
                    <div class="w-auto">
                      <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                        <img src="nightsable-assets/images/modals/check.svg" alt="">
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="text-white">Umgang mit DJ-Equipment</p>
                    </div>
                  </li>
                  <li class="flex items-center w-full sm:w-1/2">
                    <div class="w-auto">
                      <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                        <img src="nightsable-assets/images/modals/check.svg" alt="">
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="text-white">Musikauswahl und Playlist-Erstellung</p>
                    </div>
                  </li>
                </ul>
                <a class="relative z-10 block px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Jetzt buchen</a>
        
              </div>
        </div>
        <div class="w-full md:w-1/2 p-4">
          <div class="px-8 pt-12 pb-12 h-full bg-gradient-radial-dark border-2 border-gray-900 border-opacity-30 overflow-hidden rounded-5xl">
            <div class="flex flex-wrap items-center -m-2 mb-7">
              <div class="w-full md:w-1/2 p-2">
                <p class="mb-2 text-xl text-white font-light">Fortgeschrittenenkurs</p>
                <p class="text-gray-300">Erweiterte DJ-Techniken und Produktionselemente für erfahrene DJs</p>
                </div>
              <div class="w-full md:w-1/2 p-2">
                <div class="max-w-max md:ml-auto">
                  <p class="flex flex-col text-white font-medium text-5xl">
                    {#if toggle}
                      <span class="mb-1.5">€100</span>
                      <span class="text-base font-medium text-gray-300">/ Monat</span>
                    {:else}
                      <span class="mb-1.5">€1000</span>
                      <span class="text-base font-medium text-gray-300">/ Jahr</span>
                    {/if}
                  </p>
                </div>
              </div>
              </div>
              <p class="mb-6 text-xs text-gray-300 font-light uppercase">Kursinhalt</p>
          <ul class="flex flex-wrap mb-10">
            <li class="flex items-center w-full sm:w-1/2 mb-4">
              <div class="w-auto">
                <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                  <img src="nightsable-assets/images/modals/check.svg" alt="">
                </div>
              </div>
              <div class="flex-1">
                <p class="text-white">Fortgeschrittene Mixing-Techniken</p>
              </div>
            </li>
            <li class="flex items-center w-full sm:w-1/2 mb-4">
              <div class="w-auto">
                <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                  <img src="nightsable-assets/images/modals/check.svg" alt="">
                </div>
              </div>
              <div class="flex-1">
                <p class="text-white">Musikproduktion für DJs</p>
              </div>
            </li>
            <li class="flex items-center w-full sm:w-1/2 mb-4 md:mb-0">
              <div class="w-auto">
                <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                  <img src="nightsable-assets/images/modals/check.svg" alt="">
                </div>
              </div>
              <div class="flex-1">
                <p class="text-white">Live-Performance-Techniken</p>
              </div>
            </li>
            <li class="flex items-center w-full sm:w-1/2">
              <div class="w-auto">
                <div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full">
                  <img src="nightsable-assets/images/modals/check.svg" alt="">
                </div>
              </div>
              <div class="flex-1">
                <p class="text-white">Branding und Marketing für DJs</p>
              </div>
            </li>
          </ul>
          <a class="relative z-10 block px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Jetzt buchen</a>

                </div>
              </div>
              </div>
        </div>

</div>

<style>
  /* Add any additional custom styles here if needed */
</style>
