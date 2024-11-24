<script lang="ts">
  import { fade } from 'svelte/transition';

  export let images: string[] = [];
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
          <img
            src={image}
            alt="Event impression"
            class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      {/each}
    </div>
  </div>
</div>
