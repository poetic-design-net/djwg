import { setPreviewing } from '@sanity/visual-editing/svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = (event) => {
  const { preview } = event.data;
  setPreviewing(preview);
  
  return {
    ...event.data
  };
};
