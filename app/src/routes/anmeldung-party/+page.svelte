<script lang="ts">
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  export let data;

  let submitting = false;
  let success = false;
  let error = '';
</script>

<div class="min-h-screen bg-black text-white py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <OptimizedImage
      image="https://cdn.sanity.io/images/kijh3dc6/production/c7c429b4bed564a64b1cea9eccc1431b083c9c38-1620x2880.png"
      alt="Party Flyer"
      className="w-full mb-8 rounded-lg shadow-xl"
      maxWidth={810}
      sizes="(max-width: 810px) 100vw, 810px"
    />

    {#if success}
      <div class="bg-green-900/50 p-6 rounded-lg text-center mb-8">
        <h2 class="text-2xl font-bold mb-2">🎉 Danke für deine Anmeldung!</h2>
        <p>Wir freuen uns auf dich!</p>
      </div>
    {:else}
      <form
        method="POST"
        use:enhance={() => {
          submitting = true;
          return async ({ result }) => {
            submitting = false;
            if (result.type === 'success') {
              success = true;
              await invalidateAll();
            } else {
              error = 'Es gab einen Fehler bei der Anmeldung. Bitte versuche es erneut.';
            }
          };
        }}
        class="bg-white/5 backdrop-blur-sm p-8 rounded-lg shadow-xl"
      >
        <h1 class="text-3xl font-bold mb-6 text-center">Party Anmeldung</h1>
        
        {#if error}
          <div class="bg-red-900/50 p-4 rounded mb-6">
            {error}
          </div>
        {/if}

        <div class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              class="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Name"
            />
          </div>

          <div>
           <label for="email" class="block text-sm font-medium mb-2">Email</label>
           <input
             type="email"
             id="email"
             name="email"
             required
             class="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             placeholder="deine@email.de"
           />
         </div>

         <div>
           <label for="personCount" class="block text-sm font-medium mb-2">Wie viele Personen?</label>
           <input
             type="number"
             id="personCount"
             name="personCount"
             required
             min="1"
             max="10"
             value="1"
             class="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           />
         </div>

          <button
            type="submit"
            disabled={submitting}
            class="w-full bg-green-500 hover:bg-green-400 text-black disabled:opacity-50 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Wird angemeldet...' : 'Jetzt anmelden'}
          </button>
        </div>

        {#if data.registrationCount !== undefined}
          <p class="mt-6 text-center text-sm text-gray-400">
            Bereits {data.registrationCount} Anmeldungen 🎉
          </p>
        {/if}
      </form>
    {/if}
  </div>
</div>