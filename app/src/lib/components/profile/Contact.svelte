<script lang="ts">
  import type { Profile } from '$lib/types/profile';

  export let profile: Partial<Profile>;
  export let showContact = false;
  export let instagram = '';
  export let facebook = '';
  export let soundcloud = '';
  
  // Social Media Aktivierungsstatus als Props
  export let isInstagramEnabled = false;
  export let isFacebookEnabled = false;
  export let isSoundcloudEnabled = false;

  const toggleContact = () => showContact = !showContact;
</script>

<div class="space-y-4">
  <button
    type="button"
    on:click={toggleContact}
    class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 transform transition-transform {showContact ? 'rotate-180' : ''}"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
    <h3 class="text-lg font-medium">Kontakt & Social Media {showContact ? 'ausblenden' : 'anzeigen'}</h3>
  </button>

  {#if showContact}
    <div class="space-y-4 animate-fadeIn">
      <div>
        <label for="website" class="block text-sm font-medium text-gray-400 mb-2">Website</label>
        <input
          type="url"
          id="website"
          bind:value={profile.website}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="https://"
        />
      </div>
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-400 mb-2">Telefon</label>
        <input
          type="tel"
          id="phone"
          bind:value={profile.phone}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Social Media Section -->
      <div class="border-t border-gray-800 pt-4 mt-6">
        <h4 class="text-sm font-medium text-gray-400 mb-4">Social Media Profile</h4>
        <div class="space-y-6">
          <!-- Instagram -->
          <div>
            <div class="flex items-center mb-2">
              <input
                type="checkbox"
                id="enable-instagram"
                bind:checked={isInstagramEnabled}
                class="w-4 h-4 text-green-500 bg-gray-950 border-gray-800 rounded focus:ring-green-500"
              />
              <label for="enable-instagram" class="ml-2 text-sm font-medium text-gray-400">
                Instagram Profil aktivieren
              </label>
            </div>
            {#if isInstagramEnabled}
              <input
                type="text"
                id="instagram"
                bind:value={instagram}
                class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                placeholder="@username"
              />
            {/if}
          </div>

          <!-- Facebook -->
          <div>
            <div class="flex items-center mb-2">
              <input
                type="checkbox"
                id="enable-facebook"
                bind:checked={isFacebookEnabled}
                class="w-4 h-4 text-green-500 bg-gray-950 border-gray-800 rounded focus:ring-green-500"
              />
              <label for="enable-facebook" class="ml-2 text-sm font-medium text-gray-400">
                Facebook Profil aktivieren
              </label>
            </div>
            {#if isFacebookEnabled}
              <input
                type="text"
                id="facebook"
                bind:value={facebook}
                class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                placeholder="facebook.com/username"
              />
            {/if}
          </div>

          <!-- Soundcloud -->
          <div>
            <div class="flex items-center mb-2">
              <input
                type="checkbox"
                id="enable-soundcloud"
                bind:checked={isSoundcloudEnabled}
                class="w-4 h-4 text-green-500 bg-gray-950 border-gray-800 rounded focus:ring-green-500"
              />
              <label for="enable-soundcloud" class="ml-2 text-sm font-medium text-gray-400">
                Soundcloud Profil aktivieren
              </label>
            </div>
            {#if isSoundcloudEnabled}
              <input
                type="text"
                id="soundcloud"
                bind:value={soundcloud}
                class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                placeholder="soundcloud.com/username"
              />
            {/if}
          </div>
        </div>
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