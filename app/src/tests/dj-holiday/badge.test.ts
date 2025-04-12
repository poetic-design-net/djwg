import { describe, it, expect, beforeEach } from 'vitest';
import { supabaseClient, type Database } from '$lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

const BADGE_ID = '551d9015-aa13-4117-8776-b59f1aaade9b';

describe('DJ Holiday Badge System', () => {
  let supabase: SupabaseClient<Database>;

  beforeEach(() => {
    supabase = supabaseClient;
  });

  describe('Badge Verification', () => {
    it('should verify a valid badge ID', async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          badge (
            id,
            name,
            description,
            style
          )
        `)
        .eq('badge_id', BADGE_ID)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.badge_id).toBe(BADGE_ID);
        expect(data.badge).toHaveProperty('name');
      }
    });

    it('should reject an invalid badge ID', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('badge_id', invalidId)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });
});