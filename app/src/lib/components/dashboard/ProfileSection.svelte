<script lang="ts">
  import { calculateProfileCompletion, normalizeUserMetadata } from '$lib/utils/profile-utils';
  import { generateSocialMediaLinks } from '$lib/utils/social-media-utils';
  import { profileProgress } from '$lib/stores/profile-progress';
  import { toasts } from '$lib/stores/toast';
  import OptimizedAvatar from '$lib/components/OptimizedAvatar.svelte';
  import AvatarUpload from '$lib/components/profile/AvatarUpload.svelte';
  import type { User, Profile } from '$lib/types/profile';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { getContext, createEventDispatcher } from 'svelte';
 
  const dispatch = createEventDispatcher();

  export let user: User;
  export let profile: Profile | null;
  export let onEdit: () => void;

  let isSocialExpanded = false;
  let isBasicInfoExpanded = false;
  let isAdditionalInfoExpanded = false;

  const supabase = getContext<SupabaseClient>('supabase');

  // Normalisiere die Benutzerdaten
  $: normalizedMetadata = normalizeUserMetadata(user);
  $: firstName = normalizedMetadata.first_name || profile?.first_name || '';
  $: lastName = normalizedMetadata.last_name || profile?.last_name || '';

  // Extrahiere Avatar URL mit Fallback-Logik
  $: displayAvatar = profile?.avatar_url || '';
  
  // Aktualisiere den Store bei Profiländerungen
  $: if (profile) {
    profileProgress.update(
      profile,
      profile.social_links || { instagram: '', facebook: '', soundcloud: '' }
    );
  }

  // Verwende den Store für den Fortschritt
  $: completionPercentage = $profileProgress.percentage;

  // Handler für Avatar-Updates
  function handleProfileUpdate(event: CustomEvent) {
    if (event.detail?.profile) {
      const updatedProfile = event.detail.profile as Profile;
      profile = updatedProfile;
      
      // Aktualisiere Store und Progress
      setTimeout(() => {
        profileProgress.update(
          updatedProfile,
          updatedProfile.social_links || { instagram: '', facebook: '', soundcloud: '' }
        );
      }, 100);
    }
  }
</script>

<div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
  <div class="absolute inset-0 mix-blend-overlay "></div>
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
    <div class="w-full bg-gray-800/40 rounded-full h-4 overflow-hidden mb-6">
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
      {#if profile?.username}
        <div class="flex items-center space-x-4">
          <div class="bg-gray-950 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-400">Username</p>
            <p class="text-white font-medium">@{profile.username}</p>
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
          {#if profile?.bio}
            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Bio</p>
                <p class="text-white font-medium">{profile.bio}</p>
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
          {#if profile?.social_links}
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
                  {#if profile.social_links.instagram}
                    <a href={generateSocialMediaLinks(profile.social_links.instagram, 'instagram')} target="_blank" class="block text-green-500 hover:text-green-400">
                      Instagram
                    </a>
                  {/if}
                  {#if profile.social_links.facebook}
                    <a href={generateSocialMediaLinks(profile.social_links.facebook, 'facebook')} target="_blank" class="block text-green-500 hover:text-green-400">
                      Facebook
                    </a>
                  {/if}
                  {#if profile.social_links.soundcloud}
                    <a href={generateSocialMediaLinks(profile.social_links.soundcloud, 'soundcloud')} target="_blank" class="block text-green-500 hover:text-green-400">
                      Soundcloud
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          {/if}

          <!-- Website -->
          {#if profile?.website}
            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Website</p>
                <a href={profile.website} target="_blank" class="text-green-500 hover:text-green-400 font-medium">
                  {profile.website}
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
