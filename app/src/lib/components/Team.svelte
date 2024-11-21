<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { TeamMember } from '$lib/sanity/queries';
  import { urlFor } from '$lib/sanity/image';

  export let teamMembers: TeamMember[] = [];
  let showAllTeam = false;
  
  // Shuffle array and get first 6 members
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  $: displayedMembers = showAllTeam 
    ? teamMembers 
    : shuffleArray(teamMembers).slice(0, 6);
</script>

<div class="container px-4 mx-auto">
  <div class="mb-20 md:max-w-xl text-center mx-auto">
    <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Unser Team</span>
    <h2 class="font-heading text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">Die Trainer</h2>
  </div>

  <div class="flex flex-wrap -m-4 mb-10">
    {#each displayedMembers as member}
      <div class="w-full md:w-1/2 p-4" in:fade>
        <div class="h-full py-7 px-12 border border-gray-900 border-opacity-30 rounded-5xl">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div class="w-16 h-16 flex-shrink-0">
                <img 
                  src={urlFor(member.image).width(200).height(200).url()} 
                  alt={member.name} 
                  class="w-full h-full rounded-full object-cover"
                >
              </div>
              <div>
                <p class="mb-1.5 text-sm text-gray-300">{member.role}</p>
                <h3 class="text-3xl text-white tracking-3xl">{member.name}</h3>
              </div>
            </div>
            <div class="flex gap-4">
              {#if member.socials?.instagram}
                <a 
                  href={member.socials.instagram}
                  class="text-white hover:text-green-400 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              {/if}
              {#if member.socials?.soundcloud}
                <a 
                  href={member.socials.soundcloud}
                  class="text-white hover:text-green-400 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.56 8.87V17h8.76c1.85 0 3.35-1.5 3.35-3.35 0-1.85-1.5-3.35-3.35-3.35-.18 0-.35.02-.52.05C19.23 4.79 16.07 0 11.56 0v8.87zM9.68 4.53v12.5H0V9c0-2.47 2.01-4.47 4.48-4.47 2.47 0 4.47 2 4.47 4.47v.53z"/>
                  </svg>
                </a>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if !showAllTeam && teamMembers.length > 6}
    <div class="flex flex-wrap justify-center max-w-xs mx-auto">
      <div class="w-full">
        <button 
          class="block w-full px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300"
          on:click={() => showAllTeam = true}
        >
          Mehr laden
        </button>
      </div>
    </div>
  {/if}
</div>
