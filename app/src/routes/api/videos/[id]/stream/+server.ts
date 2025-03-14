import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { videoByIdQuery, type Video } from '$lib/sanity/queries/videos';

interface UserBadge {
  badge_id: string;
}

// Constants for streaming optimization
const INITIAL_CHUNK_SIZE = 1024 * 1024; // 1MB initial chunk for faster start
const CACHE_MAX_AGE = 60 * 60 * 24; // 24 hours caching for video chunks
const STALE_WHILE_REVALIDATE = 60 * 60; // 1 hour stale-while-revalidate

export const GET: RequestHandler = async ({ params, locals, request }) => {
  const { id } = params;
  
  // Authentication check
  const session = await locals.supabase.auth.getSession();
  if (!session.data.session?.user) {
    throw error(401, 'Nicht autorisiert');
  }
  
  try {
    // Get video details from Sanity
    const videoResponse = await locals.loadQuery<Video>(videoByIdQuery(id));
    const video = videoResponse?.data;
    
    if (!video) {
      throw error(404, 'Video nicht gefunden');
    }
    
    // Check badge permissions
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
    
    // Get video URL from Sanity
    const videoUrl = video.videoFile?.asset?.url;
    if (!videoUrl) {
      throw error(404, 'Video-Datei nicht gefunden');
    }
    
    // Get video metadata
    const headResponse = await fetch(videoUrl, { method: 'HEAD' });
    if (!headResponse.ok) {
      throw error(500, 'Fehler beim Laden der Video-Metadaten');
    }
    
    const videoSize = Number(headResponse.headers.get('content-length'));
    const contentType = headResponse.headers.get('content-type') || 'video/mp4';
    
    // Handle range request (streaming)
    const range = request.headers.get('range');
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + INITIAL_CHUNK_SIZE, videoSize - 1);
      const chunkSize = (end - start) + 1;
      
      // Fetch the requested chunk
      try {
        const videoStream = await fetch(videoUrl, {
          headers: { Range: `bytes=${start}-${end}` }
        });
        
        if (!videoStream.ok) {
          throw error(500, 'Fehler beim Streaming des Videos');
        }
        
        // Set appropriate caching headers for video chunks
        return new Response(videoStream.body, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': contentType,
            // Enable caching for video chunks
            'Cache-Control': `max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
            'X-Content-Type-Options': 'nosniff'
          }
        });
      } catch (streamErr) {
        console.error('Streaming-Fehler:', streamErr);
        throw error(500, 'Fehler beim Streaming des Videos');
      }
    }
    
    // Initial request (no range) - send small initial chunk to start playback faster
    const initialEnd = Math.min(INITIAL_CHUNK_SIZE - 1, videoSize - 1);
    
    try {
      const videoStream = await fetch(videoUrl, {
        headers: { Range: `bytes=0-${initialEnd}` }
      });
      
      if (!videoStream.ok) {
        throw error(500, 'Fehler beim Laden des Videos');
      }
      
      // For initial request, we still use caching but with shorter max-age
      return new Response(videoStream.body, {
        status: 206,
        headers: {
          'Content-Range': `bytes 0-${initialEnd}/${videoSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': (initialEnd + 1).toString(),
          'Content-Type': contentType,
          'Cache-Control': `max-age=${CACHE_MAX_AGE / 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'X-Content-Type-Options': 'nosniff'
        }
      });
    } catch (initialErr) {
      console.error('Fehler beim Laden des initialen Chunks:', initialErr);
      throw error(500, 'Fehler beim Laden des Videos');
    }
  } catch (err) {
    console.error('Fehler beim Streaming des Videos:', err);
    
    // More detailed error handling
    if (err instanceof Error) {
      throw error(500, `Video-Streaming-Fehler: ${err.message}`);
    }
    throw error(500, 'Interner Server-Fehler beim Video-Streaming');
  }
};