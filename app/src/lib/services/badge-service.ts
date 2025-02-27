import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/profile';
import { isProfileComplete } from '$lib/utils/profile-utils';

export const DJ_BADGE_ID = '4d2e1bf7-37e7-4226-9239-f8a60f608900';

export async function debugBadgeAssignment(
    supabase: SupabaseClient,
    userId: string,
    profile: Profile | null
): Promise<void> {
    console.group('Badge Assignment Debug');
    
    try {
        // 1. Überprüfe vorhandene Badge-Zuweisungen
        const { data: existingBadges, error: fetchError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId);

        console.log('Existing badges:', existingBadges);
        if (fetchError) console.error('Error fetching badges:', fetchError);

        // 2. Überprüfe Profilstatus
        console.log('Profile status:', {
            profile,
            isComplete: profile ? isProfileComplete(profile) : false
        });

        // 3. Überprüfe DJ Badge Zuweisung
        const { data: djBadge, error: djBadgeError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId)
            .eq('badge_id', DJ_BADGE_ID)
            .single();

        console.log('DJ Badge status:', {
            exists: !!djBadge,
            badge: djBadge,
            error: djBadgeError
        });

        // 4. Wenn Profil vollständig aber Badge fehlt, weise zu
        if (profile && isProfileComplete(profile) && !djBadge) {
            console.log('Assigning DJ badge...');
            
            const { error: assignError } = await supabase
                .from('user_badges')
                .upsert({
                    user_id: userId,
                    badge_id: DJ_BADGE_ID,
                    assigned_reason: 'Profil vollständig ausgefüllt'
                });

            if (assignError) {
                console.error('Error assigning badge:', assignError);
            } else {
                console.log('DJ badge assigned successfully');
            }
        }

    } catch (error) {
        console.error('Unexpected error during badge debug:', error);
    } finally {
        console.groupEnd();
    }
}