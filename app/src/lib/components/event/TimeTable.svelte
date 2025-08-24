<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let timelineItems: HTMLElement[] = [];
  let timelineObserver: IntersectionObserver;
  let timelineContainer: HTMLElement;

  onMount(() => {
    // Intersection Observer für Timeline-Punkte
    timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('timeline-active');
          } else {
            entry.target.classList.remove('timeline-active');
          }
        });
      },
      {
        rootMargin: '-10% 0px -10% 0px',
        threshold: 0.5
      }
    );

    // Beobachte alle Timeline-Punkte
    timelineItems.forEach(item => {
      timelineObserver?.observe(item);
    });

    // URL-Parameter überprüfen und entsprechende Tabs auswählen
    handleUrlParams();

    return () => {
      timelineObserver?.disconnect();
    };
  });

  interface ScheduleItem {
    time: string;
    title: string;
    description?: string;
    instructor?: {
      name: string;
      role: string;
      image?: string;
    };
    icon?: string;
  }

  interface Stage {
    name: string;
    description: string;
    schedule: ScheduleItem[];
  }

  interface Day {
    date: string;
    stages: Stage[];
  }

  export let schedule: Day[] = [];
  export let isSecret: boolean = false;
  export let isAdmin: boolean = false;
  
  let selectedDayIndex = 0;
  let selectedStageIndex = 0;
  let expandedDescriptions: Record<string, boolean> = {};

  $: selectedDay = schedule[selectedDayIndex];
  $: selectedStage = selectedDay?.stages?.[selectedStageIndex];
  $: hasStages = selectedDay?.stages?.length > 0;

  $: console.log('Current expanded state:', expandedDescriptions);

  function truncateText(text: string, wordCount: number = 15): string {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  }

  function toggleDescription(id: string) {
    console.log('Toggle description called for:', id);
    console.log('Current state before:', expandedDescriptions[id]);
    expandedDescriptions[id] = !expandedDescriptions[id];
    expandedDescriptions = {...expandedDescriptions};
    console.log('New state after:', expandedDescriptions[id]);
    console.log('Full state:', expandedDescriptions);
  }

  function isDescriptionExpanded(id: string): boolean {
    const expanded = !!expandedDescriptions[id];
    console.log('Checking if expanded:', id, expanded);
    return expanded;
  }

  function shouldTruncate(text: string): boolean {
    const should = text.split(' ').length > 15;
    console.log('Should truncate check:', text.split(' ').length, 'words,', should);
    return should;
  }

  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  }

  function selectDay(index: number) {
    selectedDayIndex = index;
    if (schedule[index]?.stages?.length > 0) {
      selectedStageIndex = 0;
    }
    updateUrlParams();
  }

  function selectStage(index: number) {
    if (index < selectedDay?.stages?.length) {
      selectedStageIndex = index;
      updateUrlParams();
    }
  }

  // Neue Funktionen für URL-Parameter

  function handleUrlParams() {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Tag-Parameter (day)
      const dayParam = params.get('day');
      if (dayParam !== null && !isNaN(parseInt(dayParam))) {
        const dayIndex = parseInt(dayParam);
        if (dayIndex >= 0 && dayIndex < schedule.length) {
          selectedDayIndex = dayIndex;
        }
      }
      
      // Bühnen-Parameter (stage)
      const stageParam = params.get('stage');
      if (stageParam !== null && !isNaN(parseInt(stageParam))) {
        const stageIndex = parseInt(stageParam);
        if (stageIndex >= 0 && selectedDay?.stages && stageIndex < selectedDay.stages.length) {
          selectedStageIndex = stageIndex;
        }
      }
    }
  }

  function updateUrlParams() {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('day', selectedDayIndex.toString());
      url.searchParams.set('stage', selectedStageIndex.toString());
      
      // URL aktualisieren ohne Seite neu zu laden
      window.history.pushState({}, '', url.toString());
    }
  }

  function getTabUrl(dayIndex: number, stageIndex: number = 0): string {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('day', dayIndex.toString());
      url.searchParams.set('stage', stageIndex.toString());
      return url.toString();
    }
    return '#';
  }
</script>

