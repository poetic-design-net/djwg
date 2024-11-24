<script lang="ts">
  import { onMount } from 'svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { fade, slide } from 'svelte/transition';

  export let isAuthenticated: boolean;
  export let showAuthUI: boolean;
  export let onLogout: () => Promise<void>;
  export let isMobile = false;

  let showDropdown = false;
  let loading = false;

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
    <div class="relative" use:clickOutside on:click_outside={closeDropdown}>
      {#if isMobile}
        <button
          on:click={handleLogoutClick}
          class="text-white hover:text-green-500 transition-colors duration-200 flex items-center space-x-2"
          title="Abmelden"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      {:else}
        <button
          on:click={toggleDropdown}
          class="text-white hover:text-green-500 transition-colors duration-200 flex items-center space-x-2"
          title="Benutzermenü"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

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
