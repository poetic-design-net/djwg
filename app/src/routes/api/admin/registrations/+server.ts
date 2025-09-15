import { json } from '@sveltejs/kit';
import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset } from '$lib/sanity/api';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import groq from 'groq';
import { isAdmin } from '$lib/config/admin.server';

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: env.VITE_SANITY_API_WRITE_TOKEN,
  useCdn: false
});

// GET: Admin endpoint for advanced registration management
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { supabase, getUser } = locals as any;
    const user = await getUser?.();

    // Admin check
    if (!user || !isAdmin(user.email)) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const eventId = url.searchParams.get('eventId');
    const action = url.searchParams.get('action');

    if (!eventId) {
      return json({ error: 'eventId is required' }, { status: 400 });
    }

    // Different actions for admin
    switch (action) {
      case 'detailed': {
        // Get detailed registrations with full user profiles
        const query = groq`*[_type == "scheduleRegistration" && event._ref == $eventId] {
          _id,
          dayIndex,
          stageIndex,
          itemIndex,
          sessionTitle,
          sessionTime,
          userId,
          profileId,
          userName,
          userEmail,
          status,
          createdAt,
          _updatedAt,
          "eventTitle": event->title,
          "scheduleTitle": eventSchedule->title
        } | order(dayIndex asc, stageIndex asc, itemIndex asc, createdAt asc)`;

        const registrations = await writeClient.fetch(query, { eventId });

        // Get event schedule details
        const scheduleQuery = groq`*[_type == "event" && _id == $eventId][0] {
          eventSchedule-> {
            _id,
            title,
            schedule
          }
        }`;

        const eventData = await writeClient.fetch(scheduleQuery, { eventId });

        return json({
          success: true,
          registrations,
          schedule: eventData?.eventSchedule
        });
      }

      case 'statistics': {
        // Get registration statistics
        const statsQuery = groq`{
          "total": count(*[_type == "scheduleRegistration" && event._ref == $eventId]),
          "confirmed": count(*[_type == "scheduleRegistration" && event._ref == $eventId && status == "confirmed"]),
          "waitlist": count(*[_type == "scheduleRegistration" && event._ref == $eventId && status == "waitlist"]),
          "cancelled": count(*[_type == "scheduleRegistration" && event._ref == $eventId && status == "cancelled"]),
          "uniqueUsers": count(*[_type == "scheduleRegistration" && event._ref == $eventId] | select(userId) | unique(userId)),
          "bySession": *[_type == "scheduleRegistration" && event._ref == $eventId] {
            dayIndex,
            stageIndex,
            itemIndex,
            sessionTitle,
            status
          }
        }`;

        const stats = await writeClient.fetch(statsQuery, { eventId });

        // Process by session stats
        const sessionStats = new Map();
        if (stats.bySession) {
          stats.bySession.forEach((reg: any) => {
            const key = `${reg.dayIndex}-${reg.stageIndex}-${reg.itemIndex}`;
            if (!sessionStats.has(key)) {
              sessionStats.set(key, {
                sessionTitle: reg.sessionTitle,
                confirmed: 0,
                waitlist: 0,
                cancelled: 0
              });
            }
            const stat = sessionStats.get(key);
            if (reg.status === 'confirmed') stat.confirmed++;
            else if (reg.status === 'waitlist') stat.waitlist++;
            else if (reg.status === 'cancelled') stat.cancelled++;
          });
        }

        return json({
          success: true,
          statistics: {
            ...stats,
            bySession: Array.from(sessionStats.entries()).map(([key, value]) => ({
              key,
              ...value
            }))
          }
        });
      }

      default: {
        // Standard registration list
        const query = groq`*[_type == "scheduleRegistration" && event._ref == $eventId] {
          _id,
          dayIndex,
          stageIndex,
          itemIndex,
          sessionTitle,
          sessionTime,
          userName,
          userEmail,
          status,
          createdAt
        } | order(dayIndex asc, stageIndex asc, itemIndex asc, createdAt asc)`;

        const registrations = await writeClient.fetch(query, { eventId });

        return json({ success: true, data: registrations });
      }
    }
  } catch (error: any) {
    console.error('Error in admin registrations endpoint:', error);
    return json(
      { success: false, error: 'Failed to fetch registration data' },
      { status: 500 }
    );
  }
};

