<script lang="ts">
  import {
    LinkIcon,
    ArrowRightIcon
  } from 'heroicons-svelte/24/outline'

  interface SocialMediaLink {
    platform: string;
    url: string;
  }

  export let socialLinks: SocialMediaLink[]

  const getIcon = (platform: string) => {
    // Für dieses Beispiel verwenden wir vorerst nur das Link-Icon
    // bis wir eine bessere Icon-Bibliothek für soziale Medien implementieren
    return LinkIcon
  }
</script>
<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative py-20 overflow-hidden">
    <div class="container px-4 mx-auto">
      <div class="max-w-4xl mx-auto text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Up to Date</span>
        <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">Bleib auf dem Laufenden</h1>
        <p class="text-2xl text-white/80 mb-8">Folge uns auf unseren Social Media Kanälen und verpasse keine Updates mehr</p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container px-4 mx-auto py-4">
    <div class="max-w-4xl mx-auto">

          <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">


  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each socialLinks as link}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        class="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <svelte:component this={getIcon(link.platform)} class="w-8 h-8 text-gray-900" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
              {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
            </h3>
            {#if link.description}
              <p class="text-sm text-gray-500 line-clamp-2">
                {link.description}
              </p>
            {/if}
          </div>
          <div class="flex-shrink-0">
            <div class="i-bi-arrow-right w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
      </div>
    </div>
  </div>

