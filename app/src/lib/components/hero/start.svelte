<script lang="ts">
    import { onMount } from 'svelte';
    import type { SanityImageSource } from '$lib/sanity/image';
    import OptimizedImage from '../OptimizedImage.svelte';

    export let id: string | undefined = undefined;
    export let title: string = "Der ultimative DJ Workshop";
    export let subtitle: string = "DJWORKSHOPGERMANY bietet professionelle DJ-Kurse für Anfänger und Fortgeschrittene in ganz Deutschland an.";
    export let eyebrow: string = "von DJs für DJs";
    export let backgroundImages: SanityImageSource[] = [];
    export let transitionInterval: number = 7.5;
    export let primaryButton: { text: string; link: string } | undefined = undefined;
    export let secondaryButton: { text: string; link: string } | undefined = undefined;

    let currentImageIndex = 0;

    function nextImage() {
        if (backgroundImages.length > 0) {
            currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
        }
    }

    onMount(() => {
        if (backgroundImages.length > 0) {
            const interval = setInterval(nextImage, transitionInterval * 1000); 
            return () => clearInterval(interval);
        }
    });
</script>

<section {id} class="relative overflow-hidden pt-14 pb-16">
  <div class="relative z-10 container px-4 mx-auto">
    <div class="flex flex-wrap lg:items-center -m-8">
      <div class="w-full md:w-1/2 p-8">
        <span class="inline-block mb-2.5 text-sm text-green-400 font-medium tracking-tighter">{eyebrow}</span>
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
          {#if primaryButton?.text && primaryButton?.link}
            <div class="w-auto p-2">
              <a class="inline-block px-8 py-4 tracking-tighter border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" 
                href={primaryButton.link}>
                {primaryButton.text}
              </a>
            </div>
          {/if}
          {#if secondaryButton?.text && secondaryButton?.link}
            <div class="w-auto p-2">
              <a class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" 
                href={secondaryButton.link}>
                {secondaryButton.text}
              </a>
            </div>
          {/if}
        </div>
        <p class="text-lg text-white md:max-w-md">{subtitle}</p>
      </div>
      <div class="w-full md:w-1/2 p-8">
        <div class="w-full aspect-[4/4] max-w-[600px] mx-auto md:mr-0 relative overflow-hidden rounded-3xl bg-gray-900">
          {#if backgroundImages.length > 0}
            {#each backgroundImages as image, index}
              <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                   style="opacity: {index === currentImageIndex ? '1' : '0'};">
                <OptimizedImage 
                  {image}
                  alt="Hero image {index + 1}"
                  maxWidth={1600}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover"
                />
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
