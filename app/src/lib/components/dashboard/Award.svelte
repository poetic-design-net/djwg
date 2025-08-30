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
  let groupedSubmission: any = null;
  
  // Lade die Award-Einreichungen des Benutzers
  async function loadAwardSubmissions() {
    try {
      const submissions = await client.fetch(`
        *[_type == "awardUpload" && userEmail == $email] | order(_createdAt desc) {
          _id,
          userName,
          userEmail,
          status,
          "fileUrl": coalesce(
            file.asset->url,
            asset.file.asset->url,
            "https://cdn.sanity.io/files/" + $projectId + "/" + $dataset + "/" + asset.file.asset._ref
          ),
          "imageUrl": coalesce(
            asset.image.asset->url,
            "https://cdn.sanity.io/images/" + $projectId + "/" + $dataset + "/" + asset.image.asset._ref
          ),
          asset,
          "fileType": fileType,
          "fileName": originalFilename,
          description,
          _createdAt,
          uploadedAt,
          winner,
          isWinner
        }
      `, { 
        email: user.email,
        projectId: 'h41owctz',
        dataset: 'production'
      });
      
      awardSubmissions = submissions || [];
      
      // Gruppiere die Einreichungen für die Anzeige
      if (awardSubmissions.length > 0) {
        // Finde Videos und Bilder
        const videos = awardSubmissions.filter(s => s.fileType?.startsWith('video/'));
        const images = awardSubmissions.filter(s => s.fileType?.startsWith('image/'));
        
        // Das Hauptvideo enthält Mix + Vorstellungsvideo
        const mainVideo = videos[0]; // Das erste/einzige Video ist Mix + Intro kombiniert
        const profilePhoto = images.find(img => 
          img.fileName?.toLowerCase().includes('profil') || 
          img.fileName?.toLowerCase().includes('portrait') ||
          img.fileName?.toLowerCase().includes('foto') ||
          !img.fileName?.toLowerCase().includes('setup')
        ) || images[0];
        const setupPhoto = images.find(img => 
          img.fileName?.toLowerCase().includes('setup') || 
          img.fileName?.toLowerCase().includes('dj') ||
          img.fileName?.toLowerCase().includes('equipment')
        ) || images[1];
        
        groupedSubmission = {
          userName: awardSubmissions[0].userName,
          userEmail: awardSubmissions[0].userEmail,
          mainVideo, // Enthält Mix + Vorstellungsvideo
          profilePhoto: profilePhoto || images[0],
          setupPhoto: setupPhoto || images[1],
          allFiles: awardSubmissions,
          hasVideo: !!mainVideo,
          hasProfilePhoto: !!profilePhoto,
          hasSetupPhoto: !!setupPhoto,
          isComplete: !!mainVideo && !!profilePhoto && !!setupPhoto,
          latestDate: awardSubmissions[0]._createdAt || awardSubmissions[0].uploadedAt,
          hasWinner: awardSubmissions.some(s => s.winner || s.isWinner),
          overallStatus: awardSubmissions[0].status
        };
      }
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
    
    <!-- Meine Award-Einreichung -->
    {#if !loadingSubmissions && groupedSubmission}
      <div class="my-8 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-white">Meine Award-Einreichung</h3>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">
              {groupedSubmission.totalFiles} Datei{groupedSubmission.totalFiles !== 1 ? 'en' : ''} hochgeladen
            </span>
            {#if groupedSubmission.overallStatus}
              <span class="px-2 py-1 text-xs font-medium rounded-full 
                {groupedSubmission.overallStatus === 'accepted' ? 'bg-green-500/20 text-green-300' : 
                 groupedSubmission.overallStatus === 'reviewed' ? 'bg-blue-500/20 text-blue-300' : 
                 groupedSubmission.overallStatus === 'rejected' ? 'bg-red-500/20 text-red-300' : 
                 'bg-yellow-500/20 text-yellow-300'}">
                {groupedSubmission.overallStatus === 'accepted' ? 'Akzeptiert' :
                 groupedSubmission.overallStatus === 'reviewed' ? 'Geprüft' :
                 groupedSubmission.overallStatus === 'rejected' ? 'Abgelehnt' :
                 'Ausstehend'}
              </span>
            {/if}
            {#if groupedSubmission.hasWinner}
              <span class="text-2xl" title="Gewinner">🏆</span>
            {/if}
          </div>
        </div>
        
        <!-- Übersicht Card -->
        <div class="bg-gray-900/50 rounded-xl border border-gray-800/60 p-6">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Videos Section -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Videos</h4>
              
              {#if groupedSubmission.mainVideo && groupedSubmission.mainVideo.fileUrl}
                <div class="space-y-2">
                  <p class="text-xs text-gray-500">Video (15-20 Min Mix + Vorstellung)</p>
                  <div class="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      controls
                      class="w-full h-full object-cover"
                    >
                      <source src={groupedSubmission.mainVideo.fileUrl} type="video/mp4" />
                      Dein Browser unterstützt das Video-Tag nicht.
                    </video>
                  </div>
                  <p class="text-xs text-gray-400">
                    Datei: {groupedSubmission.mainVideo.fileName || 'Video.mp4'}
                  </p>
                </div>
              {:else}
                <div class="bg-gray-800/50 rounded-lg p-4 text-center space-y-2">
                  <p class="text-sm text-gray-500">Video noch nicht hochgeladen</p>
                  <p class="text-xs text-gray-600">
                    Bitte lade dein 15-20 minütiges Video (Mix + Vorstellung) hoch
                  </p>
                </div>
              {/if}
            </div>
            
            <!-- Bilder Section -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Fotos</h4>
              
              <div class="grid grid-cols-2 gap-4">
                <!-- Profil Foto -->
                <div class="space-y-2">
                  <p class="text-xs text-gray-500">Profil-Foto</p>
                  <div class="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    {#if groupedSubmission.profilePhoto?.imageUrl || groupedSubmission.profilePhoto?.fileUrl}
                      <img 
                        src={groupedSubmission.profilePhoto.imageUrl || groupedSubmission.profilePhoto.fileUrl}
                        alt="Profil-Foto"
                        class="w-full h-full object-cover"
                      />
                    {:else}
                      <div class="flex items-center justify-center h-full">
                        <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    {/if}
                  </div>
                </div>
                
                <!-- Setup Foto -->
                <div class="space-y-2">
                  <p class="text-xs text-gray-500">DJ Setup</p>
                  <div class="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    {#if groupedSubmission.setupPhoto?.imageUrl || groupedSubmission.setupPhoto?.fileUrl}
                      <img 
                        src={groupedSubmission.setupPhoto.imageUrl || groupedSubmission.setupPhoto.fileUrl}
                        alt="DJ Setup"
                        class="w-full h-full object-cover"
                      />
                    {:else}
                      <div class="flex items-center justify-center h-full">
                        <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Upload Status -->
          <div class="mt-6 pt-6 border-t border-gray-800">
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500">
                Zuletzt aktualisiert: {formatDate(groupedSubmission.latestDate)}
              </p>
              <div class="flex items-center gap-3 text-xs">
                <span class="{groupedSubmission.hasVideo ? 'text-green-500' : 'text-gray-500'}">
                  {groupedSubmission.hasVideo ? '✓' : '○'} Video (Mix + Vorstellung)
                </span>
                <span class="{groupedSubmission.hasProfilePhoto ? 'text-green-500' : 'text-gray-500'}">
                  {groupedSubmission.hasProfilePhoto ? '✓' : '○'} Profil-Foto
                </span>
                <span class="{groupedSubmission.hasSetupPhoto ? 'text-green-500' : 'text-gray-500'}">
                  {groupedSubmission.hasSetupPhoto ? '✓' : '○'} Setup-Foto
                </span>
                {#if groupedSubmission.isComplete}
                  <span class="text-green-400 font-medium ml-auto">✓ Vollständig</span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    {:else if !loadingSubmissions}
      <div class="my-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60 text-center">
        <p class="text-gray-400">Du hast noch keine Dateien für den Award eingereicht.</p>
        <p class="text-sm text-gray-500 mt-2">Bitte lade folgende Dateien hoch:</p>
        <ul class="text-sm text-gray-500 mt-2 space-y-1">
          <li>• 15-20 minütiges Video (DJ Mix + Vorstellung) als MP4</li>
          <li>• Ein Foto von dir zum Posten</li>
          <li>• Ein Foto von deinem DJ Setup</li>
        </ul>
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
