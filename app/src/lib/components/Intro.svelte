<script lang="ts">
  import { client } from '$lib/sanity/client';
  import type { KnowledgeBaseItem } from '$lib/sanity/queries';
  import { featuredKnowledgeBaseItemsQuery } from '$lib/sanity/queries';

  export let items: KnowledgeBaseItem[] = [];

  const defaultItems = [
    {
      _id: '1',
      title: 'Professionelles Equipment',
      description: 'Lerne an professionellem Club-Equipment von Pioneer DJ, Denon DJ und mehr.',
      icon: 'mixer',
      category: 'equipment'
    },
    {
      _id: '2',
      title: 'Erfahrene Trainer',
      description: 'Profitiere vom Wissen aktiver DJs mit jahrelanger Club- und Festival-Erfahrung.',
      icon: 'headphones',
      category: 'performance'
    },
    {
      _id: '3',
      title: 'Praxisorientiert',
      description: 'Wir setzen auf Learning by Doing. Bei uns lernst du das DJing von der Pike auf.',
      icon: 'vinyl',
      category: 'mixing'
    }
  ];

  $: displayItems = items.length > 0 ? items : defaultItems;

  function getIconSvg(icon: string) {
    switch (icon) {
      case 'mixer':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />`;
      case 'headphones':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />`;
      case 'vinyl':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />`;
      case 'laptop':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />`;
      case 'microphone':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />`;
      case 'controller':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />`;
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />`;
    }
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
            <h2 class="font-heading mb-4 text-5xl lg:text-7xl text-black tracking-5xl lg:tracking-7xl">Werde zum <span class="block">DJ-Profi</span></h2>
            <p class="mb-6 text-black text-xl">Entdecke die Kunst des DJings mit professionellen Workshops für Anfänger und Fortgeschrittene. Von Mixing-Techniken bis zur Crowd Control - wir bringen dich auf das nächste Level.</p>
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
      {#each displayItems as item}
        <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 flex items-center justify-center bg-green-400/10 rounded-xl mr-4">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {@html getIconSvg(item.icon)}
              </svg>
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
