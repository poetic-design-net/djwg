<script lang="ts">
  import type { Profile } from '$lib/types/profile';

  export let profile: Partial<Profile>;
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-white">Basis-Informationen</h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-400 mb-2">
        E-Mail <span class="text-yellow-500">*</span>
      </label>
      <input
        type="email"
        id="email"
        bind:value={profile.email}
        required
        class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="deine@email.com"
      />
      <p class="mt-1 text-xs text-gray-500">
        Bei Änderung der E-Mail erhältst du eine Bestätigungs-E-Mail
      </p>
    </div>

    <div>
      <label for="firstName" class="block text-sm font-medium text-gray-400 mb-2">
        Vorname <span class="text-yellow-500">*</span>
      </label>
      <input
        type="text"
        id="firstName"
        bind:value={profile.first_name}
        required
        class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>

    <div>
      <label for="username" class="block text-sm font-medium text-gray-400 mb-2">
        Username <span class="text-yellow-500">*</span>
      </label>
      <input
        type="text"
        id="username"
        bind:value={profile.username}
        required
        class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="@username"
      />
    </div>

    <div>
      <label for="lastName" class="block text-sm font-medium text-gray-400 mb-2">
        Nachname <span class="text-yellow-500">*</span>
      </label>
      <input
        type="text"
        id="lastName"
        bind:value={profile.last_name}
        required
        class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  </div>
</div>