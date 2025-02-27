<script lang="ts">
  import type { DisplayBadge } from '$lib/types/badges';

  export let badges: DisplayBadge[] = [];

  $: unlockedBadges = badges.filter(b => b.isUnlocked);
  $: lockedBadges = badges.filter(b => !b.isUnlocked);

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

<div class="space-y-8">
  <!-- Freigeschaltete Badges -->
  {#if unlockedBadges.length > 0}
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-white">Freigeschaltete Badges</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each unlockedBadges as badge (badge._id)}
          <div class="relative group">
            <div 
              class="flex items-center space-x-2 p-3 rounded-xl border border-gray-800 bg-gray-950 hover:border-green-500 transition-all duration-200"
            >
              <div
                class="w-12 h-12 flex items-center justify-center rounded-full"
                style="background-color: {getBadgeColor(badge)}"
              >
                <span class="text-black text-lg font-medium">
                  {badge.name.charAt(0)}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">{badge.name}</p>
                {#if badge.description}
                  <p class="text-sm text-gray-400">{badge.description}</p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Nicht freigeschaltete Badges -->
  {#if lockedBadges.length > 0}
    <div class="space-y-4 hidden">
      <h2 class="text-xl font-semibold text-white">Verfügbare Badges</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2  gap-4">
        {#each lockedBadges as badge (badge._id)}
          <div class="relative group">
            <div 
              class="flex items-center space-x-2 p-3 rounded-xl border border-gray-800/50 bg-gray-900/50 hover:border-yellow-500/50 transition-all duration-200"
            >
              <div
                class="w-12 h-12 flex items-center justify-center rounded-full filter blur-sm group-hover:blur-none transition-all duration-200"
                style="background-color: {getBadgeColor(badge)}"
              >
                <span class="text-black text-lg font-medium">
                  {badge.name.charAt(0)}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">{badge.name}</p>
                {#if badge.description}
                  <p class="text-sm text-gray-400">{badge.description}</p>
                {/if}
              </div>
            </div>

            <!-- Hover-Info für nicht freigeschaltete Badges -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="bg-black bg-opacity-90 p-4 rounded-lg shadow-xl max-w-xs">
                <h4 class="text-yellow-500 font-semibold mb-2">Wie du diesen Badge freischaltest:</h4>
                {#if badge.unlockCondition}
                  <p class="text-white text-sm mb-3">{badge.unlockCondition}</p>
                {/if}
                {#if badge.unlockReward}
                  <div class="border-t border-gray-700 pt-2 mt-2">
                    <p class="text-green-400 text-sm">Belohnung:</p>
                    <p class="text-white text-sm">{badge.unlockReward}</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Keine Badges verfügbar -->
  {#if badges.length === 0}
    <p class="text-gray-400">Keine Badges verfügbar</p>
  {/if}
</div>

<style>
  .group:hover {
    z-index: 20;
  }
</style>