import { p as push, d as bind_props, c as pop, e as stringify, f as store_get, g as slot, u as unsubscribe_stores } from "../../chunks/index3.js";
import { p as page } from "../../chunks/stores.js";
import "../../chunks/client.js";
import { J as fallback } from "../../chunks/utils.js";
import { a as attr } from "../../chunks/attributes.js";
import { i as isPreviewing } from "../../chunks/previewStore.js";
function VisualEditing($$payload, $$props) {
  push();
  let zIndex = fallback($$props["zIndex"], () => void 0, true);
  let refresh = fallback($$props["refresh"], () => void 0, true);
  bind_props($$props, { zIndex, refresh });
  pop();
}
function LiveMode($$payload, $$props) {
  push();
  pop();
}
function MobileMenu($$payload, $$props) {
  push();
  let isOpen = fallback($$props["isOpen"], false);
  $$payload.out += `<div${attr("class", `${stringify(isOpen ? "block" : "hidden")} fixed top-0 left-0 bottom-0 w-4/6 sm:max-w-xs z-50`)}><button class="fixed inset-0 bg-black opacity-60"></button> <nav class="relative z-10 px-9 pt-8 h-full bg-black overflow-y-auto"><div class="flex flex-wrap justify-between h-full"><div class="w-full"><div class="flex items-center justify-between -m-2"><div class="w-auto p-2"><a class="inline-block" href="/"><img src="assets/logo.svg" alt=""></a></div> <div class="w-auto p-2"><button class="inline-block text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></div></div> <div class="flex flex-col justify-center py-16 w-full"><ul><li class="mb-8 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Home</a></li> <li class="mb-8 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">About us</a></li> <li class="mb-8 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Wallet</a></li> <li class="text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Blog</a></li></ul></div> <div class="flex flex-col justify-end w-full pb-8"><a class="inline-block px-8 py-4 text-center text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="/">Get in touch</a></div></div></nav></div>`;
  bind_props($$props, { isOpen });
  pop();
}
function Header($$payload) {
  let mobileNavOpen = false;
  $$payload.out += `<div class="container px-4 mx-auto"><div class="flex items-center justify-between pt-10 -m-2"><div class="w-auto p-2"><div class="flex flex-wrap items-center"><div class="w-auto"><a class="relative z-10 inline-block" href="#"><img class="w-32 -mt-5" src="assets/logo.svg" alt=""></a></div></div></div> <div class="w-auto p-2"><div class="flex flex-wrap items-center"><div class="w-auto hidden lg:block"><ul class="flex items-center mr-12 font-heading"><li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Home</a></li> <li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">About us</a></li> <li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Mitmachen</a></li> <li class="text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Blog</a></li></ul></div> <div class="w-auto hidden lg:block"><div class="inline-block"><a class="inline-block font-heading font-light px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="/">Tickets</a></div></div> <div class="w-auto lg:hidden"><button class="relative z-10 inline-block"><svg class="text-green-500" width="51" height="51" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="56" height="56" rx="28" fill="currentColor"></rect><path d="M37 32H19M37 24H19" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></div></div></div></div> `;
  MobileMenu($$payload, { isOpen: mobileNavOpen });
  $$payload.out += `<!----> <img class="absolute top-0 left-0" src="nightsable-assets/images/headers/layer-blur.svg" alt="">`;
}
function Footer($$payload) {
  $$payload.out += `<div class="py-14 bg-black rounded-b-7xl"></div> <div class="py-24"><div class="container px-4 mx-auto"><div class="flex flex-wrap justify-center -m-8 mb-28"><div class="w-full md:w-1/2 lg:w-4/12 p-8"><div class="md:max-w-xs"><img class="mb-7 w-32" src="assets/logo_dark.svg" alt=""> <p class="text-gray-400 font-medium">Nightsable is a strategic branding agency focused on brand creation, rebrands, and brand</p></div></div> <div class="w-full md:w-1/2 lg:w-2/12 p-8"><h3 class="mb-6 text-lg text-black font-medium">About</h3> <ul><li class="mb-2.5"><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Contact</a></li> <li class="mb-2.5"><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Blog</a></li> <li class="mb-2.5"><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Our Story</a></li> <li><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Careers</a></li></ul></div> <div class="w-full md:w-1/2 lg:w-2/12 p-8"><h3 class="mb-6 text-lg text-black font-medium">Company</h3> <ul><li class="mb-2.5"><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Contact</a></li> <li class="mb-2.5"><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Blog</a></li> <li class="mb-2.5"><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Our Story</a></li> <li><a class="inline-block text-lg font-medium text-gray-400 hover:text-black transition duration-300" href="#">Careers</a></li></ul></div> <div class="w-full md:w-1/2 lg:flex-1 p-8"><div class="flex flex-wrap -m-2"><div class="w-full p-2"><a class="block py-5 px-8 bg-white rounded-full" href="#"><div class="flex flex-wrap items-center -m-2"><div class="w-auto p-2"><img src="nightsable-assets/images/footers/twitter.svg" alt=""></div> <div class="flex-1 p-2"><p class="text-black">Follow us on Twitter for updates</p></div></div></a></div> <div class="w-full p-2"><a class="block py-5 px-8 bg-white rounded-full" href="#"><div class="flex flex-wrap items-center -m-2"><div class="w-auto p-2"><img src="nightsable-assets/images/footers/instagram.svg" alt=""></div> <div class="flex-1 p-2"><p class="text-black">Follow us on Instagram for updates</p></div></div></a></div> <div class="w-full p-2"><a class="block py-5 px-8 bg-white rounded-full" href="#"><div class="flex flex-wrap items-center -m-2"><div class="w-auto p-2"><img src="nightsable-assets/images/footers/tiktok.svg" alt=""></div> <div class="flex-1 p-2"><p class="text-black">Follow us on TikTok for updates</p></div></div></a></div></div></div></div> <div class="flex flex-wrap justify-between -m-2"><div class="w-auto p-2"><p class="inline-block text-sm font-medium text-black text-opacity-60">© 2025 djworkshopgermany.de</p></div> <div class="w-auto p-2"><div class="flex flex-wrap items-center -m-2 sm:-m-7"><div class="w-auto p-2 sm:p-7"><a class="inline-block text-sm text-black text-opacity-60 hover:text-opacity-100 font-medium transition duration-300" href="#">Terms of Use</a></div> <div class="w-auto p-2 sm:p-7"><a class="inline-block text-sm text-black text-opacity-60 hover:text-opacity-100 font-medium transition duration-300" href="#">Privacy Policy</a></div></div></div></div></div></div>`;
}
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  if (store_get($$store_subs ??= {}, "$isPreviewing", isPreviewing)) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${attr("href", `/preview/disable?redirect=${store_get($$store_subs ??= {}, "$page", page).url.pathname}`)} class="preview-toggle svelte-wbfv4u"><span class="svelte-wbfv4u">Preview Enabled</span> <span class="svelte-wbfv4u">Disable Preview</span></a>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <main>`;
  Header($$payload);
  $$payload.out += `<!----> <!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></main> <footer><section class="bg-gray-50 overflow-hidden">`;
  Footer($$payload);
  $$payload.out += `<!----></section></footer> `;
  if (store_get($$store_subs ??= {}, "$isPreviewing", isPreviewing)) {
    $$payload.out += "<!--[-->";
    VisualEditing($$payload, {});
    $$payload.out += `<!----> `;
    LiveMode();
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};
