import { postsQuery, testimonialsQuery, logosQuery, artistsQuery, eventsQuery, faqsQuery, featuredKnowledgeBaseItemsQuery, siteSettingsQuery, type Post, type Testimonial, type Logo, type Artist, type Event, type FAQ, type KnowledgeBaseItem, type SiteSettings, aboutUsQuery } from '$lib/sanity/queries';
import { homePageQuery, type HomePage } from '$lib/sanity/queries/homepage';
import { navigationQuery, type NavigationData, isValidNavigationData } from '$lib/sanity/queries/navigation';
import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { MenuItems } from '$lib/types/menu';

// Placeholder artist data for secret state
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

// Default navigation data for testing
const defaultNavigationData: MenuItems = {
  workshops: {
    _id: 'navigation-workshops',
    _type: 'navigation',
    title: 'Workshops',
    featured: {
      title: 'Featured Workshop',
      description: 'Learn the basics of DJing',
      image: '/assets/home_hero_2.jpg',
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
  },
  join: {
    _id: 'navigation-join',
    _type: 'navigation',
    title: 'Join Us',
    featured: {
      title: 'Become a Member',
      description: 'Join our community',
      image: '/assets/home_hero.jpg',
      link: '/join',
      linkType: 'page'
    },
    columns: [
      {
        title: 'Membership',
        items: [
          { label: 'Benefits', link: '#benefits', linkType: 'anchor' },
          { label: 'Pricing', link: '#pricing', linkType: 'anchor' }
        ]
      }
    ],
    quickLinks: [
      { label: 'Sign Up', link: '/sign-up', linkType: 'page' },
      { label: 'Contact', link: '/contact', linkType: 'page' }
    ]
  },
  about: {
    _id: 'navigation-about',
    _type: 'navigation',
    title: 'About Us',
    featured: {
      title: 'Our Story',
      description: 'Learn about our mission',
      image: '/assets/home_hero.jpg',
      link: '/about',
      linkType: 'page'
    },
    columns: [
      {
        title: 'Company',
        items: [
          { label: 'Team', link: '#team', linkType: 'anchor' },
          { label: 'Mission', link: '#mission', linkType: 'anchor' }
        ]
      }
    ],
    quickLinks: [
      { label: 'About Us', link: '/about', linkType: 'page' },
      { label: 'FAQ', link: '/faq', linkType: 'page' }
    ]
  }
};

interface Locals extends LoaderLocals {
  supabase: SupabaseClient;
  getUser(): Promise<User | null>;
}

export const load = async ({ locals, url, setHeaders }: { locals: Locals; url: URL; setHeaders: (headers: { [key: string]: string }) => void }) => {
  const { loadQuery } = locals;
  const preview = url.searchParams.has('preview');
  
  // Set cache headers - don't cache preview mode, cache normal mode for 1 hour
  if (!preview) {
    setHeaders({
      'cache-control': 'public, max-age=0, s-maxage=3600'
    });
  } else {
    setHeaders({
      'cache-control': 'no-cache, no-store, must-revalidate'
    });
  }

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
    homePage,
    navigationResult
  ] = await Promise.all([
    locals.getUser(),
    loadQuery<Post[]>(postsQuery),
    loadQuery<Testimonial[]>(testimonialsQuery),
    loadQuery<Logo[]>(logosQuery),
    loadQuery<Artist[]>(artistsQuery),
    loadQuery<Event[]>(eventsQuery),
    loadQuery<FAQ[]>(faqsQuery),
    loadQuery<KnowledgeBaseItem[]>(featuredKnowledgeBaseItemsQuery),
    loadQuery(aboutUsQuery),
    loadQuery<SiteSettings>(siteSettingsQuery),
    loadQuery<HomePage>(homePageQuery),
    loadQuery<NavigationData>(navigationQuery)
  ]);

  // Debug logging for navigation
  console.log('Raw Navigation Result:', navigationResult);
  console.log('Navigation Data:', navigationResult?.data);

  // Get the actual artists array from the Sanity response
  const artistsData = artists?.data || [];

  // Calculate if lineup should be revealed based on any artist being revealed
  const isLineupRevealed = artistsData.length > 0 && artistsData.some((artist: Artist) => artist.isRevealed);

  // If lineup is revealed, only show revealed artists
  // If not revealed, show placeholder data
  const visibleArtists = isLineupRevealed 
    ? artistsData.filter((artist: Artist) => artist.isRevealed)
    : placeholderArtists;

  // Get navigation data with fallback to default
  const navigationData = navigationResult?.data || defaultNavigationData;

  console.log('Navigation Data to be used:', navigationData);
  
  if (!isValidNavigationData(navigationData)) {
    console.warn('Navigation data structure is incomplete. Required keys missing.');
    console.log('Available keys:', Object.keys(navigationData));
  }

  return {
    user,
    preview,
    siteSettings: {
      query: siteSettingsQuery,
      options: { initial: siteSettings?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    aboutUs: {
      query: aboutUsQuery,
      options: { initial: aboutUs?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    posts: {
      query: postsQuery,
      options: { initial: posts?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    testimonials: {
      query: testimonialsQuery,
      options: { initial: testimonials?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    logos: {
      query: logosQuery,
      options: { initial: logos?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    artists: {
      query: artistsQuery,
      data: visibleArtists,
      options: { initial: artists?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    events: {
      query: eventsQuery,
      data: events?.data || null,
      options: { initial: events?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    faqs: {
      query: faqsQuery,
      options: { initial: faqs?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    featuredKnowledgeBaseItems: {
      query: featuredKnowledgeBaseItemsQuery,
      options: { initial: featuredKnowledgeBaseItems?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    homePage: {
      query: homePageQuery,
      options: { initial: homePage?.data || null, perspective: preview ? 'previewDrafts' : 'published' }
    },
    navigation: navigationData,
    isLineupRevealed,
    isArtistsSecret: !isLineupRevealed
  };
};
