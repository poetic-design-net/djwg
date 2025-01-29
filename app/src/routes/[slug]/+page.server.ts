import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
  const { pages } = await parent();
  const { slug } = params;

  // Finde die Seite anhand des Slugs
  const page = Object.values(pages).find((p: any) => p.slug === slug && !p.isDraft);

  if (!page) {
    throw error(404, 'Seite nicht gefunden');
  }

  return { page };
}
