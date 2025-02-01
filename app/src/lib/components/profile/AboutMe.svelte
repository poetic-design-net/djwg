<script lang="ts">
  import type { Profile } from '$lib/types/profile';

  export let profile: Partial<Profile>;
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-white">Über mich</h3>
  <div>
    <label for="bio" class="block text-sm font-medium text-gray-400 mb-2">Bio</label>
    <textarea
      id="bio"
      bind:value={profile.bio}
      rows="4"
      class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
      placeholder="Erzähle etwas über dich..."
    ></textarea>
  </div>
</div>