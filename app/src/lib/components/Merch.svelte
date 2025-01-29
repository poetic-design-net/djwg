<script lang="ts">
  import type { MerchProduct } from '$lib/types/menu';
  import OptimizedImage from './OptimizedImage.svelte';

  export let id: string | undefined = undefined;
  export let title: string = "Unser Merch Shop";
  export let description: string = "Entdecke unsere exklusive DJ Workshop Kollektion";
  export let products: MerchProduct[] = [];
  let validProducts: MerchProduct[] = [];
  $: gridColumns = Math.min(validProducts.length || 1, 4);

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
  }
  function getImageAlt(product: MerchProduct): string {
    if (product.image?.alt && typeof product.image.alt === 'string') {
      return product.image.alt;
    }
    return product.title || 'Produkt Bild';
  }
</script>

<section {id} class="relative overflow-hidden pt-36">
  <div class="container px-4 mx-auto">
    <div class="text-center mb-20">
      <span class="inline-block mb-4 text-sm text-tourquis-500 font-medium tracking-tighter">Merchandise</span>
      <h2 class="font-heading mb-6 text-5xl md:text-6xl text-white tracking-tighter">{title}</h2>
      <p class="text-lg text-gray-300 md:max-w-md mx-auto">{description}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 auto-cols-fr" style="grid-template-columns: repeat({Math.min(validProducts.length, 4)}, minmax(0, 1fr));">
      {#each validProducts as product}
        <div class="h-full">
          <div class="relative h-full flex flex-col bg-black/40 border-gray-800 border rounded-5xl bg-gradient-radial-dark transition duration-200">
            <!-- Content Container -->
            <div class="flex-grow p-8">
              <div class="mb-6">
                {#if product.image?.asset}
                  <div class="mb-6 aspect-square overflow-hidden rounded-xl">
                    <OptimizedImage
                      image={product.image}
                      alt={getImageAlt(product)}
                      maxWidth={600}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                {/if}
                <h3 class="mb-4 text-xl text-white">{product.title}</h3>
                <p class="text-gray-300 text-sm">{product.description || ''}</p>
                {#if typeof product.price === 'number' && product.currency}
                  <p class="mt-2 text-lg font-semibold text-tourquis-500">{product.price} {product.currency}</p>
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
            </div>
            
            <!-- Button Container (Always at Bottom) -->
            {#if product.shopUrl}
              <div class="p-8 pt-0 text-center">
                <a
                  class="inline-block w-full py-4 px-6 text-sm text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200"
                  href={product.shopUrl}
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

  @media (min-width: 1024px) {
    .merch-grid {
      grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
    }
  }

  :global(.merch-grid) {
    --grid-columns: {gridColumns};
  }
</style>