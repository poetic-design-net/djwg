<script lang="ts">
  import { badgeStore } from '$lib/stores/badges';
  import { getContext, onMount, onDestroy } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { User, Profile } from '$lib/types/profile';
  import type { Badge } from '$lib/types/badge';
  import { manageBadgesRealtime } from '$lib/services/badge-service';

  export let user: User;
  const supabase = getContext<SupabaseClient>('supabase');

  // Alle verfügbaren Badges aus der Datenbank
  let availableBadges: Badge[] = [];

  // Lade alle verfügbaren Badges
  async function loadAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data && !error)
      availableBadges = data;
  }

  // Profil-Daten für Echtzeit-Überwachung
  let profile: Profile | null = null;
  let profileSubscription: any;

  // Lade Badges und richte Echtzeit-Überwachung ein
  onMount(async () => {
    // Lade alle verfügbaren Badges
    await loadAllBadges();

    // Lade Badges initial
    badgeStore.loadBadges(supabase, user.id);
    
    // Lade das aktuelle Profil
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (data) {
      profile = data;
      // Prüfe initial, ob Badges aktualisiert werden müssen
      manageBadgesRealtime(supabase, user.id, profile);
    }
    
    // Abonniere Profiländerungen für Echtzeit-Updates
    profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          // Aktualisiere das lokale Profil
          profile = payload.new as Profile;
          // Prüfe, ob Badges aktualisiert werden müssen
          await manageBadgesRealtime(supabase, user.id, profile);
        }
      )
      .subscribe();
  });
  
  // Bereinige Abonnements beim Komponenten-Abbau
  onDestroy(() => {
    if (profileSubscription) {
      supabase.removeChannel(profileSubscription);
    }
  });

  $: unlockedBadges = availableBadges.filter(b => 
    $badgeStore.userBadges.some(ub => ub.badge_id === b.id)
  );
  
  $: lockedBadges = availableBadges.filter(b => 
    !$badgeStore.userBadges.some(ub => ub.badge_id === b.id)
  );

  function getBadgeColor(badge: Badge): string {
    if (badge.style?.customColor?.hex) {
      return badge.style.customColor.hex;
    }
    
    switch (badge.style?.variant) {
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
      case 'premium':
        return '#50C878';
      default:
        return '#50C878';
    }
  }
</script>

<div class="space-y-8">
  <!-- Freigeschaltete Badges -->
  {#if unlockedBadges.length > 0}
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Freigeschaltete Badges</h2>
        <a 
          href="/videos" 
          class="text-green-500 hover:text-green-400 text-sm flex items-center gap-1 transition-colors"
        >
          <span>Zu den Videos</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
      <p class="text-sm text-gray-400 -mt-2 mb-3">Mit deinen Badges kannst du auf exklusive DJ Workshop Videos zugreifen.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each unlockedBadges as badge (badge.id)}
          <div class="relative group">
            <div 
              class="flex items-center space-x-2 p-3 rounded-xl border border-gray-800 bg-gray-950 hover:border-green-500 transition-all duration-200"
            >
              <div
                class="w-12 h-12 flex items-center justify-center rounded-full"
                style="background-color: {getBadgeColor(badge)}"
              >
                <span class="text-black text-lg font-medium">
                  {badge.name.charAt(0)}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">{badge.name}</p>
                {#if badge.description}
                  <p class="text-sm text-gray-400">{badge.description}</p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Nicht freigeschaltete Badges -->
  {#if lockedBadges.length > 0}
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Verfügbare Badges</h2>
      </div>
      <a 
      href="/videos" 
      class="text-green-500 hover:text-green-400 text-sm flex items-center gap-1 transition-colors"
    >
      <span>Zu den Videos</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
      <p class="text-sm text-gray-400 -mt-2 mb-3">
        Vervollständige die Anforderungen für die jeweiligen Badges, 
        um neue Features und Inhalte freizuschalten!
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2  gap-4">
        {#each lockedBadges as badge (badge.id)}
          <!-- Äußerer Container mit overflow-visible -->
          <div class="relative group overflow-visible">
            <div 
              class="flex items-center space-x-2 p-3 rounded-xl border border-gray-800/50 bg-gray-900/50 hover:border-yellow-500/50 transition-all duration-200 relative"
              style="z-index: 10;">
              <div
                class="w-12 h-12 flex items-center justify-center rounded-full filter blur-sm group-hover:blur-none transition-all duration-200"
                style="background-color: {getBadgeColor(badge)}"
              >
                <span class="text-black text-lg font-medium">
                  {badge.name.charAt(0)}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">{badge.name}</p>
                {#if badge.description}
                  <p class="text-sm text-gray-400">{badge.description}</p>
                {/if}
              </div>
            </div>

            <!-- Unlock-Info für nicht freigeschaltete Badges -->
            <div class="opacity-0 hidden group-hover:opacity-100 absolute -bottom-2 left-0 right-0 transform translate-y-full z-50 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div class="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800 relative">
                <p class="text-sm font-medium text-white mb-2">Freischaltbedingung:</p>
                <p class="text-sm text-gray-400 mb-3">{badge.unlockCondition}</p>
                {#if badge.unlockReward}
                  <p class="text-sm font-medium text-white mb-2">Belohnung:</p>
                  <p class="text-sm text-gray-400">{badge.unlockReward}</p>
                {/if}
              </div>
            </div>
            
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if availableBadges.length === 0}
    <p class="text-gray-400">Keine Badges verfügbar</p>
  {/if}
</div>

<style>
  .group:hover {
    z-index: 20;
  }
</style>
