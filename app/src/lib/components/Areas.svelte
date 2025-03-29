<script lang="ts">
  import type { Area } from '$lib/types/area';
  
  export let areas: Area[] = [];
  export let title = 'Unsere Areas';
  export let subtitle = 'Entdecke die verschiedenen Bereiche des DJ Workshops';
  export let showButton = false;
</script>

<div class="my-20">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-medium text-white mb-4">{title}</h2>
      <p class="text-gray-300">{subtitle}</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#if areas && areas.length > 0}
        {#each areas as area (area._id)}
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur flex flex-col">
            <h3 class="text-xl font-medium text-white mb-4">{area.title}</h3>
            <p class="text-gray-300 flex-grow">{area.description}</p>
            {#if showButton && area.button?.text && area.button?.url}
            <a
              href={area.button.url}
              target="_blank"
              class="mt-4 w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              {area.button.text}
            </a>
          {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>