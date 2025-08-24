import { json } from '@sveltejs/kit';
import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset } from '$lib/sanity/api';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import groq from 'groq';

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: env.VITE_SANITY_API_WRITE_TOKEN,
  useCdn: false
});

// DELETE: Cancel a registration
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const { supabase, getUser } = locals as any;
    
    // Get authenticated user
    const user = await getUser?.();
    if (!user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const registrationId = params.id;
    
    // Fetch the registration
    const registration = await writeClient.fetch(
      groq`*[_type == "scheduleRegistration" && _id == $id][0]`,
      { id: registrationId }
    );
    
    if (!registration) {
      return json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // Check if user owns this registration
    if (registration.userId !== user.id) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update status to cancelled instead of deleting
    await writeClient
      .patch(registrationId)
      .set({ status: 'cancelled' })
      .commit();
    
    // Check if there's anyone on the waitlist to promote
    if (registration.status === 'confirmed') {
      const waitlistQuery = groq`*[_type == "scheduleRegistration" && 
        event._ref == $eventId && 
        dayIndex == $dayIndex && 
        stageIndex == $stageIndex && 
        itemIndex == $itemIndex && 
        status == "waitlist"] | order(createdAt asc)[0]`;
        
      const nextInLine = await writeClient.fetch(waitlistQuery, {
        eventId: registration.event._ref,
        dayIndex: registration.dayIndex,
        stageIndex: registration.stageIndex,
        itemIndex: registration.itemIndex
      });
      
      if (nextInLine) {
        // Promote from waitlist to confirmed
        await writeClient
          .patch(nextInLine._id)
          .set({ status: 'confirmed' })
          .commit();
          
        // TODO: Send notification to the promoted user
      }
    }
    
    // Fetch the updated count for this session
    const sessionCountQuery = groq`count(*[_type == "scheduleRegistration" && 
      event._ref == $eventId && 
      dayIndex == $dayIndex && 
      stageIndex == $stageIndex && 
      itemIndex == $itemIndex && 
      status == "confirmed"])`;
    
    const updatedCount = await writeClient.fetch(sessionCountQuery, {
      eventId: registration.event._ref,
      dayIndex: registration.dayIndex,
      stageIndex: registration.stageIndex,
      itemIndex: registration.itemIndex
    });
    
    return json({ 
      success: true, 
      message: 'Registration cancelled successfully',
      updatedCount,
      sessionKey: `${registration.dayIndex}-${registration.stageIndex}-${registration.itemIndex}`
    });
    
  } catch (error: any) {
    console.error('Error cancelling registration:', error);
    return json(
      { 
        success: false, 
        error: 'Failed to cancel registration'
      },
      { status: 500 }
    );
  }
};