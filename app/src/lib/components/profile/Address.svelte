<script lang="ts">
  import type { Profile } from '$lib/types/profile';

  export let profile: Partial<Profile>;
  export let showAddress = false;

  const toggleAddress = () => showAddress = !showAddress;
</script>

<div class="space-y-4">
  <button
    type="button"
    on:click={toggleAddress}
    class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 transform transition-transform {showAddress ? 'rotate-180' : ''}"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
    <h3 class="text-lg font-medium">Adresse {showAddress ? 'ausblenden' : 'anzeigen'}</h3>
  </button>

  {#if showAddress}
    <div class="space-y-4 animate-fadeIn">
      <div>
        <label for="street" class="block text-sm font-medium text-gray-400 mb-2">Straße</label>
        <input
          type="text"
          id="street"
          bind:value={profile.address_street}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label for="number" class="block text-sm font-medium text-gray-400 mb-2">Hausnummer</label>
        <input
          type="text"
          id="number"
          bind:value={profile.address_number}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1">
          <label for="zip" class="block text-sm font-medium text-gray-400 mb-2">PLZ</label>
          <input
            type="text"
            id="zip"
            bind:value={profile.address_zip}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div class="col-span-2">
          <label for="city" class="block text-sm font-medium text-gray-400 mb-2">Stadt</label>
          <input
            type="text"
            id="city"
            bind:value={profile.address_city}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div>
        <label for="country" class="block text-sm font-medium text-gray-400 mb-2">Land</label>
        <input
          type="text"
          id="country"
          bind:value={profile.address_country}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>