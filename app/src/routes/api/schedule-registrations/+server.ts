import { json } from '@sveltejs/kit';
import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset } from '$lib/sanity/api';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import groq from 'groq';

// Check if write token is available
if (!env.VITE_SANITY_API_WRITE_TOKEN) {
  console.error('VITE_SANITY_API_WRITE_TOKEN is not set in environment variables');
}

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: env.VITE_SANITY_API_WRITE_TOKEN,
  useCdn: false
});

// GET: Fetch user registrations or all registrations for an event
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const eventId = url.searchParams.get('eventId');
    const userId = url.searchParams.get('userId');
    
    let query: string;
    let params: Record<string, string> = {};
    
    if (userId && eventId) {
      // Get specific user's registrations for an event
      query = groq`*[_type == "scheduleRegistration" && event._ref == $eventId && userId == $userId && status != "cancelled"] {
        _id,
        dayIndex,
        stageIndex,
        itemIndex,
        sessionTitle,
        sessionTime,
        status,
        createdAt
      }`;
      params = { eventId, userId };
    } else if (eventId) {
      // Get all registrations for an event (grouped by session)
      // Include status field to allow frontend to filter confirmed vs waitlist
      query = groq`*[_type == "scheduleRegistration" && event._ref == $eventId && status != "cancelled"] {
        _id,
        dayIndex,
        stageIndex,
        itemIndex,
        userName,
        userEmail,
        status,
        createdAt
      } | order(dayIndex asc, stageIndex asc, itemIndex asc)`;
      params = { eventId };
    } else {
      return json({ error: 'eventId is required' }, { status: 400 });
    }
    
    const registrations = await writeClient.fetch(query, params);
    
    return json({ success: true, data: registrations });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
};

// POST: Create a new registration
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if write token is available
  if (!env.VITE_SANITY_API_WRITE_TOKEN) {
    return json({ 
      error: 'Server configuration error: Missing write permissions. Please contact support.' 
    }, { status: 500 });
  }
  
  try {
    // Parse request body first
    const {
      eventId,
      eventScheduleId,
      dayIndex,
      stageIndex,
      itemIndex,
      sessionTitle,
      sessionTime,
      maxRegistrations
    } = await request.json();
    
    // Validate required fields
    if (!eventId) {
      return json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    const { supabase, getUser } = locals as any;
    
    // Get authenticated user
    const user = await getUser?.();
    if (!user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Check if user is already registered for this session
    const existingQuery = groq`*[_type == "scheduleRegistration" && 
      event._ref == $eventId && 
      dayIndex == $dayIndex && 
      stageIndex == $stageIndex && 
      itemIndex == $itemIndex && 
      userId == $userId && 
      status != "cancelled"][0]`;
      
    const existing = await writeClient.fetch(existingQuery, {
      eventId,
      dayIndex,
      stageIndex,
      itemIndex,
      userId: user.id
    });
    
    if (existing) {
      return json({ error: 'Already registered for this session' }, { status: 400 });
    }
    
    // Check current registration count if there's a limit
    if (maxRegistrations) {
      const countQuery = groq`count(*[_type == "scheduleRegistration" && 
        event._ref == $eventId && 
        dayIndex == $dayIndex && 
        stageIndex == $stageIndex && 
        itemIndex == $itemIndex && 
        status == "confirmed"])`;
        
      const currentCount = await writeClient.fetch(countQuery, {
        eventId,
        dayIndex,
        stageIndex,
        itemIndex
      });
      
      if (currentCount >= maxRegistrations) {
        // Add to waitlist instead
        const registration: any = {
          _type: 'scheduleRegistration',
          event: { _type: 'reference', _ref: eventId },
          dayIndex,
          stageIndex,
          itemIndex,
          sessionTitle,
          sessionTime,
          userId: user.id,
          profileId: profile.id,
          userName: profile.displayName || profile.username || user.email.split('@')[0],
          userEmail: user.email,
          status: 'waitlist',
          createdAt: new Date().toISOString()
        };
        
        // Only add eventSchedule if it exists
        if (eventScheduleId) {
          registration.eventSchedule = { _type: 'reference', _ref: eventScheduleId };
        }
        
        const result = await writeClient.create(registration);
        return json({ 
          success: true, 
          data: result,
          message: 'Added to waitlist'
        });
      }
    }
    
    // Create registration
    const registration: any = {
      _type: 'scheduleRegistration',
      event: { _type: 'reference', _ref: eventId },
      dayIndex,
      stageIndex,
      itemIndex,
      sessionTitle,
      sessionTime,
      userId: user.id,
      profileId: profile.id,
      userName: profile.displayName || profile.username || user.email.split('@')[0],
      userEmail: user.email,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    // Only add eventSchedule if it exists
    if (eventScheduleId) {
      registration.eventSchedule = { _type: 'reference', _ref: eventScheduleId };
    }
    
    const result = await writeClient.create(registration);
    
    // Fetch all user registrations for this event
    const userRegistrations = await writeClient.fetch(
      groq`*[_type == "scheduleRegistration" && event._ref == $eventId && userId == $userId && status != "cancelled"] {
        _id,
        dayIndex,
        stageIndex,
        itemIndex,
        sessionTitle,
        sessionTime,
        status,
        createdAt
      }`,
      { eventId, userId: user.id }
    );
    
    // Also fetch the updated count for this specific session
    const sessionCountQuery = groq`count(*[_type == "scheduleRegistration" && 
      event._ref == $eventId && 
      dayIndex == $dayIndex && 
      stageIndex == $stageIndex && 
      itemIndex == $itemIndex && 
      status == "confirmed"])`;
    
    const updatedCount = await writeClient.fetch(sessionCountQuery, {
      eventId,
      dayIndex,
      stageIndex,
      itemIndex
    });
    
    return json({ 
      success: true, 
      data: result,
      userRegistrations,
      updatedCount,
      sessionKey: `${dayIndex}-${stageIndex}-${itemIndex}`,
      message: 'Successfully registered'
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    const errorMessage = error.message || 'Unknown error';
    
    // Provide more specific error messages
    if (errorMessage.includes('MAX_WRITE_OPERATIONS_PER_HOUR')) {
      return json(
        { 
          success: false, 
          error: 'Das System ist derzeit ausgelastet. Bitte versuche es in einer Stunde erneut.'
        },
        { status: 429 }
      );
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('token')) {
      return json(
        { 
          success: false, 
          error: 'Berechtigung fehlt. Bitte kontaktiere den Support.'
        },
        { status: 403 }
      );
    }
    
    return json(
      { 
        success: false, 
        error: `Registrierung fehlgeschlagen: ${errorMessage}`
      },
      { status: 500 }
    );
  }
};