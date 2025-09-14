import {
	postsQuery,
	testimonialsQuery,
	logosQuery,
	artistsQuery,
	faqsQuery,
	featuredKnowledgeBaseItemsQuery,
	siteSettingsQuery,
	type Post,
	type Testimonial,
	type Logo,
	type Artist,
	type FAQ,
	type KnowledgeBaseItem,
	type SiteSettings,
	aboutUsQuery
} from '$lib/sanity/queries';
import { eventsQuery, type SanityEvent } from '$lib/sanity/queries/events';
import { homePageQuery, type HomePage } from '$lib/sanity/queries/homepage';
import { navigationQuery, type NavigationData, isValidNavigationData } from '$lib/sanity/queries/navigation';
import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { MenuItems } from '$lib/types/menu';

// Placeholder artists for unrevealed lineup
const placeholderArtists: Partial<Artist>[] = Array(6).fill({
	_id: 'placeholder',
	name: "Coming Soon",
	role: "DJ & Producer",
	description: "Details will be announced soon...",
	image: {
		_type: 'image',
		asset: {
			_ref: '/assets/home_hero_2.jpg',
			_type: 'reference'
		}
	},
	socials: {
		instagram: "#",
		soundcloud: "#"
	},
	isRevealed: false,
	order: 0
});

// Default navigation data fallback
const defaultNavigationData: MenuItems = [
	{
		_id: 'navigation-workshops',
		_type: 'navigation',
		type: 'megamenu',
		title: 'Workshops',
		sortOrder: 10,
		featured: {
			title: 'Featured Workshop',
			description: 'Learn the basics of DJing',
			image: {
				_type: 'image',
				asset: {
					_type: 'reference',
					_ref: 'image-home_hero_2-jpg'
				}
			},
			link: '/workshops',
			linkType: 'page'
		},
		columns: [
			{
				title: 'Workshop Categories',
				items: [
					{ label: 'Beginner', link: '/workshops/beginner', linkType: 'page' },
					{ label: 'Advanced', link: '/workshops/advanced', linkType: 'page' }
				]
			}
		],
		quickLinks: [
			{ label: 'All Workshops', link: '/workshops', linkType: 'page' },
			{ label: 'Schedule', link: '/schedule', linkType: 'page' }
		]
	}
];

interface Locals extends LoaderLocals {
	supabase: SupabaseClient;
	getUser(): Promise<User | null>;
}

export const load = async ({ locals, url, setHeaders }: {
	locals: Locals;
	url: URL;
	setHeaders: (headers: { [key: string]: string }) => void
}) => {
	const { loadQuery } = locals;
	const preview = url.searchParams.has('preview');

	// Aggressive caching for production
	if (!preview) {
		setHeaders({
			'cache-control': 'public, max-age=60, s-maxage=3600', // 1 min client, 1 hour server
			'cdn-cache-control': 'max-age=3600' // CDN cache
		});
	} else {
		setHeaders({
			'cache-control': 'no-cache, no-store, must-revalidate'
		});
	}

	// Critical data for immediate rendering (user, homepage, events)
	const criticalDataPromise = Promise.all([
		locals.getUser(),
		loadQuery<HomePage>(homePageQuery),
		loadQuery<SanityEvent[]>(eventsQuery),
		loadQuery<SiteSettings>(siteSettingsQuery)
	]);

	// Secondary data (can load after initial render)
	const secondaryDataPromise = Promise.all([
		loadQuery<Post[]>(postsQuery),
		loadQuery<Testimonial[]>(testimonialsQuery),
		loadQuery<Logo[]>(logosQuery),
		loadQuery<Artist[]>(artistsQuery),
		loadQuery<FAQ[]>(faqsQuery),
		loadQuery<KnowledgeBaseItem[]>(featuredKnowledgeBaseItemsQuery),
		loadQuery(aboutUsQuery),
		loadQuery<NavigationData>(navigationQuery)
	]);

	// Wait for critical data
	const [
		user,
		homePage,
		events,
		siteSettings
	] = await criticalDataPromise;

	// Get secondary data with timeout fallback
	let secondaryData;
	try {
		secondaryData = await Promise.race([
			secondaryDataPromise,
			new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
		]) as any[];
	} catch {
		// Fallback to empty data if timeout
		secondaryData = Array(8).fill({ data: null });
	}

	const [
		posts,
		testimonials,
		logos,
		artists,
		faqs,
		featuredKnowledgeBaseItems,
		aboutUs,
		navigationResult
	] = secondaryData;

	// Process artists data
	const artistsData = artists?.data || [];
	const isLineupRevealed = artistsData.length > 0 && artistsData.some((artist: Artist) => artist.isRevealed);
	const visibleArtists = isLineupRevealed
		? artistsData.filter((artist: Artist) => artist.isRevealed)
		: placeholderArtists;

	// Process navigation data
	let navigationData = navigationResult?.data;
	if (!navigationData || !isValidNavigationData(navigationData)) {
		navigationData = defaultNavigationData;
	}

	// Return optimized data structure
	return {
		user,
		preview,
		// Critical data for immediate rendering
		siteSettings: {
			query: siteSettingsQuery,
			options: { initial: siteSettings?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
		},
		homePage: {
			query: homePageQuery,
			options: { initial: homePage?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
		},
		events: {
			query: eventsQuery,
			data: events?.data ? events.data.map((event: SanityEvent) => ({
				...event,
				image: event.image
			})) : [],
			options: { initial: events?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		// Secondary data
		aboutUs: {
			query: aboutUsQuery,
			options: { initial: aboutUs?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
		},
		posts: {
			query: postsQuery,
			options: { initial: posts?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		testimonials: {
			query: testimonialsQuery,
			options: { initial: testimonials?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		logos: {
			query: logosQuery,
			options: { initial: logos?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		artists: {
			query: artistsQuery,
			data: visibleArtists,
			options: { initial: artists?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		faqs: {
			query: faqsQuery,
			options: { initial: faqs?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		featuredKnowledgeBaseItems: {
			query: featuredKnowledgeBaseItemsQuery,
			options: { initial: featuredKnowledgeBaseItems?.data || [], perspective: preview ? 'previewDrafts' : 'published' }
		},
		navigation: navigationData,
		isLineupRevealed,
		isArtistsSecret: !isLineupRevealed
	};
};