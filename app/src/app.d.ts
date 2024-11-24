import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals extends LoaderLocals {
			supabase: SupabaseClient;
			getUser(): Promise<User | null>;
		}
		interface PageData {
			user: User | null;
			preview?: boolean;
		}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
