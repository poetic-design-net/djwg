import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset, studioUrl } from '$lib/sanity/api';

// Separater Client für Uploads mit Write-Token
export const uploadClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: import.meta.env.VITE_SANITY_API_WRITE_TOKEN,  // Hier VITE_ hinzugefügt
  useCdn: false, // Deaktiviere CDN für Uploads
  stega: {
    studioUrl
  }
});