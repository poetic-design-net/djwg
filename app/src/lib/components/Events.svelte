<script lang="ts">
  import type { SanityEvent } from '$lib/sanity/queries/events';
  import OptimizedImage from './OptimizedImage.svelte';

  export let events: SanityEvent[] = [];
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
          class="group block relative aspect-[4/3] rounded-3xl overflow-hidden hover:scale-101 transition-all duration-300"
        >
          <div class="relative w-full h-full">
            <div class="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-300">
              <OptimizedImage
                image={event.image}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
                maxWidth={800}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex flex-col gap-4">
                <span class="inline-block px-3 py-1 text-sm text-black font-medium tracking-tighter bg-green-400 rounded-full w-fit">
                  {event.tag}
                </span>
                <div>
                  <span class="inline-block mb-2 text-sm text-green-400 font-medium tracking-tighter">{event.date}</span>
                  <h3 class="mb-2 text-3xl text-white tracking-3xl group-hover:text-green-400 transition-colors duration-500">{event.title}</h3>
                  <p class="text-gray-300">{event.location}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
