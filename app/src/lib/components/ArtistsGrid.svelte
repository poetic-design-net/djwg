<script lang="ts">
  import { fade } from 'svelte/transition';
  
  export let artists: Array<{
    image: string;
    role: string;
    name: string;
    description: string;
    socials: {
      instagram: string;
      soundcloud: string;
    };
  }>;
  export let isLineupRevealed: boolean;
  
  let showMore = false;
  $: visibleArtists = showMore ? artists : artists.slice(0, 4);
</script>

<section class="py-24 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="mb-20 md:max-w-xl text-center mx-auto">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Unsere Artists</span>
      <h2 class="font-heading text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">DJ Line-Up</h2>
    </div>
    <div class="relative">
      {#if !isLineupRevealed}
        <div class="absolute inset-0 backdrop-blur-xl bg-black/40 z-10 flex items-center justify-center">
          <div class="text-center">
            <span class="text-2xl text-white font-medium">Line-Up wird bald bekannt gegeben</span>
            <p class="text-gray-400 mt-2">Bleib gespannt!</p>
          </div>
        </div>
      {/if}

      <div class="flex flex-wrap -m-4 mb-10 relative z-0">
        {#each visibleArtists as artist, i}
          <div class="w-full md:w-1/2 lg:w-1/3 p-4"
               in:fade={{delay: i * 100, duration: 300}}>
            <div class="relative h-full py-8 px-12 bg-gradient-radial-dark overflow-hidden border border-gray-800 hover:border-green-500 rounded-3xl transition-all duration-300">
              <div class="relative z-10">
                <div class="flex flex-wrap items-center justify-between -m-2 mb-4">
                  <div class="w-auto p-2">
                    <div class="relative w-20 h-20 rounded-full overflow-hidden">
                      <img 
                        src={artist.image} 
                        alt={artist.name}
                        class="w-full h-full object-cover"
                      >
                    </div>
                  </div>
                  <div class="w-auto p-2">
                    <div class="flex flex-wrap -m-2">
                      <div class="w-auto p-2">
                        <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer" class="text-white hover:text-green-500 transition-colors">
                          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      </div>
                      <div class="w-auto p-2">
                        <a href={artist.socials.soundcloud} target="_blank" rel="noopener noreferrer" class="text-white hover:text-green-500 transition-colors">
                          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.4 0C5.1 0 0 5.1 0 11.4c0 6.3 5.1 11.4 11.4 11.4 6.3 0 11.4-5.1 11.4-11.4C22.8 5.1 17.7 0 11.4 0zm0 21.6c-5.6 0-10.2-4.6-10.2-10.2S5.8 1.2 11.4 1.2s10.2 4.6 10.2 10.2-4.6 10.2-10.2 10.2zm4.9-13.6c-.3 0-.6.1-.8.3-.2.2-.3.4-.3.7v6.4c0 .3.1.5.3.7.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.4.3-.7V9c0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3zm-9.8 6.4c-.3 0-.6.1-.8.3-.2.2-.3.4-.3.7v2.4c0 .3.1.5.3.7.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.4.3-.7v-2.4c0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3zm2.4-2.4c-.3 0-.6.1-.8.3-.2.2-.3.4-.3.7v4.8c0 .3.1.5.3.7.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.4.3-.7v-4.8c0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3zm2.4-2.4c-.3 0-.6.1-.8.3-.2.2-.3.4-.3.7v7.2c0 .3.1.5.3.7.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.4.3-.7V9c0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="mb-1.5 text-sm text-gray-300">{artist.role}</p>
                <h3 class="mb-4 text-3xl text-white tracking-3xl">{artist.name}</h3>
                <p class="text-gray-300">{artist.description}</p>
              </div>
              <div class="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        {/each}
      </div>

      {#if !showMore && artists.length > 4}
        <div class="flex justify-center relative z-0">
          <button
            on:click={() => showMore = true}
            class="px-8 py-4 text-sm text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200"
          >
            Mehr Artists anzeigen
          </button>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .bg-gradient-radial-dark {
    background: radial-gradient(circle at center, rgba(31, 31, 31, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%);
  }
</style>
