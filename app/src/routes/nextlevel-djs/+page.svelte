<script lang="ts">
  import type { PageData } from './$types';
  import VideoPlayer from '$lib/components/video/VideoPlayer.svelte';
  import ComingSoon from '$lib/components/ComingSoon.svelte';
  import { courseProgress } from '$lib/stores/courseProgress';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { loadUserProgress, saveLessonProgress } from '$lib/services/courseProgress';

  export let data: PageData;


  let selectedCourse = data.courses?.[0];
  let selectedChapter = selectedCourse?.chapters?.[0];
  let selectedLesson = selectedChapter?.lessons?.[0];

  $: totalLessons = selectedCourse?.chapters?.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  ) || 0;

  $: completedLessons = Object.values($courseProgress[selectedCourse?._id || ''] || {}).filter(
    Boolean
  ).length;

  $: progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  onMount(async () => {
    if ($page.data.session?.user) {
      await loadUserProgress($page.data.session.user);
    }
  });

  async function handleLessonComplete() {
    if (selectedCourse && selectedLesson && $page.data.session?.user) {
      await saveLessonProgress(
        $page.data.session.user,
        selectedCourse._id,
        selectedLesson.title,
        true
      );
    }
  }

  function selectLesson(chapter: typeof selectedChapter, lesson: typeof selectedLesson) {
    selectedChapter = chapter;
    selectedLesson = lesson;
  }
</script>

{#if data.pageData?.showComingSoon}
  <ComingSoon
    backgroundImage={data.pageData.comingSoon?.backgroundImage}
    title={data.pageData.comingSoon?.title}
    subtitle={data.pageData.comingSoon?.subtitle}
    description={data.pageData.comingSoon?.description}
    footerText={data.pageData.comingSoon?.footerText}
    comingSoonText={data.pageData.comingSoon?.comingSoonText}
  />
{:else}
  <div class="min-h-screen bg-black text-white">
    <!-- Navigation Header -->
    <header class="bg-black/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold">NextLevel DJs Academy</h1>
      </div>
    </header>

    {#if !$page.data.session}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 class="text-3xl font-bold mb-4">Anmeldung erforderlich</h2>
        <p class="text-lg text-white/80 mb-8">
          Bitte melde dich an, um auf die DJ-Kurse zugreifen zu können.
        </p>
        <a
          href="/auth/signin"
          class="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
        >
          Jetzt anmelden
        </a>
      </div>
    {:else}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Navigation -->
          <aside class="lg:col-span-1 space-y-6">
            <div class="bg-white/5 rounded-lg p-4">
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="h-2 bg-white/10 rounded-full">
                  <div
                    class="h-2 bg-green-500 rounded-full transition-all duration-300"
                    style="width: {progress}%"
                  />
                </div>
                <p class="text-sm text-white/60 mt-2">{completedLessons} von {totalLessons} Lektionen abgeschlossen</p>
              </div>

              <!-- Course Navigation -->
              {#if selectedCourse}
                {#each selectedCourse.chapters as chapter}
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-2">{chapter.title}</h3>
                    <ul class="space-y-2">
                      {#each chapter.lessons as lesson}
                        <li>
                          <button
                            class="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors
                            {selectedLesson?.title === lesson.title ? 'bg-white/10' : ''}
                            {$courseProgress[selectedCourse._id]?.[lesson.title] ? 'text-green-400' : 'text-white/80'}"
                            on:click={() => selectLesson(chapter, lesson)}
                          >
                            <div class="flex items-center justify-between">
                              <span class="truncate">{lesson.title}</span>
                              <span class="text-sm text-white/40">{lesson.duration}</span>
                            </div>
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              {/if}
            </div>
          </aside>

          <!-- Main Content -->
          <main class="lg:col-span-3 space-y-6">
            {#if selectedLesson}
              <!-- Video Player -->
              <VideoPlayer
                url={selectedLesson.videoUrl}
                chapters={selectedLesson.chapters}
              />

              <!-- Lesson Content -->
              <div class="bg-white/5 rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-2xl font-bold">{selectedLesson.title}</h2>
                  <span class="text-white/40">{selectedLesson.duration}</span>
                </div>

                {#if selectedLesson.description}
                  <div class="prose prose-invert max-w-none">
                    <p class="text-white/80">{selectedLesson.description}</p>
                  </div>
                {/if}

                {#if selectedLesson.resources && selectedLesson.resources.length > 0}
                  <div class="mt-8">
                    <h3 class="text-lg font-medium mb-4">Zusätzliche Materialien</h3>
                    <ul class="space-y-2">
                      {#each selectedLesson.resources as resource}
                        <li>
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                          >
                            <span>{resource.title}</span>
                            <svg
                              class="w-4 h-4 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </a>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>

              <!-- Navigation Buttons -->
              <div class="flex justify-between items-center">
                <button
                  class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                  on:click={() => {
                    const chapters = selectedCourse.chapters;
                    const currentChapterIndex = chapters.indexOf(selectedChapter);
                    const currentLessonIndex = selectedChapter.lessons.indexOf(selectedLesson);

                    if (currentLessonIndex > 0) {
                      // Previous lesson in same chapter
                      selectLesson(selectedChapter, selectedChapter.lessons[currentLessonIndex - 1]);
                    } else if (currentChapterIndex > 0) {
                      // Last lesson of previous chapter
                      const prevChapter = chapters[currentChapterIndex - 1];
                      selectLesson(prevChapter, prevChapter.lessons[prevChapter.lessons.length - 1]);
                    }
                  }}
                >
                  ← Vorherige Lektion
                </button>

                <button
                  class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors"
                  on:click={async () => {
                    await handleLessonComplete();
                    const chapters = selectedCourse.chapters;
                    const currentChapterIndex = chapters.indexOf(selectedChapter);
                    const currentLessonIndex = selectedChapter.lessons.indexOf(selectedLesson);

                    if (currentLessonIndex < selectedChapter.lessons.length - 1) {
                      // Next lesson in same chapter
                      selectLesson(selectedChapter, selectedChapter.lessons[currentLessonIndex + 1]);
                    } else if (currentChapterIndex < chapters.length - 1) {
                      // First lesson of next chapter
                      const nextChapter = chapters[currentChapterIndex + 1];
                      selectLesson(nextChapter, nextChapter.lessons[0]);
                    }
                  }}
                >
                  Nächste Lektion →
                </button>
              </div>
            {/if}
          </main>
        </div>
      </div>
    {/if}
  </div>
{/if}