import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isAdmin } from '$lib/config/admin.server';
import groq from 'groq';
import { client } from '$lib/sanity/client';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, getUser } = locals as any;
  const user = await getUser?.();

  if (!user || !isAdmin(user.email)) {
    throw redirect(303, '/');
  }

  // Fetch all events with schedules
  const eventsQuery = groq`*[_type == "event" && count(*[_type == "eventSchedule" && references(^._id)]) > 0] | order(date desc) {
    _id,
    title,
    date,
    location,
    "scheduleId": *[_type == "eventSchedule" && references(^._id)][0]._id,
    "image": image.asset->url
  }`;

  const events = await client.fetch(eventsQuery);

  // Fetch all event schedules
  const schedulesQuery = groq`*[_type == "eventSchedule"] | order(_createdAt desc) {
    _id,
    "title": event->title,
    isSecret,
    days
  }`;

  const schedules = await client.fetch(schedulesQuery);

  return {
    events,
    schedules,
    user
  };
};