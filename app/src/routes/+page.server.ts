import { postsQuery, testimonialsQuery, logosQuery, artistsQuery, eventsQuery, faqsQuery, featuredKnowledgeBaseItemsQuery, type Post, type Testimonial, type Logo, type Artist, type Event, type FAQ, type KnowledgeBaseItem } from '$lib/sanity/queries';
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
	const posts = await loadQuery<Post[]>(postsQuery);
	const testimonials = await loadQuery<Testimonial[]>(testimonialsQuery);
	const logos = await loadQuery<Logo[]>(logosQuery);
	const artists = await loadQuery<Artist[]>(artistsQuery);
	const events = await loadQuery<Event[]>(eventsQuery);
	const faqs = await loadQuery<FAQ[]>(faqsQuery);
	const featuredKnowledgeBaseItems = await loadQuery<KnowledgeBaseItem[]>(featuredKnowledgeBaseItemsQuery);

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
		posts: {
			query: postsQuery,
			options: { initial: posts }
		},
		testimonials: {
			query: testimonialsQuery,
			options: { initial: testimonials }
		},
		logos: {
			query: logosQuery,
			options: { initial: logos }
		},
		artists: {
			query: artistsQuery,
			data: visibleArtists,
			options: { initial: artists }
		},
		events: {
			query: eventsQuery,
			data: events,
			options: { initial: events }
		},
		faqs: {
			query: faqsQuery,
			options: { initial: faqs }
		},
		featuredKnowledgeBaseItems: {
			query: featuredKnowledgeBaseItemsQuery,
			options: { initial: featuredKnowledgeBaseItems }
		},
		isLineupRevealed,
		isArtistsSecret: true
	};
};
