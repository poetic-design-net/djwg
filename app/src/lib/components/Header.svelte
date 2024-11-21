<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { MenuItems, MenuKey } from '$lib/types/menu';
  import MobileMenu from './MobileMenu.svelte';

  let isScrolled = false;
  let activeMenu: MenuKey | null = null;
  let mobileMenuOpen = false;
  let megaMenuContainer: HTMLDivElement;

  const menuItems: MenuItems = {
    workshops: {
      title: 'Workshops',
      featured: {
        title: 'DJWG x Headliner Academy 2025',
        description: 'Das exklusive zweitägige DJ-Event des Jahres',
        image: '/assets/home_hero_2.jpg',
        link: '/events/dj-workshop-germany-x-headliner-academy'
      },
      columns: [
        {
          title: 'DJWG x headliner-academy',
          items: [
            { label: 'Über das Event', link: '/events/dj-workshop-germany-x-headliner-academy' },
            { label: 'Schedule', link: '/events/dj-workshop-germany-x-headliner-academy#schedule' },
            { label: 'Open Stage', link: '/events/dj-workshop-germany-x-headliner-academy#openstage' },
            { label: 'Artists', link: '/events/dj-workshop-germany-x-headliner-academy#artists' },
            { label: 'Location', link: '/events/dj-workshop-germany-x-headliner-academy#location' },
            { label: 'Tickets', link: '/events/dj-workshop-germany-x-headliner-academy#tickets' },
          ]
        },
        {
          title: 'Berlin Events',
          items: [
            { label: 'Über das Event', link: '/events/dj-workshop-germany-meets-berlin' },
          ]
        },
      ],
      quickLinks: [
        { label: 'Workshop Kalender', link: '/events' },
        { label: 'Equipment Guide', link: '/equipment' },
        { label: 'FAQ', link: '/faq' }
      ]
    },
    join: {
      title: 'Join',
      featured: {
        title: 'Werde Artist!',
        description: 'Du bist Künstler und möchtest mitwirken?',
        image: '/assets/home_hero.jpg',
        link: '/artist-werden'
      },
      columns: [
        {
          title: 'Mitmachen',
          items: [
            { label: 'Artist werden', link: '/artist-werden' },
            { label: 'Aussteller werden', link: '/partner' },
            { label: 'Community (coming soon)', link: '/community' }
          ]
        }
      ],
      quickLinks: [
        { label: 'Kontakt', link: '/kontakt' },
        { label: 'Feedback', link: '/feedback' },
        { label: 'FAQ', link: '/faq' }
      ]
    },
    about: {
      title: 'Über Uns',
      featured: {
        title: 'DJ Workshop Germany',
        description: 'Deine professionelle DJ-Ausbildung',
        image: '/nightsable-assets/images/cards/bg-image2.png',
        link: '/uber-uns'
      },
      columns: [
        {
          title: 'Unser Team',
          items: [
            { label: 'Trainer & DJs', link: '/uber-uns#team' },
            { label: 'Der Gründer', link: '/uber-uns#gruender' },
            { label: 'Unsere Geschichte', link: '/uber-uns#geschichte' },
            { label: 'Philosophie', link: '/uber-uns#philosophie' }
          ]
        },
        {
          title: 'Equipment (coming soon)',
          items: [
            { label: 'Studio Setup', link: '/equipment#studio' },
            { label: 'Workshop Equipment', link: '/equipment#workshop' },
            { label: 'Partner', link: '/equipment#partner' }
          ]
        }
      ],
      quickLinks: [
        { label: 'Kontakt', link: '/kontakt' },
        { label: 'Feedback', link: '/feedback' },
        { label: 'FAQ', link: '/faq' },
        { label: 'Presse (coming soon)', link: '/presse' }
      ]
    }
  };

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function handleMouseEnter(menu: string) {
    activeMenu = menu as MenuKey;
  }

  function handleClick(menu: string) {
    activeMenu = activeMenu === menu as MenuKey ? null : menu as MenuKey;
  }

  function handleMouseLeave() {
    activeMenu = null;
  }

  function closeMenu() {
    activeMenu = null;
  }

  $: headerBg = isScrolled || activeMenu !== null || mobileMenuOpen ? 'bg-black' : '';
