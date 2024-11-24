<script lang="ts">
  import { client } from '$lib/sanity/client';
  import type { PortableTextComponents } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import { PortableText } from '@portabletext/svelte';
  import Icon from './icons/Icon.svelte';
  import type { KnowledgeBaseItem } from '$lib/sanity/queries/content';

  type IconType = 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';

  interface IntroProps {
    items?: KnowledgeBaseItem[];
    title?: PortableTextBlock[];
    description?: string;
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

  const components: Partial<PortableTextComponents> = {};

  function validateIcon(icon: string): IconType {
    const validIcons: IconType[] = ['mixer', 'headphones', 'vinyl', 'laptop', 'microphone', 'controller'];
    return validIcons.includes(icon as IconType) ? icon as IconType : 'mixer';
  }
</script>

<div class="container px-4 mx-auto">
    <div class="relative p-6 sm:p-12 bg-green-500 border-b bg-gradient-radial-dark  border-blueGray-900 rounded-5xl">
      <div class="flex flex-wrap lg:items-center -m-8">
        <div class="w-full md:w-1/2 p-8 order-2 md:order-1">
          <img class="relative rounded-xl" src="assets/home_hero.jpg" alt="DJ Workshop">
        </div>
        <div class="w-full md:w-1/2 p-8 order-1 md:order-2">
          <div class="md:max-w-md">
            <h2 class="font-heading mb-4 text-5xl lg:text-7xl text-black tracking-5xl lg:tracking-7xl">
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

    <!-- Knowledge Base Button -->
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
