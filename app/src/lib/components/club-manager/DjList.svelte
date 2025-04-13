<script lang="ts">
  import type { EnrichedProfile } from '$lib/types/profile';

  export let djs: EnrichedProfile[];
  export let onDjClick: (dj: EnrichedProfile) => void;

  function getEventHtml(dj: EnrichedProfile): string {
    const avatarHtml = dj.avatar_url
      ? `<img src="${dj.avatar_url}" alt="${dj.full_name || 'DJ'}" class="dj-avatar" />`
      : `<div class="dj-avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-6.627 0-12 4.373-12 9.777 0 1.223.993 2.223 2.217 2.223h19.566A2.22 2.22 0 0024 23.777C24 18.373 18.627 14 12 14z"/>
          </svg>
        </div>`;

    let displayName = dj.username || dj.full_name || '';
    if (!displayName && dj.email) {
      displayName = dj.email.split('@')[0];
    }
    if (!displayName) {
      displayName = 'DJ';
    }
    
    return `
      <div class="flex items-center gap-2">
        ${avatarHtml}
        <span class="dj-name">@${displayName}</span>
      </div>
    `;
  }

  function getStatusBadgeColor(badges: Array<{ badge_id: string }> | undefined): string {
    if (!badges || badges.length === 0) return '#6B7280'; // gray-500
    const urlaubBadge = badges.find(b => b.badge_id === '551d9015-aa13-4117-8776-b59f1aaade9b');
    return urlaubBadge ? '#F59E0B' : '#10B981'; // yellow-500 : green-500
  }
</script>

<div class="sticky top-24 bg-gray-900/50 rounded-xl p-6 border border-gray-800/60 space-y-6">
  <div class="border-b border-gray-800/60 pb-4 mb-6">
    <h2 class="text-xl font-semibold text-white">DJ Übersicht</h2>
    <p class="text-sm text-gray-400 mt-1">Verfügbare DJs ({djs.length})</p>
  </div>
  
  <div class="space-y-2">
    {#each djs as dj}
      <button 
        class="w-full bg-gray-800/70 hover:bg-gray-800/90 rounded-lg p-3 border border-gray-700/50 transition-all dj-list-item"
        on:click={() => onDjClick(dj)}
      >
        <div class="flex items-center justify-between">
          {@html getEventHtml(dj)}
          <span 
            class="w-2 h-2 rounded-full"
            style="background-color: {getStatusBadgeColor(dj.badges)}"
          />
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .dj-avatar, .dj-avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dj-avatar-placeholder {
    background: rgb(55, 65, 81);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    color: rgb(156, 163, 175);
  }

  .dj-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(229, 231, 235);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dj-list-item {
    transform: translateY(0);
    transition: transform 0.2s ease;
  }

  .dj-list-item:hover {
    transform: translateY(-1px);
  }
</style>