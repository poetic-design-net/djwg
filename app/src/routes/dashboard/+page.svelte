<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { User, Profile } from '$lib/types/profile';
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
  import SocialFeed from '$lib/components/dashboard/SocialFeed.svelte';
  import { onMount } from 'svelte';
  import Award from '$lib/components/dashboard/Award.svelte';
  import DjHoliday from '$lib/components/dashboard/DjHoliday.svelte';
  import Notifications from '$lib/components/dashboard/Notifications.svelte';
  import PartnerDisplay from '$lib/components/partners/PartnerDisplay.svelte';

  interface OnlineTalk {
    _id: string;
    title: string;
    date: string;
    link: string;
    password: string;
    visibleFromHours: number;
  }

  interface DashboardData {
    processInfo: any[];
    surveyUrl: string;
    submissionStart: string;
    submissionEnd: string;
    isActive: boolean;
  }

  interface Badge {
    badge_id: string;
  }

  interface PageData {
    user: User & {
      badges?: Badge[];
    };
    profile: Profile;
    onlineTalks: OnlineTalk[];
    isAdmin: boolean;
    videos: Record<string, any>;
    award: { dashboard: DashboardData } | null;
  }

  const AWARD_BADGE_ID = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1';
  const DJ_URLAUB_BADGE_ID = '551d9015-aa13-4117-8776-b59f1aaade9b';
  const PARTNER_BADGE_ID = 'b83547a4-fdbf-4ff8-8bec-0ea5666a0ac5';

  export let data: PageData;

  const hasAwardBadge = (user: PageData['user']) => {
    return user.badges?.some((badge: Badge) => badge.badge_id === AWARD_BADGE_ID) || false;
  };

  const hasPartnerBadge = (user: PageData['user']) => {
    return user.badges?.some((badge: Badge) => badge.badge_id === PARTNER_BADGE_ID) || false;
  };

  function canShowAward(user: PageData['user'], award: PageData['award']): boolean {
    return hasAwardBadge(user) && award !== null && award.dashboard && award.dashboard.isActive;
  };

  let loading = false;
  let showEditProfile = false;
  let videosComponent: VideosSection;
  const supabase = getContext<SupabaseClient>('supabase');

  const { user, profile, onlineTalks, isAdmin, videos, award } = data;

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
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">

       <!-- Benachrichtigungen -->
       <div class="md:col-span-12">
        <Notifications {user} />
      </div>

        <div class="md:col-span-4">
          <ProfileSection
            {user}
            {profile}    
            onEdit={() => showEditProfile = true}
          />
        </div>
        
 

        <!-- Badges Section -->
        <div class="relative rounded-xl p-6 border border-gray-800 overflow-hidden md:col-span-8">
          <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
          <div class="relative">
            <h3 class="text-xl font-medium text-white mb-4">Deine Badges</h3>
            <BadgeDisplay {user} on:openVideos={handleOpenVideos} />
          </div>
        </div>
      </div>

      <!-- Videos Section -->
      <VideosSection {videos} {user} bind:this={videosComponent} />

      <!-- Partner Section (Admin Only - Testing) -->
      {#if isAdmin}
        <CollapsibleSection title="Partner" initiallyOpen={false}>
          {#if hasPartnerBadge(user)}
            <PartnerDisplay {user} />
          {:else}
            <div class="text-center py-8 space-y-4">
              <div class="bg-gray-800/70 rounded-lg p-6 border border-gray-700/50">
                <h3 class="text-xl font-medium text-white mb-3">Level 5 benötigt!</h3>
                <p class="text-gray-400">Exklusive Angebote und Vergünstigungen unserer Partner - nur für dich!</p>
                <div class="mt-4 flex justify-center">
                  <InfoIcon
                    variant="light"
                    text="Erhalte Vergünstigungen und Gutscheine von unseren Partnern! Erreiche Level 5, um Zugang zu erhalten."
                    position="bottom"
                  />
                </div>
              </div>
            </div>
          {/if}
        </CollapsibleSection>
      {/if}
    

      <!-- Award Section -->
      {#if canShowAward(user, award)}
        <CollapsibleSection title="DJ Award" initiallyOpen={false}>
          {#if award}
            <Award user={user} award={award} />
          {/if}
        </CollapsibleSection>
      {/if}

      <!-- DJ Urlaub Section -->
      <CollapsibleSection title="DJ Urlaub" initiallyOpen={false}>
        <DjHoliday {user} />
      </CollapsibleSection>

      <!-- Social Feed Section -->
      <CollapsibleSection title="Community Feed" initiallyOpen={false}>
        {#if isAdmin}
          <SocialFeed {user} {profile} />
        {:else}
          <div class="text-center py-8 space-y-4">
            <div class="bg-gray-800/70 rounded-lg p-6 border border-gray-700/50">
              <h3 class="text-xl font-medium text-white mb-3">Coming Soon!</h3>
              <p class="text-gray-400">Der Community Feed befindet sich derzeit in der Beta-Phase und wird bald für alle Mitglieder verfügbar sein.</p>
              <div class="mt-4 flex justify-center">
                <InfoIcon
                  variant="light"
                  text="Werde Teil der Beta und erhalte frühzeitigen Zugang zu neuen Features! Kontaktiere uns für mehr Informationen."
                  position="bottom"
                />
              </div>
            </div>
          </div>
        {/if}
      </CollapsibleSection>

      <!-- Online Talks Section -->
      <CollapsibleSection title="Online Talks" initiallyOpen={false}>
        <OnlineTalkSection {onlineTalks} />
      </CollapsibleSection>

      <!-- Media Section -->
      <CollapsibleSection title="Meine Uploads" initiallyOpen={false}>
        <MyFiles {user} let:handleUploadComplete>
          <MediaUploader 
            {user} 
            on:uploadComplete={handleUploadComplete} 
          />
        </MyFiles>
      </CollapsibleSection>
           
      <!-- Links & Resources -->
      <CollapsibleSection title="Links & Ressourcen" initiallyOpen={false}>
        <UsefulLinksSection {isAdmin} />
      </CollapsibleSection>

      <!-- Newsletter Section -->
      <CollapsibleSection title="Newsletter & WhatsApp Channel" initiallyOpen={false}>
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
        {profile}
        on:close={async () => {
          showEditProfile = false;
          await invalidate('app:profile');
        }}
      />
    </div>
  </div>
{/if}

<TooltipPortal />
