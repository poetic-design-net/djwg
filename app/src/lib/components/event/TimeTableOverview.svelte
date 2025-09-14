<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  // Extended interface to support multiple artists
  interface Artist {
    _id?: string;
    name: string;
    role?: string;
    image?: string;
    soundcloud?: string;
    instagram?: string;
  }

  interface ExtendedScheduleItem {
    time: string;
    title: string;
    description?: string;
    instructor?: Artist; // Deprecated - for backward compatibility
    instructors?: Artist[]; // New: multiple artists
    instructorDisplayMode?: 'all' | 'b2b' | 'vs' | 'comma' | 'ampersand' | 'main';
    icon?: string;
  }

  interface Stage {
    name: string;
    description: string;
    schedule: ExtendedScheduleItem[];
  }

  interface Day {
    date: string;
    stages: Stage[];
  }

  export let schedule: Day[] = [];
  export let isSecret: boolean = false;
  export let isAdmin: boolean = false;
  export let scheduleView: string = 'overview';

  const dispatch = createEventDispatcher();

  // Stage filtering
  let selectedStages: Set<string> = new Set();
  let showStageFilter = false;
  let scrollContainer: HTMLDivElement;
  let canScrollLeft = false;
  let canScrollRight = false;
  let hoveredEvent: { event: ExtendedScheduleItem; position: DOMRect } | null = null;

  // Artist rotation state
  let artistIndexMap: Map<string, number> = new Map();
  let artistIntervals: Map<string, number> = new Map();

  
  // Zoom state
  let zoomLevel = 100;
  const zoomStep = 5;
  const minZoom = 30;
  const maxZoom = 100;
  
  // Hold-to-zoom state
  let zoomInterval: ReturnType<typeof setInterval> | null = null;
  let isZooming = false;

  // Helper function to get all artists from an item
  function getAllArtists(item: ExtendedScheduleItem): Artist[] {
    const artists: Artist[] = [];

    // Debug logging
    console.log('Item:', item.title, 'Instructor:', item.instructor, 'Instructors:', item.instructors);

    // Add instructors if they exist
    if (item.instructors && Array.isArray(item.instructors) && item.instructors.length > 0) {
      artists.push(...item.instructors);
    }
    // Fall back to single instructor for backward compatibility
    else if (item.instructor) {
      artists.push(item.instructor);
    }

    return artists;
  }

  // Format artist names based on display mode
  function formatArtistNames(item: ExtendedScheduleItem): string {
    const artists = getAllArtists(item);
    if (artists.length === 0) return '';

    const names = artists.map(a => a.name);
    const mode = item.instructorDisplayMode || 'all';

    switch (mode) {
      case 'b2b':
        return names.join(' b2b ');
      case 'vs':
        return names.join(' vs ');
      case 'comma':
        return names.join(', ');
      case 'ampersand':
        return names.join(' & ');
      case 'main':
        return names[0]; // Only show first artist
      case 'all':
      default:
        // For 2 artists use &, for more use comma
        if (names.length === 2) {
          return names.join(' & ');
        }
        return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
    }
  }

  // Get current artist for rotation
  function getCurrentArtist(item: ExtendedScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number): Artist | undefined {
    const artists = getAllArtists(item);
    if (artists.length === 0) return undefined;
    if (artists.length === 1) return artists[0];

    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    const currentIndex = artistIndexMap.get(key) || 0;
    return artists[currentIndex];
  }

  // Start artist rotation for items with multiple artists
  function startArtistRotation(dayIndex: number, stageIndex: number, itemIndex: number, artistCount: number) {
    if (artistCount <= 1) return;

    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;

    // Clear existing interval if any
    const existingInterval = artistIntervals.get(key);
    if (existingInterval) {
      clearInterval(existingInterval as unknown as ReturnType<typeof setInterval>);
    }

    // Initialize index
    if (!artistIndexMap.has(key)) {
      artistIndexMap.set(key, 0);
      artistIndexMap = new Map(artistIndexMap);
    }

    // Start rotation interval (change every 4 seconds)
    const interval = setInterval(() => {
      const currentIndex = artistIndexMap.get(key) || 0;
      const nextIndex = (currentIndex + 1) % artistCount;
      artistIndexMap.set(key, nextIndex);
      // Force reactivity with assignment
      artistIndexMap = new Map(artistIndexMap);
    }, 4000);

    artistIntervals.set(key, interval as unknown as number);
  }

  
  // Initialize all stages as selected
  $: if (schedule.length > 0 && selectedStages.size === 0) {
    schedule.forEach(day => {
      day.stages.forEach(stage => {
        selectedStages.add(stage.name);
      });
    });
    selectedStages = selectedStages; // Trigger reactivity
  }
  
  // Filter stages based on selection
  $: filteredSchedule = schedule.map(day => ({
    ...day,
    stages: day.stages.filter(stage => selectedStages.has(stage.name))
  }));

  // Start artist rotation when schedule changes
  $: if (filteredSchedule) {
    // Clear existing intervals
    artistIntervals.forEach(interval => clearInterval(interval));
    artistIntervals.clear();
    artistIndexMap.clear();

    // Start rotation for all items with multiple artists
    filteredSchedule.forEach((day, dayIndex) => {
      day.stages.forEach((stage, stageIndex) => {
        stage.schedule.forEach((event, itemIndex) => {
          const artists = getAllArtists(event);
          if (artists.length > 1) {
            startArtistRotation(dayIndex, stageIndex, itemIndex, artists.length);
          }
        });
      });
    });
  }
  
  function toggleStage(stageName: string) {
    if (selectedStages.has(stageName)) {
      selectedStages.delete(stageName);
    } else {
      selectedStages.add(stageName);
    }
    selectedStages = selectedStages; // Trigger reactivity
  }
  
  function checkScroll() {
    if (!scrollContainer) return;
    canScrollLeft = scrollContainer.scrollLeft > 0;
    canScrollRight = scrollContainer.scrollLeft <
      scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
  }
  
  function scrollToDirection(direction: 'left' | 'right') {
    if (!scrollContainer) return;
    const scrollAmount = 300;
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
  
  function handleEventHover(event: ExtendedScheduleItem, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    hoveredEvent = { event, position: rect };
  }
  
  function handleEventLeave() {
    hoveredEvent = null;
  }
  
  function zoomIn() {
    if (zoomLevel < maxZoom) {
      zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
    }
  }
  
  function zoomOut() {
    if (zoomLevel > minZoom) {
      zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
    }
  }
  
  function resetZoom() {
    zoomLevel = 100;
  }
  
  // Hold-to-zoom functions
  function startZoomOut() {
    if (isZooming) return;
    isZooming = true;
    zoomOut();
    zoomInterval = setInterval(() => {
      zoomOut();
    }, 50);
  }
  
  function startZoomIn() {
    if (isZooming) return;
    isZooming = true;
    zoomIn();
    zoomInterval = setInterval(() => {
      zoomIn();
    }, 50);
  }
  
  function stopZoom() {
    if (zoomInterval) {
      clearInterval(zoomInterval);
      zoomInterval = null;
    }
    isZooming = false;
  }
  
  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomIn();
      } else if (event.key === '-') {
        event.preventDefault();
        zoomOut();
      } else if (event.key === '0') {
        event.preventDefault();
        resetZoom();
      }
    }
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    // Start artist rotation for all items with multiple artists
    filteredSchedule.forEach((day, dayIndex) => {
      day.stages.forEach((stage, stageIndex) => {
        stage.schedule.forEach((item, itemIndex) => {
          const artists = getAllArtists(item);
          if (artists.length > 1) {
            startArtistRotation(dayIndex, stageIndex, itemIndex, artists.length);
          }
        });
      });
    });

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  onMount(() => {
    if (scrollContainer) {
      // Reset scroll position to start (0,0) on mount - critical for mobile
      scrollContainer.scrollLeft = 0;
      scrollContainer.scrollTop = 0;

      // Small delay to ensure DOM is fully rendered before checking scroll
      setTimeout(() => {
        scrollContainer.scrollLeft = 0; // Double-ensure position reset
        checkScroll();
      }, 100);

      scrollContainer.addEventListener('scroll', checkScroll);
      return () => scrollContainer.removeEventListener('scroll', checkScroll);
    }
  });

  onDestroy(() => {
    // Clear all artist rotation intervals
    artistIntervals.forEach(interval => clearInterval(interval as unknown as ReturnType<typeof setInterval>));
    artistIntervals.clear();
  });

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

  function parseTimeRange(timeStr: string): { start: Date; end?: Date } {
    const [startStr, endStr] = timeStr.split('-').map(t => t?.trim());
    const baseDate = '1970/01/01 ';
    return {
      start: new Date(baseDate + startStr),
      end: endStr ? new Date(baseDate + endStr) : undefined
    };
  }

  function generateTimeSlots(events: ExtendedScheduleItem[]): string[] {
    const timeSet = new Set<string>();
    
    events.forEach(event => {
      const { start, end } = parseTimeRange(event.time);
      timeSet.add(start.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      
      if (end) {
        timeSet.add(
          end.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        );
      }
    });

    return Array.from(timeSet).sort((a, b) => {
      return new Date(`1970/01/01 ${a}`).getTime() - new Date(`1970/01/01 ${b}`).getTime();
    });
  }

  function getEventStyles(event: ExtendedScheduleItem, timeSlots: string[]): { top: string; height: string } {
    const { start, end } = parseTimeRange(event.time);
    const startIndex = timeSlots.findIndex(slot => 
      new Date(`1970/01/01 ${slot}`).getTime() === start.getTime()
    );

    if (!end) return { top: `${startIndex * 90}px`, height: '85px' };

    const endIndex = timeSlots.findIndex(slot => 
      new Date(`1970/01/01 ${slot}`).getTime() === end.getTime()
    );

    const height = endIndex > startIndex ? (endIndex - startIndex) * 90 : 85;
    return { 
      top: `${startIndex * 90}px`,
      height: `${height}px`
    };
  }

  $: allEvents = schedule.flatMap(day => day.stages.flatMap(stage => stage.schedule));
  $: timeSlots = allEvents.length > 0 ? generateTimeSlots(allEvents) : [];
</script>

{#if schedule?.length > 0}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto">
      <div class="mb-12 text-center">
        <span class="inline-block mb-4 text-sm text-[#33cc99] font-medium tracking-tighter">Tagesablauf</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter mb-8">Übersicht</h2>
        
        <!-- View Switcher -->
        <div class="relative inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1 border border-gray-800">
            <button
              class="group px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 text-gray-400 hover:text-green-400 hover:bg-white/5"
              on:click={() => dispatch('switchView')}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Timeline
            </button>
            <button
              class="group px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 {scheduleView === 'overview' ? 'bg-green-400 text-black shadow-lg shadow-green-400/20' : 'text-gray-400 hover:text-white'}"
              disabled
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              Übersicht
            </button>
        </div>
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
      
      <!-- Zoom Controls -->
      <div class="flex justify-center mb-6">
        <div class="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-800">
          <button
            on:mousedown={startZoomOut}
            on:mouseup={stopZoom}
            on:mouseleave={stopZoom}
            on:touchstart={startZoomOut}
            on:touchend={stopZoom}
            disabled={zoomLevel <= minZoom}
            class="p-1 rounded-full transition-all select-none {zoomLevel <= minZoom ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-green-400 hover:bg-white/5 active:bg-white/10'}"
            title="Verkleinern (Gedrückt halten oder Ctrl/Cmd + -)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
            </svg>
          </button>
          
          <button
            on:click={resetZoom}
            class="px-3 py-1 text-sm font-medium text-gray-400 hover:text-green-400 transition-all"
            title="Zoom zurücksetzen (Ctrl/Cmd + 0)"
          >
            {zoomLevel}%
          </button>
          
          <button
            on:mousedown={startZoomIn}
            on:mouseup={stopZoom}
            on:mouseleave={stopZoom}
            on:touchstart={startZoomIn}
            on:touchend={stopZoom}
            disabled={zoomLevel >= maxZoom}
            class="p-1 rounded-full transition-all select-none {zoomLevel >= maxZoom ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-green-400 hover:bg-white/5 active:bg-white/10'}"
            title="Vergrößern (Gedrückt halten oder Ctrl/Cmd + +)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Stage Filter for multiple stages -->
      {#if schedule.some(day => day.stages.length > 3)}
        <div class="mb-6 bg-black/60 rounded-xl p-4">
          <button
            on:click={() => showStageFilter = !showStageFilter}
            class="flex items-center gap-2 text-[#33cc99] hover:text-[#33cc99]/80 transition-colors mb-3"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span class="font-medium">Bühnen filtern ({selectedStages.size} ausgewählt)</span>
          </button>
          
          {#if showStageFilter}
            <div class="flex flex-wrap gap-2">
              {#each [...new Set(schedule.flatMap(d => d.stages.map(s => s.name)))] as stageName}
                <button
                  on:click={() => toggleStage(stageName)}
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all
                    {selectedStages.has(stageName) 
                      ? 'bg-teal-500 text-black' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
                >
                  {stageName}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
      
      {#each filteredSchedule as day, dayIndex}
        <div class="mb-16">
          <h3 class="text-2xl text-white mb-6 flex items-center justify-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {formatDate(day.date)}
          </h3>
          
          <div class="schedule-wrapper-container">
            <!-- Left scroll indicator -->
            {#if canScrollLeft}
              <button
                on:click={() => scrollToDirection('left')}
                class="scroll-indicator scroll-indicator-left"
                aria-label="Nach links scrollen"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            {/if}
            
            <!-- Right scroll indicator -->
            {#if canScrollRight}
              <button
                on:click={() => scrollToDirection('right')}
                class="scroll-indicator scroll-indicator-right"
                aria-label="Nach rechts scrollen"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/if}
            
            <div class="schedule-wrapper {canScrollLeft ? 'can-scroll-left' : ''} {canScrollRight ? 'can-scroll-right' : ''}"
                 style="overflow-x: auto; overflow-y: hidden; scroll-behavior: auto; -webkit-overflow-scrolling: touch;"
                 bind:this={scrollContainer}>
            <div class="schedule-container"
                 style="transform: scale({zoomLevel / 100}); transform-origin: top left; width: {100 * (100 / zoomLevel)}%; will-change: transform;">
              <div class="schedule-header">
                <div class="header-cell time-header">Zeit</div>
                {#each day.stages as stage}
                  <div class="header-cell stage-header">{stage.name}</div>
                {/each}
              </div>

              <div class="schedule-body">
                <div class="time-column">
                  {#each timeSlots as timeSlot}
                    <div class="time-cell">{timeSlot}</div>
                  {/each}
                </div>

                {#each day.stages as stage, stageIndex}
                  <div class="stage-column">
                    {#each stage.schedule as event, itemIndex}
                      {@const styles = getEventStyles(event, timeSlots)}
                      {@const artists = getAllArtists(event)}
                      {@const currentArtist = getCurrentArtist(event, dayIndex, stageIndex, itemIndex)}
                      <div
                        class="event-card group"
                        style="top: {styles.top}; height: {styles.height};"
                        on:mouseenter={(e) => handleEventHover(event, e.currentTarget)}
                        on:mouseleave={handleEventLeave}
                        role="button"
                        tabindex="0"
                      >
                        <p class="text-white font-medium">{event.title}</p>
                        {#if artists.length > 0}
                          <div class="flex items-center gap-1 mt-1">
                            <span
                              class="flex items-center gap-1 text-[#33cc99] text-xs"
                            >
                              <span class="truncate">
                                {formatArtistNames(event)}
                              </span>
                            </span>
                            {#if currentArtist?.soundcloud}
                              <a
                                href={currentArtist.soundcloud}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-[#33cc99] hover:text-[#33cc99]/80"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M2.048 13.164l.343 1.632-.343 1.607c-.007.037-.037.064-.074.064s-.067-.027-.074-.064l-.301-1.607.301-1.632c.007-.033.037-.06.074-.06.037 0 .067.027.074.06zm1.005-1.105l.462 2.737-.462 2.7c-.007.037-.037.067-.078.067s-.071-.03-.074-.067l-.404-2.7.404-2.737c.004-.034.033-.06.074-.06s.071.026.078.06zm1.004-.273l.43 3.01-.43 2.935c-.004.044-.037.078-.082.078-.041 0-.075-.034-.082-.078l-.372-2.935.372-3.01c.007-.041.041-.071.082-.071s.078.03.082.071zm1.008.152l.398 2.858-.398 2.86c-.004.049-.041.086-.09.086-.045 0-.082-.037-.086-.086l-.344-2.86.344-2.858c.004-.045.041-.082.086-.082s.086.034.09.082zm1.015-.073l.367 2.931-.367 2.842c-.004.052-.045.09-.093.09-.053 0-.09-.037-.093-.09l-.315-2.842.315-2.931c.004-.049.041-.086.093-.086s.089.037.093.086zm1.023-.349l.334 3.28-.334 2.799c-.004.056-.045.097-.101.097s-.093-.041-.097-.097l-.286-2.799.286-3.28c.004-.052.041-.09.097-.09.056 0 .097.037.101.09zm1.026-.224l.304 3.504-.304 2.812c-.004.06-.048.104-.108.104s-.101-.044-.104-.104l-.274-2.812.274-3.504c.003-.056.045-.097.104-.097s.104.041.108.097zm1.03-.224l.274 3.728-.274 2.771c0 .067-.052.116-.112.116-.064 0-.112-.049-.115-.116l-.244-2.771.244-3.728c.003-.063.052-.108.115-.108.06 0 .112.045.112.108zm1.036-.134l.244 3.862-.244 2.753c0 .071-.056.123-.12.123-.064 0-.116-.052-.12-.123l-.215-2.753.215-3.862c.004-.067.056-.115.12-.115s.12.048.12.115zm1.04-.112l.215 3.974-.215 2.734c0 .075-.056.13-.127.13s-.124-.055-.127-.13l-.19-2.734.19-3.974c.004-.071.056-.123.127-.123s.127.052.127.123zm1.045-.127l.189 4.101-.189 2.72c0 .082-.06.141-.134.141-.075 0-.135-.06-.135-.142l-.165-2.718.165-4.101c0-.075.06-.13.135-.13.074 0 .134.055.134.13zm1.052-.089l.16 4.19-.16 2.697c0 .086-.063.149-.142.149s-.142-.063-.142-.149l-.138-2.697.138-4.19c0-.082.063-.141.142-.141s.142.06.142.141zm1.056-.067l.134 4.257-.134 2.686c0 .093-.067.156-.15.156-.082 0-.149-.064-.149-.156l-.112-2.686.112-4.257c0-.086.067-.149.149-.149.082 0 .15.063.15.149zm1.063-.06l.104 4.317-.104 2.686c0 .097-.07.167-.157.167-.086 0-.157-.07-.157-.167l-.082-2.686.082-4.317c0-.093.071-.16.157-.16.086 0 .157.067.157.16zm1.176.06l.075 4.257-.075 2.671c0 .108-.075.179-.168.179s-.171-.071-.171-.179l-.052-2.667.052-4.261c0-.097.078-.171.171-.171.093 0 .168.075.168.171zm1.003-.374l.045 4.631-.045 2.671c0 .112-.082.19-.179.19s-.179-.078-.179-.19v-2.671l.001-4.631c0-.104.078-.186.178-.186s.179.082.179.186zm2.55-2.194c.712 0 1.3.537 1.374 1.226l.116 3.399-.116 2.682c0 .749-.615 1.359-1.374 1.359-.755 0-1.37-.61-1.37-1.359l-.097-2.682.097-3.399c0-.749.615-1.359 1.37-1.359z"/>
                                </svg>
                              </a>
                            {/if}
                            {#if currentArtist?.instagram}
                              <a
                                href={currentArtist.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-[#33cc99] hover:text-[#33cc99]/80 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                            {/if}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
            </div>
          </div>
        </div>
      {/each}
      {/if}
    </div>
  </div>
  
  <!-- Hover Overlay -->
  {#if hoveredEvent}
    <div 
      class="fixed pointer-events-none z-50"
      style="
        left: {hoveredEvent.position.left - 3}px;
        top: {hoveredEvent.position.top - 3}px;
        width: {hoveredEvent.position.width}px;
        height: auto;
      "
    >
      <div class="hover-overlay-card">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-white font-bold text-base">{hoveredEvent.event.title}</h3>
          <span class="text-[#33cc99] text-xs font-medium">{hoveredEvent.event.time}</span>
        </div>
        
        {#if hoveredEvent.event.description}
          <p class="text-gray-300 text-sm mb-2">{hoveredEvent.event.description}</p>
        {/if}

        {#if getAllArtists(hoveredEvent.event).length > 0}
          {@const hoveredArtists = getAllArtists(hoveredEvent.event)}
          <div class="border-t border-gray-700 pt-2">
            {#each hoveredArtists as artist}
              <div class="flex items-center gap-3 mb-2">
                {#if artist.image}
                  <img
                    src={artist.image}
                    alt={artist.name}
                    class="w-10 h-10 rounded-full object-cover"
                  />
                {/if}
                <div>
                  <p class="text-[#33cc99] font-medium text-sm">{artist.name}</p>
                  {#if artist.role}
                    <p class="text-gray-400 text-xs">{artist.role}</p>
                  {/if}
                </div>
              </div>
            {/each}

            <div class="flex gap-2 mt-2">
              {#each hoveredArtists as artist}
                {#if artist.soundcloud}
                  <a
                    href={artist.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#33cc99] hover:text-[#33cc99]/80 pointer-events-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.048 13.164l.343 1.632-.343 1.607c-.007.037-.037.064-.074.064s-.067-.027-.074-.064l-.301-1.607.301-1.632c.007-.033.037-.06.074-.06.037 0 .067.027.074.06zm1.005-1.105l.462 2.737-.462 2.7c-.007.037-.037.067-.078.067s-.071-.03-.074-.067l-.404-2.7.404-2.737c.004-.034.033-.06.074-.06s.071.026.078.06zm1.004-.273l.43 3.01-.43 2.935c-.004.044-.037.078-.082.078-.041 0-.075-.034-.082-.078l-.372-2.935.372-3.01c.007-.041.041-.071.082-.071s.078.03.082.071zm1.008.152l.398 2.858-.398 2.86c-.004.049-.041.086-.09.086-.045 0-.082-.037-.086-.086l-.344-2.86.344-2.858c.004-.045.041-.082.086-.082s.086.034.09.082zm1.015-.073l.367 2.931-.367 2.842c-.004.052-.045.09-.093.09-.053 0-.09-.037-.093-.09l-.315-2.842.315-2.931c.004-.049.041-.086.093-.086s.089.037.093.086zm1.023-.349l.334 3.28-.334 2.799c-.004.056-.045.097-.101.097s-.093-.041-.097-.097l-.286-2.799.286-3.28c.004-.052.041-.09.097-.09.056 0 .097.037.101.09zm1.026-.224l.304 3.504-.304 2.812c-.004.06-.048.104-.108.104s-.101-.044-.104-.104l-.274-2.812.274-3.504c.003-.056.045-.097.104-.097s.104.041.108.097zm1.03-.224l.274 3.728-.274 2.771c0 .067-.052.116-.112.116-.064 0-.112-.049-.115-.116l-.244-2.771.244-3.728c.003-.063.052-.108.115-.108.06 0 .112.045.112.108zm1.036-.134l.244 3.862-.244 2.753c0 .071-.056.123-.12.123-.064 0-.116-.052-.12-.123l-.215-2.753.215-3.862c.004-.067.056-.115.12-.115s.12.048.12.115zm1.04-.112l.215 3.974-.215 2.734c0 .075-.056.13-.127.13s-.124-.055-.127-.13l-.19-2.734.19-3.974c.004-.071.056-.123.127-.123s.127.052.127.123zm1.045-.127l.189 4.101-.189 2.72c0 .082-.06.141-.134.141-.075 0-.135-.06-.135-.142l-.165-2.718.165-4.101c0-.075.06-.13.135-.13.074 0 .134.055.134.13zm1.052-.089l.16 4.19-.16 2.697c0 .086-.063.149-.142.149s-.142-.063-.142-.149l-.138-2.697.138-4.19c0-.082.063-.141.142-.141s.142.06.142.141zm1.056-.067l.134 4.257-.134 2.686c0 .093-.067.156-.15.156-.082 0-.149-.064-.149-.156l-.112-2.686.112-4.257c0-.086.067-.149.149-.149.082 0 .15.063.15.149zm1.063-.06l.104 4.317-.104 2.686c0 .097-.07.167-.157.167-.086 0-.157-.07-.157-.167l-.082-2.686.082-4.317c0-.093.071-.16.157-.16.086 0 .157.067.157.16zm1.176.06l.075 4.257-.075 2.671c0 .108-.075.179-.168.179s-.171-.071-.171-.179l-.052-2.667.052-4.261c0-.097.078-.171.171-.171.093 0 .168.075.168.171zm1.003-.374l.045 4.631-.045 2.671c0 .112-.082.19-.179.19s-.179-.078-.179-.19v-2.671l.001-4.631c0-.104.078-.186.178-.186s.179.082.179.186zm2.55-2.194c.712 0 1.3.537 1.374 1.226l.116 3.399-.116 2.682c0 .749-.615 1.359-1.374 1.359-.755 0-1.37-.61-1.37-1.359l-.097-2.682.097-3.399c0-.749.615-1.359 1.37-1.359z"/>
                    </svg>
                  </a>
                {/if}
                {#if artist.instagram}
                  <a
                    href={artist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#33cc99] hover:text-[#33cc99]/80 pointer-events-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

{:else}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto text-center">
      <p class="text-gray-400">Kein Schedule verfügbar.</p>
    </div>
  </div>
{/if}

<style>
  .schedule-wrapper {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: auto; /* Prevent unwanted smooth scrolling on init */
    position: relative;
    touch-action: pan-x pan-y; /* Better touch handling on mobile */
  }

  .schedule-container {
    min-width: 800px;
    width: 100%;
    display: table;
    table-layout: fixed;
  }

  .schedule-header {
    display: table-header-group;
    background-color: rgba(0, 0, 0);
    position: sticky;
    top: 0;
    z-index: 10;
    /* Ensure header stays on top on mobile */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .header-cell {
    display: table-cell;
    padding: 0.75rem;
    color: #33cc99;
    font-weight: 500;
    text-align: left;
    min-width: 250px; /* Increased for better readability */
  }

  .time-header {
    width: 100px;
    min-width: 100px;
  }

  .stage-header {
    width: auto;
  }

  .schedule-body {
    display: table-row-group;
    position: relative;
  }

  .time-column {
    display: table-cell;
    position: sticky;
    left: 0;
    background-color: rgb(0, 0, 0);
    z-index: 5;
    width: 100px;
    min-width: 100px;
    vertical-align: top;
    /* Ensure sticky works properly on mobile */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0); /* Force GPU acceleration */
  }

  .time-cell {
    height: 90px;
    padding: 0.75rem;
    color: white;
    border-bottom: 1px solid #374151;
    font-size: 0.875rem;
  }

  .stage-column {
    display: table-cell;
    position: relative;
    min-height: calc(90px * var(--total-slots, 1));
    border-left: 1px solid #374151;
    width: auto;
    min-width: 280px; /* Increased for better readability */
    vertical-align: top;
  }

  .event-card {
    position: absolute;
    left: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid #374151;
    border-radius: 0.5rem;
    padding: 0.75rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 0.875rem;
    cursor: pointer;
  }
  
  .event-card p:first-child {
    font-size: 0.875rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .event-card:hover {
    border-color: rgba(51, 204, 153, 0.5);
    cursor: pointer;
  }
  
  /* Hover Overlay Card */
  .hover-overlay-card {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.98), rgba(17, 17, 17, 0.95));
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(51, 204, 153, 0.4);
    border-radius: 0.75rem;
    padding: 0.875rem;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.9),
      0 0 100px rgba(51, 204, 153, 0.1),
      inset 0 0 30px rgba(51, 204, 153, 0.05);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 320px;
    max-width: 400px;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  

  .schedule-wrapper::-webkit-scrollbar {
    height: 8px;
  }

  .schedule-wrapper::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 4px;
  }

  .schedule-wrapper::-webkit-scrollbar-thumb {
    background-color: #33cc99;
    border-radius: 4px;
  }
  
  /* Container for scroll indicators */
  .schedule-wrapper-container {
    position: relative;
    width: 100%;
  }
  
  /* Scroll indicator buttons */
  .scroll-indicator {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    background: linear-gradient(90deg, rgba(0,0,0,0.95), rgba(0,0,0,0.85));
    color: #33cc99;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(51, 204, 153, 0.3);
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
  
  .scroll-indicator:hover {
    background: rgba(51, 204, 153, 0.9);
    color: black;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 12px rgba(51, 204, 153, 0.3);
  }
  
  .scroll-indicator-left {
    left: 0.5rem;
  }
  
  .scroll-indicator-right {
    right: 0.5rem;
  }
  
  /* Gradient edges for scroll hint */
  .schedule-wrapper {
    position: relative;
  }
  
  .schedule-wrapper::before,
  .schedule-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    pointer-events: none;
    z-index: 15;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .schedule-wrapper.can-scroll-left::before {
    left: 100px; /* After time column */
    background: linear-gradient(90deg, rgba(0,0,0,0.8), transparent);
    opacity: 1;
  }
  
  .schedule-wrapper.can-scroll-right::after {
    right: 0;
    background: linear-gradient(270deg, rgba(0,0,0,0.8), transparent);
    opacity: 1;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .header-cell,
    .stage-column {
      min-width: 200px;
    }

    .schedule-wrapper {
      /* Remove scroll-snap on mobile to prevent auto-scrolling issues */
      scroll-snap-type: none;
      -webkit-overflow-scrolling: touch;
      /* Ensure scroll starts at left */
      scroll-padding-left: 0;
    }

    .stage-column {
      /* Remove snap align to prevent unwanted scrolling */
      scroll-snap-align: none;
    }

    /* Ensure time column stays properly fixed on mobile */
    .time-column {
      position: sticky;
      left: 0 !important;
      z-index: 10; /* Higher z-index for mobile */
    }

    /* Fix for iOS Safari sticky positioning */
    .schedule-body {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }

    /* Larger touch targets on mobile */
    .scroll-indicator {
      padding: 1rem;
    }
  }
  
  /* Smooth scrolling for all browsers */
  .schedule-wrapper {
    scroll-behavior: smooth;
  }
</style>
