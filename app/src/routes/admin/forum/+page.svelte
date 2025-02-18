<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { getForumTopics, createForumTopic, createForumPost } from '$lib/services/project-management';
  import type { ForumTopic, ForumPost, CreateForumTopic, CreateForumPost, DatabaseUser } from '$lib/types/project-management';
  
  export let data: PageData;

  let topics: ForumTopic[] = [];
  let loading = true;
  let error: string | null = null;
  let showAddForm = false;
  let showReplyForm = false;
  let selectedTopic: ForumTopic | null = null;
  let searchQuery = '';
  
  let newTopic: CreateForumTopic = {
    title: '',
    content: '',
    category: 'Allgemein',
    is_pinned: false
  };
  
  let newReply: CreateForumPost = {
    content: '',
    topic_id: ''
  };

  const CATEGORIES = [
    'Allgemein',
    'Ankündigungen',
    'Fragen',
    'Ideen',
    'Technisches'
  ] as const;

  onMount(async () => {
    try {
      if (data.topics && data.topics.length > 0) {
        topics = data.topics;
      } else {
        topics = await getForumTopics();
      }
      console.log('Loaded topics:', topics);
    } catch (e) {
      handleError(e, 'Ein Fehler ist beim Laden der Themen aufgetreten');
    } finally {
      loading = false;
    }
  });

  async function handleSubmitTopic() {
    try {
      loading = true;
      const topic = await createForumTopic(newTopic);
      topics = [topic, ...topics];
      showAddForm = false;
      resetNewTopic();
    } catch (e) {
      handleError(e, 'Fehler beim Erstellen des Themas');
    } finally {
      loading = false;
    }
  }

  async function handleSubmitReply() {
    if (!selectedTopic) {
      error = 'Kein Thema ausgewählt';
      return;
    }

    const currentTopic = selectedTopic;
    
    try {
      loading = true;
      const post = await createForumPost({
        ...newReply,
        topic_id: currentTopic.id
      });
      
      updateTopicWithNewPost(currentTopic, post);
      showReplyForm = false;
      resetNewReply();
    } catch (e) {
      handleError(e, 'Fehler beim Erstellen der Antwort');
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function resetNewTopic() {
    newTopic = {
      title: '',
      content: '',
      category: 'Allgemein',
      is_pinned: false
    };
  }

  function resetNewReply() {
    newReply = {
      content: '',
      topic_id: ''
    };
  }

  function updateTopicWithNewPost(topic: ForumTopic, post: ForumPost) {
    const updatedTopic = {
      ...topic,
      posts: [...(topic.posts || []), post]
    };
    
    topics = topics.map(t =>
      t.id === topic.id ? updatedTopic : t
    );
    
    selectedTopic = updatedTopic;
  }

  function handleError(e: unknown, defaultMessage: string) {
    error = e instanceof Error ? e.message : defaultMessage;
  }

  function sortTopics(a: ForumTopic, b: ForumTopic): number {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }

  function getUserIdentifier(user: DatabaseUser | null | undefined): string {
    if (!user) return 'Unbekannter Benutzer';
    return user.full_name || user.email || user.username || 'Unbekannter Benutzer';
  }

  $: filteredTopics = topics
    .filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort(sortTopics);
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Forum</h1>
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      on:click={() => {
        showAddForm = true;
        selectedTopic = null;
      }}
    >
      Neues Thema
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <p>{error}</p>
    </div>
  {/if}

  <div class="mb-6">
    <input
      type="text"
      placeholder="Themen durchsuchen..."
      bind:value={searchQuery}
      class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  {:else}
  {#if showAddForm}
  <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Neues Thema</h2>
      <button
        class="text-gray-500 hover:text-gray-700"
        on:click={() => showAddForm = false}
      >
        ✕
      </button>
    </div>

    <form 
      method="POST" 
      action="?/createTopic" 
      on:submit|preventDefault={handleSubmitTopic} 
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
          bind:value={newTopic.title}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Inhalt
        </label>
        <textarea
          name="content"
          bind:value={newTopic.content}
          rows="5"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Kategorie
          </label>
          <select
            name="category"
            required
            bind:value={newTopic.category}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {#each CATEGORIES as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <div class="flex items-center justify-start md:justify-end">
          <label class="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_pinned"
              bind:checked={newTopic.is_pinned}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Als wichtig markieren</span>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
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
          Erstellen
        </button>
      </div>
    </form>
  </div>
    {:else if selectedTopic}
      <div class="bg-white rounded-lg shadow-lg mb-8">
        <div class="p-6 border-b">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-semibold">{selectedTopic.title}</h2>
              <div class="mt-2 text-sm text-gray-500">
                <span>{formatDate(selectedTopic.created_at)}</span>
                <span class="mx-2">·</span>
                <span>{selectedTopic.category}</span>
                <span class="mx-2">·</span>
                <span>von {getUserIdentifier(selectedTopic.created_by_user)}</span>
                {#if selectedTopic.is_pinned}
                  <span class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Wichtig
                  </span>
                {/if}
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500"
              on:click={() => selectedTopic = null}
            >
              ×
            </button>
          </div>
          <div class="mt-4 text-gray-700">
            {selectedTopic.content}
          </div>
        </div>

        {#if selectedTopic.posts?.length}
          <div class="divide-y">
            {#each selectedTopic.posts as post}
              <div class="p-6">
                <div class="text-gray-700">{post.content}</div>
                <div class="mt-2 text-sm text-gray-500">
                  <span>{formatDate(post.created_at)}</span>
                  <span class="mx-2">·</span>
                  <span>von {getUserIdentifier(post.created_by_user)}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <div class="p-6 bg-gray-50">
          {#if showReplyForm}
            <form on:submit|preventDefault={handleSubmitReply} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Deine Antwort</label>
                <textarea
                  bind:value={newReply.content}
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  on:click={() => showReplyForm = false}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Antworten
                </button>
              </div>
            </form>
          {:else}
            <button
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              on:click={() => showReplyForm = true}
            >
              Antworten
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-lg divide-y">
        {#each filteredTopics as topic (topic.id)}
          <div 
            class="p-6 hover:bg-gray-50 cursor-pointer"
            on:click={() => {
              selectedTopic = topic;
              showReplyForm = false;
            }}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium">
                  {topic.title}
                  {#if topic.is_pinned}
                    <span class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Wichtig
                    </span>
                  {/if}
                </h3>
                {#if topic.content}
                  <p class="mt-1 text-gray-600 line-clamp-2">{topic.content}</p>
                {/if}
                <div class="mt-2 text-sm text-gray-500">
                  <span>{formatDate(topic.created_at)}</span>
                  <span class="mx-2">·</span>
                  <span>{topic.category}</span>
                  <span class="mx-2">·</span>
                  <span>von {getUserIdentifier(topic.created_by_user)}</span>
                  <span class="mx-2">·</span>
                  <span>{topic.posts?.length || 0} Antworten</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>