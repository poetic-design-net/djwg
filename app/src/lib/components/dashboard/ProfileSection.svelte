<script lang="ts">
  import { calculateProfileCompletion, normalizeUserMetadata } from '$lib/utils/profile-utils';
  import OptimizedAvatar from '$lib/components/OptimizedAvatar.svelte';
  import AvatarUpload from '$lib/components/profile/AvatarUpload.svelte';
  import type { User, Profile } from '$lib/types/profile';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { getContext, createEventDispatcher } from 'svelte';
  import { profileStore } from '$lib/stores/profile';

  const dispatch = createEventDispatcher();

  export let user: User;
  export let onEdit: () => void;

  let isSocialExpanded = false;
  let isBasicInfoExpanded = false;
  let isAdditionalInfoExpanded = false;

  const supabase = getContext<SupabaseClient>('supabase');

  // Funktion zum Dispatchen des profileUpdated Events
  function handleProfileUpdate() {
    profileStore.refresh(supabase, user.id);
    dispatch('profileUpdated');
  }
  
  // Normalisiere die Benutzerdaten
  $: normalizedMetadata = normalizeUserMetadata(user);
  $: firstName = normalizedMetadata.first_name || $profileStore?.first_name || '';
  $: lastName = normalizedMetadata.last_name || $profileStore?.last_name || '';

  // Extrahiere Avatar URL mit Fallback-Logik
  $: displayAvatar = $profileStore?.avatar_url || '';
  $: completionPercentage = calculateProfileCompletion(
    $profileStore || {},
    $profileStore?.social_links || { instagram: '', facebook: '', soundcloud: '' }
  );
</script>

<div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
  <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
  <div class="relative">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-2xl font-medium text-white">Profile Information</h2>
      <button
        on:click={onEdit}
        class="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition duration-300"
      >
        Bearbeiten
      </button>
    </div>

    <!-- Fortschrittsbalken -->
    <div class="w-full bg-gray-800 rounded-full h-4 overflow-hidden mb-6">
      <div
        class="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
        style="width: {completionPercentage}%"
      />
      <div class="text-center text-sm text-gray-400 mt-1">
        Profil zu {completionPercentage}% vollständig
      </div>
    </div>

    <div class="space-y-4">
      <!-- Avatar Upload -->
      <AvatarUpload
        {user}
        avatarUrl={displayAvatar}
        firstName={firstName}
        lastName={lastName}
        on:profileUpdated={handleProfileUpdate}
      />

      <!-- Email -->
      <div class="flex items-center space-x-4">
        <div class="bg-gray-950 rounded-full p-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-gray-400">Email</p>
          <p class="text-white font-medium">{user.email}</p>
        </div>
      </div>

      <!-- Username -->
      {#if $profileStore?.username}
        <div class="flex items-center space-x-4">
          <div class="bg-gray-950 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-400">Username</p>
            <p class="text-white font-medium">@{$profileStore.username}</p>
          </div>
        </div>
      {/if}

      <!-- Basic Info Section -->
      <div class="flex items-center space-x-4">
        <button 
          class="bg-gray-950 rounded-full p-4 hover:bg-gray-900 transition-colors duration-200" 
          on:click={() => isBasicInfoExpanded = !isBasicInfoExpanded}
          aria-expanded={isBasicInfoExpanded}
          aria-label="Basis-Informationen anzeigen/ausblenden"
        >
          <div class="transform transition-transform duration-200" class:rotate-180={!isBasicInfoExpanded}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="flex-1">
          <p class="text-gray-400">Basis-Informationen <span class="text-sm">(klicken zum Auf-/Zuklappen)</span></p>
        </div>
      </div>

      {#if isBasicInfoExpanded}
        <div class="space-y-4 pl-16 mt-4">
          <!-- Name -->
          <div class="flex items-center space-x-4">
            <div class="bg-gray-950 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-gray-400">Name</p>
              <p class="text-white font-medium">
                {#if firstName || lastName}
                  {firstName} {lastName}
                {:else}
                  Nicht angegeben
                {/if}
              </p>
            </div>
          </div>

          <!-- Bio -->
          {#if $profileStore?.bio}
            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Bio</p>
                <p class="text-white font-medium">{$profileStore.bio}</p>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Additional Info Section -->
      <div class="flex items-center space-x-4 mt-4">
        <button 
          class="bg-gray-950 rounded-full p-4 hover:bg-gray-900 transition-colors duration-200" 
          on:click={() => isAdditionalInfoExpanded = !isAdditionalInfoExpanded}
          aria-expanded={isAdditionalInfoExpanded}
          aria-label="Weitere Informationen anzeigen/ausblenden"
        >
          <div class="transform transition-transform duration-200" class:rotate-180={!isAdditionalInfoExpanded}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="flex-1">
          <p class="text-gray-400">Weitere Informationen <span class="text-sm">(klicken zum Auf-/Zuklappen)</span></p>
        </div>
      </div>

      {#if isAdditionalInfoExpanded}
        <div class="space-y-4 pl-16 mt-4">
          <!-- Social Links -->
          {#if $profileStore?.social_links}
            <div class="flex items-center space-x-4">
              <button 
                class="bg-gray-950 rounded-full p-4 hover:bg-gray-900 transition-colors duration-200" 
                on:click={() => isSocialExpanded = !isSocialExpanded}
                aria-expanded={isSocialExpanded}
                aria-label="Social Media Links anzeigen/ausblenden"
              >
                <div class="transform transition-transform duration-200" class:rotate-180={!isSocialExpanded}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div class="flex-1">
                <p class="text-gray-400 mb-2">Social Media <span class="text-sm">(klicken zum Auf-/Zuklappen)</span></p>
                <div 
                  class="space-y-2 transition-all duration-300"
                  class:h-auto={isSocialExpanded}
                  class:h-0={!isSocialExpanded}
                  class:opacity-100={isSocialExpanded}
                  class:opacity-0={!isSocialExpanded}
                  class:overflow-hidden={!isSocialExpanded}
                >
                  {#if $profileStore.social_links.instagram}
                    <a href={$profileStore.social_links.instagram} target="_blank" class="block text-green-500 hover:text-green-400">
                      Instagram
                    </a>
                  {/if}
                  {#if $profileStore.social_links.facebook}
                    <a href={$profileStore.social_links.facebook} target="_blank" class="block text-green-500 hover:text-green-400">
                      Facebook
                    </a>
                  {/if}
                  {#if $profileStore.social_links.soundcloud}
                    <a href={$profileStore.social_links.soundcloud} target="_blank" class="block text-green-500 hover:text-green-400">
                      Soundcloud
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          {/if}

          <!-- Website -->
          {#if $profileStore?.website}
            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Website</p>
                <a href={$profileStore.website} target="_blank" class="text-green-500 hover:text-green-400 font-medium">
                  {$profileStore.website}
                </a>
              </div>
            </div>
          {/if}

          <!-- Member Since -->
          <div class="flex items-center space-x-4">
            <div class="bg-gray-950 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-gray-400">Member Since</p>
              <p class="text-white font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      {/if}
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
