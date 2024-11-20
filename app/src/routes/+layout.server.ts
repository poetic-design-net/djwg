import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  return {
    preview: event.locals.preview
  };
};
