<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  


  // Info text for pricing cards - besser formuliert
  const priceInfo = "Bei Mitbringen eines eigenen DJs reduzieren sich die Paketpreise entsprechend. Bitte kontaktieren Sie uns für individuelle Angebote.          Scrollen Sie nach unten um Kontakt aufzunehmen.";

  export let data;
  export let form: any;
  
  const { settings, partnerPage } = data;
  
  let isSubmitting = false;
  let showForm = false;
</script>

<svelte:head>
  <title>{partnerPage?.seo?.title || 'Partner werden'} | {settings.title || 'DJ Workshop'}</title>
  <meta name="description" content={partnerPage?.seo?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!'} />
</svelte:head>

<section class="py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="md:max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Partner & Aussteller</span>
        <h1 class="font-heading mb-8 text-5xl md:text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">
          {partnerPage?.title || 'Partner werden'}
        </h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          {partnerPage?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!'}
        </p>
      </div>

      <!-- Partner Benefits Section -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        {#if partnerPage?.benefits}
          {#each partnerPage.benefits as benefit}
            <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
              <h3 class="text-xl font-medium text-white mb-3">{benefit.title}</h3>
              <p class="text-gray-300">{benefit.description}</p>
            </div>
          {/each}
        {:else}
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Direkte Zielgruppe</h3>
            <p class="text-gray-300">Erreiche motivierte DJs und Musikbegeisterte direkt vor Ort.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Präsentation</h3>
            <p class="text-gray-300">Eigener Stand und Präsentationsmöglichkeiten für deine Produkte.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Networking</h3>
            <p class="text-gray-300">Knüpfe wertvolle Kontakte in der DJ- und Musikbranche.</p>
          </div>
        {/if}
      </div>

      <!-- Pricing Section -->
      <div class="mb-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-medium text-white mb-4">Unsere Partnerpakete</h2>
          <p class="text-gray-300 mb-8">Wähle das passende Paket für deine Präsentation auf dem DJ Workshop</p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Sponsor/Supporter Card -->
          <div class="relative p-8 rounded-xl bg-gray-800/70 backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full">
            <div class="absolute top-4 right-4 z-50">
                <InfoIcon text={priceInfo} position="top" />
            </div>
            <div class="flex-grow">
              <h3 class="text-2xl font-medium text-white mb-2">Sponsor / Supporter</h3>
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-medium text-white">380€</span>
                <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Social Media Advertising Basic</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Homepage Advertising</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Merchandise Advertising</span>
                </li>
              </ul>
            </div>
            <a target="_blank" 
              href="https://eventix.shop/vc4cqfbu" 
              class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              Jetzt Paket buchen
            </a>
          </div>

          <!-- Exhibitor Card -->
          <div class="relative p-8 rounded-xl bg-gray-800/70 backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-green-400 before:to-blue-500 before:rounded-t-3xl">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-500 text-black text-sm font-medium px-4 py-1 rounded-full">Populär</div>
            <div class="absolute top-4 right-4 z-50">
                <InfoIcon text={priceInfo} position="top" />
            </div>
            <div class="flex-grow">
              <h3 class="text-2xl font-medium text-white mb-2">Exhibitor</h3>
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-medium text-white">700€</span>
                <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">2 Days</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Stand space of 5 qm</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">3 Exhibitor Tickets</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">2 Free Tickets Giveaway</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Social Media Advertising Basic</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Homepage Advertising</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Merchandise Advertising</span>
                </li>
              </ul>
            </div>
            <a target="_blank" 
              href="https://eventix.shop/vc4cqfbu" 
              class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              Jetzt Paket buchen
            </a>
          </div>

          <!-- Area Branding Card -->
          <div class="relative p-8 rounded-xl bg-gray-800/70 backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full">
            <div class="absolute top-4 right-4 z-50">
                <InfoIcon text={priceInfo} position="top" />
            </div>
            <div class="flex-grow">
              <h3 class="text-2xl font-medium text-white mb-2">Area Branding</h3>
              <p class="text-xs text-gray-400 mb-1">Exklusiv</p>
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-medium text-white">5000€</span>
                <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Area Branding (Mixing Area by..., PA Area by..., Light Area by...)</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">2 Days</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Stand space of 7 qm</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">5 Exhibitor Tickets</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">2 Free Tickets Giveaway</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Social Media Advertising Premium</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Homepage Advertising</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Merchandise Advertising</span>
                </li>
                <li class="flex items-start">
                  <svg class="mr-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                  </svg>
                  <span class="text-gray-300">Video Content Advertising</span>
                </li>
              </ul>
            </div>
            <a target="_blank" 
              href="https://eventix.shop/vc4cqfbu" 
              class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              Jetzt Paket buchen
            </a>
          </div>
        </div>

        <!-- Add-Ons Section -->
        <div class="mt-16">
          <h3 class="text-2xl font-medium text-white mb-6 text-center">Add-Ons</h3>
          <p class="text-sm text-gray-400 mb-8 text-center">Für Exhibitor und Area Branding Pakete</p>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Card 1 -->
            <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2">Extra Stand Space</h4>
                <p class="text-gray-300 mb-3">1 qm - 140€ inkl. MwSt</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
            
            <!-- Card 2 -->
            <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2">Social Media Promotion Push</h4>
                <p class="text-gray-300 mb-3">240€ inkl. MwSt</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
            
            <!-- Card 3 -->
            <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2">Extra Exhibitor Ticket</h4>
                <p class="text-gray-300 mb-3">50€ inkl. MwSt pro Ticket (max. 3)</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
            
            <!-- Card 4 -->
            <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2">Extra Video Content Advertising</h4>
                <p class="text-gray-300 mb-3">380€ inkl. MwSt</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
          </div>
        </div>


<div class="text-center mt-16">
  <button 
    on:click={() => showForm = !showForm}
    class="px-8 py-3 text-center font-medium tracking-2xl border border-gray-700 hover:border-white text-white rounded-full transition duration-300 focus:outline-none mr-4"
  >
    {showForm ? 'Anfrage-Formular schließen' : 'Oder generell anfragen'}
  </button>
  
  <a 
    href="/contact" 
    class="px-8 py-3 text-center font-medium tracking-2xl border border-purple-500 hover:border-purple-400 text-white bg-blue-500/20 hover:bg-blue-400/20 rounded-full transition duration-300 inline-block"
  >
    Kontakt
  </a>
      </div>




      <!-- Partner Application Form (Collapsible) -->
      {#if showForm}
        <div transition:slide={{duration: 300, delay: 50}} class="mt-8 p-8 rounded-xl bg-gray-800/50 backdrop-blur">
          <h3 class="text-2xl font-medium text-white mb-6 text-center">Kontaktiere uns für individuelle Anfragen</h3>
          
          <form 
            method="POST"
            use:enhance={() => {
              isSubmitting = true;
              return async ({ update }) => {
                await update();
                isSubmitting = false;
              };
            }}
            class="space-y-6" 
            novalidate
          >
            <!-- Kontaktinformationen -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="name" class="block text-sm font-medium text-gray-300">Name / Firma</label>
                <div class="relative">
                  <input 
                    id="name"
                    name="name"
                    type="text" 
                    value={form?.values?.name ?? ''}
                    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
                    class:border-red-500={form?.error}
                    placeholder="Dein Name oder Firmenname"
                  >
                </div>
              </div>

              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-gray-300">E-Mail</label>
                <div class="relative">
                  <input 
                    id="email"
                    name="email"
                    type="email" 
                    value={form?.values?.email ?? ''}
                    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
                    class:border-red-500={form?.error}
                    placeholder="Deine E-Mail"
                  >
                </div>
              </div>
            </div>

            <!-- Zusätzliche Kontaktinformationen -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="phone" class="block text-sm font-medium text-gray-300">Telefon</label>
                <div class="relative">
                  <input 
                    id="phone"
                    name="phone"
                    type="tel" 
                    value={form?.values?.phone ?? ''}
                    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
                    placeholder="Deine Telefonnummer"
                  >
                </div>
              </div>

              <div class="space-y-2">
                <label for="website" class="block text-sm font-medium text-gray-300">Website</label>
                <div class="relative">
                  <input 
                    id="website"
                    name="website"
                    type="url" 
                    value={form?.values?.website ?? ''}
                    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
                    placeholder="https://www.deine-website.de"
                  >
                </div>
              </div>
            </div>

            <!-- Unternehmensinformationen -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="company" class="block text-sm font-medium text-gray-300">Unternehmen</label>
                <div class="relative">
                  <input 
                    id="company"
                    name="company"
                    type="text" 
                    value={form?.values?.company ?? ''}
                    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
                    placeholder="Name deines Unternehmens"
                  >
                </div>
              </div>

              <div class="space-y-2">
                <label for="industry" class="block text-sm font-medium text-gray-300">Branche</label>
                <div class="relative">
                  <input 
                    id="industry"
                    name="industry"
                    type="text" 
                    value={form?.values?.industry ?? ''}
                    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
                    placeholder="z.B. DJ Equipment, Software, etc."
                  >
                </div>
              </div>
            </div>

            <!-- Produkte/Services -->
            <div class="space-y-2">
              <label for="products" class="block text-sm font-medium text-gray-300">Produkte/Services</label>
              <p class="text-sm text-gray-400 mb-2">Welche Produkte oder Services möchtest du präsentieren?</p>
              <div class="relative">
                <textarea 
                  id="products"
                  name="products"
                  value={form?.values?.products ?? ''}
                  class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors min-h-[100px]"
                  placeholder="Beschreibe deine Produkte oder Services..."
                ></textarea>
              </div>
            </div>

            <!-- Nachricht -->
            <div class="space-y-2">
              <label for="message" class="block text-sm font-medium text-gray-300">Zusätzliche Informationen</label>
              <p class="text-sm text-gray-400 mb-2">Hast du besondere Anforderungen oder Wünsche für deine Präsentation?</p>
              <div class="relative">
                <textarea 
                  id="message"
                  name="message"
                  value={form?.values?.message ?? ''}
                  class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors min-h-[150px]"
                  class:border-red-500={form?.error}
                  placeholder="Deine Nachricht..."
                ></textarea>
              </div>
            </div>

            <div class="flex flex-col items-center space-y-4">
              <button 
                type="submit" 
                class="px-14 py-4 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {#if isSubmitting}
                  Wird gesendet...
                {:else}
                  Anfrage senden
                {/if}
              </button>

              {#if form?.error}
                <p class="text-red-500" transition:fade>{form.error}</p>
              {/if}

              {#if form?.success}
                <p class="text-green-400" transition:fade>Vielen Dank für deine Anfrage! Wir melden uns in Kürze bei dir.</p>
              {/if}

              <p class="text-sm text-gray-300 max-w-xs text-center">
                Deine Daten werden gemäß unserer Datenschutzrichtlinien verwendet.
              </p>
            </div>
          </form>
        </div>
      {/if}

     

      <!-- Additional Info Section -->
      <div class="mt-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-medium text-white mb-4">
            {partnerPage?.whyPartnerSection?.title || 'Warum Partner werden?'}
          </h2>
          <p class="text-gray-300">
            {partnerPage?.whyPartnerSection?.description || 'Als Partner des DJ Workshops profitierst du von unserem starken Netzwerk und direktem Zugang zur DJ-Community.'}
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          {#if partnerPage?.exhibitorInfo}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">{partnerPage.exhibitorInfo.title}</h3>
              <ul class="space-y-3 text-gray-300">
                {#each partnerPage.exhibitorInfo.items as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">Ausstellerfläche</h3>
              <ul class="space-y-3 text-gray-300">
                <li>• Professionell ausgestattete Standfläche</li>
                <li>• Technische Ausstattung nach Bedarf</li>
                <li>• Optimale Präsentationsmöglichkeiten</li>
                <li>• Flexible Standgrößen verfügbar</li>
              </ul>
            </div>
          {/if}

          {#if partnerPage?.marketingInfo}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">{partnerPage.marketingInfo.title}</h3>
              <ul class="space-y-3 text-gray-300">
                {#each partnerPage.marketingInfo.items as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">Marketing & Promotion</h3>
              <ul class="space-y-3 text-gray-300">
                <li>• Präsenz auf unserer Website</li>
                <li>• Social Media Promotion</li>
                <li>• Erwähnung in Newsletter</li>
                <li>• Logo-Präsenz auf Event-Material</li>
              </ul>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>