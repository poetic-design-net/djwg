import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { FooterSettings } from '$lib/sanity/queries/content';

export interface LayoutData {
    supabase: SupabaseClient;
    session: Session | null;
    user: User | null;
    preview: boolean;
    footerSettings: FooterSettings | null;
}
