<script lang="ts">
  import { enhance } from '$app/forms';

  export let error: string | null = null;
</script>

<div class="min-h-screen flex items-center justify-center bg-black">
  <div class="max-w-md w-full space-y-8 p-8 bg-gray-900 rounded-xl">
    <div>
      <h2 class="text-center text-3xl font-heading text-white">
        Club Manager Zugang
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        Bitte gib das Passwort ein, um fortzufahren
      </p>
    </div>

    <form method="POST" use:enhance class="mt-8 space-y-6">
      {#if error}
        <div class="rounded-md bg-red-900/50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-400">{error}</p>
            </div>
          </div>
        </div>
      {/if}

      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="password" class="sr-only">Passwort</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            placeholder="Passwort eingeben"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Zugang anfordern
        </button>
      </div>
    </form>
  </div>
</div>