<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import AwardUploader from './AwardUploader.svelte';
  import PortableTextContent from '$lib/components/PortableTextContent.svelte';
  import type { User } from '$lib/types/profile';
  import { client } from '$lib/sanity/client';

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
  
  let awardSubmissions: any[] = [];
  let loadingSubmissions = true;
  
  // Lade die Award-Einreichungen des Benutzers
  async function loadAwardSubmissions() {
    try {
      const submissions = await client.fetch(`
        *[_type == "awardUpload" && userEmail == $email] | order(_createdAt desc) {
          _id,
          userName,
          userEmail,
          status,
          "fileUrl": file.asset->url,
          "thumbnail": file.asset->metadata.dimensions,
          description,
          _createdAt,
          uploadedAt,
          winner
        }
      `, { email: user.email });
      
      awardSubmissions = submissions || [];
    } catch (error) {
      console.error('Fehler beim Laden der Award-Einreichungen:', error);
    } finally {
      loadingSubmissions = false;
    }
  }
  
  // Handler für Upload-Completion
  function handleUploadComplete() {
    // Lade die Einreichungen neu
    setTimeout(() => loadAwardSubmissions(), 2000); // Kurze Verzögerung für Sanity-Synchronisation
  }
  
  onMount(() => {
    if (canAccess) {
      loadAwardSubmissions();
    }
  });
  
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
      <AwardUploader {user} on:uploadComplete={handleUploadComplete} />
    </div>
    
    <!-- Meine Award-Einreichungen -->
    {#if !loadingSubmissions && awardSubmissions.length > 0}
      <div class="my-8 space-y-4">
        <h3 class="text-lg font-medium text-white">Meine Award-Einreichungen</h3>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {#each awardSubmissions as submission}
            <div class="bg-gray-900/50 rounded-xl border border-gray-800/60 overflow-hidden">
              <!-- Video Thumbnail oder Placeholder -->
              <div class="aspect-video bg-gray-800 relative">
                {#if submission.fileUrl}
                  <!-- Video Player -->
                  <video
                    controls
                    class="w-full h-full object-cover"
                    poster={submission.thumbnail?.url}
                  >
                    <source src={submission.fileUrl} type="video/mp4" />
                    Dein Browser unterstützt das Video-Tag nicht.
                  </video>
                {:else}
                  <div class="flex items-center justify-center h-full">
                    <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                {/if}
                
                <!-- Status Badge -->
                {#if submission.status}
                  <div class="absolute top-2 right-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full 
                      {submission.status === 'accepted' ? 'bg-green-500/20 text-green-300' : 
                       submission.status === 'reviewed' ? 'bg-blue-500/20 text-blue-300' : 
                       submission.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 
                       'bg-yellow-500/20 text-yellow-300'}">
                      {submission.status === 'accepted' ? 'Akzeptiert' :
                       submission.status === 'reviewed' ? 'Geprüft' :
                       submission.status === 'rejected' ? 'Abgelehnt' :
                       'Ausstehend'}
                    </span>
                  </div>
                {/if}
                
                <!-- Winner Badge -->
                {#if submission.winner}
                  <div class="absolute top-2 left-2">
                    <span class="text-3xl" title="Gewinner">🏆</span>
                  </div>
                {/if}
              </div>
              
              <!-- Submission Info -->
              <div class="p-4 space-y-2">
                {#if submission.description}
                  <p class="text-sm text-gray-300 line-clamp-2">{submission.description}</p>
                {/if}
                <p class="text-xs text-gray-500">
                  Eingereicht am {formatDate(submission.uploadedAt || submission._createdAt)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if !loadingSubmissions}
      <div class="my-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60 text-center">
        <p class="text-gray-400">Du hast noch keine Videos für den Award eingereicht.</p>
      </div>
    {/if}

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
