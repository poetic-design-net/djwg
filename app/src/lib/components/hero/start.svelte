<script lang="ts">
    import { onMount } from 'svelte';
    import { enhancedUrlFor } from '$lib/sanity/image';
    import type { Image } from '@sanity/types';

    export let title: string = "Der ultimative DJ Workshop";
    export let subtitle: string = "DJWORKSHOPGERMANY bietet professionelle DJ-Kurse für Anfänger und Fortgeschrittene in ganz Deutschland an.";
    export let backgroundImages: Image[] = [];
    export let transitionInterval: number = 7.5;

    let mobileNavOpen = false;
    let currentImageIndex = 0;
    const defaultImages = [
        'assets/home_hero.jpg',
        'assets/home_hero_2.jpg',
        'assets/home_hero.jpg'
    ];
  
    function toggleMobileNav() {
      mobileNavOpen = !mobileNavOpen;
    }

    function nextImage() {
        const maxIndex = backgroundImages.length > 0 
            ? backgroundImages.length - 1 
            : defaultImages.length - 1;
        currentImageIndex = (currentImageIndex + 1) % (maxIndex + 1);
    }

    onMount(() => {
        const interval = setInterval(nextImage, transitionInterval * 1000); 
        return () => clearInterval(interval);
    });

    $: imageUrls = backgroundImages.map(img => {
        const sizes = [400, 800, 1200];
        const urls = sizes.map(size => ({
            ...enhancedUrlFor(img),
            width: size
        }));

        return {
            webp: urls.map(u => `${u.webp}&w=${u.width} ${u.width}w`).join(', '),
            fallback: urls.map(u => `${u.fallback}&w=${u.width} ${u.width}w`).join(', '),
            alt: (img as any).alt || 'Hero image',
            // Use smallest size as placeholder
            placeholder: `${enhancedUrlFor(img).fallback}&w=400&blur=10`
        };
    });
</script>

<div class="relative pt-14 pb-16">
  <div class="relative z-10 container px-4 mx-auto">
    <div class="flex flex-wrap lg:items-center -m-8">
      <div class="w-full md:w-1/2 p-8">
        <span class="inline-block mb-2.5 text-sm text-green-400 font-medium tracking-tighter">von DJs für DJs</span>
        <h1 class="font-heading mb-10 text-7xl lg:text-8xl xl:text-10xl text-white tracking-tighter">
          {#if title}
            <span>{title}</span>
          {:else}
            <span>Der ultimative DJ Workshop</span>
            <span class="inline-block">
              <span>im deutschen</span>
            </span>
            <span> Raum</span>    
          {/if}
          <img class="inline-block pr-6" src="nightsable-assets/images/headers/star4.svg" alt="">
        </h1>
        <div class="flex flex-wrap -m-2 mb-12">
          <div class="w-auto p-2"><a class="inline-block px-8 py-4 tracking-tighter border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="/events/">Jetzt Tickets sichern</a></div>
          <div class="w-auto p-2"><a class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="#intro">Mehr erfahren</a></div>
        </div>
        <p class="text-lg text-white md:max-w-xs">{subtitle}</p>
      </div>
      <div class="w-full md:w-1/2 p-8">
          <div class="w-full aspect-[4/3] max-w-[600px] mx-auto md:mr-0 relative overflow-hidden rounded-3xl bg-gray-900">
              {#if backgroundImages.length > 0}
                  {#each imageUrls as image, index}
                      <picture>
                          <source 
                              srcset={image.webp}
                              type="image/webp"
                              sizes="(max-width: 768px) 100vw, 50vw"
                          >
                          <img
                              srcset={image.fallback}
                              src={image.placeholder}
                              alt={image.alt}
                              class="w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out object-cover"
                              style="opacity: {index === currentImageIndex ? '1' : '0'};"
                              loading={index === 0 ? 'eager' : 'lazy'}
                              decoding="async"
                              width="800"
                              height="600"
                          >
                      </picture>
                  {/each}
              {:else}
                  {#each defaultImages as image, index}
                      <picture>
                          <source 
                              srcset={`${image.replace('.jpg', '.webp')}`}
                              type="image/webp"
                          >
                          <img
                              src={image}
                              alt="Gallery image {index + 1}"
                              class="w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out object-cover"
                              style="opacity: {index === currentImageIndex ? '1' : '0'};"
                              loading={index === 0 ? 'eager' : 'lazy'}
                              decoding="async"
                              width="800"
                              height="600"
                          >
                      </picture>
                  {/each}
              {/if}
          </div>
      </div>
    </div>
  </div>
</div>
