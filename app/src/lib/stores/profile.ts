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

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      set(profile);
    }
  };
}

export const profileStore = createProfileStore();