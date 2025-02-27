<script lang="ts">
  import type { DisplayBadge } from '$lib/types/badges';

  export let badges: DisplayBadge[] = [];
  
  // Zeige nur freigeschaltete Badges, maximal 3
  $: displayBadges = badges.filter(b => b.isUnlocked).slice(0, 3);

  function getBadgeColor(badge: DisplayBadge): string {
    if (badge.style?.customColor?.hex) {
      return badge.style.customColor.hex;
    }
    
    switch (badge.style?.variant) {
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
      case 'premium':
        return '#50C878';
      default:
        return '#50C878'; // Default grün
    }
  }
</script>

{#if displayBadges.length > 0}
  <div class="flex -space-x-2">
    {#each displayBadges as badge (badge._id)}
      <div class="relative group">
        <div 
          class="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden bg-gray-900 relative z-10 hover:z-20 transition-transform hover:scale-110"
          style:border-color={getBadgeColor(badge)}
        >
          <div class="w-full h-full flex items-center justify-center bg-gray-900">
            <span class="text-xs font-medium" style:color={getBadgeColor(badge)}>
              {badge.name.charAt(0)}
            </span>
          </div>
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
    
    {#if badges.filter(b => b.isUnlocked).length > 3}
      <div class="relative group">
        <div class="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-900 flex items-center justify-center text-xs font-medium text-gray-400 relative z-10 hover:z-20">
          +{badges.filter(b => b.isUnlocked).length - 3}
        </div>
        
        <!-- Tooltip -->
        <div class="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-32 bg-gray-900 rounded-lg p-2 text-xs text-center hidden group-hover:block shadow-xl border border-gray-800 z-30">
          <p class="text-gray-400">Weitere Badges im Dashboard ansehen</p>
        </div>
      </div>
    {/if}
  </div>
{/if}