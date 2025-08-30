import { json } from '@sveltejs/kit';
import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset } from '$lib/sanity/api';
import { env } from '$env/dynamic/private';

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false
});

export async function POST({ request }: any) {
  try {
    const { slotId, isBlocked, eventId } = await request.json();

    // Update the slot's blocked status
    await writeClient
      .patch(slotId)
      .set({ isBlocked })
      .commit();

    // Fetch updated time slots
    const updatedSlots = await writeClient.fetch(
      `*[_type == "timeSlot" && event._ref == $eventId] | order(startTime asc)`,
      { eventId }
    );

    return json({ success: true, data: updatedSlots });
  } catch (error: any) {
    console.error('Block/unblock error:', error);
    return json(
      { 
        success: false, 
        error: error.message?.includes('MAX_WRITE_OPERATIONS_PER_HOUR')
          ? 'Das System ist derzeit ausgelastet. Bitte versuche es in einer Stunde erneut.'
          : 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
      },
      { status: 500 }
    );
  }
}
