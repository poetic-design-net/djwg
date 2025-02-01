<script lang="ts">
  const links = [
    {
      href: '/events',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      text: 'Upcoming Events'
    },
    {
      href: '/equipment',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      text: 'Equipment Guide'
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
</script>

<div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden flex-grow">
  <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
  <div class="relative">
    <h2 class="text-2xl font-medium text-white mb-6">Useful Links</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each links as link}
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

<style>
  .noise-filter {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
  }
</style>