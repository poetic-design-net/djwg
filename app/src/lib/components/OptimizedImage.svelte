<script lang="ts">
  import { enhancedUrlFor } from '$lib/sanity/image';
  import type { SanityImage, SanityImageSource } from '$lib/sanity/image';

  export let image: SanityImage | SanityImageSource;
  export let alt: string = '';
  export let className: string = '';
  export let maxWidth: number = 1200;
  export let sizes: string = '(max-width: 768px) 100vw, 50vw';

  $: imageUrls = image?.asset && enhancedUrlFor(image, { maxWidth });
  $: altText = alt || (image?.alt ?? '');
</script>

{#if image?.asset && imageUrls}
  <picture>
    <source 
      srcset={imageUrls.webp}
      type="image/webp"
      {sizes}
    />
    <img
      srcset={imageUrls.fallback}
      src={imageUrls.placeholder}
      {alt}
      class={className}
      loading="lazy"
      decoding="async"
    />
  </picture>
{/if}