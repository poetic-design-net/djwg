<script lang="ts">
  import { client } from '$lib/sanity/client';
  import type { PortableTextComponents } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import { PortableText } from '@portabletext/svelte';
  import Icon from './icons/Icon.svelte';
  import OptimizedImage from './OptimizedImage.svelte';
  import type { SanityImage } from '$lib/sanity/image';
  import type { IntroSectionItem } from '$lib/types/menu';

  export let id: string | undefined = undefined;

  type IconType = 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';

  export let title: PortableTextBlock[] | string = "Werde zum DJ-Profi";
  export let description: PortableTextBlock[] = [];
  export let image: SanityImage | undefined = undefined;
  export let items: IntroSectionItem[] | null = null;
  export let cta: { text: string; link: string } | undefined = undefined;
  export let secondaryCta: { text: string; link: string } | undefined = undefined;

  const components: Partial<PortableTextComponents> = {};

  function validateIcon(icon: string): IconType {
    const validIcons: IconType[] = ['mixer', 'headphones', 'vinyl', 'laptop', 'microphone', 'controller'];
    return validIcons.includes(icon as IconType) ? icon as IconType : 'mixer';
  }

  $: processedTitle = typeof title === 'string' ? [{
    _type: 'block',
    children: [{ _type: 'span', text: title }]
  }] : title;

  $: altText = image?.alt || "DJ Workshop";
</script>

<section {id} class="relative overflow-hidden pt-20">
  <div class="container px-4 mx-auto">
    <div class="relative p-6 sm:p-12 bg-green-500 border-b bg-gradient-radial-dark border-blueGray-900 rounded-5xl">
      <div class="flex flex-wrap lg:items-center -m-8">
        {#if image?.asset}
          <!-- Image Column -->
          <div class="w-full md:w-1/2 p-8 order-2 md:order-1">
            <div class="relative block w-full aspect-video">
              <OptimizedImage 
                image={image}
                alt={altText}
                maxWidth={1200}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="relative rounded-xl w-full h-full object-cover"
              />
            </div>
          </div>
          <!-- Content Column (Half Width) -->
          <div class="w-full md:w-1/2 p-8 order-1 md:order-2">
            <div class="md:max-w-md">
              <h2 class="font-heading mb-4 text-4xl lg:text-5xl text-black tracking-4xl lg:tracking-5xl">
                <PortableText value={processedTitle} {components} />
              </h2>
              <div class="mb-6 text-black text-xl">
                <PortableText value={description} {components} />
              </div>
              {#if cta?.text && cta?.link}
                <div class="flex flex-wrap items-center -m-2">
                  <div class="w-auto p-2">
                    <a href={cta.link} class="inline-block px-8 py-4 text-center text-black font-medium tracking-tighter bg-white hover:bg-black/95 hover:text-white border-2 hover:border-black/95 border-white focus:ring-4 focus:ring-green-300 focus:ring-opacity-40 rounded-full transition duration-300">
                      {cta.text}
                    </a>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {:else}
          <!-- Content Column (Full Width) -->
          <div class="w-full p-8">
            <div class="mx-auto">
              <h2 class="font-heading mb-4 text-4xl lg:text-5xl text-black tracking-4xl lg:tracking-5xl ">
                <PortableText value={processedTitle} {components} />
              </h2>
              <div class="mb-6 text-black text-xl">
                <PortableText value={description} {components} />
              </div>
              {#if cta?.text && cta?.link}
                <div class="flex flex-wrap items-center justify-center -m-2">
                  <div class="w-auto p-2">
                    <a href={cta.link} class="inline-block px-8 py-4 text-center text-black font-medium tracking-tighter bg-white hover:bg-black/95 hover:text-white border-2 hover:border-black/95 border-white focus:ring-4 focus:ring-green-300 focus:ring-opacity-40 rounded-full transition duration-300">
                      {cta.text}
                    </a>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
      
    <div class="max-w-7xl mx-auto mt-8">
      {#if items && items.length > 0}
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

        {#if secondaryCta?.text && secondaryCta?.link}
          <div class="text-center mt-12">
            <a
              href={secondaryCta.link}
              class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300"
            >
              {secondaryCta.text}
            </a>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</section>