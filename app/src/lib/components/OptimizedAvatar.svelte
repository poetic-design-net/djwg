<script lang="ts">
  import OptimizedImage from './OptimizedImage.svelte';
  import type { SanityImage, SanityImageSource } from '$lib/sanity/image';

  export let image: SanityImage | SanityImageSource | string;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let border: boolean = false;
  export let borderColor: string = 'border-green-500';

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const sizeDimensions = {
    sm: 80,  // Doppelte Größe für bessere Qualität
    md: 160, // Doppelte Größe für bessere Qualität
    lg: 256  // Doppelte Größe für bessere Qualität
  };

  $: avatarClasses = `${sizeClasses[size]} rounded-full object-cover ${
    border ? `border-2 ${borderColor}` : ''
  }`;

  function optimizeImageUrl(url: string, width: number): string {
    if (!url.includes('cdn.sanity.io')) return url;
    
    // Extrahiere den Basis-URL-Pfad
    const baseUrl = url.split('?')[0];
    
    // Füge Sanity Image Pipeline Parameter hinzu
    return `${baseUrl}?w=${width}&h=${width}&fit=crop&crop=center&auto=format&q=90`;
  }

  $: imageUrl = typeof image === 'string' 
    ? optimizeImageUrl(image, sizeDimensions[size])
    : null;
</script>

{#if imageUrl}
  <div class="flex items-center">
    <img
      src={imageUrl}
      alt="Profilbild"
      class={avatarClasses}
      loading="lazy"
      decoding="async"
    />
  </div>
{:else}
  <div class="flex items-center">
    <OptimizedImage
      image={image}
      alt="Profilbild"
      className={avatarClasses}
      maxWidth={sizeDimensions[size]}
      sizes={`${sizeDimensions[size]}px`}
    />
  </div>
{/if}