</script>

<header 
  class="fixed top-0 left-0 w-full z-[100] transition-all duration-300 {headerBg}"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-20">
      <!-- Logo -->
      <a href="/" class="relative z-[110]">
        <img src="/assets/logo.svg" alt="DJ Workshop Germany" class="h-12">
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center space-x-8">
        {#each Object.entries(menuItems) as [key, menu]}
          <div class="relative">
            <button 
              class="font-heading text-white font-medium hover:text-green-500 transition-colors duration-200 py-8"
              class:text-green-500={activeMenu === key}
              on:mouseenter={() => handleMouseEnter(key)}
              on:click={() => handleClick(key)}
            >
              {menu.title}
            </button>
          </div>
        {/each}
        <a 
          href="/events" 
          class="font-heading font-medium px-6 py-3 text-white border border-green-500 hover:bg-green-500 hover:text-black rounded-full transition duration-200"
        >
          Tickets buchen
        </a>
      </nav>

      <!-- Mobile Menu Button -->
      <button 
        class="lg:hidden relative z-[110] text-white"
        on:click={() => mobileMenuOpen = !mobileMenuOpen}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if !mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Page Overlay -->
  {#if activeMenu}
    <div 
      class="fixed inset-0 bg-black/80 transition-opacity duration-300 z-[90]"
      style="top: 80px;"
      on:click={closeMenu}
      transition:fade={{ duration: 200 }}
    ></div>
  {/if}

  <!-- Mega Menu -->
  {#if activeMenu && menuItems[activeMenu]}
    <div 
      bind:this={megaMenuContainer}
      class="absolute top-full left-0 w-full bg-black border-t border-b border-gray-900/30 z-[95]"
      transition:slide={{ duration: 200, easing: quintOut }}
      on:mouseleave={handleMouseLeave}
    >
      <!-- Close Button -->
      <button 
        class="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors duration-200"
        on:click={closeMenu}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-12 gap-8">
          <!-- Featured Content -->
          <div class="col-span-4">
            <a 
              href={menuItems[activeMenu].featured.link} 
              class="block group"
              on:click={closeMenu}
            >
              <div class="relative rounded-3xl overflow-hidden mb-4 aspect-video">
                <img 
                  src={menuItems[activeMenu].featured.image} 
                  alt={menuItems[activeMenu].featured.title}
                  class="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                >
                <div class="absolute inset-0 bg-black/40"></div>
              </div>
              <h3 class="font-heading text-xl text-white mb-2 group-hover:text-green-500 transition duration-200">
                {menuItems[activeMenu].featured.title}
              </h3>
              <p class="text-gray-400">
                {menuItems[activeMenu].featured.description}
              </p>
            </a>
          </div>

          <!-- Menu Columns -->
          {#each menuItems[activeMenu].columns as column}
            <div class="col-span-2">
              <h4 class="font-heading text-sm text-green-500 font-medium mb-4">{column.title}</h4>
              <ul class="space-y-2">
                {#each column.items as item}
                  <li>
                    <a 
                      href={item.link} 
                      class="font-heading text-gray-300 hover:text-white transition duration-200"
                      on:click={closeMenu}
                    >
                      {item.label}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}

          <!-- Quick Links -->
          <div class="col-span-2">
            <h4 class="font-heading text-sm text-green-500 font-medium mb-4">Quick Links</h4>
            <ul class="space-y-2">
              {#each menuItems[activeMenu].quickLinks as link}
                <li>
                  <a 
                    href={link.link} 
                    class="font-heading text-gray-300 hover:text-white transition duration-200"
                    on:click={closeMenu}
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Mobile Menu -->
  <MobileMenu bind:isOpen={mobileMenuOpen} {menuItems} />
</header>

<!-- Spacer to prevent content from hiding under fixed header -->
<div class="h-20"></div>

<style>
  button {
    text-align: left;
  }
</style>
