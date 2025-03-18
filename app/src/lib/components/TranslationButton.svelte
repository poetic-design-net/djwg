<!-- TranslationButton.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { setupBrowserTranslation, type TranslationTip } from '$lib/services/translationHelper';
  
  let translationTip: TranslationTip | undefined;
  let showButton = true;

  onMount(() => {
    translationTip = setupBrowserTranslation();
    
    // Check if user has dismissed the button before
    const dismissed = localStorage.getItem('translationButtonDismissed');
    if (dismissed === 'true') {
      showButton = false;
      return;
    }
    
    // Check if page is already translated
    const isTranslated = document.documentElement.classList.contains('translated-rtl') || 
                        document.documentElement.classList.contains('translated-ltr');
    if (isTranslated) {
      showButton = false;
      localStorage.setItem('translationButtonDismissed', 'true');
    }
  });

  function toggleTranslationHint() {
    if (translationTip) {
      translationTip.show();
    }
  }

  function dismissButton() {
    showButton = false;
    localStorage.setItem('translationButtonDismissed', 'true');
    if (translationTip) {
      translationTip.hide();
    }
  }
</script>

{#if showButton}
  <div class="translation-controls" role="complementary" aria-label="Translation options">
    <button 
      on:click={toggleTranslationHint}
      class="translate-button"
      aria-label="Show translation options"
    >
      <span class="icon">🌐</span>
      <span class="text">Translate</span>
    </button>
    <button 
      on:click={dismissButton}
      class="close-button"
      aria-label="Dismiss translation button"
    >×</button>
  </div>
{/if}
  
<style>
  .translation-controls {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }

  .translate-button {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    padding-right: 30px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: background-color 0.2s;
  }
  
  .close-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #ddd;
    color: #666;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: background-color 0.2s;
  }

  .translate-button:hover,
  .close-button:hover {
    background-color: #e9ecef;
  }
  
  .icon {
    font-size: 16px;
  }
</style>