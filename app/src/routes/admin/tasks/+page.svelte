<script lang="ts">
  import { onMount } from 'svelte';
  import { getTasks, createTask, updateTask, deleteTask } from '$lib/services/project-management';
  import type { Task, CreateTask, UpdateTask, TaskStatus } from '$lib/types/project-management';
  
  let tasks: Task[] = [];
  let loading = true;
  let error: string | null = null;
  let showAddForm = false;
  let showDeleteConfirm = false;
  let showEditForm = false;
  
  const STATUS_OPTIONS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'done'];
  
  let newTask: CreateTask = {
    title: '',
    description: '',
    status: 'todo',
    priority: 0,
    due_date: '',
    assigned_to: null as string | null
  };
  
  let editTask = {
    id: '' as string,
    title: '',
    description: '' as string | null,
    status: 'todo' as TaskStatus,
    priority: 0 as number,
    due_date: '',
    assigned_to: null as string | null
  };
  
  let selectedTask: Task | null = null;
  
  function showTaskDetails(task: Task) {
    selectedTask = task;
  }
  
  function formatDescription(text: string): string {
    // URLs in klickbare Links umwandeln
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
  }
  
  function handleClick(event: MouseEvent) {
    // Verhindern, dass der Modal sich schließt wenn auf einen Link geklickt wird
    if ((event.target as HTMLElement).tagName === 'A') {
      event.stopPropagation();
    }
  }
  
  function startEdit(task: Task) {
    if (task) {
      editTask = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || '',
        assigned_to: task.assigned_to
      };
    };
    showEditForm = true;
  }
  
  async function handleEdit() {
    try {
      loading = true;
      const updated = await updateTask(editTask.id, editTask);
      tasks = tasks.map(task => 
        task.id === editTask.id ? updated : task
      );
      showEditForm = false;
      selectedTask = updated;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Fehler beim Aktualisieren der Aufgabe';
    } finally {
      loading = false;
    }
  }
  
  async function handleDelete(id: string) {
    try {
      await deleteTask(id);
      tasks = tasks.filter(task => task.id !== id);
      selectedTask = null;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Fehler beim Löschen der Aufgabe';
    }
  }
  
  onMount(async () => {
    try {
      tasks = await getTasks();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    try {
      loading = true;
      const task = await createTask(newTask);
      tasks = [...tasks, task];
      showAddForm = false;
      newTask = {
        title: '',
        description: '',
        status: 'todo',
        priority: 0,
        due_date: '',
        assigned_to: null
      };
    } catch (e) {
      error = e instanceof Error ? e.message : 'Fehler beim Erstellen der Aufgabe';
    } finally {
      loading = false;
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    try {
      loading = true;
      const updated = await updateTask(id, { status });
      tasks = tasks.map(task => 
        task.id === id ? { ...task, status: updated.status } : task
      );
    } catch (e) {
      error = e instanceof Error ? e.message : 'Fehler beim Aktualisieren des Status';
    } finally {
      loading = false;
    }
  }

  function getPriorityClass(priority: number): string {
    if (priority >= 80) return 'bg-red-100 text-red-800';
    if (priority >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Aufgaben</h1>
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      on:click={() => showAddForm = true}
    >
      Neue Aufgabe
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <p>{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  {:else}
  {#if showAddForm}
  <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Neue Aufgabe</h2>
      <button
        class="text-gray-500 hover:text-gray-700"
        on:click={() => showAddForm = false}
      >
        ✕
      </button>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Titel
        </label>
        <input
          type="text"
          bind:value={newTask.title}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Beschreibung
        </label>
        <textarea
          bind:value={newTask.description}
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
            bind:value={newTask.status}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {#each STATUS_OPTIONS as status}
              <option value={status}>{status.replace('_', ' ')}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fälligkeitsdatum
          </label>
          <input
            type="date"
            bind:value={newTask.due_date}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Priorität (0-100)
          </label>
          <input
            type="number"
            bind:value={newTask.priority}
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

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      {#each STATUS_OPTIONS as status}
        <div class="bg-gray-50 p-4 rounded-lg">
          <h2 class="font-semibold text-lg mb-4 capitalize">
            {status.replace('_', ' ')}
          </h2>
          <div class="space-y-4">
            {#each tasks.filter(task => task.status === status) as task (task.id)}
              <div class="bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer" on:click={() => showTaskDetails(task)}>
                <div class="flex justify-between items-start">
                  <h3 class="font-medium">{task.title}</h3>
                  <span class={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}>
                    P{task.priority}
                  </span>
                </div>
                
                {#if task.due_date}
                  <p class="text-xs text-gray-500 mt-2">
                    Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
                  </p>
                {/if}

                <div class="mt-3 flex gap-2">
                  {#each STATUS_OPTIONS as newStatus}
                    {#if newStatus !== task.status}
                      <button
                        class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                        on:click={() => updateTaskStatus(task.id, newStatus)}
                      >
                        → {newStatus.replace('_', ' ')}
                      </button>
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    
    {#if selectedTask}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" on:click={() => selectedTask = null}>
        <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold">{selectedTask.title}</h2>
            <div class="flex gap-2">
              <button
                class="text-gray-600 hover:text-gray-800 px-2 py-1"
                on:click={() => selectedTask && startEdit(selectedTask)}
              >
                ✏️ Bearbeiten
              </button>
              <button
                class="text-red-600 hover:text-red-800 px-2 py-1"
                on:click={() => showDeleteConfirm = true}
              >
                🗑️ Löschen
              </button>
              <button
                class="text-gray-500 hover:text-gray-700"
                on:click={() => selectedTask = null}
              >
                ✕
              </button>
            </div>
          </div>
          
          {#if !showEditForm}
            <div class="space-y-4">
              {#if selectedTask.description}
                <div class="prose max-w-none" on:click={handleClick}>
                  <p class="text-gray-600 whitespace-pre-wrap">{@html formatDescription(selectedTask.description)}</p>
                </div>
              {/if}
              
              <div class="mt-4 text-sm text-gray-500">
                Priorität: {selectedTask.priority}
                {#if selectedTask.due_date}<br>Fällig: {new Date(selectedTask.due_date).toLocaleDateString('de-DE')}{/if}
              </div>
            </div>
          {:else}
            <form on:submit|preventDefault={handleEdit} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  bind:value={editTask.title}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  bind:value={editTask.description}
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
                    bind:value={editTask.status}
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {#each STATUS_OPTIONS as status}
                      <option value={status}>{status.replace('_', ' ')}</option>
                    {/each}
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    bind:value={editTask.due_date}
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Priorität (0-100)
                  </label>
                  <input
                    type="number"
                    bind:value={editTask.priority}
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
                  on:click={() => showEditForm = false}
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
          {/if}
        </div>
      </div>
    {/if}

    {#if showDeleteConfirm}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" on:click|stopPropagation>
          <h2 class="text-xl font-semibold mb-4">Aufgabe löschen</h2>
          <p class="text-gray-600 mb-6">
            Bist du sicher, dass du diese Aufgabe löschen möchtest?
            Dies kann nicht rückgängig gemacht werden.
          </p>
          
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              on:click={() => showDeleteConfirm = false}
            >
              Abbrechen
            </button>
            {#if selectedTask}
              <button
                class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                on:click={() => {
                  selectedTask && handleDelete(selectedTask.id);
                  showDeleteConfirm = false;
                }}
              >
                Löschen
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>