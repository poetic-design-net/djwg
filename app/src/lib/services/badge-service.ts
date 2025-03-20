import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/profile';
import { isProfileComplete } from '$lib/utils/profile-utils';
import { badgeStore } from '$lib/stores/badges';
import { browser } from '$app/environment';

export const DJ_LEVEL_1_ID = '4d2e1bf7-37e7-4226-9239-f8a60f608900';
export const DJ_LEVEL_2_ID = '023cc4ab-9a20-45db-82d5-c248aacefe0a';
export const WELCOME_BADGE_ID = 'b1055aa1-7b91-40c4-9d3e-9e965a0ce1c3';

/**
 * Manages badge assignments in real-time based on profile completeness
 * This function will add or remove badges as needed without requiring a page reload
 */
export async function manageBadgesRealtime(
    supabase: SupabaseClient,
    userId: string,
    profile: Profile | null
): Promise<void> {
    console.log('🎯 Badge Service: manageBadgesRealtime called', {
        environment: browser ? 'Client' : 'Server',
        userId,
        hasProfile: !!profile,
        isProfileComplete: profile ? isProfileComplete(profile) : false,
        timestamp: new Date().toISOString()
    });

    if (!userId || !supabase) return;
    
    // Prüfe und vergebe Welcome Badge
    try {
        const { data: welcomeBadge, error: welcomeBadgeError } = await supabase
            .from('badges')
            .select('*')
            .eq('id', WELCOME_BADGE_ID)
            .single();
            
        if (welcomeBadgeError) {
            console.error('🎯 Badge Service: Error fetching welcome badge', welcomeBadgeError);
            return;
        }
        
        // Prüfe ob User bereits das Welcome Badge hat
        const { data: existingWelcomeBadge } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId)
            .eq('badge_id', WELCOME_BADGE_ID)
            .single();
            
        if (!existingWelcomeBadge) {
            // Vergebe Welcome Badge
            const { error: assignError } = await supabase
                .from('user_badges')
                .upsert({
                    user_id: userId,
                    badge_id: WELCOME_BADGE_ID,
                    assigned_reason: 'Willkommen bei DJ Workshop Guide',
                    assigned_at: new Date().toISOString()
                });
                
            if (!assignError) badgeStore.addUserBadge(welcomeBadge, userId);
        }
    } catch (error) {
        console.error('🎯 Badge Service: Error managing welcome badge:', error);
    }
    
    try {
        // Get the DJ Level 1 badge definition
        const { data: badge, error: badgeError } = await supabase
            .from('badges')
            .select('*')
            .eq('id', DJ_LEVEL_1_ID)
            .single();
            
        if (badgeError) {
            console.error('🎯 Badge Service: Error fetching badge definition', {
                environment: browser ? 'Client' : 'Server',
                error: badgeError,
                userId,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Check if user already has Level 1 badge
        const { data: existingBadge, error: fetchError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId)
            .eq('badge_id', DJ_LEVEL_1_ID)
            .single();
            
        console.log('🎯 Badge Service: Checking badge status', {
            environment: browser ? 'Client' : 'Server',
            userId,
            hasBadge: !!existingBadge,
            shouldHaveBadge: profile ? isProfileComplete(profile) : false,
            timestamp: new Date().toISOString()
        });
            
        const hasBadge = !!existingBadge;
        const shouldHaveBadge = profile ? isProfileComplete(profile) : false;
        
        // If profile is complete but user doesn't have Level 1 badge, assign it
        if (shouldHaveBadge && !hasBadge) {
            const { error: assignError } = await supabase
                .from('user_badges')
                .upsert({
                    user_id: userId,
                    badge_id: DJ_LEVEL_1_ID,
                    assigned_reason: 'Profil vollständig ausgefüllt',
                    assigned_at: new Date().toISOString()
                });

            if (assignError) {
                console.error('🎯 Badge Service: Error assigning badge', {
                    environment: browser ? 'Client' : 'Server',
                    error: assignError,
                    userId,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('🎯 Badge Service: Badge assigned successfully');
                badgeStore.addUserBadge(badge, userId);
            }
        } 
        // If profile is incomplete but user has Level 1 badge, remove it and Level 2
        else if (!shouldHaveBadge && hasBadge) {
            // Entferne Level 1
            const { error: removeError } = await supabase
                .from('user_badges')
                .delete()
                .eq('user_id', userId)
                .eq('badge_id', DJ_LEVEL_1_ID);
                
            if (removeError) {
                console.error('🎯 Badge Service: Error removing badge', {
                    environment: browser ? 'Client' : 'Server',
                    error: removeError,
                    userId,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('🎯 Badge Service: Level 1 badge removed');
                badgeStore.removeUserBadge(DJ_LEVEL_1_ID);

                // Wenn Level 1 entfernt wird, muss auch Level 2 entfernt werden
                const { error: removeLevel2Error } = await supabase
                    .from('user_badges')
                    .delete()
                    .eq('user_id', userId)
                    .eq('badge_id', DJ_LEVEL_2_ID);

                if (!removeLevel2Error) {
                    console.log('🎯 Badge Service: Level 2 badge removed');
                    badgeStore.removeUserBadge(DJ_LEVEL_2_ID);
                }
            }
        }

        // Prüfe Level 2 nur, wenn Level 1 vorhanden ist
        if (hasBadge) {
            const { data: level2Badge } = await supabase
                .from('user_badges')
                .select('*')
                .eq('user_id', userId)
                .eq('badge_id', DJ_LEVEL_2_ID)
                .single();

            if (level2Badge) {
                console.log('🎯 Badge Service: User has Level 2 badge');
            }
        }

    } catch (error) {
        console.error('Unexpected error during badge management:', error);
    }
}
