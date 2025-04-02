<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import AwardUploader from './AwardUploader.svelte';
  import PortableTextContent from '$lib/components/PortableTextContent.svelte';
  import type { User } from '$lib/types/profile';

  interface AwardData {
    dashboard: {
      processInfo: any[];
      surveyUrl: string;
      submissionStart: string;
      submissionEnd: string;
      isActive: boolean;
    };
  }

  export let user: User;
  export let award: AwardData;
  
  // Award Badge ID
  const AWARD_BADGE_ID = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1';
  
  // Prüfe, ob der Benutzer das Award Badge hat
  $: canAccess = user.badges?.some(badge => badge.badge_id === AWARD_BADGE_ID) || false;
  
  // Formatiere das Datum
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
</script>

<div class="space-y-8">
  {#if canAccess}
    <!-- Prozess-Informationen -->
    <div class="prose prose-invert max-w-none">
      {#if award?.dashboard?.processInfo}
        <PortableTextContent value={award.dashboard.processInfo} className="text-gray-300" />
      {:else}
        <h3>Ablauf des Award Uploads</h3>
        <p class="text-gray-400">
          Lade deine Medien hoch um am Award teilzunehmen.
        </p>
      {/if}
    </div>

    <!-- Upload Bereich -->
    <div class="my-8 space-y-6">
      <AwardUploader {user} />
    </div>

    <!-- Zeitliche Informationen -->
    <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60">
      <div class="text-sm text-gray-400">
        <p>Einreichungszeitraum:</p>
        <p class="mt-2">
          <span class="text-gray-300">Von:</span> {formatDate(award.dashboard.submissionStart)}
        </p>
        <p>
          Bis: {formatDate(award.dashboard.submissionEnd)}
        </p>
      </div>
    </div>

    <!-- Google Form Button -->
    <div class="mt-8">
      {#if award.dashboard.surveyUrl}
        <a 
          href={award.dashboard.surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Zum Fragebogen
        </a>
      {/if}
    </div>
  {:else}
    <div class="p-6 bg-gray-900/80 rounded-xl border border-gray-800/60 text-center">
      <p class="text-gray-400">
        Du benötigst das Award Badge um auf diesen Bereich zugreifen zu können.
      </p>
    </div>
  {/if}
</div>
