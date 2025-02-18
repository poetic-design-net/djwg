<script lang="ts">
  export let data;
  
  let searchTerm = '';
  let selectedStatus = 'all';
  let sortBy: 'priority' | 'date' = 'priority';
  let showAddForm = false;
  
  const STATUS_OPTIONS = [
    'backlog',
    'todo',
    'in_progress',
    'done'
  ] as const;

  let newItem = {
    title: '',
    description: '',
    target_date: '',
    status: STATUS_OPTIONS[0],
    priority: 0
  };

  $: filteredItems = data.items
    .filter(item => 
      (selectedStatus === 'all' || item.status === selectedStatus) &&
      (searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => sortBy === 'priority' 
      ? (b.priority || 0) - (a.priority || 0)
      : new Date(b.target_date || 0).getTime() - new Date(a.target_date || 0).getTime()
    );

  async function handleSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;
    try {
      const response = await fetch('?/createItem', {
        method: 'POST',
        body: new FormData(form)
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
    }
  }

  function getStatusBadgeClasses(status: string): string {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'backlog': return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'todo': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'done': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Bearbeitung';
      case 'done': return 'Erledigt';
      default: return status;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Roadmap</h1>
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      on:click={() => showAddForm = true}
    >
      Neuer Eintrag
    </button>
  </div>

  <div class="mb-6 flex flex-wrap gap-4">
    <div class="flex-1 max-w-md">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Einträge suchen..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div>
      <select
        bind:value={selectedStatus}
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Alle Status</option>
        {#each STATUS_OPTIONS as status}
          <option value={status}>{getStatusLabel(status)}</option>
        {/each}
      </select>
    </div>
    
    <div>
      <select
        bind:value={sortBy}
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="priority">Nach Priorität</option>
        <option value="date">Nach Datum</option>
      </select>
    </div>
  </div>

  <div class="my-4 text-sm font-medium text-gray-500">
    {filteredItems.length} von {data.items.length} Einträgen
  </div>

  {#if showAddForm}
    <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Neuer Roadmap-Eintrag</h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          on:click={() => showAddForm = false}
        >
          ✕
        </button>
      </div>

      <form 
        method="POST" 
        action="?/createItem" 
        on:submit|preventDefault={handleSubmit} 
        class="space-y-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Titel
          </label>
          <input
            type="text"
            name="title"
            required
            bind:value={newItem.title}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung
          </label>
          <textarea
            name="description"
            bind:value={newItem.description}
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              required
              bind:value={newItem.status}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {#each STATUS_OPTIONS as status}
                <option value={status}>{getStatusLabel(status)}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Zieldatum
            </label>
            <input
              type="date"
              name="target_date"
              bind:value={newItem.target_date}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Priorität
            </label>
            <input
              type="number"
              name="priority"
              bind:value={newItem.priority}
              min="0"
              max="100"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
      {#each filteredItems as item (item.id)}
        <div class="p-6 hover:bg-gray-50">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-medium text-gray-900">
                  {item.title}
                </h3>
                <span class={getStatusBadgeClasses(item.status)}>
                  {getStatusLabel(item.status)}
                </span>
              </div>

              {#if item.description}
                <p class="mt-2 text-gray-600">
                  {item.description}
                </p>
              {/if}

              <div class="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>
                  Priorität: {item.priority}
                </span>
                {#if item.target_date}
                  <span>•</span>
                  <span>
                    Zieldatum: {new Date(item.target_date).toLocaleDateString('de-DE')}
                  </span>
                {/if}
              </div>
            </div>

            <div class="ml-4">
              <select
                class="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={item.status}
                on:change={async (e) => {
                  const formData = new FormData();
                  formData.append('id', item.id);
                  formData.append('status', e.currentTarget.value);
                  await fetch('?/updateStatus', {
                    method: 'POST',
                    body: formData
                  });
                  window.location.reload();
                }}
              >
                {#each STATUS_OPTIONS as status}
                  <option value={status}>{getStatusLabel(status)}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      {/each}

      {#if filteredItems.length === 0}
        <div class="p-6 text-center text-gray-500">
          Keine Einträge gefunden
        </div>
      {/if}
    </div>
  </div>


</div>