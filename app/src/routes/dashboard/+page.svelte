<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  import { invalidate, invalidateAll } from '$app/navigation';
  import ProfileSection from '$lib/components/dashboard/ProfileSection.svelte';
  import OnlineTalkSection from '$lib/components/dashboard/OnlineTalkSection.svelte';
  import NewsletterSection from '$lib/components/dashboard/NewsletterSection.svelte';
  import UsefulLinksSection from '$lib/components/dashboard/UsefulLinksSection.svelte';
  import BadgeDisplay from '$lib/components/badges/BadgeDisplay.svelte';
  import ProfileEdit from '$lib/components/ProfileEdit.svelte';
  import MediaUploader from '$lib/components/dashboard/MediaUploader.svelte';
  import MyFiles from '$lib/components/dashboard/MyFiles.svelte';
  import WebMaster from '$lib/components/dashboard/WebMaster.svelte';
  import type { DisplayBadge } from '$lib/types/badges';
  import { onMount } from 'svelte';

  import type { User } from '$lib/types/profile';

  export let data: {
    user: User;
    onlineTalks: {
      _id: string;
      title: string;
      date: string;
      link: string;
      password: string;
      visibleFromHours: number;
    }[];
    badges: DisplayBadge[];
    isAdmin: boolean;
  };
  
  const { user, onlineTalks, badges, isAdmin } = data;
  let showEditProfile = false;

  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;

  const handleLogout = async () => {
    if (loading) return;
    
    loading = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }

      await invalidate('supabase:auth');
      await invalidateAll();
      
      goto('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      loading = false;
    }
  };
</script>

<div class="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-medium text-white mb-2">Dashboard</h1>
        <p class="text-gray-400">Manage your profile and preferences</p>
      </div>
      <button 
        on:click={handleLogout}
        disabled={loading}
        class="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Wird abgemeldet...' : 'Abmelden'}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Profile Section -->
      <ProfileSection
        {user}
        onEdit={() => showEditProfile = true}
      />

      <!-- Badges & Useful Links Container -->
      <div class="space-y-8 h-full flex flex-col">
        <!-- Badges Section -->
        <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden flex-grow">
          <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
          <div class="relative">
            <h2 class="text-2xl font-medium text-white mb-6">Deine Badges</h2>
            <BadgeDisplay {badges} />
          </div>
        </div>

        <!-- Useful Links Section -->
        <UsefulLinksSection {isAdmin} />
      </div>

       <!-- Media Upload Section -->
       <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
        <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
        <div class="relative space-y-8">
          <MyFiles {user} let:handleUploadComplete>
            <MediaUploader 
              {user} 
              on:uploadComplete={handleUploadComplete} />
          </MyFiles>
        </div>
      </div>

      <!-- Online Talk Section -->
      <OnlineTalkSection {onlineTalks} />

      <!-- Newsletter Section -->
      <NewsletterSection 
        email={user.email} 
        firstName={user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || ''} 
        lastName={user.raw_user_meta_data?.last_name || user.user_metadata?.last_name || ''} 
      />

     <WebMaster />
    </div>
  </div>
</div>

{#if showEditProfile}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
    <div class="my-8 bg-gray-900 rounded-3xl p-8 max-w-5xl w-full relative border border-gray-800 max-h-[90vh] overflow-y-auto">
      <button
        on:click={() => showEditProfile = false}
        class="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 class="text-2xl font-medium text-white mb-6">Profil bearbeiten</h2>
      <ProfileEdit
        {user}
        on:close={() => {
          showEditProfile = false;
        }}
      />
    </div>
  </div>
{/if}

<style>
  .noise-filter {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
  }
</style>
