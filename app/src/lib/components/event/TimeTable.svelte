<script lang="ts">
  import { fade } from 'svelte/transition';

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
  
  let selectedDayIndex = 0;
  let selectedStageIndex = 0;

  $: selectedDay = schedule[selectedDayIndex];
  $: selectedStage = selectedDay?.stages?.[selectedStageIndex];
  $: hasStages = selectedDay?.stages?.length > 0;

  // Debug logging
  $: {
    console.log('Current schedule:', schedule);
    console.log('Selected day index:', selectedDayIndex);
    console.log('Selected stage index:', selectedStageIndex);
    console.log('Selected day:', selectedDay);
    console.log('Selected stage:', selectedStage);
    console.log('Has stages:', hasStages);
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
    // Reset stage index only if the new day has stages
    if (schedule[index]?.stages?.length > 0) {
      selectedStageIndex = 0;
    }
  }

  function selectStage(index: number) {
    if (index < selectedDay?.stages?.length) {
      selectedStageIndex = index;
    }
  }
</script>

{#if schedule?.length > 0 && selectedDay}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto">
      <div class="mb-20 text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Tagesablauf</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">Schedule</h2>
      </div>

      <!-- Day Tabs -->
      {#if schedule.length > 1}
        <div class="flex flex-wrap justify-center mb-8 gap-4">
          {#each schedule as day, i}
            <button
              class="px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 {selectedDayIndex === i ? 'bg-green-500 text-black' : 'text-white hover:text-green-500'}"
              on:click={() => selectDay(i)}
            >
              {formatDate(day.date)}
            </button>
          {/each}
        </div>
      {/if}

      {#if hasStages && selectedStage}
        <!-- Stage Tabs -->
        {#if selectedDay.stages.length > 1}
          <div class="flex flex-wrap justify-center mb-12 gap-4">
            {#each selectedDay.stages as stage, i}
              <button
                class="px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 {selectedStageIndex === i ? 'bg-green-500 text-black' : 'text-white hover:text-green-500'}"
                on:click={() => selectStage(i)}
              >
                {stage.name}
              </button>
            {/each}
          </div>
        {/if}

        <!-- Stage Description -->
        <div class="text-center mb-12">
          <p class="text-gray-400">{selectedStage.description}</p>
        </div>

        <div class="relative">
          <!-- Timeline Line -->
          <div class="absolute left-12 md:left-1/2 top-0 w-px h-full bg-gray-800 transform -translate-x-1/2"></div>

          <!-- Schedule Items -->
          {#if selectedStage.schedule?.length > 0}
            <div class="relative space-y-8">
              {#each selectedStage.schedule as item, i}
                <div 
                  class="relative flex flex-col md:flex-row items-start md:items-center group"
                  in:fade={{ duration: 200, delay: i * 50 }}
                >
                  <!-- Left Side (Time) -->
                  <div class="flex-1 w-full md:w-5/12 order-2 md:order-none mb-4 md:mb-0 pl-20 md:pl-0 {i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:hidden'}">
                    <span class="text-xl text-green-400 font-medium">{item.time}</span>
                  </div>

                  <!-- Center (Icon) -->
                  <div class="absolute left-6 md:left-1/2 top-0 md:top-1/2 transform md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-black border-4 border-gray-800 rounded-full flex items-center justify-center group-hover:border-green-500 transition-colors duration-300 z-10">
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
                    <div class="p-4 md:p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-colors duration-300">
                      <h3 class="mb-2 text-lg md:text-xl text-white">{item.title}</h3>
                      {#if item.description}
                        <p class="mb-2 text-sm md:text-base text-gray-400">{item.description}</p>
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
  /* Ensure smooth transitions */
  .group {
    transition: transform 0.3s ease;
  }

  /* Prevent content overflow on mobile */
  @media (max-width: 768px) {
    .break-words {
      word-break: break-word;
    }
  }
</style>
