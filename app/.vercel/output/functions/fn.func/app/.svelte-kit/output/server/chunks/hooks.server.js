import { a as assertEnvVar, c as client } from "./client.js";
import { e as error, r as redirect } from "./index.js";
import { a as unstable__serverClient, l as loadQuery, s as setServerClient } from "./createQueryStore.js";
import crypto from "crypto";
const schemaType = "sanity.previewUrlSecret", schemaIdPrefix = "sanity-preview-url-secret", schemaIdSingleton = `${schemaIdPrefix}.share-access`, schemaTypeSingleton = "sanity.previewUrlShareAccess", apiVersion = "2023-11-09", urlSearchParamPreviewSecret = "sanity-preview-secret", urlSearchParamPreviewPathname = "sanity-preview-pathname", urlSearchParamPreviewPerspective = "sanity-preview-perspective", isDev = process.env.NODE_ENV === "development", SECRET_TTL = 60 * 60, fetchSecretQuery = (
  /* groq */
  `*[_type == "${schemaType}" && secret == $secret && dateTime(_updatedAt) > dateTime(now()) - ${SECRET_TTL}][0]{
    _id,
    _updatedAt,
    secret,
    studioUrl,
  }`
), fetchSharedAccessSecretQuery = (
  /* groq */
  `*[_id == "${schemaIdSingleton}" && _type == "${schemaTypeSingleton}" && secret == $secret][0]{
  secret,
  studioUrl,
}`
), tag = "sanity.preview-url-secret";
function createClientWithConfig(client2) {
  if (!client2)
    throw new TypeError("`client` is required");
  if (!client2.config().token)
    throw new TypeError("`client` must have a `token` specified");
  return client2.withConfig({
    perspective: "raw",
    // Userland might be using an API version that's too old to use perspectives
    apiVersion,
    // We can't use the CDN, the secret is typically validated right after it's created
    useCdn: false,
    // Don't waste time returning a source map, we don't need it
    resultSourceMap: false,
    // @ts-expect-error - If stega is enabled, make sure it's disabled
    stega: false
  });
}
function parsePreviewUrl(unsafeUrl) {
  const url = new URL(unsafeUrl, "http://localhost"), secret = url.searchParams.get(urlSearchParamPreviewSecret);
  if (!secret)
    throw new Error("Missing secret");
  const studioPreviewPerspective = url.searchParams.get(urlSearchParamPreviewPerspective);
  let redirectTo;
  const unsafeRedirectTo = url.searchParams.get(urlSearchParamPreviewPathname);
  if (unsafeRedirectTo) {
    const { pathname, search, hash } = new URL(unsafeRedirectTo, "http://localhost");
    redirectTo = `${pathname}${search}${hash}`;
  }
  return { secret, redirectTo, studioPreviewPerspective };
}
async function validateSecret(client2, secret, disableCacheNoStore) {
  if (typeof EdgeRuntime < "u" && await new Promise((resolve) => setTimeout(resolve, 300)), !secret || !secret.trim())
    return { isValid: false, studioUrl: null };
  const { private: privateSecret, public: publicSecret } = await client2.fetch(
    `{
      "private": ${fetchSecretQuery},
      "public": ${fetchSharedAccessSecretQuery}
    }`,
    { secret },
    {
      tag,
      // In CloudFlare Workers we can't pass the cache header
      ...disableCacheNoStore ? void 0 : { cache: "no-store" }
    }
  );
  return privateSecret ? !privateSecret?._id || !privateSecret?._updatedAt || !privateSecret?.secret ? { isValid: false, studioUrl: null } : { isValid: secret === privateSecret.secret, studioUrl: privateSecret.studioUrl } : publicSecret?.secret ? { isValid: secret === publicSecret.secret, studioUrl: publicSecret.studioUrl } : { isValid: false, studioUrl: null };
}
async function validatePreviewUrl(_client, previewUrl, disableCacheNoStore = globalThis.navigator?.userAgent === "Cloudflare-Workers") {
  const client2 = createClientWithConfig(_client);
  let parsedPreviewUrl;
  try {
    parsedPreviewUrl = parsePreviewUrl(previewUrl);
  } catch (error2) {
    return isDev && console.error("Failed to parse preview URL", error2, {
      previewUrl,
      client: client2
    }), { isValid: false };
  }
  const { isValid, studioUrl } = await validateSecret(
    client2,
    parsedPreviewUrl.secret,
    disableCacheNoStore
  ), redirectTo = isValid ? parsedPreviewUrl.redirectTo : void 0, studioPreviewPerspective = isValid ? parsedPreviewUrl.studioPreviewPerspective : void 0;
  let studioOrigin;
  if (isValid)
    try {
      studioOrigin = new URL(studioUrl).origin;
    } catch (error2) {
      isDev && console.error("Failed to parse studioUrl", error2, {
        previewUrl,
        studioUrl
      });
    }
  return { isValid, redirectTo, studioOrigin, studioPreviewPerspective };
}
const handlePreview = ({ client: client2, preview }) => {
  const cookieName = preview?.cookie || "__sanity_preview";
  const enablePath = preview?.endpoints?.enable || "/preview/enable";
  const disablePath = preview?.endpoints?.disable || "/preview/disable";
  const secret = preview?.secret || crypto.randomBytes(16).toString("hex");
  if (!client2)
    throw new Error("No client configured for preview");
  return async ({ event, resolve }) => {
    const { cookies, url } = event;
    event.locals.preview = event.cookies.get(cookieName) === secret;
    const perspective = event.locals.preview ? "previewDrafts" : "published";
    const useCdn = event.locals.preview ? false : true;
    if (event.url.pathname === enablePath) {
      const { isValid, redirectTo = "/" } = await validatePreviewUrl(client2, url.toString());
      if (!isValid) {
        throw error(401, "Invalid secret");
      }
      const devMode = process.env.NODE_ENV === "development";
      cookies.set(cookieName, secret, {
        httpOnly: true,
        sameSite: devMode ? "lax" : "none",
        secure: !devMode,
        path: "/"
      });
      return redirect(307, redirectTo);
    }
    if (event.url.pathname === disablePath) {
      cookies.delete(cookieName, { path: "/" });
      return redirect(307, url.searchParams.get("redirect") || "/");
    }
    event.locals.client = client2.withConfig({
      perspective,
      useCdn
    });
    return await resolve(event);
  };
};
function sequence(...handlers) {
  const length = handlers.length;
  if (!length) return ({ event, resolve }) => resolve(event);
  return ({ event, resolve }) => {
    return apply_handle(0, event, {});
    function apply_handle(i, event2, parent_options) {
      const handle2 = handlers[i];
      return handle2({
        event: event2,
        resolve: (event3, options) => {
          const transformPageChunk = async ({ html, done }) => {
            if (options?.transformPageChunk) {
              html = await options.transformPageChunk({ html, done }) ?? "";
            }
            if (parent_options?.transformPageChunk) {
              html = await parent_options.transformPageChunk({ html, done }) ?? "";
            }
            return html;
          };
          const filterSerializedResponseHeaders = parent_options?.filterSerializedResponseHeaders ?? options?.filterSerializedResponseHeaders;
          const preload = parent_options?.preload ?? options?.preload;
          return i < length - 1 ? apply_handle(i + 1, event3, {
            transformPageChunk,
            filterSerializedResponseHeaders,
            preload
          }) : resolve(event3, { transformPageChunk, filterSerializedResponseHeaders, preload });
        }
      });
    }
  };
}
const handleLoadQuery = ({ client: _client, loadQuery: loadQuery$1 }) => async ({ event, resolve }) => {
  const client2 = _client || event.locals.client;
  if (!client2)
    throw new Error("No client instance provided to handleLoadQuery");
  const lq = loadQuery$1 || loadQuery;
  const { perspective, useCdn } = client2.config();
  event.locals.loadQuery = (query, params, options = {}) => {
    const stega = event.locals.preview ? options.stega : false;
    return lq(query, params, {
      ...options,
      perspective,
      useCdn,
      stega
    });
  };
  return await resolve(event);
};
const createRequestHandler = ({ preview, loadQuery: loadQuery2 } = {}) => {
  const client2 = preview?.client || unstable__serverClient.instance;
  if (!client2)
    throw new Error("No Sanity client configured for preview");
  return sequence(handlePreview({ client: client2, preview }), handleLoadQuery({ loadQuery: loadQuery2 }));
};
const SANITY_API_READ_TOKEN = "skzPAmStEhIfoGfEuHwOKAZe1yOovcnHG8EkQ59BSQsqHtg7cdhyhl1VUt2M4T1mf7ZU4sll7iBKhSS1u1o0FqbxSAALLTiqhXJObnRqN7H9JG5zPJOfdxj8DoWkqpPtLA7zHPVpF9sbMr4ulAGUVPJkQSnTNGAXFeBEV1t5u20ayv6Suhlo";
const token = assertEnvVar(SANITY_API_READ_TOKEN, "SANITY_API_READ_TOKEN");
const serverClient = client.withConfig({
  token,
  useCdn: false,
  stega: true
});
setServerClient(serverClient);
const handle = createRequestHandler();
export {
  handle
};
