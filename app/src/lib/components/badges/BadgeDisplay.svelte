<script lang="ts">
  import { badgeStore } from '$lib/stores/badges';
  import { getContext, onMount, onDestroy } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { User, Profile } from '$lib/types/profile';
  import type { Badge, UserBadge } from '$lib/types/badge';
  import { manageBadgesRealtime } from '$lib/services/badge-service';
  import { loadSanityBadges } from '$lib/services/sanity-badge-service';
  import BadgeCard from './BadgeCard.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let user: User;
  const supabase = getContext<SupabaseClient>('supabase');

  // Profil-Daten für Echtzeit-Überwachung
  let profile: Profile | null = null;
  let profileSubscription: any;

  // Badge Management Setup
  onMount(async () => {
    // Lade Badges aus Sanity
    console.log('Lade Badges aus Sanity...');
    const sanityBadges = await loadSanityBadges();
    console.log('Sanity Badges:', sanityBadges);

    // Lade User Badges aus Supabase
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    if (userBadgesError) {
      console.error('Fehler beim Laden der User Badges:', userBadgesError);
    }

    if (sanityBadges) {
      badgeStore.setAvailableBadges(sanityBadges);
    }

    if (userBadges) {
      userBadges.forEach((ub: { user_id: string; badge_id: string }) => {
        const badge = sanityBadges?.find((b: Badge) => b.supabaseId === ub.badge_id) || 
          { id: ub.badge_id, name: 'Unbekannt' } as Badge;
          
        console.log('Füge User Badge hinzu:', badge);
        badgeStore.addUserBadge(badge, user.id);
      }
      );
    }
    
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (data) {
      profile = data;
      await manageBadgesRealtime(supabase, user.id, profile);
    }
    
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
          profile = payload.new as Profile;
          await manageBadgesRealtime(supabase, user.id, profile);
        }
      )
      .subscribe();
  });
  
  onDestroy(() => {
    if (profileSubscription) {
      supabase.removeChannel(profileSubscription);
    }
  });

  function handleOpenVideos() {
    dispatch('openVideos');
  }

  $: unlockedBadges = $badgeStore.availableBadges.filter(b => {
    // Filter out Urlaub badge
    const badgeName = b.name?.toLowerCase() || '';
    if (badgeName.includes('urlaub')) return false;
    
    return $badgeStore.userBadges.some(ub => ub.badge_id === b.id);
  });
  
  $: lockedBadges = $badgeStore.availableBadges.filter(b => {
    // Filter out Urlaub badge
    const badgeName = b.name?.toLowerCase() || '';
    if (badgeName.includes('urlaub')) return false;
    
    return !$badgeStore.userBadges.some(ub => ub.badge_id === b.id);
  });
</script>

<div class="space-y-8">
  <!-- Freigeschaltete Badges -->
  {#if unlockedBadges.length > 0}
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-white">Freigeschaltete Badges</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each unlockedBadges as badge (badge.id)}
          <BadgeCard {badge} on:openVideos={handleOpenVideos} />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Nicht freigeschaltete Badges -->
  {#if lockedBadges.length > 0}
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-white">Verfügbare Badges</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each lockedBadges as badge (badge.id)}
          <BadgeCard {badge} locked={true} on:openVideos={handleOpenVideos} />
        {/each}
      </div>
    </div>
  {/if}

  {#if $badgeStore.availableBadges.length === 0}
    <p class="text-gray-400">Keine Badges verfügbar</p>
  {/if}
</div>
