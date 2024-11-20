import { createRequestHandler, setServerClient } from '@sanity/svelte-loader';
import { serverClient } from '$lib/server/sanity/client';
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import type { Profile } from '@auth/core/types';

// Sets the client to be used by `loadQuery` when fetching data on the server.
setServerClient(serverClient);

interface GoogleProfile extends Profile {
  email_verified: boolean;
  locale: string;
}

// Auth.js configuration
const auth = SvelteKitAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    })
  ],
  secret: process.env.AUTH_SECRET ?? '',
  trustHost: true,
  debug: true, // Enable debug logs
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
});

// Sanity preview handler
const sanity = createRequestHandler();

// Combine both handlers
export const handle = sequence(auth.handle, sanity) satisfies Handle;
