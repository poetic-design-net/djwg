<script lang="ts">
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { getContext } from 'svelte';

  export let user: {
    email: string;
    created_at: string;
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
  export let profile: any = null;
  export let onEdit: () => void;

  const supabase = getContext<SupabaseClient>('supabase');
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
    <div class="space-y-4">
      {#if profile?.avatar_url}
        <div class="flex items-center space-x-4">
          <img
            src={profile.avatar_url}
            alt="Profilbild"
            class="w-20 h-20 rounded-full object-cover border-2 border-green-500"
          />
        </div>
      {/if}

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

      <div class="flex items-center space-x-4">
        <div class="bg-gray-950 rounded-full p-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-gray-400">Name</p>
          <p class="text-white font-medium">{user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || ''} {user.raw_user_meta_data?.last_name || user.user_metadata?.last_name || ''}</p>
        </div>
      </div>

      {#if profile?.social_links}
        <div class="flex items-center space-x-4">
          <div class="bg-gray-950 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-gray-400 mb-2">Social Media</p>
            <div class="space-y-2">
              {#if profile.social_links.instagram}
                <a href={profile.social_links.instagram} target="_blank" class="block text-green-500 hover:text-green-400">
                  Instagram
                </a>
              {/if}
              {#if profile.social_links.facebook}
                <a href={profile.social_links.facebook} target="_blank" class="block text-green-500 hover:text-green-400">
                  Facebook
                </a>
              {/if}
              {#if profile.social_links.soundcloud}
                <a href={profile.social_links.soundcloud} target="_blank" class="block text-green-500 hover:text-green-400">
                  Soundcloud
                </a>
              {/if}
              {#if profile.social_links.linkedin}
                <a href={profile.social_links.linkedin} target="_blank" class="block text-green-500 hover:text-green-400">
                  LinkedIn
                </a>
              {/if}
            </div>
          </div>
        </div>
      {/if}

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