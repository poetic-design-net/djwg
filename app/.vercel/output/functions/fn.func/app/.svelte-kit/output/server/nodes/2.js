import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.CI_3vrq4.js","_app/immutable/chunks/disclose-version.BbHg_3cr.js","_app/immutable/chunks/index-client.Bm3hC5iA.js","_app/immutable/chunks/legacy.4_-7NDyu.js","_app/immutable/chunks/each.C5ZC5uao.js","_app/immutable/chunks/attributes.CJjV9I4q.js","_app/immutable/chunks/render.BD8I6o9n.js","_app/immutable/chunks/class.Bcz9j7d2.js","_app/immutable/chunks/this.w5RDX-qx.js","_app/immutable/chunks/index.CCg6-XlO.js","_app/immutable/chunks/if.D9LSaWDq.js"];
export const stylesheets = ["_app/immutable/assets/2.DmoU7Rs-.css"];
export const fonts = [];
