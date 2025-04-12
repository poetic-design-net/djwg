import { supabaseClient } from '$lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface DjAvailability {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'available' | 'tentative' | 'booked';
  created_at: string;
  updated_at: string;
}

export const getAvailabilities = async (userId: string): Promise<{ data: DjAvailability[] | null; error: PostgrestError | null }> => {
  return await supabaseClient
    .from('dj_availability')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });
};

export const addAvailability = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  status: 'available' | 'tentative' | 'booked'
): Promise<{ data: DjAvailability | null; error: PostgrestError | null }> => {
  return await supabaseClient
    .from('dj_availability')
    .insert({
      user_id: userId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status
    })
    .select()
    .single();
};

export const deleteAvailability = async (id: string): Promise<{ error: PostgrestError | null }> => {
  return await supabaseClient
    .from('dj_availability')
    .delete()
    .eq('id', id);
};