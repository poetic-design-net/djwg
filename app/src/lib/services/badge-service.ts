import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/profile';
import { isProfileComplete } from '$lib/utils/profile-utils';
import { badgeStore } from '$lib/stores/badges';
import { browser } from '$app/environment';

export const DJ_LEVEL_1_ID = '4d2e1bf7-37e7-4226-9239-f8a60f608900';
export const DJ_LEVEL_2_ID = '023cc4ab-9a20-45db-82d5-c248aacefe0a';
export const WELCOME_BADGE_ID = 'b1055aa1-7b91-40c4-9d3e-9e965a0ce1c3';
// Weeztix badge ID is configured via environment variable
export const WEEZTIX_BADGE_ID = '319b8937-cc53-4b1c-a2ef-b9f97aa81f51';

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
        const { data: existingBadge } = await supabase
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
        // If profile is incomplete but user has Level 1 badge, remove it
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
                // Level 2 Badge wird NICHT mehr automatisch entfernt
            }
        }

        // Prüfe Level 2 nur, wenn Level 1 vorhanden ist (optional, kann entfernt werden, wenn Level 2 komplett unabhängig sein soll)
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

/**
 * Check and assign Weeztix badge for a user
 * This can be called after a successful Weeztix purchase
 */
export async function assignWeeztixBadgeToUser(
    supabase: SupabaseClient,
    userId: string,
    orderGuid?: string,
    badgeId?: string
): Promise<boolean> {
    console.log('🎫 Badge Service: assignWeeztixBadgeToUser called', {
        userId,
        orderGuid,
        badgeId: badgeId || WEEZTIX_BADGE_ID,
        timestamp: new Date().toISOString()
    });

    if (!userId || !supabase) {
        console.error('Missing required parameters for Weeztix badge assignment');
        return false;
    }

    const targetBadgeId = badgeId || WEEZTIX_BADGE_ID;

    if (!targetBadgeId) {
        console.error('Weeztix badge ID not configured');
        return false;
    }

    try {
        // Get the Weeztix badge definition
        const { data: badge, error: badgeError } = await supabase
            .from('badges')
            .select('*')
            .eq('id', targetBadgeId)
            .single();

        if (badgeError || !badge) {
            console.error('🎫 Badge Service: Error fetching Weeztix badge definition', badgeError);
            return false;
        }

        // Check if user already has the badge
        const { data: existingBadge } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId)
            .eq('badge_id', targetBadgeId)
            .single();

        if (existingBadge) {
            console.log('🎫 Badge Service: User already has Weeztix badge');
            return true;
        }

        // Assign the badge
        const { error: assignError } = await supabase
            .from('user_badges')
            .upsert({
                user_id: userId,
                badge_id: targetBadgeId,
                assigned_reason: orderGuid
                    ? `Weeztix Ticket Purchase - Order: ${orderGuid}`
                    : 'Weeztix Ticket Purchase',
                assigned_at: new Date().toISOString()
            });

        if (assignError) {
            console.error('🎫 Badge Service: Error assigning Weeztix badge', assignError);
            return false;
        }

        console.log('🎫 Badge Service: Weeztix badge assigned successfully');

        if (browser) {
            badgeStore.addUserBadge(badge, userId);
        }

        return true;

    } catch (error) {
        console.error('🎫 Badge Service: Unexpected error assigning Weeztix badge:', error);
        return false;
    }
}

/**
 * Check if a user has a Weeztix purchase and assign badge if needed
 */
export async function checkAndAssignWeeztixBadge(
    supabase: SupabaseClient,
    userId: string
): Promise<void> {
    if (!userId || !supabase || !WEEZTIX_BADGE_ID) return;

    try {
        // Check if user has any Weeztix orders
        const { data: order, error: orderError } = await supabase
            .from('weeztix_orders')
            .select('order_guid, badge_assigned')
            .eq('user_id', userId)
            .eq('badge_assigned', false)
            .limit(1)
            .single();

        if (!orderError && order) {
            // User has an order but no badge assigned yet
            const success = await assignWeeztixBadgeToUser(
                supabase,
                userId,
                order.order_guid,
                WEEZTIX_BADGE_ID
            );

            if (success) {
                // Update the order to mark badge as assigned
                await supabase
                    .from('weeztix_orders')
                    .update({
                        badge_assigned: true,
                        badge_assigned_at: new Date().toISOString()
                    })
                    .eq('order_guid', order.order_guid);
            }
        }
    } catch (error) {
        console.error('Error checking and assigning Weeztix badge:', error);
    }
}
