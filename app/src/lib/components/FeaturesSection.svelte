<script lang="ts">
  import { fade } from 'svelte/transition';
  import { PortableText } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import Icon from './icons/Icon.svelte';

  type IconType = 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';

  interface Feature {
    icon: string;
    title: string;
    description: string;
  }

  export let title: PortableTextBlock[] | string = '';
  export let description: string = '';
  export let features: Feature[] = [];
  export let layout: 'grid' | 'list' = 'grid';
  export let backgroundColor: 'black' | 'darkGray' = 'black';

  function validateIcon(icon: string): IconType {
    const validIcons: IconType[] = ['mixer', 'headphones', 'vinyl', 'laptop', 'microphone', 'controller'];
    return validIcons.includes(icon as IconType) ? icon as IconType : 'mixer';
  }

  $: processedTitle = typeof title === 'string' ? [{
    _type: 'block',
    children: [{ _type: 'span', text: title }]
  }] : title;

  $: bgClass = backgroundColor === 'darkGray' ? 'bg-gray-900/40' : 'bg-black/40';
</script>

<section class="py-20 {bgClass}">
  <div class="container px-4 mx-auto">
    <!-- Header -->
    <div class="mb-20 md:max-w-3xl text-center mx-auto">
      {#if title}
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter mb-6">
          <PortableText value={processedTitle} />
        </h2>
      {/if}
      {#if description}
        <p class="text-xl text-gray-300">{description}</p>
      {/if}
    </div>

    <!-- Features -->
    <div class="{layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-12'}">
      {#each features as feature, i}
        <div 
          class="group"
          in:fade={{delay: i * 100, duration: 300}}
        >
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300 h-full">
            <div class="flex items-start gap-6 mb-6">
              <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/10">
                <Icon name={validateIcon(feature.icon)} size={24} class_name="text-green-400" />
              </div>
              <div>
                <h3 class="text-xl text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p class="text-gray-300">{feature.description}</p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  /* Add any additional custom styles here */
</style>