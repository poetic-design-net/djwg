<script lang="ts">
  import type { Image } from '@sanity/types';
  import { generateImageHTML } from '$lib/sanity/image';

  export let locationDetails: {
    name: string;
    description: string;
    image: Image;
  };
  export let isSecret: boolean = false;

  $: imageHtml = generateImageHTML(
    locationDetails.image,
    locationDetails.name,
    'absolute inset-0 w-full h-full object-cover',
    800,  // Width for location image
    600   // Height maintaining 4:3 aspect ratio
  );
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
          {@html imageHtml}
        </div>
        <div class="flex flex-col justify-center">
          <h3 class="text-3xl text-white mb-4">{locationDetails.name}</h3>
          <p class="text-gray-300">{locationDetails.description}</p>
        </div>
      </div>
    </div>
  </div>
</div>
