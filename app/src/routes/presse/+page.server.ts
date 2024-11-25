import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: 'Presse | DJ Workshop Germany',
      description: 'Pressematerial, Logos und Brand Guidelines für DJ Workshop Germany'
    }
  };
};
