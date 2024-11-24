import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { FooterSettings } from '$lib/sanity/queries/content';
import type { Post, Testimonial, Logo, Artist, Event, FAQ, KnowledgeBaseItem, SiteSettings } from '$lib/sanity/queries';
import type { HomePage } from '$lib/sanity/queries/homepage';

export interface LayoutData {
    supabase: SupabaseClient;
    session: Session | null;
    user: User | null;
    preview: boolean;
    footerSettings: FooterSettings | null;
}

export interface PageData {
    user: User | null;
    preview: boolean;
    siteSettings: {
        query: string;
        options: { initial: SiteSettings | null; perspective: string };
    };
    aboutUs: {
        query: string;
        options: { initial: any; perspective: string };
    };
    posts: {
        query: string;
        options: { initial: Post[] | null; perspective: string };
    };
    testimonials: {
        query: string;
        options: { initial: Testimonial[] | null; perspective: string };
    };
    logos: {
        query: string;
        options: { initial: Logo[] | null; perspective: string };
    };
    artists: {
        query: string;
        data: Artist[];
        options: { initial: Artist[] | null; perspective: string };
    };
    events: {
        query: string;
        data: Event[] | null;
        options: { initial: Event[] | null; perspective: string };
    };
    faqs: {
        query: string;
        options: { initial: FAQ[] | null; perspective: string };
    };
    featuredKnowledgeBaseItems: {
        query: string;
        options: { initial: KnowledgeBaseItem[] | null; perspective: string };
    };
    homePage: {
        query: string;
        options: { initial: HomePage | null; perspective: string };
    };
    isLineupRevealed: boolean;
    isArtistsSecret: boolean;
}
