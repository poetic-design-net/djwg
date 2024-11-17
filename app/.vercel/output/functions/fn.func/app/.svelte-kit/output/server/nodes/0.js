import * as universal from '../entries/pages/_layout.ts.js';
import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.DOkgrNJQ.js","_app/immutable/chunks/0.7b_ZNbxr.js","_app/immutable/chunks/index.CCg6-XlO.js","_app/immutable/chunks/index-client.Bm3hC5iA.js","_app/immutable/chunks/disclose-version.BbHg_3cr.js","_app/immutable/chunks/legacy.4_-7NDyu.js","_app/immutable/chunks/if.D9LSaWDq.js","_app/immutable/chunks/client.C1mLzEnz.js","_app/immutable/chunks/preload-helper.BqZSpHe9.js","_app/immutable/chunks/attributes.CJjV9I4q.js","_app/immutable/chunks/stores.CdskA7_W.js","_app/immutable/chunks/entry.bWnWDS-E.js","_app/immutable/chunks/class.Bcz9j7d2.js"];
export const stylesheets = ["_app/immutable/assets/0.zmDvmCVh.css"];
export const fonts = [];
