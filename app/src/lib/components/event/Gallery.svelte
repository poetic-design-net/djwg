<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { SanityImageSource } from '$lib/sanity/image';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  
  export let images: SanityImageSource[] = [];
</script>

<div class="py-20">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl text-white mb-12 text-center">Impressionen</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each images as image, i}
        <div
          class="relative aspect-square rounded-3xl overflow-hidden group"
          in:fade={{delay: i * 100}}
        >
          <OptimizedImage
            {image}
            alt="Event impression {i + 1}"
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
            maxWidth={800}
          />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      {/each}
    </div>
  </div>
</div>
