<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { invalidate, invalidateAll } from '$app/navigation';
  import { goto } from '$app/navigation';
  import type { MenuItems, MenuKey } from '$lib/types/menu';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { toasts } from '$lib/stores/toast';
  import { authState } from '$lib/stores/auth';
  import { navigateToSection } from '$lib/utils/navigation';
  import MobileMenu from './MobileMenu.svelte';
  import DesktopNav from './navigation/DesktopNav.svelte';
  import HeaderAuth from './auth/HeaderAuth.svelte';
  import MegaMenu from './navigation/MegaMenu.svelte';

  export let data;
  let { user, navigation, pages } = data || {};
  $: ({ user, navigation, pages } = data || {});
  $: if (!pages) {
    console.warn('Pages data is missing:', data);
    pages = {};
  }

  const supabase = getContext<SupabaseClient>('supabase');

  let isScrolled = false;
  let activeMenu: MenuKey | null = null;
  let mobileMenuOpen = false;
  let loading = false;

  // Initialize menuItems with an empty object if navigation is undefined
  let menuItems: MenuItems = {
    workshops: undefined,
    join: undefined,
    about: undefined
  };

  $: {
    menuItems = navigation || {
      workshops: undefined,
      join: undefined,
      about: undefined
    };
    console.log('Header menuItems:', JSON.stringify(menuItems, null, 2));
    console.log('Header pages:', JSON.stringify(pages, null, 2));
    console.log('Navigation raw data:', JSON.stringify(navigation, null, 2));
  }

  const handleLogout = async () => {
    if (loading) return;
    
    loading = true;
    try {
      if (!supabase) {
        console.error('Supabase client not available');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }

      // Invalidate auth state first
      await invalidate('supabase:auth');
      await invalidateAll();
      
      goto('/auth');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  async function handleClick(menu: MenuKey) {
    const menuItem = menuItems[menu];
    if (!menuItem) return;

    if (menuItem.type === 'direct') {
      console.log('Handling direct link click:', { menuItem, pages });
      await navigateToSection(menuItem, pages);
      return;
    }
    
    // Toggle mega menu for non-direct links
    activeMenu = activeMenu === menu ? null : menu;
  }

  function closeMenu() {
    activeMenu = null;
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  $: headerBg = isScrolled || activeMenu !== null || mobileMenuOpen ? 'bg-black' : '';
  $: showAuthUI = !!supabase;
  $: isAuthenticated = user?.aud === 'authenticated';
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
      <div class="hidden lg:flex flex-1 items-center justify-between pl-8">
        {#if menuItems && Object.values(menuItems).some(item => item !== undefined)}
          <DesktopNav 
            {menuItems}
            {activeMenu}
            onClick={handleClick}
            {pages}
          />
        {/if}

        <!-- Right Side Items -->
        <div class="flex items-center space-x-8">
          <a 
            href="/events" 
            class="font-heading font-medium px-6 py-3 text-white border border-green-500 hover:bg-green-500 hover:text-black rounded-full transition duration-200"
          >
            Tickets buchen
          </a>

          <HeaderAuth
            {isAuthenticated}
            {showAuthUI}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <!-- Mobile Menu Button and Auth -->
      <div class="lg:hidden flex items-center space-x-4">
        <HeaderAuth
          {isAuthenticated}
          {showAuthUI}
          onLogout={handleLogout}
          isMobile={true}
        />
        
        <button 
          class="relative z-[110] text-white p-2"
          on:click={toggleMobileMenu}
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
  </div>

  {#if menuItems && Object.values(menuItems).some(item => item !== undefined)}
    <!-- Nur Mega-Menu anzeigen, wenn ein aktives Menu vom Typ 'megamenu' existiert -->
    {#if activeMenu && menuItems[activeMenu]?.type === 'megamenu'}
      <MegaMenu
        {activeMenu}
        {menuItems}
        onClose={closeMenu}
      />
    {/if}

    <MobileMenu 
      bind:isOpen={mobileMenuOpen} 
      {menuItems}
      {pages}
    />
  {/if}
</header>

<div class="h-20"></div>
