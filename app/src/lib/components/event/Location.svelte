<script lang="ts">
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import type { SanityImageSource } from '$lib/sanity/image';

  interface TransformedLocationDetails {
    name: string;
    description: string;
    image: SanityImageSource;
  }

  export let locationDetails: TransformedLocationDetails;
  export let locationUrl: string | undefined = undefined;
  export let isSecret: boolean = false;
</script>

<div class="py-20">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl text-white mb-12 text-center">Location</h2>
    <div class="relative">
      {#if isSecret}
        <div class="absolute inset-0 backdrop-blur-xl bg-black/40 z-10 flex items-center justify-center">
          <div class="text-center">
            <span class="text-2xl text-white font-medium">Location wird bald bekannt gegeben</span>
            <p class="text-gray-400 mt-2">Bleib gespannt!</p>
          </div>
        </div>
      {/if}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="relative aspect-[4/3] rounded-3xl overflow-hidden">
          <OptimizedImage
            image={locationDetails.image}
            alt={locationDetails.name}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            maxWidth={1920}
          />
        </div>
        <div class="flex flex-col justify-center">
          <h3 class="text-3xl text-white mb-4">{locationDetails.name}</h3>
          <p class="text-gray-300 mb-6">{locationDetails.description}</p>
          
          {#if locationUrl}
            <a
              href={locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-300"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Auf Google Maps öffnen</span>
            </a>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
