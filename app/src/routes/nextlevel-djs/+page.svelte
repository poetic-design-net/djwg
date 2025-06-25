<script lang="ts">
  import type { PageData } from './$types';
  import ComingSoon from '$lib/components/ComingSoon.svelte';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import PricingPlans from '$lib/components/nextlevel/PricingPlans.svelte';
  import type { UserBadge } from '$lib/utils/badge-utils';
  import { isAdmin } from '$lib/types/profile';

  export let data: PageData;

  // NextLevel DJs Badge ID
  const NEXTLEVEL_BADGE_ID = 'b43630a1-86b3-43d2-9fd2-76857a122afd';

  let canAccess = false;

  $: {
    const badges = data.user?.badges as UserBadge[] | undefined;
    canAccess = badges?.some(badge => badge.badge_id === NEXTLEVEL_BADGE_ID) || false;
  }
</script>

{#if !canAccess}
  <!-- Coming Soon für alle Nicht-Admins -->
  <div class="min-h-screen bg-black text-white flex items-center justify-center">
    <div class="text-center max-w-2xl mx-auto px-4">
      {#if data.pageData?.comingSoon?.backgroundImage}
        <div class="absolute inset-0 z-0">
          <OptimizedImage
            image={data.pageData.comingSoon.backgroundImage}
            alt="NextLevel DJs Academy Cover Image"
            sizes="100vw"
            className="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-black/80" />
        </div>
      {/if}
      
      <div class="relative z-10">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">NextLevel DJs Academy</span>
        
        <h1 class="font-heading mb-8 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">
          Coming Soon
        </h1>
        
        <div class="space-y-6 text-xl md:text-2xl text-white/90 leading-relaxed">
          <p>
            Bald präsentieren wir dir eine einzigartige Plattform, die das DJ-Game auf den Kopf stellt.
          </p>
          
          <p class="text-green-400 font-medium">
            Bleib dran – es wird legendär! 🎧
          </p>
        </div>
        
        <div class="mt-12">
          <a
            href="/"
            class="inline-flex items-center px-8 py-3 text-lg font-medium text-black bg-green-500 hover:bg-green-400 rounded-full transition duration-300"
          >
            Zurück zur Startseite
          </a>
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Kompletter Zugang für User mit NextLevel Badge -->
  <div class="min-h-screen bg-black text-white">
    
    <!-- 1. Pricing Section -->
    <div class="relative overflow-hidden">
      {#if data.pageData?.comingSoon?.backgroundImage}
        <div class="absolute inset-0 z-0">
          <OptimizedImage
            image={data.pageData.comingSoon.backgroundImage}
            alt="NextLevel DJs Academy Cover Image"
            sizes="100vw"
            className="w-full h-[70vh] object-cover"
          />
          <div class="absolute inset-0 bg-black/80" />
        </div>
      {/if}
      <div class="relative z-10 py-32">
        <div class="container px-4 mx-auto">
          <div class="max-w-4xl mx-auto text-center">
            <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">NextLevel DJs Academy</span>
            <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">
              Werde zum Pro-DJ
            </h1>
            <p class="text-2xl text-white/80 mb-8">
              Erhalte Zugang zu exklusiven DJ-Videos, Musikdownloads und der Community
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div class="flex items-center gap-2 text-white/60">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>Professionelle DJ-Videos</span>
              </div>
              <div class="flex items-center gap-2 text-white/60">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>Musik-Downloads</span>
              </div>
              <div class="flex items-center gap-2 text-white/60">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>Community Zugang</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Plans Section -->
    <PricingPlans />

    <!-- 2. Course Grid Section -->
    <div class="py-16 border-t border-white/10">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center mb-16">
          <h2 class="font-heading mb-6 text-4xl md:text-5xl text-white tracking-tighter">Deine Kurse</h2>
          <p class="text-xl text-white/80">
            Als NextLevel Member hast du Zugang zu allen Kursen und Inhalten
          </p>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {#if !data.courses?.length}
          <div class="text-center">
            <h3 class="text-2xl font-medium mb-4">Keine Kurse verfügbar</h3>
            <p class="text-lg text-white/80">
              Momentan sind keine Kurse verfügbar. Bitte versuche es später erneut.
            </p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each data.courses as course}
              <a
                href={course.slug?.current ? `/nextlevel-djs/${course.slug.current}` : '#'}
                class="group bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02]"
              >
                {#if course.coverImage}
                  <div class="relative aspect-video">
                    <OptimizedImage
                      image={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                {:else}
                  <div class="aspect-video bg-gray-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                {/if}

                <div class="p-6">
                  <h3 class="text-xl font-medium mb-2 group-hover:text-green-400 transition-colors">{course.title}</h3>
                  {#if course.description}
                    <p class="text-white/60 line-clamp-2">{course.description}</p>
                  {/if}

                  {#if course.chapters?.length}
                    <div class="mt-4 flex items-center gap-4 text-sm text-white/40">
                      <div class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{course.chapters.length} Kapitel</span>
                      </div>

                      <div class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {course.chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0)} Lektionen
                        </span>
                      </div>
                    </div>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}