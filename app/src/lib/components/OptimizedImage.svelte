<script lang="ts">
  import { enhancedUrlFor } from '$lib/sanity/image';
  import type { Image } from '@sanity/types';
  import type { SanityImage, SanityImageSource } from '$lib/sanity/image';

  export let image: SanityImage | SanityImageSource | string;
  export let alt = '';
  export let className = '';
  export let maxWidth = 1920;
  export let sizes = '(max-width: 768px) 100vw, 50vw';

  function isSanityImage(img: any): img is Image {
    return typeof img === 'object' && img !== null && 'asset' in img;
  }

  $: isDirectUrl = typeof image === 'string';
  $: sanityImage = !isDirectUrl && isSanityImage(image) ? image : null;
  $: imageUrls = sanityImage && enhancedUrlFor(sanityImage, { maxWidth });
  $: imgSrc = isDirectUrl ? image : undefined;
</script>

{#if isDirectUrl && typeof image === 'string'}
  <img
    src={image}
    {alt}
    class={className}
    loading="lazy"
    decoding="async"
  />
{:else if sanityImage && imageUrls}
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