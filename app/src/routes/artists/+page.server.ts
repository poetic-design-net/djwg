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

export const load: PageServerLoad = async () => {
  // Flag to control when to reveal the real lineup
  const isLineupRevealed = false;

  // Real data would be fetched from a database when isLineupRevealed is true
  const artists = Array(6).fill(placeholderArtist);

  return {
    isLineupRevealed,
    artists
  };
};
