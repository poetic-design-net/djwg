<script lang="ts">
  import { getContext } from 'svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { fade, slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import OptimizedAvatar from '$lib/components/OptimizedAvatar.svelte';
  import { profileStore } from '$lib/stores/profile';
  import { badgeStore } from '$lib/stores/badges';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Profile } from '$lib/types/profile';

  export let isAuthenticated: boolean;
  export let showAuthUI: boolean;
  export let onLogout: () => Promise<void>;
  export let isMobile = false;

  let showDropdown = false;
  let loading = false;

  const supabase = getContext<SupabaseClient>('supabase');

  // Profil beim Initialisieren laden
  async function initializeProfile() {
    if (!isAuthenticated) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await profileStore.refresh(supabase, user.id);
    }
    
    // Debug Ausgabe
    console.log('ProfileStore nach Initialisierung:', $profileStore);
  }

  // Bei Änderung des Auth-Status Profil aktualisieren
  $: if (isAuthenticated) {
    initializeProfile();
  }

  const handleLogoutClick = async () => {
    if (loading) return;
    
    loading = true;
    try {
      await onLogout();
    } finally {
      loading = false;
      showDropdown = false;
    }
  };

  const toggleDropdown = () => {
    showDropdown = !showDropdown;
  };

  const closeDropdown = () => {
    showDropdown = false;
  };
</script>

{#if showAuthUI}
  {#if isAuthenticated}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div 
      class="relative" 
      use:clickOutside 
      on:click_outside={closeDropdown}
    >
      {#if isMobile}
        <button
          on:click={async () => {
            loading = true;
            await goto('/dashboard');
            loading = false;
          }}
          disabled={loading}
          class="text-white hover:text-green-500 transition-colors duration-200 flex items-center space-x-2 relative"
          title="Dashboard"
        >
          <div class:opacity-50={loading}>
            {#if $profileStore && $profileStore.avatar_url}
              <OptimizedAvatar
                image={$profileStore.avatar_url}
                size="sm"
              />
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            {/if}
          </div>
          {#if loading}
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          {/if}
        </button>
      {:else}
        <div class="flex items-center space-x-4">
          <button
            on:click={toggleDropdown}
            class="text-white hover:text-green-500 transition-colors duration-200 flex items-center space-x-2"
            title="Benutzermenü"
          >
            {#if $profileStore && $profileStore.avatar_url}
              <OptimizedAvatar
                image={$profileStore.avatar_url}
                size="sm"
              />
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            {/if}
          </button>
        </div>

        {#if showDropdown}
          <div
            transition:slide={{ duration: 200 }}
            class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          >
            <div class="py-1">
              <a
                href="/dashboard"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                on:click={closeDropdown}
              >
                Dashboard
              </a>
              <button
                on:click={handleLogoutClick}
                disabled={loading}
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird abgemeldet...' : 'Abmelden'}
              </button>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {:else}
    <a
      href="/auth"
      class="text-white hover:text-green-500 transition-colors duration-200 flex items-center space-x-2"
      title="Anmelden"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
    </a>
  {/if}
{/if}

<style>
  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
