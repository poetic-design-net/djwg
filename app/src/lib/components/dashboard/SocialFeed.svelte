<script lang="ts">
  import { getContext, onMount, onDestroy } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { User, Profile } from '$lib/types/profile';
  import { isAdmin } from '$lib/types/profile';
  import { badgeStore } from '$lib/stores/badges';
  import type { NormalizedPost, PostLike } from '$lib/types/social';
  import { DJ_LEVEL_1_ID } from '$lib/services/badge-service';
  import { SocialFeedService } from '$lib/services/social-feed-service';
  import { toasts } from '$lib/stores/toast';
  import { formatTextWithLinks } from '$lib/utils/format-text';

  export let user: User;
  export let profile: Profile | null;

  const supabase = getContext<SupabaseClient>('supabase');
  const socialFeedService = new SocialFeedService(supabase);

  let newPostContent = '';
  let posts: NormalizedPost[] = [];
  let canPost = false;
  let loading = true;
  let subscription: ReturnType<typeof socialFeedService.subscribeToUpdates>;
  let selectedFiles: FileList | null = null;
  let previewUrls: string[] = [];
  
  // Kommentar-Inputs mit Index Signature
  let commentInputs: { [key: string]: string } = {};

  // Medien-Vorschau Cleanup Funktion
  let cleanup: (() => void) | undefined;
  $: {
    if (previewUrls.length > 0) {
      cleanup = () => {
        previewUrls.forEach(URL.revokeObjectURL);
      };
    }
  }

  onDestroy(() => {
    if (cleanup) cleanup();
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  });

  // Helper Funktionen
  function hasUserLiked(likes: PostLike[], userId: string): boolean {
    return likes.some(like => like.user_id === userId);
  }

  function isOwnContent(contentUserId: string): boolean {
    return contentUserId === user.id || isAdmin(user);
  }

  function formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleString('de-DE', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Prüfe, ob der Benutzer das erforderliche Badge hat oder Admin ist
  $: {
    try {
      const userBadges = user.badges || [];
      canPost = userBadges.some(badge => badge.badge_id === DJ_LEVEL_1_ID) || isAdmin(user);
      
      if (!canPost) {
        console.log('Keine Postberechtigung:', {
          userBadges,
          DJ_LEVEL_1_ID,
          isAdmin: isAdmin(user)
        });
      }
    } catch (error) {
      console.error('Fehler bei der Badge-Prüfung:', error);
      canPost = false;
    }
  }

  // Medien-Vorschau
  $: if (selectedFiles) {
    previewUrls = [];
    Array.from(selectedFiles).forEach(file => {
      const url = URL.createObjectURL(file);
      previewUrls = [...previewUrls, url];
    });
  }

  async function loadPosts() {
    try {
      loading = true;
      posts = await socialFeedService.getPosts();
    } catch (error) {
      console.error('Fehler beim Laden der Posts:', error);
      toasts.error('Posts konnten nicht geladen werden');
    } finally {
      loading = false;
    }
  }

  async function handlePostSubmit() {
    if (!newPostContent.trim() || !canPost) return;

    try {
      await socialFeedService.createPost(
        user.id, 
        newPostContent, 
        selectedFiles ? Array.from(selectedFiles) : undefined
      );
      await loadPosts();
      newPostContent = '';
      selectedFiles = null;
      previewUrls = [];
      toasts.success('Post wurde erstellt');
    } catch (error) {
      console.error('Fehler beim Erstellen des Posts:', error);
      toasts.error('Post konnte nicht erstellt werden');
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('Möchtest du diesen Post wirklich löschen?')) return;

    try {
      await socialFeedService.deletePost(postId, user.id);
      await loadPosts();
      toasts.success('Post wurde gelöscht');
    } catch (error) {
      console.error('Fehler beim Löschen des Posts:', error);
      toasts.error('Post konnte nicht gelöscht werden');
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Möchtest du diesen Kommentar wirklich löschen?')) return;

    try {
      await socialFeedService.deleteComment(commentId, user.id);
      await loadPosts();
      toasts.success('Kommentar wurde gelöscht');
    } catch (error) {
      console.error('Fehler beim Löschen des Kommentars:', error);
      toasts.error('Kommentar konnte nicht gelöscht werden');
    }
  }

  async function handleLike(postId: string) {
    try {
      await socialFeedService.toggleLike(postId, user.id);
      await loadPosts();
    } catch (error) {
      console.error('Fehler beim Liken/Unliken:', error);
      toasts.error('Aktion konnte nicht ausgeführt werden');
    }
  }

  async function handleComment(postId: string) {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    try {
      await socialFeedService.addComment(postId, user.id, commentText);
      commentInputs[postId] = '';
      await loadPosts();
      toasts.success('Kommentar wurde hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Kommentieren:', error);
      toasts.error('Kommentar konnte nicht erstellt werden');
    }
  }

  onMount(() => {
    loadPosts();
    subscription = socialFeedService.subscribeToUpdates(loadPosts);
  });
</script>

<div class="space-y-6 p-4 bg-gray-950/90 rounded-xl border border-gray-800/60 backdrop-blur">
  <!-- Post erstellen -->
  {#if canPost}
    <div class="space-y-3 p-4 bg-gray-900/80 rounded-xl border border-gray-800/60 shadow-lg">
      <textarea
        bind:value={newPostContent}
        placeholder="Was gibt's Neues?"
        class="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-inner"
        rows="3"
      />
      
      <!-- Medien Upload -->
      <div class="flex items-center space-x-4">
        <label class="cursor-pointer group">
          <input
            type="file"
            class="hidden"
            accept="image/*,video/*"
            multiple
            bind:files={selectedFiles}
          />
          <div class="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm">Medien hinzufügen</span>
          </div>
        </label>
        <button
          on:click={handlePostSubmit}
          disabled={!newPostContent.trim()}
          class="px-6 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20"
        >
          Posten
        </button>
      </div>

      <!-- Medien Vorschau -->
      {#if previewUrls.length > 0}
        <div class="grid grid-cols-2 gap-2 mt-2">
          {#each previewUrls as url}
            <div class="relative group">
              {#if url.includes('video')}
                <video 
                  src={url} 
                  class="w-full h-32 object-cover rounded-lg"
                  controls
                />
              {:else}
                <img 
                  src={url} 
                  alt="Vorschau"
                  class="w-full h-32 object-cover rounded-lg"
                />
              {/if}
              <button
                class="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                on:click={() => {
                  const index = previewUrls.indexOf(url);
                  if (selectedFiles && index > -1) {
                    const newFiles = Array.from(selectedFiles);
                    newFiles.splice(index, 1);
                    selectedFiles = new DataTransfer().files;
                    previewUrls = previewUrls.filter((_, i) => i !== index);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="p-6 bg-gray-900/80 rounded-xl border border-gray-800/60 text-center text-gray-400 text-sm shadow-lg backdrop-blur">
      <p>Du benötigst das "DJ Level 1" Badge, um Beiträge zu erstellen.</p>
      <p class="mt-2 text-green-400">Vervollständige dein Profil, um das Badge zu erhalten!</p>
    </div>
  {/if}

  <!-- Posts anzeigen -->
  <div class="space-y-6">
    {#if loading}
      <div class="text-center text-gray-400 p-8">
        <div class="animate-pulse">Lädt...</div>
      </div>
    {:else if posts.length === 0}
      <div class="text-center text-gray-400 p-8">Noch keine Posts vorhanden.</div>
    {:else}
      {#each posts as post (post.id)}
        <div class="p-5 bg-gray-900/80 rounded-xl border border-gray-800/60 shadow-lg backdrop-blur">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              {#if post.profiles?.avatar_url}
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.username}
                  class="w-10 h-10 rounded-full object-cover border-2 border-green-500/20"
                />
              {:else}
                <div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-green-500/20">
                  <span class="text-sm text-green-400 font-medium">
                    {(post.profiles?.username || 'A')[0].toUpperCase()}
                  </span>
                </div>
              {/if}
              <div class="flex flex-col">
                <span class="font-medium text-green-400">
                  {post.profiles?.username || 'Anonym'}
                </span>
                <span class="text-xs text-gray-300">
                  {formatDateTime(post.created_at)}
                </span>
              </div>
            </div>
            {#if isOwnContent(post.user_id)}
              <button 
                on:click={() => handleDeletePost(post.id)}
                class="text-gray-300 hover:text-red-500 transition-colors"
                title="Post löschen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
          </div>
          <p class="text-white mb-4 text-lg whitespace-pre-wrap px-2">
            {@html formatTextWithLinks(post.content)}
          </p>

          <!-- Medien anzeigen -->
          {#if post.post_media && post.post_media.length > 0}
            <div class="grid grid-cols-2 gap-2 mb-4">
              {#each post.post_media as media}
                <div class="relative group rounded-lg overflow-hidden">
                  {#if media.media_type === 'video'}
                    <video 
                      src={media.media_url} 
                      class="w-full h-48 object-cover"
                      controls
                    />
                  {:else}
                    <img 
                      src={media.media_url} 
                      alt="Post media"
                      class="w-full h-48 object-cover"
                    />
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <div class="flex items-center space-x-4 text-gray-400 mb-4">
            <button 
              on:click={() => handleLike(post.id)} 
              class="flex items-center space-x-2 hover:text-red-500 transition-colors group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 {hasUserLiked(post.post_likes, user.id) ? 'text-red-500' : ''} transform group-hover:scale-110 transition-transform" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fill-rule="evenodd" 
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                  clip-rule="evenodd" 
                />
              </svg>
              <span>{post.post_likes.length}</span>
            </button>
            <div class="flex items-center space-x-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path 
                  fill-rule="evenodd" 
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" 
                  clip-rule="evenodd" 
                />
              </svg>
              <span>{post.post_comments.length} Kommentare</span>
            </div>
          </div>

          <!-- Kommentarbereich -->
          <div class="mt-4 pt-4 border-t border-gray-800/60 space-y-3">
            {#each post.post_comments as comment}
              <div class="group bg-gray-950/50 p-3 rounded-lg border border-gray-800/40 shadow-inner">
                <div class="flex items-start justify-between gap-3 relative">
                  <div class="flex items-start gap-3">
                    {#if comment.profiles?.avatar_url} 
                      <img 
                        src={comment.profiles.avatar_url}
                        alt={comment.profiles.username}
                        class="w-8 h-8 rounded-full object-cover border border-green-500/20 mt-0.5"
                      />
                    {:else}
                      <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-green-500/20 mt-0.5">
                        <span class="text-sm text-green-400 font-medium">
                          {(comment.profiles?.username || 'A')[0].toUpperCase()}
                        </span>
                      </div>
                    {/if}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-baseline">
                        <span class="font-medium text-green-400">
                          {comment.profiles?.username || 'Anonym'}
                        </span>
                      </div>
                      <p class="text-gray-300 mt-1">
                        {@html formatTextWithLinks(comment.content)}
                      </p>
                    </div>
                  </div>
                  <span class="text-xs text-gray-300 whitespace-nowrap flex-shrink-0 ml-4">
                    {formatDateTime(comment.created_at)}
                  </span>
                  {#if isOwnContent(comment.user_id)}
                    <button 
                      on:click={() => handleDeleteComment(comment.id)}
                      class="absolute top-0 right-0 -mt-1 -mr-1 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1 bg-gray-900/80 rounded-full"
                      title="Kommentar löschen"
                      style="transform: translate(25%, -25%)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>
            {/each}

            <!-- Kommentar hinzufügen -->
            {#if canPost}
              <div class="flex items-center space-x-2 pt-2">
                <input 
                  type="text" 
                  bind:value={commentInputs[post.id]}
                  placeholder="Kommentar hinzufügen..." 
                  class="flex-1 px-4 py-2 text-sm bg-gray-950 border border-gray-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
                />
                <button 
                  on:click={() => handleComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                  class="px-4 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20"
                >
                  Senden
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>