import { json } from '@sveltejs/kit';
import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset } from '$lib/sanity/api';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import groq from 'groq';
import { isAdmin } from '$lib/config/admin.server';

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

// Log write client configuration (without exposing token)
console.log('Sanity write client configured:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!env.VITE_SANITY_API_WRITE_TOKEN,
  tokenLength: env.VITE_SANITY_API_WRITE_TOKEN?.length
});

// GET: Fetch user registrations or all registrations for an event
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const eventId = url.searchParams.get('eventId');
    const userId = url.searchParams.get('userId');
    
    let query: string;
    let params: Record<string, string> = {};
    
    if (userId && eventId) {
      // Get specific user's registrations for an event - include all statuses
      query = groq`*[_type == "scheduleRegistration" && event._ref == $eventId && userId == $userId] {
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
      // Get all registrations for an event - include cancelled for admin view
      query = groq`*[_type == "scheduleRegistration" && event._ref == $eventId] {
        _id,
        dayIndex,
        stageIndex,
        itemIndex,
        userName,
        userEmail,
        profileId,
        userId,
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
      maxRegistrations,
      isOpenTable,
      openTableSettings
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

    // Check if the event schedule is secret and user is not admin
    if (eventScheduleId) {
      const scheduleQuery = groq`*[_type == "eventSchedule" && _id == $scheduleId][0] {
        isSecret
      }`;

      const schedule = await writeClient.fetch(scheduleQuery, { scheduleId: eventScheduleId });

      if (schedule?.isSecret && !isAdmin(user.email)) {
        return json({
          error: 'This workshop requires special permission to register'
        }, { status: 403 });
      }
    }

    // Create a unique registration key to prevent duplicates
    const registrationKey = `${eventId}-${dayIndex}-${stageIndex}-${itemIndex}-${user.id}`;

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
        // Check if Open Table with waitlist enabled
        const shouldWaitlist = isOpenTable && openTableSettings?.waitlistEnabled;

        if (!shouldWaitlist) {
          return json({ error: 'Registration limit reached' }, { status: 400 });
        }

        // Add to waitlist
        const registration: any = {
          _type: 'scheduleRegistration',
          registrationKey, // Add unique key to prevent duplicates
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
    
    // Create registration with unique key
    const registration: any = {
      _type: 'scheduleRegistration',
      registrationKey, // Add unique key to prevent duplicates
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
    
    // Try to create registration, handle duplicate key error
    let result;
    try {
      result = await writeClient.create(registration);
    } catch (error: any) {
      // Check if it's a duplicate key error
      if (error.message?.includes('registrationKey') || error.message?.includes('duplicate')) {
        return json({ error: 'Already registered for this session' }, { status: 400 });
      }
      throw error;
    }

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
    // Enhanced error logging
    console.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      details: error.details,
      statusCode: error.statusCode,
      userId: user?.id,
      eventId,
      sessionTitle
    });

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

// DELETE: Cancel a registration
export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, dayIndex, stageIndex, itemIndex } = body;

    if (!eventId || dayIndex === undefined || stageIndex === undefined || itemIndex === undefined) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the registration to cancel
    const query = groq`*[_type == "scheduleRegistration" &&
      event._ref == $eventId &&
      userId == $userId &&
      dayIndex == $dayIndex &&
      stageIndex == $stageIndex &&
      itemIndex == $itemIndex &&
      status != "cancelled"][0] {
        _id,
        sessionTitle
      }`;

    const registration = await writeClient.fetch(query, {
      eventId,
      userId: user.id,
      dayIndex,
      stageIndex,
      itemIndex
    });

    if (!registration) {
      return json({ error: 'Registration not found' }, { status: 404 });
    }

    // Update the registration status to cancelled
    await writeClient.patch(registration._id)
      .set({
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      })
      .commit();

    // Check if there's a waitlist for this session
    const waitlistQuery = groq`*[_type == "scheduleRegistration" &&
      event._ref == $eventId &&
      dayIndex == $dayIndex &&
      stageIndex == $stageIndex &&
      itemIndex == $itemIndex &&
      status == "waitlist"] | order(createdAt asc)[0] {
        _id,
        userId,
        userName,
        userEmail
      }`;

    const nextInWaitlist = await writeClient.fetch(waitlistQuery, {
      eventId,
      dayIndex,
      stageIndex,
      itemIndex
    });

    // If someone is on waitlist, promote them
    if (nextInWaitlist) {
      await writeClient.patch(nextInWaitlist._id)
        .set({
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        })
        .commit();

      // TODO: Send notification to user about their promotion from waitlist
      console.log(`User ${nextInWaitlist.userName} promoted from waitlist for session`);
    }

    return json({
      success: true,
      message: 'Successfully cancelled registration',
      promotedUser: nextInWaitlist ? nextInWaitlist.userId : null
    });

  } catch (error: any) {
    console.error('Cancellation error:', error);
    return json(
      {
        success: false,
        error: `Cancellation failed: ${error.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
};