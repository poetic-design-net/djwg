<script lang="ts">
  export let isAdmin: boolean = false;

  const links = [
    {
      href: '/events',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      text: 'Upcoming Events'
    },
    {
      href: '/faq',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      text: 'FAQ'
    },
    {
      href: '/feedback',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
      text: 'Feedback'
    }
  ];

  $: allLinks = isAdmin ? [
    ...links,
    {
      href: '/admin',
      icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      text: 'Admin Dashboard'
    }
  ] : links;
</script>

<div class="relative rounded-3xl p-8 border border-gray-800/40 overflow-hidden flex-grow">
  <div class="absolute inset-0 mix-blend-overlay "></div>
  <div class="relative">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each allLinks as link}
        <a 
          href={link.href} 
          class="group flex items-center space-x-3 p-4 rounded-xl bg-gray-950 hover:bg-green-500 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={link.icon} />
          </svg>
          <span class="text-white group-hover:text-black transition-colors duration-200">{link.text}</span>
        </a>
      {/each}
    </div>
  </div>
</div>

