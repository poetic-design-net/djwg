import { postsQuery, testimonialsQuery, logosQuery, artistsQuery, eventsQuery, faqsQuery, featuredKnowledgeBaseItemsQuery, siteSettingsQuery, type Post, type Testimonial, type Logo, type Artist, type Event, type FAQ, type KnowledgeBaseItem, type SiteSettings, aboutUsQuery } from '$lib/sanity/queries';
import { homePageQuery, type HomePage } from '$lib/sanity/queries/homepage';
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
	const preview = event.url.searchParams.has('preview');
	
	// Load all data in parallel
	const [
		user,
		posts,
		testimonials,
		logos,
		artists,
		events,
		faqs,
		featuredKnowledgeBaseItems,
		aboutUs,
		siteSettings,
    homePage
	] = await Promise.all([
		event.locals.getUser(),
		loadQuery<Post[]>(postsQuery),
		loadQuery<Testimonial[]>(testimonialsQuery),
		loadQuery<Logo[]>(logosQuery),
		loadQuery<Artist[]>(artistsQuery),
		loadQuery<Event[]>(eventsQuery),
		loadQuery<FAQ[]>(faqsQuery),
		loadQuery<KnowledgeBaseItem[]>(featuredKnowledgeBaseItemsQuery),
		loadQuery(aboutUsQuery),
		loadQuery<SiteSettings>(siteSettingsQuery),
    loadQuery<HomePage>(homePageQuery)
	]);

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
		user,
		preview,
		siteSettings: {
			query: siteSettingsQuery,
			options: { initial: siteSettings, perspective: preview ? 'previewDrafts' : 'published' }
		},
		aboutUs: {
			query: aboutUsQuery,
			options: { initial: aboutUs, perspective: preview ? 'previewDrafts' : 'published' }
		},
		posts: {
			query: postsQuery,
			options: { initial: posts, perspective: preview ? 'previewDrafts' : 'published' }
		},
		testimonials: {
			query: testimonialsQuery,
			options: { initial: testimonials, perspective: preview ? 'previewDrafts' : 'published' }
		},
		logos: {
			query: logosQuery,
			options: { initial: logos, perspective: preview ? 'previewDrafts' : 'published' }
		},
		artists: {
			query: artistsQuery,
			data: visibleArtists,
			options: { initial: artists, perspective: preview ? 'previewDrafts' : 'published' }
		},
		events: {
			query: eventsQuery,
			data: events,
			options: { initial: events, perspective: preview ? 'previewDrafts' : 'published' }
		},
		faqs: {
			query: faqsQuery,
			options: { initial: faqs, perspective: preview ? 'previewDrafts' : 'published' }
		},
		featuredKnowledgeBaseItems: {
			query: featuredKnowledgeBaseItemsQuery,
			options: { initial: featuredKnowledgeBaseItems, perspective: preview ? 'previewDrafts' : 'published' }
		},
    homePage: {
      query: homePageQuery,
      options: { initial: homePage, perspective: preview ? 'previewDrafts' : 'published' }
    },
		isLineupRevealed,
		isArtistsSecret: !isLineupRevealed
	};
};
