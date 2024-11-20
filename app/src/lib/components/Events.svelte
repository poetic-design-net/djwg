<script lang="ts">
  import { urlFor } from '$lib/sanity/image';
  import type { Event } from '$lib/sanity/queries';

  export let events: Event[] = [];
</script>

<section class="relative py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="mb-20 md:max-w-xl text-center mx-auto">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Upcoming Events</span>
      <h2 class="font-heading text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">DJ Workshops</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each events as event}
        <a 
          href="/events/{event.slug.current}" 
          class="group relative aspect-[4/3] rounded-3xl overflow-hidden"
        >
          <img 
            src={urlFor(event.image).width(800).height(600).url()} 
            alt={event.title}
            class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex flex-col gap-4">
              <span class="inline-block px-3 py-1 text-sm text-black font-medium tracking-tighter bg-green-400 rounded-full w-fit">
                {event.tag}
              </span>
              <div>
                <span class="inline-block mb-2 text-sm text-green-400 font-medium tracking-tighter">{event.date}</span>
                <h3 class="mb-2 text-3xl text-white tracking-3xl">{event.title}</h3>
                <p class="text-gray-300">{event.location}</p>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
