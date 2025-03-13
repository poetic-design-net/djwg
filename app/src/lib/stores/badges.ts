import { writable } from 'svelte/store';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Badge } from '$lib/types/badge';

interface BadgeStore {
  userBadges: Array<{
    badge_id: string;
    user_id: string;
    assigned_at: string;
  }>;
  availableBadges: Badge[];
}

function createBadgeStore() {
  const { subscribe, set, update } = writable<BadgeStore>({
    userBadges: [],
    availableBadges: []
  });

  return {
    subscribe,
    addUserBadge: (badge: Badge, userId: string) => update(store => ({
      ...store,
      userBadges: [...store.userBadges, {
        badge_id: badge.id,
        user_id: userId,
        assigned_at: new Date().toISOString()
      }]
    })),
    removeUserBadge: (badgeId: string) => update(store => ({
      ...store,
      userBadges: store.userBadges.filter(b => b.badge_id !== badgeId)
    })),
    setAvailableBadges: (badges: Badge[]) => update(store => ({
      ...store,
      availableBadges: badges
    })),
    loadBadges: async (supabase: SupabaseClient, userId: string) => {
      try {
        // Lade alle verfügbaren Badges
        const { data: availableBadges, error: badgesError } = await supabase
          .from('badges')
          .select('*')
          .order('created_at', { ascending: true });
          
        console.log('Geladene Badges aus Supabase:', availableBadges);

        if (badgesError) throw badgesError;

        // Lade die Badges des Users
        const { data: userBadges, error: userBadgesError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId);
          
        console.log('User Badges aus Supabase:', userBadges);

        if (userBadgesError) throw userBadgesError;

        // Update store
        set({
          userBadges: userBadges || [],
          availableBadges: availableBadges || []
        });
      } catch (error) {
        console.error('Error loading badges:', error);
      }
    }
  };
}

export const badgeStore = createBadgeStore();
