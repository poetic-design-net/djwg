<script lang="ts">
  export let requiredBadges: Array<{ name: string }> = [];
</script>

<div class="min-h-[50vh] flex items-center justify-center">
  <div class="max-w-2xl mx-auto text-center px-4">
    <h1 class="text-3xl font-bold mb-4">Premium-Inhalt</h1>
    <p class="text-xl mb-8">
      Dieser Bereich ist exklusiv für Mitglieder mit {#if requiredBadges.length === 1}{requiredBadges[0].name}{:else}{requiredBadges.map(b => b.name).join(' oder ')}{/if} Badge.
    </p>
    <div class="space-y-4">
      <p class="text-lg">
        Möchtest du Zugang zu diesem exklusiven Inhalt?
      </p>
      <div class="flex justify-center gap-4">
        <a
          href="/dashboard"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Zum Dashboard
        </a>
        <a
          href="/contact"
          class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Kontaktiere uns
        </a>
      </div>
    </div>
  </div>
</div>