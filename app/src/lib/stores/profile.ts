import { writable } from 'svelte/store';
import type { Profile } from '$lib/types/profile';

function createProfileStore() {
  const { subscribe, set, update } = writable<Profile | null>(null);

  return {
    subscribe,
    set,
    update,
    async refresh(supabase: any, userId: string) {
      if (!userId) {
        set(null);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) return;
        set(profile);
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
  };
}

export const profileStore = createProfileStore();