{#if schedule?.length > 0 && selectedDay}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto">
      <div class="mb-20 text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Tagesablauf</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">Timeline</h2>
      </div>

      {#if isSecret && !isAdmin}
        <div class="relative">
          <div class="absolute inset-0 backdrop-blur-xl bg-black/60 z-10 flex items-center justify-center rounded-3xl">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h3 class="text-2xl text-white mb-2">Noch geheim!</h3>
              <p class="text-gray-400">Der Zeitplan wird bald veröffentlicht.</p>
            </div>
          </div>
          <div class="opacity-20 pointer-events-none">
            <!-- Placeholder content to show blurred background -->
            <div class="h-96"></div>
          </div>
        </div>
      {:else}

      <!-- Day Tabs -->
      {#if schedule.length > 1}
        <div class="flex flex-wrap justify-center mb-8 gap-4">
          {#each schedule as day, i}
            <a
              href={getTabUrl(i)}
              class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {selectedDayIndex === i ? 'bg-green-500 text-black scale-105' : 'text-white hover:text-green-500 hover:scale-105 border border-gray-700 hover:border-green-500'}"
              on:click|preventDefault={() => selectDay(i)}
            >
              {formatDate(day.date)}
            </a>
          {/each}
        </div>
      {/if}

      {#if hasStages && selectedStage}
        <!-- Stage Tabs -->
        {#if selectedDay.stages.length > 1}
          <div class="flex flex-wrap justify-center mb-12 gap-4">
            {#each selectedDay.stages as stage, i}
              <a
                href={getTabUrl(selectedDayIndex, i)}
                class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {selectedStageIndex === i ? 'bg-green-500 text-black scale-105' : 'text-white hover:text-green-500 hover:scale-105 border border-gray-700 hover:border-green-500'}"
                on:click|preventDefault={() => selectStage(i)}
              >
                {stage.name}
              </a>
            {/each}
          </div>
        {/if}

        <!-- Stage Description -->
        <div class="text-center mb-12">
          {#if shouldTruncate(selectedStage.description)}
            <div
              class="text-gray-400 hover:text-gray-300 transition-all duration-300 cursor-pointer"
              on:click={() => {
                console.log('Clicked stage description');
                expandedDescriptions = {
                  ...expandedDescriptions,
                  stage: !expandedDescriptions.stage
                };
              }}
              role="button"
              tabindex="0"
            >
              <div class="overflow-hidden">
                {#key expandedDescriptions.stage}
                  <p transition:slide|local={{duration: 300, axis: 'y'}}>
                    {expandedDescriptions.stage ? selectedStage.description : truncateText(selectedStage.description)}
                  </p>
                {/key}
              </div>
              <span class="text-green-400 hover:text-green-300 mt-2 text-sm font-medium inline-block">
                {expandedDescriptions.stage ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              </span>
            </div>
          {:else}
            <p class="text-gray-400">{selectedStage.description}</p>
          {/if}
        </div>

        <div class="relative" bind:this={timelineContainer}>
          <!-- Timeline Line -->
          <div class="absolute left-12 md:left-1/2 top-0 w-px h-full bg-gray-800 transform -translate-x-1/2"></div>

          <!-- Schedule Items -->
          {#if selectedStage.schedule?.length > 0}
            <div class="relative space-y-8">
              {#each selectedStage.schedule as item, i}
                <div 
                  class="relative flex flex-col md:flex-row items-start md:items-center group"
                  in:fade={{ duration: 300, delay: i * 50 }}
                >
                  <!-- Left Side (Time) -->
                  <div class="flex-1 w-full md:w-5/12 order-2 md:order-none mb-4 md:mb-0 pl-20 md:pl-0 {i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:hidden'}">
                    <span class="text-xl text-green-400 font-medium">{item.time}</span>
                  </div>

                  <!-- Center (Icon) -->
                  <div
                    bind:this={timelineItems[i]}
                    class="timeline-dot absolute left-6 md:left-1/2 top-0 md:top-1/2 transform md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-black border-4 border-gray-800 rounded-full flex items-center justify-center group-hover:border-green-500 transition-all duration-500 ease-out z-10"
                  >
                    <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={item.icon}></path>
                    </svg>
                  </div>

                  <!-- Right Side (Time for odd items) -->
                  <div class="hidden md:block flex-1 w-full md:w-5/12 order-2 mb-4 md:mb-0 pl-20 md:pl-0 {i % 2 === 1 ? 'md:text-left md:pl-10' : 'md:hidden'}">
                    <span class="text-xl text-green-400 font-medium">{item.time}</span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 w-full md:w-5/12 order-3 pl-20 md:pl-0 {i % 2 === 0 ? 'md:pl-10' : 'md:pr-10 md:order-first'}">
                    <div class="p-4 md:p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-500 hover:scale-[1.02] transform">
                      <h3 class="mb-2 text-lg md:text-xl text-white">{item.title}</h3>
                      {#if item.description}
                        {#if shouldTruncate(item.description)}
                          <div
                            class="mb-2 text-sm md:text-base text-gray-400 hover:text-gray-300 transition-all duration-300 cursor-pointer"
                            on:click={() => {
                              console.log('Clicked event description', i);
                              expandedDescriptions = {
                                ...expandedDescriptions,
                                [`event-${i}`]: !expandedDescriptions[`event-${i}`]
                              };
                            }}
                            role="button"
                            tabindex="0"
                          >
                            <div class="overflow-hidden">
                              {#key expandedDescriptions[`event-${i}`]}
                                <p transition:slide|local={{duration: 300, axis: 'y'}}>
                                  {expandedDescriptions[`event-${i}`] ? item.description : truncateText(item.description)}
                                </p>
                              {/key}
                            </div>
                            <span class="text-green-400 hover:text-green-300 mt-1 text-sm font-medium inline-block">
                              {expandedDescriptions[`event-${i}`] ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                            </span>
                          </div>
                        {:else}
                          <p class="mb-2 text-sm md:text-base text-gray-400">{item.description}</p>
                        {/if}
                      {/if}
                      {#if item.instructor}
                        <div class="flex items-center text-sm text-green-400">
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          <span class="break-words">{item.instructor.name}</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-12">
              <p class="text-gray-400">Keine Termine für diese Bühne verfügbar.</p>
            </div>
          {/if}
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-400">Keine Bühnen für diesen Tag verfügbar.</p>
        </div>
      {/if}
      {/if}
    </div>
  </div>
{:else}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto text-center">
      <p class="text-gray-400">Kein Schedule verfügbar.</p>
    </div>
  </div>
{/if}

<style>
  .timeline-dot {
    will-change: transform, border-color;
  }

  .timeline-dot.timeline-active {
    @apply border-green-500 scale-110;
  }

  .timeline-dot.timeline-active svg {
    @apply text-green-300;
  }

  /* Smooth scrolling für den Container */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Ensure smooth transitions */
  .group {
    transition: transform 0.3s ease-out;
  }

  /* Prevent content overflow on mobile */
  @media (max-width: 768px) {
    .break-words {
      word-break: break-word;
    }
  }
</style>