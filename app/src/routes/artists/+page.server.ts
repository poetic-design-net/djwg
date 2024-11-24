import type { PageServerLoad } from './$types';

interface Artist {
  image: string;
  role: string;
  name: string;
  description: string;
  socials: {
    instagram: string;
    soundcloud: string;
  };
}

// This will be replaced with real data when ready to announce
const placeholderArtist: Artist = {
  image: "/assets/home_hero_2.jpg",
  role: "DJ & Producer",
  name: "Coming Soon",
  description: "Details will be announced soon...",
  socials: {
    instagram: "#",
    soundcloud: "#"
  }
};

export const load: PageServerLoad = async ({ setHeaders }) => {
  // Flag to control when to reveal the real lineup
  const isLineupRevealed = false;

  // Set cache headers based on lineup reveal status
  // If lineup is not revealed, cache for longer (1 hour) since it's static placeholder data
  // If lineup is revealed, cache for shorter time (5 minutes) to keep artist data fresh
  setHeaders({
    'cache-control': `public, max-age=0, s-maxage=${isLineupRevealed ? 300 : 3600}`
  });

  // Real data would be fetched from a database when isLineupRevealed is true
  const artists = Array(6).fill(placeholderArtist);

  return {
    isLineupRevealed,
    artists
  };
};
