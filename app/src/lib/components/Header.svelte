<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { invalidate, invalidateAll } from '$app/navigation';
  import { goto } from '$app/navigation';
  import type { MenuItems } from '$lib/types/menu';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { toasts } from '$lib/stores/toast';
  import { authState } from '$lib/stores/auth';
  import { navigateToSection } from '$lib/utils/navigation';
  import MobileMenu from './MobileMenu.svelte';
  import DesktopNav from './navigation/DesktopNav.svelte';
  import HeaderAuth from './auth/HeaderAuth.svelte';
  import MegaMenu from './navigation/MegaMenu.svelte';
  import OptimizedImage from './OptimizedImage.svelte';

  export let data;
  let { user, navigation, pages, headerSettings } = data;
  $: {
    ({ user, navigation, pages, headerSettings } = data);
    console.log('Header Component Data:', {
      data,
      headerSettings,
      hasType: headerSettings?._type === 'headerSettings',
      hasLogo: !!headerSettings?.logo,
      hasAsset: !!headerSettings?.logo?.asset,
      hasUrl: !!headerSettings?.logo?.asset?.url,
      fullLogo: headerSettings?.logo
    });
  }
  $: if (!pages) pages = {};

  const supabase = getContext<SupabaseClient>('supabase');

  let isScrolled = false;
  let activeMenu: string | null = null;
  let mobileMenuOpen = false;
  let loading = false;

  // Initialize menuItems with an empty array if navigation is undefined
  let menuItems: MenuItems = [];

  $: menuItems = navigation || [];

  const handleLogout = async () => {
    if (loading) return;
    
    loading = true;
    try {
      if (!supabase) return;

      const { error } = await supabase.auth.signOut();
      if (error) return;

      // Invalidate auth state first
      await invalidate('supabase:auth');
      await invalidateAll();
      
      goto('/auth');
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

  async function handleClick(menuId: string) {
    const menuItem = menuItems.find(item => item._id === menuId);
    if (!menuItem) return;

    if (menuItem.type === 'direct') {
      // Schließe das Menü bevor wir navigieren
      activeMenu = null;
      mobileMenuOpen = false;
      document.body.style.overflow = '';
      
      await navigateToSection(menuItem, pages);
      return;
    }
    
    // Toggle mega menu for non-direct links
    activeMenu = activeMenu === menuId ? null : menuId;
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

  $: showAuthUI = !!supabase;
  $: isAuthenticated = user?.aud === 'authenticated';
</script>

<header class="fixed top-0 left-0 w-full z-[100]">
  <div class="bg-black w-full {mobileMenuOpen || isScrolled ? 'bg-opacity-100' : 'bg-opacity-100 hover:bg-opacity-100 transition-all duration-300'}">
    <div class="container mx-auto px-4 pt-2">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <a href="/" class="relative z-[110] mt-2">
          {#if headerSettings?._type === 'headerSettings' && headerSettings?.logo?.asset?.url}
            {console.log('Logo data:', JSON.stringify(headerSettings?.logo, null, 2))}
            <img
              src={headerSettings.logo.asset.url}
              alt="DJ Workshop Germany"
              class="h-20 w-auto"
              width={100}
              height={64}
            />
          {:else}
            <img src="/assets/logo.svg" alt="DJ Workshop Germany" class="h-20 w-auto" width={100} height={64}>
          {/if}
        </a>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex flex-1 items-center justify-between">
          {#if menuItems && menuItems.length > 0}
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
  </div>

  {#if menuItems && menuItems.length > 0}
    <!-- Nur Mega-Menu anzeigen, wenn ein aktives Menu vom Typ 'megamenu' existiert -->
    {#if activeMenu}
      {#if menuItems.find(item => item._id === activeMenu)?.type === 'megamenu'}
        <MegaMenu
          {activeMenu}
          {menuItems}
          onClose={closeMenu}
        />
      {/if}
    {/if}

    <MobileMenu 
      bind:isOpen={mobileMenuOpen} 
      {menuItems}
      {pages}
    />
  {/if}
</header>

<div class="h-20"></div>
