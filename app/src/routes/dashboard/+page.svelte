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
  let activeTab = 'overview';
  let showMobileTabs = false;
  const supabase = getContext<SupabaseClient>('supabase');

  const { user, profile, onlineTalks, isAdmin, videos, award } = data;

  // Tab-Definitionen
  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: '🏠' },
    { id: 'badges', label: 'Badges', icon: '🏆' },
    { id: 'videos', label: 'Videos', icon: '📺' },
    ...(isAdmin ? [{ id: 'partner', label: 'Partner', icon: '🤝' }] : []),
    ...(canShowAward(user, award) ? [{ id: 'award', label: 'DJ Award', icon: '🏅' }] : []),
    { id: 'online-talks', label: 'Online Talks', icon: '🎤' },
    { id: 'uploads', label: 'Uploads', icon: '📁' },
    { id: 'dj-holiday', label: 'DJ Urlaub', icon: '🏖️' },
    { id: 'community', label: 'Community Feed', icon: '👥' },
    { id: 'links', label: 'Links', icon: '🔗' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧' },
    { id: 'webmaster', label: 'Webmaster', icon: '🛠️' },
  ];

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
    activeTab = 'videos';
  }

  function setActiveTab(tabId: string) {
    activeTab = tabId;
    showMobileTabs = false;
  }
</script>

<div class="min-h-screen bg-black py-6 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
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

    <!-- Notifications -->
    <div class="mb-6">
      <Notifications {user} />
    </div>

    <!-- Main Dashboard Layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Mobile Tab Selector -->
      <div class="lg:hidden">
        <button
          on:click={() => showMobileTabs = !showMobileTabs}
          class="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
        >
          <span class="flex items-center gap-2">
            <span>{tabs.find(tab => tab.id === activeTab)?.icon}</span>
            <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
          </span>
          <svg class="w-5 h-5 transform transition-transform {showMobileTabs ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {#if showMobileTabs}
          <div class="mt-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {#each tabs as tab}
              <button
                on:click={() => setActiveTab(tab.id)}
                class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors {activeTab === tab.id ? 'bg-gray-700 text-white' : 'text-gray-300'}"
              >
                <span class="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Desktop Sidebar -->
      <div class="hidden lg:block w-64 flex-shrink-0">
        <div class="bg-black rounded-xl border border-gray-800 overflow-hidden">
          <div class="p-4 border-b border-gray-800">
            <h3 class="text-lg font-medium text-white">Navigation</h3>
          </div>
          <nav class="p-2">
            {#each tabs as tab}
              <button
                on:click={() => setActiveTab(tab.id)}
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors {activeTab === tab.id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
              >
                <span class="text-lg">{tab.icon}</span>
                <span class="font-medium">{tab.label}</span>
              </button>
            {/each}
          </nav>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 min-w-0">
        {#if activeTab === 'overview'}
          <!-- Overview Tab - Only Profile -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Profil Übersicht</h2>
            <ProfileSection
              {user}
              {profile}
              onEdit={() => showEditProfile = true}
            />
          </div>
        {:else if activeTab === 'badges'}
          <!-- Badges Tab -->
          <div class="relative rounded-xl p-6 border border-gray-800 bg-black overflow-hidden">
            <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
            <div class="relative">
              <h2 class="text-2xl font-medium text-white mb-4">Deine Badges</h2>
              <BadgeDisplay {user} on:openVideos={handleOpenVideos} />
            </div>
          </div>
        {:else if activeTab === 'videos'}
          <!-- Videos Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
              <h2 class="text-2xl font-medium text-white mb-4">DJ Learning Hub</h2>
            <VideosSection {videos} {user} bind:this={videosComponent} />
          </div>
        {:else if activeTab === 'partner' && isAdmin}
          <!-- Partner Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Partner</h2>
            {#if hasPartnerBadge(user)}
              <PartnerDisplay {user} />
            {:else}
              <div class="text-center py-6 space-y-3">
                <div class="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50">
                  <h3 class="text-lg font-medium text-white mb-2">Level 5 benötigt!</h3>
                  <p class="text-sm text-gray-400">Exklusive Angebote und Vergünstigungen unserer Partner - nur für dich!</p>
                  <div class="mt-3 flex justify-center">
                    <InfoIcon
                      variant="light"
                      text="Erhalte Vergünstigungen und Gutscheine von unseren Partnern! Erreiche Level 5, um Zugang zu erhalten."
                      position="bottom"
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else if activeTab === 'award' && canShowAward(user, award)}
          <!-- Award Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">DJ Award</h2>
            {#if award}
              <Award user={user} award={award} />
            {/if}
          </div>
        {:else if activeTab === 'dj-holiday'}
          <!-- DJ Holiday Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">DJ Urlaub</h2>
            <DjHoliday {user} />
          </div>
        {:else if activeTab === 'community'}
          <!-- Community Feed Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Community Feed</h2>
            {#if isAdmin}
              <SocialFeed {user} {profile} />
            {:else}
              <div class="text-center py-6 space-y-3">
                <div class="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50">
                  <h3 class="text-lg font-medium text-white mb-2">Coming Soon!</h3>
                  <p class="text-sm text-gray-400">Der Community Feed befindet sich derzeit in der Beta-Phase und wird bald für alle Mitglieder verfügbar sein.</p>
                  <div class="mt-3 flex justify-center">
                    <InfoIcon
                      variant="light"
                      text="Werde Teil der Beta und erhalte frühzeitigen Zugang zu neuen Features! Kontaktiere uns für mehr Informationen."
                      position="bottom"
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else if activeTab === 'online-talks'}
          <!-- Online Talks Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Online Talks</h2>
            <OnlineTalkSection {onlineTalks} />
          </div>
        {:else if activeTab === 'uploads'}
          <!-- Uploads Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Meine Uploads</h2>
            <MyFiles {user} let:handleUploadComplete>
              <MediaUploader
                {user}
                on:uploadComplete={handleUploadComplete}
              />
            </MyFiles>
          </div>
        {:else if activeTab === 'links'}
          <!-- Links Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Links & Ressourcen</h2>
            <UsefulLinksSection {isAdmin} />
          </div>
        {:else if activeTab === 'newsletter'}
          <!-- Newsletter Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Newsletter & WhatsApp Channel</h2>
            <NewsletterSection
              email={user.email}
              firstName={user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || ''}
              lastName={user.raw_user_meta_data?.last_name || user.user_metadata?.last_name || ''}
            />
          </div>
        {:else if activeTab === 'webmaster'}
          <!-- Webmaster Tab -->
          <div class="bg-black rounded-xl border border-gray-800 p-6">
            <h2 class="text-2xl font-medium text-white mb-4">Webmaster</h2>
            <WebMaster />
          </div>
        {/if}
      </div>
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
