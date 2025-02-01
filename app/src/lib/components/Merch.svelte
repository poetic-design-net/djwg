<script lang="ts">
  import type { MerchProduct } from '$lib/types/menu';
  import OptimizedImage from './OptimizedImage.svelte';
  import { onMount } from 'svelte';

  export let id: string | undefined = undefined;
  export let title: string = "Unser Merch Shop";
  export let description: string = "Entdecke unsere exklusive DJ Workshop Kollektion";
  export let products: MerchProduct[] = [];
  let validProducts: MerchProduct[] = [];
  $: gridColumns = Math.min(validProducts.length || 1, 4);

  // Aktive Bilder und Varianten für jedes Produkt
  let activeImageIndices: { [key: string]: number } = {};
  let selectedVariants: { [key: string]: number } = {};

  $: {
    console.log('Merch products:', products);
    validProducts = (products || []).filter((p): p is MerchProduct => {
      const isValid = p && typeof p === 'object' && 'title' in p && typeof p.title === 'string';
      if (!isValid) {
        console.warn('Invalid product:', p);
      }
      return isValid;
    });
    console.log('Valid products:', validProducts, 'Count:', validProducts.length);

    // Initialisiere Indizes für neue Produkte
    validProducts.forEach(product => {
      if (!(product._id in activeImageIndices)) {
        activeImageIndices[product._id] = 0;
      }
      if (!(product._id in selectedVariants)) {
        selectedVariants[product._id] = 0;
      }
    });
  }

  function getImageAlt(product: MerchProduct, imageIndex: number): string {
    const image = product.images[imageIndex];
    if (image?.alt && typeof image.alt === 'string') {
      return image.alt;
    }
    return `${product.title} - Bild ${imageIndex + 1}`;
  }

  function nextImage(productId: string, totalImages: number) {
    activeImageIndices[productId] = (activeImageIndices[productId] + 1) % totalImages;
  }

  function previousImage(productId: string, totalImages: number) {
    activeImageIndices[productId] = (activeImageIndices[productId] - 1 + totalImages) % totalImages;
  }

  function selectVariant(productId: string, variantIndex: number) {
    selectedVariants[productId] = variantIndex;
  }
</script>

<section {id} class="relative overflow-hidden pt-36">
  <div class="container px-4 mx-auto {validProducts.length === 1 ? 'max-w-2xl' : ''}">
    <div class="text-center mb-20">
      <span class="inline-block mb-4 text-sm text-tourquis-500 font-medium tracking-tighter">Merchandise</span>
      <h2 class="font-heading mb-6 text-5xl md:text-6xl text-white tracking-tighter">{title}</h2>
      <p class="text-lg text-gray-300 md:max-w-md mx-auto">{description}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 {validProducts.length <= 3 ? 'lg:grid-cols-' + validProducts.length : 'lg:grid-cols-3'} {validProducts.length === 4 ? 'xl:grid-cols-4' : ''} gap-8 max-w-7xl mx-auto">
      {#each validProducts as product}
        <div class="h-full">
          <div class="relative h-full flex flex-col bg-black/40 border-gray-800 border rounded-5xl bg-gradient-radial-dark transition duration-200">
            <!-- Content Container -->
            <div class="flex-grow p-8">
              <div class="mb-6">
                {#if product.images && product.images.length > 0}
                  <div class="relative mb-6 aspect-square overflow-hidden rounded-xl group">
                    <!-- Bilder-Slider -->
                    <OptimizedImage
                      image={product.images[activeImageIndices[product._id]]}
                      alt={getImageAlt(product, activeImageIndices[product._id])}
                      maxWidth={600}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    
                    <!-- Navigation Buttons -->
                    {#if product.images.length > 1}
                      <button
                        class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        on:click={() => previousImage(product._id, product.images.length)}
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        on:click={() => nextImage(product._id, product.images.length)}
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <!-- Bildpunkte -->
                      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                        {#each product.images as _, index}
                          <button
                            class="w-2 h-2 rounded-full transition-colors duration-200 {index === activeImageIndices[product._id] ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}"
                            on:click={() => activeImageIndices[product._id] = index}
                          />
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
                <h3 class="mb-4 text-xl text-white">{product.title}</h3>
                <p class="text-gray-300 text-sm">{product.description || ''}</p>
                {#if product.variants && product.variants.length > 0}
                  <p class="mt-2 text-lg font-semibold text-tourquis-500">
                    {product.variants[selectedVariants[product._id]].price} 
                    {product.variants[selectedVariants[product._id]].currency}
                  </p>
                {/if}
              </div>

              {#if Array.isArray(product.features) && product.features.length > 0}
                <ul class="mb-6">
                  {#each product.features as feature}
                    {#if typeof feature === 'string'}
                      <li class="flex items-center mb-4">
                        <svg class="mr-2" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="#33cc99" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#33cc99" stroke-width="1.5"/>
                        </svg>
                        <span class="text-gray-300 text-sm">{feature}</span>
                      </li>
                    {/if}
                  {/each}
                </ul>
              {/if}

              <!-- Größenauswahl -->
              {#if product.variants && product.variants.length > 0}
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-300 mb-2">Größe auswählen</label>
                  <div class="flex flex-wrap gap-2">
                    {#each product.variants as variant, index}
                      <button
                        class="px-4 py-2 rounded-lg border {selectedVariants[product._id] === index ? 'border-tourquis-500 bg-tourquis-500/10 text-white' : 'border-gray-700 text-gray-300 hover:border-gray-500'}"
                        on:click={() => selectVariant(product._id, index)}
                      >
                        {variant.name}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
            
            <!-- Button Container (Always at Bottom) -->
            {#if product.variants && product.variants.length > 0}
              <div class="p-8 pt-0 text-center">
                <a
                  class="inline-block w-full py-4 px-6 text-sm text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200"
                  href={product.variants[selectedVariants[product._id]].shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zum Shop
                </a>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .rounded-5xl {
    border-radius: 2rem;
  }
</style>