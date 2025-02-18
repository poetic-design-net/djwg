<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { PageData } from './$types';
  import type { Idea } from '$lib/types/project-management';
  
  export let data: PageData;

  let searchTerm = '';
  let selectedCategory: (typeof CATEGORIES)[number] | 'all' = 'all';
  let sortBy: 'votes' | 'date' = 'votes';
  let showAddForm = false;
  
  const CATEGORIES = [
    'Feature',
    'Verbesserung',
    'Bug Fix',
    'Design',
    'Performance',
    'Sonstiges'
  ] as const;

  let newIdea = {
    title: '',
    description: '',
    category: CATEGORIES[0]
  };

  $: filteredIdeas = data.ideas
    .filter(idea => 
      (selectedCategory === 'all' || idea.category === selectedCategory) &&
      (searchTerm === '' || 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => sortBy === 'votes' 
      ? (b.votes || 0) - (a.votes || 0)
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const handleVote: SubmitFunction = () => {
    return async ({ formData }) => {
      const id = formData.get('id') as string;
      // Optimistic UI update
      const idea = data.ideas.find(i => i.id === id);
      if (idea) {
        idea.votes = (idea.votes || 0) + 1;
        data.userVotes.add(id);
      }
      return async ({ result, update }: { result: { type: string }, update: () => Promise<void> }) => {
        if (result.type === 'error') {
          // Revert optimistic update on error
          if (idea) {
            idea.votes = (idea.votes || 0) - 1;
            data.userVotes.delete(id);
          }
        }
        await update();
      };
    };
  };

  const handleSubmit: SubmitFunction = () => {
    return async ({ update }: { update: () => Promise<void> }) => {
      showAddForm = false;
      newIdea = {
        title: '',
        description: '',
        category: CATEGORIES[0]
      };
      await update();
    };
  };

  function getStatusBadgeClasses(status: string): string {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'new': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Ideenpool</h1>
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      on:click={() => showAddForm = true}
    >
      Neue Idee
    </button>
  </div>

  <div class="mb-6 flex flex-wrap gap-4">
    <div class="flex-1 max-w-md">
      <label for="search" class="sr-only">Ideen suchen</label>
      <input
        id="search"
        type="text"
        bind:value={searchTerm}
        placeholder="Ideen suchen..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div>
      <label for="category" class="sr-only">Kategorie auswählen</label>
      <select
        id="category"
        bind:value={selectedCategory}
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Alle Kategorien</option>
        {#each CATEGORIES as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>
    
    <div>
      <label for="sort" class="sr-only">Sortieren nach</label>
      <select
        id="sort"
        bind:value={sortBy}
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="votes">Nach Stimmen</option>
        <option value="date">Nach Datum</option>
      </select>
    </div>
  </div>

  <div class="my-4 text-sm font-medium text-gray-500">
    {filteredIdeas.length} von {data.ideas.length} Ideen
  </div>

  {#if showAddForm}
    <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Neue Idee</h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          on:click={() => showAddForm = false}
        >
          ✕
        </button>
      </div>

      <form 
        method="POST" 
        action="?/createIdea" 
        use:enhance={handleSubmit}
        class="space-y-4"
      >
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Titel
          </label>
          <input
            id="title"
            type="text"
            name="title"
            required
            bind:value={newIdea.title}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            bind:value={newIdea.description}
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
            Kategorie
          </label>
          <select
            id="category"
            name="category"
            required
            bind:value={newIdea.category}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {#each CATEGORIES as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            on:click={() => showAddForm = false}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="min-w-full divide-y divide-gray-200">
      {#each filteredIdeas as idea (idea.id)}
        <div class="p-6 hover:bg-gray-50">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-medium text-gray-900">
                  {idea.title}
                </h3>
                <span class={getStatusBadgeClasses(idea.status)}>
                  {idea.status === 'new' ? 'Neu' :
                   idea.status === 'in_progress' ? 'In Bearbeitung' :
                   idea.status === 'completed' ? 'Abgeschlossen' :
                   idea.status === 'rejected' ? 'Abgelehnt' : 'Unbekannt'}
                </span>
              </div>

              {#if idea.description}
                <p class="mt-2 text-gray-600">
                  {idea.description}
                </p>
              {/if}

              <div class="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>
                  {idea.category}
                </span>
                <span>•</span>
                <span>
                  {new Date(idea.created_at).toLocaleDateString('de-DE')}
                </span>
                {#if idea.created_by_user?.email}
                  <span>•</span>
                  <span>
                    Von: {idea.created_by_user.email}
                  </span>
                {/if}
              </div>
            </div>

            <div class="ml-4 flex flex-col items-center">
              <form method="POST" action="?/vote" use:enhance={handleVote}>
                <input type="hidden" name="id" value={idea.id} />
                <button
                  type="submit"
                  class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={data.userVotes.has(idea.id)}
                  title={data.userVotes.has(idea.id) ? 'Sie haben bereits abgestimmt' : 'Für diese Idee stimmen'}
                >
                  <svg 
                    class="w-6 h-6" 
                    class:text-blue-500={data.userVotes.has(idea.id)}
                    class:text-gray-400={!data.userVotes.has(idea.id)}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
              </form>
              <span class="font-bold text-lg">
                {idea.votes || 0}
              </span>
            </div>
          </div>
        </div>
      {/each}

      {#if filteredIdeas.length === 0}
        <div class="p-6 text-center text-gray-500">
          Keine Ideen gefunden
        </div>
      {/if}
    </div>
  </div>
</div>