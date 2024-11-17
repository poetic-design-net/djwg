import { p as push, j as ensure_array_like, e as stringify, c as pop, f as store_get, u as unsubscribe_stores } from "../../chunks/index3.js";
import { a as attr } from "../../chunks/attributes.js";
import { e as escape_html } from "../../chunks/escaping.js";
import { w as writable } from "../../chunks/index2.js";
import { K as noop } from "../../chunks/utils.js";
const now = () => Date.now();
const raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (_) => noop()
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function loop(callback) {
  let task;
  if (raf.tasks.size === 0) ;
  return {
    promise: new Promise((fulfill) => {
      raf.tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      raf.tasks.delete(task);
    }
  };
}
function Start($$payload, $$props) {
  push();
  let currentImageIndex = 0;
  const images = [
    "assets/home_hero.jpg",
    "assets/home_hero_2.jpg",
    "assets/home_hero.jpg"
  ];
  const each_array = ensure_array_like(images);
  $$payload.out += `<div class="relative pt-14 pb-16"><div class="relative z-10 container px-4 mx-auto"><div class="flex flex-wrap lg:items-center -m-8"><div class="w-full md:w-1/2 p-8"><span class="inline-block mb-2.5 text-sm text-green-400 font-medium tracking-tighter">von DJs für DJs</span> <h1 class="font-heading mb-10 text-7xl lg:text-8xl xl:text-10xl text-white tracking-tighter"><span>Der ultimative DJ Workshop</span> <span class="inline-block"><span>im deutschen</span></span> <span>Raum</span> <img class="inline-block pr-6" src="nightsable-assets/images/headers/star4.svg" alt=""></h1> <div class="flex flex-wrap -m-2 mb-12"><div class="w-auto p-2"><a class="inline-block px-8 py-4 tracking-tighter border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Jetzt Tickets sichern</a></div> <div class="w-auto p-2"><a class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Mehr erfahren</a></div></div> <p class="text-lg text-white md:max-w-xs">DJWORKSHOPGERMANY bietet professionelle DJ-Kurse für Anfänger und Fortgeschrittene in ganz Deutschland an.</p></div> <div class="w-full md:w-1/2 p-8"><div class="image-container mx-auto md:mr-0 relative overflow-hidden rounded-3xl svelte-1v1geno"><!--[-->`;
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    let image = each_array[index];
    $$payload.out += `<img${attr("src", image)}${attr("alt", `Gallery image ${stringify(index + 1)}`)} class="w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out object-cover"${attr("style", `opacity: ${stringify(index === currentImageIndex ? "1" : "0")};`)}>`;
  }
  $$payload.out += `<!--]--></div></div></div></div></div>`;
  pop();
}
function linear(t) {
  return t;
}
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function Cards($$payload, $$props) {
  push();
  const cards = [
    {
      image: "assets/home_hero_2.jpg",
      tag: "DJ Workshop",
      title: "Mixing Masterclass",
      description: "Learn advanced mixing techniques from professional DJs"
    },
    {
      image: "nightsable-assets/images/cards/bg-image2.png",
      tag: "DJ Workshop",
      title: "Music Production",
      description: "Create your own tracks and remixes"
    },
    {
      image: "nightsable-assets/images/cards/bg-image3.png",
      tag: "DJ Workshop",
      title: "Live Performance",
      description: "Master the art of live DJ performance"
    },
    {
      image: "assets/home_hero_2.jpg",
      tag: "DJ Workshop",
      title: "Mixing Masterclass",
      description: "Learn advanced mixing techniques from professional DJs"
    }
  ];
  let currentIndex = 0;
  let cardsPerView = 3;
  const each_array = ensure_array_like(cards);
  const each_array_1 = ensure_array_like(Array(cards.length - cardsPerView + 1));
  $$payload.out += `<div class="container px-4 mx-auto"><div class="text-center"><span class="inline-block mb-4 text-sm text-purple-400 font-medium tracking-tighter">Featured Workshops</span> <h2 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-8xl md:max-w-md mx-auto">Master the Art of DJing</h2> <p class="mb-20 text-gray-300 md:max-w-md mx-auto">Join our professional workshops and take your DJ skills to the next level</p></div> <div class="relative"><div class="absolute -top-16 right-0 flex space-x-2 z-10"><button><div class="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200"><svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.7041 7.12817L4.15635 13.6759L10.7041 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22.4941 13.6759H4.33949" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></button> <button><div class="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200"><svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.2959 7.12817L22.8437 13.6759L16.2959 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.50586 13.6759H22.6605" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></button></div> <div class="relative overflow-hidden" role="region" aria-label="Workshop slider"><div class="flex transition-transform duration-500 ease-in-out mt-4"${attr("style", `transform: translateX(-${stringify(currentIndex * (100 / cardsPerView))}%)`)}><!--[-->`;
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    let card = each_array[index];
    $$payload.out += `<div${attr("class", `w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 p-4 transition-opacity duration-500 ${stringify([
      index >= currentIndex && index < currentIndex + cardsPerView ? "opacity-100" : "",
      index < currentIndex || index >= currentIndex + cardsPerView ? "opacity-0" : ""
    ].filter(Boolean).join(" "))}`)}><div class="relative overflow-hidden rounded-5xl"><img class="w-full h-[300px] md:h-[400px] object-cover transform hover:scale-105 transition duration-500"${attr("src", card.image)}${attr("alt", card.title)}> <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/90 to-transparent p-4 md:p-8" style="--tw-gradient-stops: var(--tw-gradient-from) 0%, var(--tw-gradient-from) 33%, var(--tw-gradient-to) 100%;"><span class="inline-block rounded-full bg-green-500 p-2 mb-2 text-xs text-black font-medium tracking-tighter">${escape_html(card.tag)}</span> <a class="group block max-w-sm" href="#workshops"><h3 class="mb-2 text-lg md:text-xl text-white tracking-3xl hover:underline">${escape_html(card.title)}</h3></a> <p class="mb-4 text-xs md:text-sm text-white/80">${escape_html(card.description)}</p> <a class="group inline-flex items-center" href="#workshops"><span class="mr-3.5 text-sm text-white font-medium">Learn more</span> <svg class="transform group-hover:rotate-90 transition duration-300" width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 0.75L1 11.25" stroke="white" stroke-width="1.43182" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.5 10.3781V0.75H1.87187" stroke="white" stroke-width="1.43182" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></div></div>`;
  }
  $$payload.out += `<!--]--></div> <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"><!--[-->`;
  for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
    each_array_1[index];
    $$payload.out += `<button${attr("class", `w-3 h-3 rounded-full transition-all duration-300 ${stringify(index === currentIndex ? "bg-purple-400 w-6" : "bg-white/50 hover:bg-white/80")}`)}></button>`;
  }
  $$payload.out += `<!--]--></div></div></div></div>`;
  pop();
}
function Intro($$payload) {
  $$payload.out += `<div class="relative container px-4 mx-auto"><div class="relative p-16 bg-green-500 border-b border-blueGray-900 rounded-5xl"><div class="flex flex-wrap lg:items-center -m-8"><div class="w-full md:w-1/2 p-8"><img class="relative rounded-xl" src="assets/home_hero.jpg" alt="DJ Workshop"></div> <div class="w-full md:w-1/2 p-8"><div class="md:max-w-md"><h2 class="font-heading mb-4 text-5xl lg:text-7xl text-black tracking-5xl lg:tracking-7xl">Werde zum <span class="block">DJ-Profi</span></h2> <p class="mb-6 text-black text-xl">Entdecke die Kunst des DJings mit professionellen Workshops für Anfänger und Fortgeschrittene. Von Mixing-Techniken bis zur Crowd Control - wir bringen dich auf das nächste Level.</p> <div class="flex flex-wrap items-center -m-2"><div class="w-auto p-2"><a href="#workshops" class="inline-block px-8 py-4 text-center text-black font-medium tracking-tighter bg-white hover:bg-black/95 hover:text-white border-2 hover:border-black/95 border-white focus:ring-4 focus:ring-green-300 focus:ring-opacity-40 rounded-full transition duration-300">Workshops entdecken</a></div></div></div></div></div></div> <div class="flex flex-wrap pt-12 -m-4"><div class="w-full md:w-1/3 p-4"><div class="px-10 pt-14 pb-12 h-full bg-gradient-radial-dark border border-gray-900 border-opacity-30 rounded-3xl flex flex-col transition duration-300 ease-in-out transform hover:shadow-xl hover:bg-gradient-to-br hover:border-green-500"><svg class="w-8 h-8 mb-6 text-gray-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"></path></svg> <h3 class="mb-6 text-4xl text-white tracking-tighter-xl">Mixing Techniken</h3> <p class="mb-6 text-white">Lerne die Grundlagen des Mixens und fortgeschrittene Techniken, um nahtlose Übergänge zwischen Tracks zu schaffen.</p> <div class="mt-auto"><a class="inline-block" href="#"><svg width="26" height="26" viewbox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.1689 2L2.11268 24" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M24.1689 22.1732V2H3.94413" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></div></div> <div class="w-full md:w-1/3 p-4"><div class="px-10 pt-14 pb-12 h-full bg-gradient-radial-dark border border-gray-900 border-opacity-30 rounded-3xl flex flex-col transition duration-300 ease-in-out transform hover:shadow-xl hover:bg-gradient-to-br hover:border-green-500"><svg class="w-8 h-8 mb-6 text-gray-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"></path></svg> <h3 class="mb-6 text-4xl text-white tracking-tighter-xl">Beatmatching</h3> <p class="mb-6 text-white">Meistere die Kunst des Beatmatchings und lerne, wie du Tracks perfekt synchronisierst für nahtlose Übergänge.</p> <div class="mt-auto"><a class="inline-block" href="#"><svg width="26" height="26" viewbox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.1689 2L2.11268 24" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M24.1689 22.1732V2H3.94413" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></div></div> <div class="w-full md:w-1/3 p-4"><div class="px-10 pt-14 pb-12 h-full bg-gradient-radial-dark border border-gray-900 border-opacity-30 rounded-3xl flex flex-col transition duration-300 ease-in-out transform hover:shadow-xl hover:bg-gradient-to-br hover:border-green-500"><svg class="w-8 h-8 mb-6 text-gray-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path></svg> <h3 class="mb-6 text-4xl text-white tracking-tighter-xl">Crowd Control</h3> <p class="mb-6 text-white">Entwickle deine Fähigkeiten in der Crowd Control und lerne, wie du die Energie auf der Tanzfläche steuern kannst.</p> <div class="mt-auto"><a class="inline-block" href="#"><svg width="26" height="26" viewbox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.1689 2L2.11268 24" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M24.1689 22.1732V2H3.94413" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></div></div></div></div>`;
}
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function get_interpolator(a, b) {
  if (a === b || a !== a) return () => a;
  const type = typeof a;
  if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    throw new Error("Cannot interpolate values of different type");
  }
  if (Array.isArray(a)) {
    const arr = (
      /** @type {Array<any>} */
      b.map((bi, i) => {
        return get_interpolator(
          /** @type {Array<any>} */
          a[i],
          bi
        );
      })
    );
    return (t) => arr.map((fn) => fn(t));
  }
  if (type === "object") {
    if (!a || !b) {
      throw new Error("Object cannot be null");
    }
    if (is_date(a) && is_date(b)) {
      const an = a.getTime();
      const bn = b.getTime();
      const delta = bn - an;
      return (t) => new Date(an + t * delta);
    }
    const keys = Object.keys(b);
    const interpolators = {};
    keys.forEach((key) => {
      interpolators[key] = get_interpolator(a[key], b[key]);
    });
    return (t) => {
      const result = {};
      keys.forEach((key) => {
        result[key] = interpolators[key](t);
      });
      return result;
    };
  }
  if (type === "number") {
    const delta = (
      /** @type {number} */
      b - /** @type {number} */
      a
    );
    return (t) => a + t * delta;
  }
  throw new Error(`Cannot interpolate ${type} values`);
}
function tweened(value, defaults = {}) {
  const store = writable(value);
  let task;
  let target_value = value;
  function set(new_value, opts) {
    target_value = new_value;
    if (value == null) {
      store.set(value = new_value);
      return Promise.resolve();
    }
    let previous_task = task;
    let started = false;
    let {
      delay = 0,
      duration = 400,
      easing = linear,
      interpolate = get_interpolator
    } = { ...defaults, ...opts };
    if (duration === 0) {
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      store.set(value = target_value);
      return Promise.resolve();
    }
    const start = raf.now() + delay;
    let fn;
    task = loop((now2) => {
      if (now2 < start) return true;
      if (!started) {
        fn = interpolate(
          /** @type {any} */
          value,
          new_value
        );
        if (typeof duration === "function")
          duration = duration(
            /** @type {any} */
            value,
            new_value
          );
        started = true;
      }
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      const elapsed = now2 - start;
      if (elapsed > /** @type {number} */
      duration) {
        store.set(value = new_value);
        return false;
      }
      store.set(value = fn(easing(elapsed / duration)));
      return true;
    });
    return task.promise;
  }
  return {
    set,
    update: (fn, opts) => set(fn(
      /** @type {any} */
      target_value,
      /** @type {any} */
      value
    ), opts),
    subscribe: store.subscribe
  };
}
function Testimonials($$payload, $$props) {
  push();
  var $$store_subs;
  const slides = [
    {
      text: '"DJ Workshop Germany bietet erstklassige DJ-Kurse für Anfänger und Fortgeschrittene in Berlin, Hamburg, München und Frankfurt an. Mit modernster Ausrüstung und erfahrenen Trainern ist es der perfekte Ort, um die Kunst des DJings zu erlernen."',
      author: "Max Mustermann",
      title: "Teilnehmer, DJ-Anfängerkurs"
    },
    {
      text: '"Die Workshops von DJ Workshop Germany haben meine DJ-Fähigkeiten auf ein ganz neues Level gebracht. Die praktischen Übungen und individuellen Tipps waren unglaublich wertvoll für meine Entwicklung als DJ."',
      author: "Lisa Schmidt",
      title: "Absolventin, Fortgeschrittenen-Workshop"
    },
    {
      text: '"Als professioneller DJ kann ich DJ Workshop Germany nur empfehlen. Die Kurse decken alles ab, von Grundlagen bis zu fortgeschrittenen Techniken, und die Trainer sind echte Experten in ihrem Fach."',
      author: "Tom Fischer",
      title: "Professioneller DJ & Kursleiter"
    }
  ];
  const slideWidth = tweened(0, { duration: 500, easing: cubicOut });
  const each_array = ensure_array_like(slides);
  $$payload.out += `<div class="container px-4 mx-auto"><div class="mb-20 md:max-w-3xl text-center mx-auto"><span class="inline-block mb-2.5 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span> <h2 class="font-heading text-7xl lg:text-8xl text-white tracking-tighter-xl">Was unsere Teilnehmer sagen</h2></div> <div class="relative p-3 bg-gradient-radial-dark overflow-hidden border border-gray-900 border-opacity-30 rounded-5xl"><div class="relative z-10 flex flex-wrap lg:flex-nowrap"><div class="w-full lg:w-1/4 p-4"><img class="w-full h-full object-cover rounded-3xl" src="assets/home_hero.jpg" alt=""></div> <div class="w-full lg:w-3/4 p-6"><div class="overflow-hidden"><div${attr("style", `transform: translateX(-${stringify(store_get($$store_subs ??= {}, "$slideWidth", slideWidth))}%)`)} class="flex transition-transform duration-500 ease-in-out"><!--[-->`;
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    let slide = each_array[i];
    $$payload.out += `<div class="flex-shrink-0 w-full"><h3 class="mb-10 text-3xl text-white tracking-tighter leading-snug">${escape_html(slide.text)}</h3> <h4 class="text-white font-medium tracking-tighter">${escape_html(slide.author)}</h4> <span class="mb-8 lg:mb-0 inline-block text-sm text-white">${escape_html(slide.title)}</span></div>`;
  }
  $$payload.out += `<!--]--></div></div> <div class="flex justify-end mt-8 -m-2"><div class="w-auto p-2"><button class="group inline-block"><div class="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200"><svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.7041 7.12817L4.15635 13.6759L10.7041 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22.4941 13.6759H4.33949" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></button></div> <div class="w-auto p-2"><button class="group inline-block"><div class="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 hover:bg-opacity-30 border border-gray-900 hover:border-green-500 rounded-full transition duration-200"><svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.2959 7.12817L22.8437 13.6759L16.2959 20.2237" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.50586 13.6759H22.6605" stroke="white" stroke-width="1.61806" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></div></button></div></div></div></div> <img class="absolute bottom-0 left-1/2 transform -translate-x-1/2" src="nightsable-assets/images/testimonials/blur.png" alt=""></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Pricing($$payload, $$props) {
  push();
  $$payload.out += `<div class="container px-4 mx-auto"><div class="container px-4 mx-auto"><div class="mb-20 md:max-w-2xl text-center mx-auto"><span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span> <h2 class="font-heading mb-8 text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">Unsere Kursangebote</h2> <p class="mb-12 text-gray-300 max-w-sm mx-auto">DJ Workshop Germany bietet professionelle DJ-Kurse für Anfänger und Fortgeschrittene an</p> <div role="region" aria-label="pricing-slider" class="relative p-1 max-w-max mx-auto bg-gradient-radial-dark-light rounded-full"><button type="button" class="w-full h-full absolute top-0 left-0 z-10 opacity-0 cursor-pointer" aria-label="Toggle billing cycle"></button> <div class="flex flex-wrap items-center"><div class="relative w-full sm:w-auto"><span${attr("class", `block py-5 px-9 text-center ${stringify("bg-white text-black")} font-medium rounded-full transition-all duration-200`)}>Monatliche Zahlung</span></div> <div class="relative flex-1"><span${attr("class", `flex flex-wrap items-center justify-center py-3.5 px-9 text-center rounded-full transition-all duration-200 ${stringify("")}`)}><p${attr("class", `mr-2.5 ${stringify("text-gray-300")} font-medium`)}>Jährliche Zahlung</p> <span${attr("class", `px-3 py-1.5 text-sm font-medium text-center ${stringify("")} uppercase border border-green-400 rounded-full ${stringify("text-green-400")}`)}>20% sparen</span></span></div></div></div></div> <div class="flex flex-wrap -m-4"><div class="w-full md:w-1/2 p-4"><div class="px-8 pt-12 pb-12 h-full bg-gradient-radial-dark border-2 border-gray-900 border-opacity-30 overflow-hidden rounded-5xl"><div class="flex flex-wrap items-center -m-2 mb-7"><div class="w-full md:w-1/2 p-2"><p class="mb-2 text-xl text-white font-light">Einsteigerkurs</p> <p class="text-gray-300">Grundlagen des DJing für Anfänger, inklusive Beatmatching und Mixing-Techniken</p></div> <div class="w-full md:w-1/2 p-2"><div class="max-w-max md:ml-auto"><p class="flex flex-col text-white font-medium text-5xl">`;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<span class="mb-1.5">€50</span> <span class="text-base font-medium text-gray-300">/ Monat</span>`;
  }
  $$payload.out += `<!--]--></p></div></div></div> <p class="mb-6 text-xs text-gray-300 font-light uppercase">Kursinhalt</p> <ul class="flex flex-wrap mb-10"><li class="flex items-center w-full sm:w-1/2 mb-4"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Grundlagen des Beatmatching</p></div></li> <li class="flex items-center w-full sm:w-1/2 mb-4"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Einführung in Mixing-Techniken</p></div></li> <li class="flex items-center w-full sm:w-1/2 mb-4 md:mb-0"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Umgang mit DJ-Equipment</p></div></li> <li class="flex items-center w-full sm:w-1/2"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Musikauswahl und Playlist-Erstellung</p></div></li></ul> <a class="relative z-10 block px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Jetzt buchen</a></div></div> <div class="w-full md:w-1/2 p-4"><div class="px-8 pt-12 pb-12 h-full bg-gradient-radial-dark border-2 border-gray-900 border-opacity-30 overflow-hidden rounded-5xl"><div class="flex flex-wrap items-center -m-2 mb-7"><div class="w-full md:w-1/2 p-2"><p class="mb-2 text-xl text-white font-light">Fortgeschrittenenkurs</p> <p class="text-gray-300">Erweiterte DJ-Techniken und Produktionselemente für erfahrene DJs</p></div> <div class="w-full md:w-1/2 p-2"><div class="max-w-max md:ml-auto"><p class="flex flex-col text-white font-medium text-5xl">`;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<span class="mb-1.5">€100</span> <span class="text-base font-medium text-gray-300">/ Monat</span>`;
  }
  $$payload.out += `<!--]--></p></div></div></div> <p class="mb-6 text-xs text-gray-300 font-light uppercase">Kursinhalt</p> <ul class="flex flex-wrap mb-10"><li class="flex items-center w-full sm:w-1/2 mb-4"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Fortgeschrittene Mixing-Techniken</p></div></li> <li class="flex items-center w-full sm:w-1/2 mb-4"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Musikproduktion für DJs</p></div></li> <li class="flex items-center w-full sm:w-1/2 mb-4 md:mb-0"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Live-Performance-Techniken</p></div></li> <li class="flex items-center w-full sm:w-1/2"><div class="w-auto"><div class="flex items-center justify-center w-5 h-5 mr-4 border border-green-400 rounded-full"><img src="nightsable-assets/images/modals/check.svg" alt=""></div></div> <div class="flex-1"><p class="text-white">Branding und Marketing für DJs</p></div></li></ul> <a class="relative z-10 block px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Jetzt buchen</a></div></div></div></div></div>`;
  pop();
}
function Newsletter($$payload) {
  $$payload.out += `<div class="container px-4 mx-auto"><div class="bg-opacity-30 rounded-6xl"><div class="md:max-w-2xl mx-auto text-center px-4"><span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span> <h2 class="font-heading mb-6 text-5xl text-white tracking-5xl">Exklusive DJ-Tipps und Tricks. Wöchentlich in deinem Postfach</h2> <p class="mb-12 text-gray-300 max-w-lg mx-auto">Schließe dich 10.000 DJs an, erhalte frühzeitig Zugang zu neuen Workshop-Terminen und lerne, wie du deine DJ-Skills auf das nächste Level bringst</p></div> <div class="px-4"><div class="flex flex-wrap md:max-w-xl mx-auto -m-2"><div class="w-full md:flex-1 p-2"><div class="md:max-w-xl mx-auto border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl"><input class="px-6 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" type="text" placeholder="E-Mail"></div></div> <div class="w-full md:w-auto p-2"><a class="inline-block px-14 py-4 font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Abonnieren</a></div></div></div></div></div>`;
}
function Logos($$payload, $$props) {
  push();
  $$payload.out += `<div class="container px-4 mx-auto svelte-fxcax2"><div class="mb-20 md:max-w-4xl text-center mx-auto svelte-fxcax2"><span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter svelte-fxcax2">Unsere Partner</span> <h2 class="font-heading text-5xl lg:text-6xl text-white tracking-7xl lg:tracking-8xl svelte-fxcax2">Unterstützt von führenden Marken der DJ-Industrie</h2></div> <div class="md:max-w-7xl border border-gray-900 mx-auto mb-12 svelte-fxcax2"><div class="flex flex-wrap svelte-fxcax2"><div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-r border-gray-900 logo-container ${stringify("highlight")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/rbs-white.png" alt="Partner Logo 1" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/nine-white.png" alt="Partner Logo 2" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/drift-white.png" alt="Partner Logo 3" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/seek-white.png" alt="Partner Logo 4" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-r lg:border-r-0 border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/deloitte-white.png" alt="Partner Logo 5" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-b-0 lg:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/wise-white.png" alt="Partner Logo 6" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-b-0 md:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/intel-white.png" alt="Partner Logo 7" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-b-0 lg:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/lenovo-white.png" alt="Partner Logo 8" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-b-0 md:border-r border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/sonder-white.png" alt="Partner Logo 9" class="svelte-fxcax2"></div> <div${attr("class", `flex items-center justify-center w-full md:w-1/2 lg:w-1/5 md:border-b-0 border-gray-900 logo-container ${stringify("")} svelte-fxcax2`)} style="height: 246px;"><img src="nightsable-assets/images/logo-clouds/sendle-white.png" alt="Partner Logo 10" class="svelte-fxcax2"></div></div></div> <div class="text-center svelte-fxcax2"><div class="w-auto p-2 svelte-fxcax2"><a class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300 svelte-fxcax2" href="#">Partner werden</a></div></div></div>`;
  pop();
}
function _page($$payload) {
  $$payload.out += `<section class="relative overflow-hidden">`;
  Start($$payload);
  $$payload.out += `<!----></section> <section class="relative pt-20 overflow-hidden">`;
  Intro($$payload);
  $$payload.out += `<!----></section> <section class="pt-48 pb-20">`;
  Cards($$payload);
  $$payload.out += `<!----></section> <section class="relative pt-36 overflow-hidden">`;
  Pricing($$payload);
  $$payload.out += `<!----></section> <section class="relative pt-36 overflow-hidden">`;
  Logos($$payload);
  $$payload.out += `<!----></section> <section class="relative py-36 overflow-hidden">`;
  Testimonials($$payload);
  $$payload.out += `<!----></section> <section class="relative pt-36 overflow-hidden">`;
  Newsletter($$payload);
  $$payload.out += `<!----></section>`;
}
export {
  _page as default
};
