import type { PageServerLoad } from './$types';
import { videosQuery, type Video } from '$lib/sanity/queries/videos';

interface UserBadgeRecord {
    badge_id: string;
}

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.supabase.auth.getSession();
    
    // Hole Videos von Sanity
    const rawVideos = await locals.loadQuery<Video[]>(videosQuery);
    
    // Hole die Badges des eingeloggten Benutzers wenn angemeldet
    let userBadges: UserBadgeRecord[] = [];
    if (session.data.session?.user) {
        const { data: badges } = await locals.supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', session.data.session.user.id);
        userBadges = badges || [];
    }

    return {
        videos: {
            query: videosQuery,
            data: rawVideos,
            options: { initial: rawVideos }
        },
        userBadges
    };
};