// PATCH: Admin actions on registrations
export const PATCH: RequestHandler = async ({ request, locals }) => {
  try {
    const { supabase, getUser } = locals as any;
    const user = await getUser?.();

    // Admin check
    if (!user || !isAdmin(user.email)) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { registrationId, action, data } = await request.json();

    if (!registrationId || !action) {
      return json({ error: 'registrationId and action are required' }, { status: 400 });
    }

    switch (action) {
      case 'changeStatus': {
        if (!data?.status) {
          return json({ error: 'New status is required' }, { status: 400 });
        }

        // Update registration status
        await writeClient
          .patch(registrationId)
          .set({ status: data.status })
          .commit();

        // If changing from waitlist to confirmed, check capacity
        if (data.status === 'confirmed') {
          const reg = await writeClient.fetch(
            groq`*[_type == "scheduleRegistration" && _id == $id][0]`,
            { id: registrationId }
          );

          if (reg) {
            // Check if there's room
            const countQuery = groq`count(*[_type == "scheduleRegistration" &&
              event._ref == $eventId &&
              dayIndex == $dayIndex &&
              stageIndex == $stageIndex &&
              itemIndex == $itemIndex &&
              status == "confirmed" &&
              _id != $registrationId])`;

            const currentCount = await writeClient.fetch(countQuery, {
              eventId: reg.event._ref,
              dayIndex: reg.dayIndex,
              stageIndex: reg.stageIndex,
              itemIndex: reg.itemIndex,
              registrationId
            });

            // Get max registrations from schedule
            const scheduleQuery = groq`*[_type == "event" && _id == $eventId][0].eventSchedule->schedule[$dayIndex].stages[$stageIndex].schedule[$itemIndex].maxRegistrations`;

            const maxRegistrations = await writeClient.fetch(scheduleQuery, {
              eventId: reg.event._ref,
              dayIndex: reg.dayIndex,
              stageIndex: reg.stageIndex,
              itemIndex: reg.itemIndex
            });

            if (maxRegistrations && currentCount >= maxRegistrations) {
              // Revert the change
              await writeClient
                .patch(registrationId)
                .set({ status: 'waitlist' })
                .commit();

              return json({
                error: 'Cannot confirm: Session is at maximum capacity'
              }, { status: 400 });
            }
          }
        }

        return json({
          success: true,
          message: `Status updated to ${data.status}`
        });
      }

      case 'promoteFromWaitlist': {
        // Get the registration
        const reg = await writeClient.fetch(
          groq`*[_type == "scheduleRegistration" && _id == $id][0]`,
          { id: registrationId }
        );

        if (!reg) {
          return json({ error: 'Registration not found' }, { status: 404 });
        }

        if (reg.status !== 'waitlist') {
          return json({ error: 'Registration is not on waitlist' }, { status: 400 });
        }

        // Promote to confirmed
        await writeClient
          .patch(registrationId)
          .set({ status: 'confirmed' })
          .commit();

        // TODO: Send notification email to user

        return json({
          success: true,
          message: 'User promoted from waitlist'
        });
      }

      case 'bulkAction': {
        if (!data?.registrationIds || !data?.newStatus) {
          return json({ error: 'registrationIds and newStatus are required' }, { status: 400 });
        }

        // Update multiple registrations
        const transaction = writeClient.transaction();
        data.registrationIds.forEach((id: string) => {
          transaction.patch(id, patch => patch.set({ status: data.newStatus }));
        });

        await transaction.commit();

        return json({
          success: true,
          message: `${data.registrationIds.length} registrations updated`
        });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in admin registration action:', error);
    return json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
};