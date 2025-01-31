<script lang="ts">
  import type { Badge } from '$lib/sanity/queries/badges';
  import { urlFor } from '$lib/sanity/image';

  export let badges: Badge[] = [];
  
  // Zeige maximal 3 Badges in der Kopfzeile
  $: displayBadges = badges.slice(0, 3);
</script>

{#if displayBadges.length > 0}
  <div class="flex -space-x-2">
    {#each displayBadges as badge (badge._id)}
      <div class="relative group">
        <div 
          class="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden bg-gray-900 relative z-10 hover:z-20 transition-transform hover:scale-110"
          style:border-color={badge.style?.customColor?.hex || '#50C878'}
        >
          {#if badge.icon}
            <img
              src={urlFor(badge.icon).width(32).height(32).url()}
              alt={badge.name}
              class="w-full h-full object-contain p-1"
            />
          {:else}
            <div class="w-full h-full flex items-center justify-center bg-gray-900">
              <span class="text-xs font-medium" style:color={badge.style?.customColor?.hex || '#50C878'}>
                {badge.name.charAt(0)}
              </span>
            </div>
          {/if}
        </div>
        
        <!-- Tooltip -->
        <div class="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-32 bg-gray-900 rounded-lg p-2 text-xs text-center hidden group-hover:block shadow-xl border border-gray-800 z-30">
          <p class="text-white font-medium">{badge.name}</p>
          {#if badge.description}
            <p class="text-gray-400 text-[10px] mt-1">{badge.description}</p>
          {/if}
        </div>
      </div>
    {/each}
    
    {#if badges.length > 3}
      <div class="relative group">
        <div class="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-900 flex items-center justify-center text-xs font-medium text-gray-400 relative z-10 hover:z-20">
          +{badges.length - 3}
        </div>
        
        <!-- Tooltip -->
        <div class="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-32 bg-gray-900 rounded-lg p-2 text-xs text-center hidden group-hover:block shadow-xl border border-gray-800 z-30">
          <p class="text-gray-400">Weitere Badges im Dashboard ansehen</p>
        </div>
      </div>
    {/if}
  </div>
{/if}