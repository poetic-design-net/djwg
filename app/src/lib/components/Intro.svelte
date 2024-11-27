<script lang="ts">
  import { client } from '$lib/sanity/client';
  import type { PortableTextComponents } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import { PortableText } from '@portabletext/svelte';
  import Icon from './icons/Icon.svelte';
  import type { KnowledgeBaseItem } from '$lib/sanity/queries/content';
  import { enhancedUrlFor } from '$lib/sanity/image';
  import type { Image } from '@sanity/types';

  type IconType = 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';

  interface SanityImage extends Image {
    alt?: string;
  }

  interface IntroProps {
    items?: KnowledgeBaseItem[];
    title?: PortableTextBlock[];
    description?: string;
    image?: SanityImage;
  }

  export let items: KnowledgeBaseItem[] = [];
  export let title: PortableTextBlock[] = [{
    _type: 'block',
    children: [{
      _type: 'span',
      text: "Werde zum DJ-Profi"
    }]
  }];
  export let description: string = "Entdecke die Kunst des DJings mit professionellen Workshops für Anfänger und Fortgeschrittene. Von Mixing-Techniken bis zur Crowd Control - wir bringen dich auf das nächste Level.";
  export let image: IntroProps['image'] = undefined;

  const components: Partial<PortableTextComponents> = {};

  function validateIcon(icon: string): IconType {
    const validIcons: IconType[] = ['mixer', 'headphones', 'vinyl', 'laptop', 'microphone', 'controller'];
    return validIcons.includes(icon as IconType) ? icon as IconType : 'mixer';
  }

  $: imageUrls = image?.asset ? (() => {
    const sizes = [400, 800, 1200];
    const urls = sizes.map(size => ({
      ...enhancedUrlFor(image),
      width: size
    }));

    return {
      webp: urls.map(u => `${u.webp}&w=${u.width} ${u.width}w`).join(', '),
      fallback: urls.map(u => `${u.fallback}&w=${u.width} ${u.width}w`).join(', '),
      placeholder: `${enhancedUrlFor(image).fallback}&w=400&blur=10`
    };
  })() : null;

  $: altText = image?.alt || "DJ Workshop";
</script>

<div class="container px-4 mx-auto">
    <div class="relative p-6 sm:p-12 bg-green-500 border-b bg-gradient-radial-dark border-blueGray-900 rounded-5xl">
      <div class="flex flex-wrap lg:items-center -m-8">
        <div class="w-full md:w-1/2 p-8 order-2 md:order-1">
          {#if image?.asset && imageUrls}
            <picture class="relative block w-full aspect-video">
              <source 
                srcset={imageUrls.webp}
                type="image/webp"
                sizes="(max-width: 768px) 100vw, 50vw"
              >
              <img 
                srcset={imageUrls.fallback}
                src={imageUrls.placeholder}
                alt={altText} 
                class="relative rounded-xl w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="800"
                height="450"
              >
            </picture>
          {:else}
            <picture class="relative block w-full aspect-video">
              <source 
                srcset="assets/home_hero.webp"
                type="image/webp"
              >
              <img 
                src="assets/home_hero.jpg" 
                alt="DJ Workshop"
                class="relative rounded-xl w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="800"
                height="450"
              >
            </picture>
          {/if}
        </div>
        <div class="w-full md:w-1/2 p-8 order-1 md:order-2">
          <div class="md:max-w-md">
            <h2 class="font-heading mb-4 text-4xl lg:text-5xl text-black tracking-4xl lg:tracking-5xl">
              <PortableText value={title} {components} />
            </h2>
            <p class="mb-6 text-black text-xl">{description}</p>
            <div class="flex flex-wrap items-center -m-2">
              <div class="w-auto p-2">
                <a href="#workshops" class="inline-block px-8 py-4 text-center text-black font-medium tracking-tighter bg-white hover:bg-black/95 hover:text-white border-2 hover:border-black/95 border-white focus:ring-4 focus:ring-green-300 focus:ring-opacity-40 rounded-full transition duration-300">
                  Workshops entdecken
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      
  <div class="max-w-7xl mx-auto mt-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each items as item}
        <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 flex items-center justify-center rounded-xl mr-4">
              <Icon name={validateIcon(item.icon)} size={24} class_name="text-green-400" />
            </div>
            <h3 class="text-xl text-white">{item.title}</h3>
          </div>
          <p class="text-gray-300">{item.description}</p>
        </div>
      {/each}
    </div>

    <div class="text-center mt-12">
      <a 
        href="/knowledgebase" 
        class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300"
      >
        Was du bei uns lernst
      </a>
    </div>
  </div>
</div>
