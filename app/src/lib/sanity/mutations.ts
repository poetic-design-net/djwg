import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset } from '$lib/sanity/api';

// Client für Schreiboperationen
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: import.meta.env.SANITY_API_WRITE_TOKEN,
  useCdn: false // Wichtig für Echtzeit-Updates
});
