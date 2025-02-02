import { client } from '$lib/sanity/client';
import { awardQuery } from '$lib/sanity/queries/award';
import type { Award } from '$lib/types/award';
import type { ServerLoad } from '@sveltejs/kit';
import type { SanityImage } from '$lib/types/image';

export const load: ServerLoad = async () => {
  const award = await client.fetch<Award>(awardQuery);
  console.log('Award data:', JSON.stringify(award, null, 2));

  if (!award) {
    console.error('No award document found');
    return { award: null };
  }

  // Konvertiere SanityImage-Assets
  const processedAward = {
    ...award,
    hero: award.hero ? {
      ...award.hero,
      backgroundImages: award.hero.backgroundImages?.map(img => {
        if (!img.asset) return undefined;
        
        const processed: SanityImage = {
          ...img,
          asset: img.asset
        };
        return processed;
      }).filter((img): img is SanityImage => img !== undefined)
    } : undefined
  };

  return {
    award: processedAward
  };
};