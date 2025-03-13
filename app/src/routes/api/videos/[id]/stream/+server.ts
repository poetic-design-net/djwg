import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { videoByIdQuery, type Video, type VideoResponse } from '$lib/sanity/queries/videos';
import type { User } from '@supabase/supabase-js';

interface UserBadge {
    badge_id: string;
}

export const GET: RequestHandler = async ({ params, locals, request }) => {
    const { id } = params;
    const session = await locals.supabase.auth.getSession();

    if (!session.data.session?.user) {
        throw error(401, 'Nicht autorisiert');
    }

    try {
        // Hole Video-Details von Sanity
        const videoResponse = await locals.loadQuery<Video>(videoByIdQuery(id));
        const video = videoResponse?.data;

        if (!video) {
            throw error(404, 'Video nicht gefunden');
        }

        // Prüfe Badge-Berechtigung
        if (video.requiredBadges?.length > 0) {
            const { data: userBadges } = await locals.supabase
                .from('user_badges')
                .select('badge_id')
                .eq('user_id', session.data.session.user.id);

            const hasAccess = video.requiredBadges.every(
                requiredBadge => userBadges?.some(
                    (userBadge: UserBadge) => userBadge.badge_id === requiredBadge._id
                )
            );

            if (!hasAccess) {
                throw error(403, 'Keine Berechtigung für dieses Video');
            }
        }

        // Hole das Video von Sanity
        const videoUrl = video.videoFile?.asset?.url;
        if (!videoUrl) {
            throw error(404, 'Video-Datei nicht gefunden');
        }

        const videoRes = await fetch(videoUrl);
        
        if (!videoRes.ok) {
            throw error(500, 'Fehler beim Laden des Videos');
        }

        // Setze Headers für Streaming
        const range = request.headers.get('range');
        const videoSize = Number(videoRes.headers.get('content-length'));
        
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
            const chunksize = (end - start) + 1;
            
            const videoStream = await fetch(videoUrl, {
                headers: { Range: `bytes=${start}-${end}` }
            });

            return new Response(videoStream.body, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize.toString(),
                    'Content-Type': 'video/mp4',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        }

        // Wenn kein Range-Header, sende das komplette Video
        return new Response(videoRes.body, {
            headers: {
                'Content-Length': videoSize.toString(),
                'Content-Type': 'video/mp4',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });

    } catch (err) {
        console.error('Fehler beim Streaming des Videos:', err);
        throw error(500, 'Interner Server-Fehler');
    }
};