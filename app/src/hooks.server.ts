import { createRequestHandler, setServerClient } from '@sanity/svelte-loader';
import { serverClient } from '$lib/server/sanity/client';
import type { Handle } from '@sveltejs/kit';

// Sets the client to be used by `loadQuery` when fetching data on the server.
setServerClient(serverClient);

// Sanity preview handler
export const handle = createRequestHandler() satisfies Handle;
