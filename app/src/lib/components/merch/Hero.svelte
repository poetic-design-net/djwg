<script lang="ts">
  import { enhancedUrlFor } from '$lib/sanity/image';
  import type { SanityImage } from '$lib/types/image';

  export let eyebrow: string;
  export let title: string;
  export let description: string;
  export let backgroundImage: SanityImage | undefined = undefined;
</script>

<section class="relative py-32 overflow-hidden">
  {#if backgroundImage?.asset}
    <div class="absolute inset-0 z-0">
      <picture>
        <source 
          srcset={enhancedUrlFor(backgroundImage.asset).webp} 
          type="image/webp"
        >
        <img 
          class="w-full h-full object-cover blur-lg scale-110"
          src={enhancedUrlFor(backgroundImage.asset).fallback}
          alt={backgroundImage.alt || ''} 
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div class="absolute inset-0 bg-black/50"></div>
    </div>
  {/if}

  <div class="container relative z-10 px-4 mx-auto">
    <div class="max-w-3xl mx-auto text-center">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">{eyebrow}</span>
      <h1 class="font-heading mb-6 text-5xl lg:text-6xl text-white tracking-tighter">{title}</h1>
      <p class="text-xl text-gray-300">{description}</p>
    </div>
  </div>
</section>

<style>
  .blur-lg {
    filter: blur(16px);
  }
</style>