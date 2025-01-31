<script lang="ts">
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import type { SanityImageSource } from '$lib/sanity/image';

  interface TransformedLocationDetails {
      name: string;
      description: string;
      image: SanityImageSource;
      website?: string;
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
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
          
          <div class="flex flex-wrap gap-4 mb-6">
            {#if locationDetails.website}
              <a
                href={locationDetails.website}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-300"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span>Website</span>
              </a>
            {/if}

            {#if locationDetails.instagram}
              <a
                href={locationDetails.instagram}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-300"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="2" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke-width="2" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-width="2" />
                </svg>
                <span>Instagram</span>
              </a>
            {/if}

            {#if locationDetails.facebook}
              <a
                href={locationDetails.facebook}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-300"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Facebook</span>
              </a>
            {/if}

            {#if locationDetails.whatsapp}
              <a
                href={locationDetails.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-300"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M20.5 3.5A12 12 0 0012 20.5h-.1A12 12 0 103.5 3.6"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>WhatsApp</span>
              </a>
            {/if}
          </div>

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
