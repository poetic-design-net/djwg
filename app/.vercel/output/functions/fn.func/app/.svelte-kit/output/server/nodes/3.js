import * as server from '../entries/pages/post/_slug_/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/post/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/post/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.BjkOjbrC.js","_app/immutable/chunks/disclose-version.BbHg_3cr.js","_app/immutable/chunks/index-client.Bm3hC5iA.js","_app/immutable/chunks/legacy.4_-7NDyu.js","_app/immutable/chunks/render.BD8I6o9n.js","_app/immutable/chunks/if.D9LSaWDq.js","_app/immutable/chunks/attributes.CJjV9I4q.js","_app/immutable/chunks/preload-helper.BqZSpHe9.js","_app/immutable/chunks/each.C5ZC5uao.js","_app/immutable/chunks/client.C1mLzEnz.js","_app/immutable/chunks/index.CCg6-XlO.js","_app/immutable/chunks/svelte-component.B153s9Q5.js"];
export const stylesheets = ["_app/immutable/assets/3.CzlQrFAh.css"];
export const fonts = [];
