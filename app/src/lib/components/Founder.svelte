<script lang="ts">
  import { enhancedUrlFor } from '$lib/sanity/image';
  import PortableTextContent from './PortableTextContent.svelte';
  import type { Founder } from '$lib/sanity/queries';

  export let data: Founder | null = null;

  const defaultFounder: Founder = {
    name: 'Christian "DJ Dawn"',
    role: 'Gründer & Head Coach',
    image: {
      asset: {
        _ref: '',
        _type: 'reference'
      }
    },
    description: [{
      _type: 'block',
      children: [{
        _type: 'span',
        text: 'Mit über 15 Jahren Erfahrung in der elektronischen Musikszene hat Christian seine Leidenschaft zum Beruf gemacht. Als DJ Dawn ist er nicht nur in Clubs und auf Festivals aktiv, sondern gibt sein Wissen und seine Erfahrung mit Begeisterung an die nächste Generation weiter.'
      }]
    }],
    quote: 'Jeder große DJ hat einmal klein angefangen. Was zählt ist die Leidenschaft für Musik und der Wille, seinen eigenen Stil zu entwickeln.',
    socials: {
      instagram: '#',
      soundcloud: '#'
    }
  };

  $: founder = data ?? defaultFounder;
</script>

<div class="container px-4 mx-auto py-20">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-wrap items-center -mx-4">
      <!-- Image Column -->
      <div class="w-full lg:w-1/2 px-4 mb-8 lg:mb-0">
        <div class="relative">
          <div class="aspect-[4/3] rounded-3xl overflow-hidden">
            {#if data && founder.image}
              <picture>
                <source 
                  srcset={enhancedUrlFor(founder.image).webp} 
                  type="image/webp"
                >
                <img 
                  src={enhancedUrlFor(founder.image).fallback}
                  alt={founder.name}
                  class="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            {:else}
              <img 
                src="/assets/home_hero_2.jpg" 
                alt={founder.name}
                class="w-full h-full object-cover"
              />
            {/if}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent rounded-3xl"></div>
          <!-- Social Links -->
          <div class="absolute bottom-6 left-6 flex space-x-4">
            {#if founder.socials?.instagram}
              <a 
                href={founder.socials.instagram}
                class="text-white hover:text-green-400 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            {/if}
            {#if founder.socials?.soundcloud}
              <a 
                href={founder.socials.soundcloud}
                class="text-white hover:text-green-400 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.56 8.87V17h8.76c1.85 0 3.35-1.5 3.35-3.35 0-1.85-1.5-3.35-3.35-3.35-.18 0-.35.02-.52.05C19.23 4.79 16.07 0 11.56 0v8.87zM9.68 4.53v12.5H0V9c0-2.47 2.01-4.47 4.48-4.47 2.47 0 4.47 2 4.47 4.47v.53z"/>
                </svg>
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Content Column -->
      <div class="w-full lg:w-1/2 px-4">
        <div class="max-w-lg">
          <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Der Gründer</span>
          <h2 class="font-heading mb-6 text-4xl md:text-5xl text-white tracking-tighter">{founder.name}</h2>
          <span class="block mb-6 text-xl text-green-400">{founder.role}</span>
          <div class="text-xl text-gray-300 mb-8">
            <PortableTextContent value={founder.description} />
          </div>
          {#if founder.quote}
            <blockquote class="p-6 bg-black/40 border-l-4 border-green-400 rounded-r-xl">
              <p class="italic text-white">{founder.quote}</p>
            </blockquote>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
