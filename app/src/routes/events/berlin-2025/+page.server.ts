import { artistsQuery, type Artist } from '$lib/sanity/queries';
import type { PageServerLoad } from './$types';

// Placeholder artist data for secret state
const placeholderArtists = Array(6).fill({
  image: "/assets/home_hero_2.jpg",
  role: "DJ & Producer",
  name: "Coming Soon",
  description: "Details will be announced soon...",
  socials: {
    instagram: "#",
    soundcloud: "#"
  }
});

export const load: PageServerLoad = async (event) => {
	const { loadQuery } = event.locals;
	const artists = await loadQuery<Artist[]>(artistsQuery);

	// Get the actual artists array from the Sanity response
	const artistsData = artists?.data || [];

	// Calculate if lineup should be revealed based on any artist being revealed
	const isLineupRevealed = artistsData.length > 0 && artistsData.some(artist => artist.isRevealed);

	// If lineup is revealed, only show revealed artists
	// If not revealed, show placeholder data
	const visibleArtists = isLineupRevealed 
		? artistsData.filter(artist => artist.isRevealed)
		: placeholderArtists;

	return {
		artists: {
			query: artistsQuery,
			data: visibleArtists,
			options: { initial: artists }
		}
	};
};
