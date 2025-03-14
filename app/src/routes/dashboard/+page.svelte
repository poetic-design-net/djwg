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
  import VideosSection from '$lib/components/dashboard/VideosSection.svelte';
  import CollapsibleSection from '$lib/components/dashboard/CollapsibleSection.svelte';
  import Support from '$lib/components/dashboard/Support.svelte';
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  import TooltipPortal from '$lib/components/TooltipPortal.svelte';
  import { onMount } from 'svelte';

  export let data;
  const { user, onlineTalks, isAdmin, videos } = data;

  let videosComponent: VideosSection;
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

  function handleOpenVideos() {
    if (videosComponent) {
      videosComponent.openAndScrollTo();
    }
  }
</script>

<div class="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
   <!-- Dashboard Header with better mobile responsiveness -->
<div class="mb-8 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
  <div>
    <h1 class="text-3xl sm:text-4xl font-medium text-white mb-2">Dashboard</h1>
    <p class="text-gray-400">Dein Bereich zum Lernen und Verwalten</p>
  </div>
  
  <div class="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
    <a
      href="https://buymeacoffee.com/djworkshopgermany"
      target="_blank"
      class="relative text-center justify-center flex flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-full transition duration-300 items-center gap-2"
    >
      <span>☕</span>
      <span>Support</span>
      <InfoIcon
        variant="light"
        size="sm"
        text="Mit dem Preis einer Tasse Kaffee (2,50€) unterstützt du uns dabei, noch mehr coole Features und Workshops für die DJ-Community anzubieten! 🙌"
        position="bottom" 
      />
    </a>
    
    {#if isAdmin}
      <a
        href="/admin/users"
        class="flex-1 sm:flex-none text-center px-4 sm:px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition duration-300"
      >
        <span>User</span>
      </a>
    {/if}
    
    <button
      on:click={handleLogout}
      disabled={loading}
      class="flex-1 sm:flex-none text-center px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-red-700 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Abmelden...' : 'Logout'}
    </button>
  </div>
</div>

    <div class="space-y-6">
      <!-- Profile Section -->
    
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileSection
            {user}
            onEdit={() => showEditProfile = true}
          />
          
          <!-- Badges Section -->
          <div class="relative rounded-xl p-6 border border-gray-800 overflow-hidden">
            <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
            <div class="relative">
              <h3 class="text-xl font-medium text-white mb-4">Deine Badges</h3>
              <BadgeDisplay {user} on:openVideos={handleOpenVideos} />
            </div>
          </div>
        </div>


      <!-- Videos Section -->
      <VideosSection {videos} {user} bind:this={videosComponent} />

      <!-- Online Talks Section -->
      <CollapsibleSection title="Online Talks" initiallyOpen={true}>
        <OnlineTalkSection {onlineTalks} />
      </CollapsibleSection>

      <!-- Media Section -->
      <CollapsibleSection title="Deine Uploads" initiallyOpen={false}>
        <MyFiles {user} let:handleUploadComplete>
          <MediaUploader 
            {user} 
            on:uploadComplete={handleUploadComplete} 
          />
        </MyFiles>
      </CollapsibleSection>

          <!-- Support 
          <CollapsibleSection title="Support" initiallyOpen={false}>
            <Support />
          </CollapsibleSection>-->

     

      <!-- Links & Resources -->
      <CollapsibleSection title="Links & Ressourcen" initiallyOpen={false}>
        <UsefulLinksSection {isAdmin} />
      </CollapsibleSection>

   <!-- Newsletter Section -->
   <CollapsibleSection title="Newsletter" initiallyOpen={false}>
    <NewsletterSection 
      email={user.email} 
      firstName={user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || ''} 
      lastName={user.raw_user_meta_data?.last_name || user.user_metadata?.last_name || ''} 
    />
  </CollapsibleSection>

  
        <CollapsibleSection title="Webmaster" initiallyOpen={false}>
          <WebMaster />
        </CollapsibleSection>
   
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

<TooltipPortal />


