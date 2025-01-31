<script lang="ts">
  interface Badge {
    _id: string;
    name: string;
    description?: string;
    style?: {
      customColor?: {
        hex: string;
      };
      borderStyle?: string;
      variant?: string;
    };
  }

  export let badges: Badge[] = [];

  function getBadgeColor(badge: Badge): string {
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

<div class="space-y-4">
  {#if badges.length > 0}
    <div class="flex flex-wrap gap-4">
      {#each badges as badge (badge._id)}
        <div class="relative group">
          <div class="flex items-center space-x-2 p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-green-500 transition-colors duration-200">
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full"
              style="background-color: {getBadgeColor(badge)}"
            >
              <span class="text-black text-sm font-medium">
                {badge.name.charAt(0)}
              </span>
            </div>
            <div>
              <p class="text-white font-medium">{badge.name}</p>
              {#if badge.description}
                <p class="text-sm text-gray-400">{badge.description}</p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-gray-400">Keine Badges verfügbar</p>
  {/if}
</div>

<style>
  .group:hover {
    z-index: 20;
  }
</style>