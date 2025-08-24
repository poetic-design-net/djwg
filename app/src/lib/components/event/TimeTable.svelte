<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { toasts } from '$lib/stores/toast';

  let timelineItems: HTMLElement[] = [];
  let timelineObserver: IntersectionObserver;
  let timelineContainer: HTMLElement;

  // Load user registrations
  async function loadUserRegistrations() {
    if (!user || !eventId) return;
    
    isLoadingRegistrations = true;
    try {
      const response = await fetch(`/api/schedule-registrations?eventId=${eventId}&userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        userRegistrations.clear();
        result.data.forEach((reg: any) => {
          const key = `${reg.dayIndex}-${reg.stageIndex}-${reg.itemIndex}`;
          userRegistrations.set(key, reg);
        });
        userRegistrations = new Map(userRegistrations);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      isLoadingRegistrations = false;
    }
  }
  
  // Load registration counts for all sessions
  async function loadRegistrationCounts() {
    if (!eventId) return;
    
    try {
      const response = await fetch(`/api/schedule-registrations?eventId=${eventId}`);
      const result = await response.json();
      
      if (result.success) {
        const newCounts = new Map();
        
        result.data.forEach((reg: any) => {
          // Only count confirmed registrations, not waitlist
          // Also handle legacy registrations without status field
          if (!reg.status || reg.status === 'confirmed') {
            const key = `${reg.dayIndex}-${reg.stageIndex}-${reg.itemIndex}`;
            const current = newCounts.get(key) || 0;
            newCounts.set(key, current + 1);
          }
        });
        
        // Force reactivity by creating a new Map AND update the object
        registrationCounts = newCounts;
        
        // Convert Map to object for better reactivity
        const countsObj: Record<string, number> = {};
        newCounts.forEach((value, key) => {
          countsObj[key] = value;
        });
        registrationCountsObject = countsObj;
      }
    } catch (error) {
      console.error('Error loading registration counts:', error);
    }
  }
  
  // Check if user is registered for a session
  function isUserRegistered(dayIndex: number, stageIndex: number, itemIndex: number): boolean {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    return userRegistrations.has(key);
  }
  
  // Get registration count for a session - use object for better reactivity
  function getRegistrationCount(dayIndex: number, stageIndex: number, itemIndex: number): number {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    const count = registrationCountsObject[key] || 0;
    return count;
  }
  
  // Handle registration
  async function handleRegistration() {
    if (!selectedSession || !user || !userProfile) return;
    
    isRegistering = true;
    registrationError = null;
    registrationSuccess = null;
    
    try {
      const { item, dayIndex, stageIndex, itemIndex } = selectedSession;
      const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
      
      // Optimistic UI update - immediately increment count
      const currentCount = registrationCounts.get(key) || 0;
      registrationCounts = new Map(registrationCounts.set(key, currentCount + 1));
      
      // Also update the object for reactivity
      registrationCountsObject = {
        ...registrationCountsObject,
        [key]: currentCount + 1
      };
      
      const response = await fetch('/api/schedule-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventScheduleId,
          dayIndex,
          stageIndex,
          itemIndex,
          sessionTitle: item.title,
          sessionTime: item.time,
          maxRegistrations: item.maxRegistrations
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Revert optimistic update on error
        registrationCounts = new Map(registrationCounts.set(key, currentCount));
        registrationCountsObject = {
          ...registrationCountsObject,
          [key]: currentCount
        };
        throw new Error(result.error);
      }
      
      registrationSuccess = result.message || 'Erfolgreich angemeldet!';
      
      // Show success toast
      toasts.success(`Erfolgreich für "${item.title}" angemeldet!`);
      
      // Update local state
      if (result.userRegistrations) {
        userRegistrations.clear();
        result.userRegistrations.forEach((reg: any) => {
          const regKey = `${reg.dayIndex}-${reg.stageIndex}-${reg.itemIndex}`;
          userRegistrations.set(regKey, reg);
        });
        userRegistrations = new Map(userRegistrations);
      }
      
      // If the server provided an updated count, use it immediately
      if (result.updatedCount !== undefined && result.sessionKey) {
        registrationCounts.set(result.sessionKey, result.updatedCount);
        registrationCounts = new Map(registrationCounts);
        registrationCountsObject = {
          ...registrationCountsObject,
          [result.sessionKey]: result.updatedCount
        };
      }
      
      // Small delay to ensure Sanity has processed the write
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload counts to ensure accuracy with server state
      await loadRegistrationCounts();
      
      // Close modal immediately after success
      selectedSession = null;
      registrationSuccess = null;
      
    } catch (e: any) {
      registrationError = e.message || 'Ein Fehler ist aufgetreten.';
      console.error('Registration error:', e);
      // Reload counts to ensure we're in sync after error
      await loadRegistrationCounts();
    } finally {
      isRegistering = false;
    }
  }
  
  // Check if cancellation is allowed (up to 1 day before event)
  function canCancelRegistration(dateStr: string): { allowed: boolean; message: string } {
    try {
      const eventDate = new Date(dateStr);
      const now = new Date();
      const oneDayBefore = new Date(eventDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      
      if (now > oneDayBefore) {
        const hours = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (hours < 0) {
          return { 
            allowed: false, 
            message: 'Das Event hat bereits begonnen' 
          };
        }
        return { 
          allowed: false, 
          message: `Stornierung nur bis 24 Stunden vor Event möglich (noch ${hours} Stunden bis zum Event)` 
        };
      }
      
      return { 
        allowed: true, 
        message: 'Stornierung möglich' 
      };
    } catch (error) {
      console.error('Error checking cancellation deadline:', error);
      return { 
        allowed: false, 
        message: 'Fehler beim Prüfen der Stornierungsfrist' 
      };
    }
  }
  
  // Cancel registration
  async function cancelRegistration(dayIndex: number, stageIndex: number, itemIndex: number) {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    const registration = userRegistrations.get(key);
    
    if (!registration) return;
    
    // Check if cancellation is allowed
    const day = schedule[dayIndex];
    if (day) {
      const cancellationStatus = canCancelRegistration(day.date);
      if (!cancellationStatus.allowed) {
        toasts.error(cancellationStatus.message);
        return;
      }
    }
    
    // Get the session info for the toast message
    const stage = day?.stages?.[stageIndex];
    const item = stage?.schedule?.[itemIndex];
    const sessionTitle = item?.title || 'Session';
    
    try {
      // Optimistic UI update - immediately decrement count
      const currentCount = registrationCounts.get(key) || 0;
      if (currentCount > 0) {
        registrationCounts = new Map(registrationCounts.set(key, currentCount - 1));
        registrationCountsObject = {
          ...registrationCountsObject,
          [key]: currentCount - 1
        };
      }
      
      // Optimistically remove from user registrations
      userRegistrations.delete(key);
      userRegistrations = new Map(userRegistrations);
      
      const response = await fetch(`/api/schedule-registrations/${registration._id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Revert optimistic updates on error
        userRegistrations.set(key, registration);
        userRegistrations = new Map(userRegistrations);
        registrationCounts = new Map(registrationCounts.set(key, currentCount));
        registrationCountsObject = {
          ...registrationCountsObject,
          [key]: currentCount
        };
        throw new Error(result.error || 'Failed to cancel registration');
      }
      
      // If the server provided an updated count, use it immediately
      if (result.updatedCount !== undefined && result.sessionKey) {
        registrationCounts.set(result.sessionKey, result.updatedCount);
        registrationCounts = new Map(registrationCounts);
        registrationCountsObject = {
          ...registrationCountsObject,
          [result.sessionKey]: result.updatedCount
        };
      }
      
      // Show success toast
      toasts.success(`Erfolgreich von "${sessionTitle}" abgemeldet!`);
      
      // Reload counts to ensure accuracy with server state
      await loadRegistrationCounts();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toasts.error('Fehler beim Abmelden. Bitte versuche es erneut.');
      // Reload to ensure we're in sync after error
      await loadUserRegistrations();
      await loadRegistrationCounts();
    }
  }

  onMount(() => {
    // Load registrations
    if (eventId) {
      loadRegistrationCounts();
      if (user) {
        loadUserRegistrations();
      }
    }
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
    allowRegistration?: boolean;
    maxRegistrations?: number;
    registrationRequired?: boolean;
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
  export let user: { id: string; email: string } | null = null;
  export let userProfile: any = null;
  export let eventId: string = '';
  export let eventScheduleId: string = '';
  
  // Required badge ID for registration
  const REQUIRED_BADGE_ID = '319b8937-cc53-4b1c-a2ef-b9f97aa81f51';
  
  // Check if user has the required badge
  $: hasRequiredBadge = userProfile?.badges?.some((badge: any) => 
    badge._id === REQUIRED_BADGE_ID || badge._ref === REQUIRED_BADGE_ID
  ) || false;
  
  
  let selectedDayIndex = 0;
  let selectedStageIndex = 0;
  let expandedDescriptions: Record<string, boolean> = {};
  
  // Registration state - use regular object for better reactivity
  let userRegistrations: Map<string, any> = new Map();
  let registrationCounts: Map<string, number> = new Map();
  let registrationCountsObject: Record<string, number> = {};
  let isLoadingRegistrations = false;
  let selectedSession: { item: ScheduleItem; dayIndex: number; stageIndex: number; itemIndex: number } | null = null;
  let showLoginPrompt = false;
  let isRegistering = false;
  let registrationError: string | null = null;
  let registrationSuccess: string | null = null;

  $: selectedDay = schedule[selectedDayIndex];
  $: selectedStage = selectedDay?.stages?.[selectedStageIndex];
  $: hasStages = selectedDay?.stages?.length > 0;
  
  // Reload registration data when eventId or user changes
  $: if (eventId) {
    if (user) {
      loadUserRegistrations();
    }
    loadRegistrationCounts();
  }


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
                      
                      {#if item.allowRegistration}
                        <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          {#if item.maxRegistrations}
                            {#key `${selectedDayIndex}-${selectedStageIndex}-${i}-${registrationCountsObject[`${selectedDayIndex}-${selectedStageIndex}-${i}`] || 0}`}
                            <div class="text-sm text-gray-400">
                              <span class="inline-flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                {getRegistrationCount(selectedDayIndex, selectedStageIndex, i)}/{item.maxRegistrations} Plätze
                              </span>
                            </div>
                            {/key}
                          {/if}
                          
                          {#key `${selectedDayIndex}-${selectedStageIndex}-${i}-user-${userRegistrations.size}`}
                          {#if isUserRegistered(selectedDayIndex, selectedStageIndex, i)}
                            {@const cancellationStatus = canCancelRegistration(selectedDay.date)}
                            <div class="relative group">
                              <button
                                on:click={() => {
                                  if (cancellationStatus.allowed) {
                                    cancelRegistration(selectedDayIndex, selectedStageIndex, i);
                                  } else {
                                    toasts.error(cancellationStatus.message);
                                  }
                                }}
                                class="px-4 py-2 {cancellationStatus.allowed ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 cursor-not-allowed opacity-75'} text-black text-sm font-medium rounded-full transition-colors duration-200"
                                title={cancellationStatus.allowed ? 'Klicken zum Abmelden' : cancellationStatus.message}
                              >
                                <span class="group-hover:hidden">✓ Angemeldet</span>
                                <span class="hidden group-hover:inline">Abmelden?</span>
                              </button>
                              
                              <!-- Tooltip -->
                              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                                {#if cancellationStatus.allowed}
                                  <span>Stornierung möglich bis 24h vor Event</span>
                                {:else}
                                  <span>{cancellationStatus.message}</span>
                                {/if}
                                <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                  <div class="border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          {:else if item.maxRegistrations && getRegistrationCount(selectedDayIndex, selectedStageIndex, i) >= item.maxRegistrations}
                            <button
                              disabled
                              class="px-4 py-2 bg-gray-700 text-gray-400 text-sm font-medium rounded-full cursor-not-allowed"
                            >
                              Ausgebucht
                            </button>
                          {:else}
                            <button
                              on:click={() => {
                                if (!user) {
                                  showLoginPrompt = true;
                                } else if (!hasRequiredBadge) {
                                  toasts.error('Du benötigst den "Event-Teilnehmer" Badge um dich anzumelden. Bitte schließe zuerst dein Profil ab.');
                                } else {
                                  selectedSession = { item, dayIndex: selectedDayIndex, stageIndex: selectedStageIndex, itemIndex: i };
                                }
                              }}
                              class="px-4 py-2 {!user || !hasRequiredBadge ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-400 hover:bg-green-500'} text-black text-sm font-medium rounded-full transition-colors duration-200"
                              title={!hasRequiredBadge ? 'Badge erforderlich' : 'Jetzt anmelden'}
                            >
                              {!hasRequiredBadge ? '🔒 Badge erforderlich' : 'Jetzt anmelden'}
                            </button>
                          {/if}
                          {/key}
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

<!-- Registration Confirmation Modal -->
{#if selectedSession && user}
  <div 
    class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
    transition:fade={{ duration: 200 }}
    on:click|self={() => selectedSession = null}
  >
    <div 
      class="w-full max-w-md bg-black border border-gray-800 rounded-3xl p-8"
      transition:slide={{ duration: 200, easing: quintOut }}
    >
      <h3 class="text-2xl text-white mb-2">Anmeldung bestätigen</h3>
      <p class="text-gray-400 mb-6">{selectedSession.item.title} - {selectedSession.item.time}</p>
      
      <div class="space-y-6">
        <div class="bg-black/40 border border-gray-800 rounded-xl p-4">
          <p class="text-sm text-gray-400 mb-2">Du meldest dich an als:</p>
          <p class="text-white font-medium">
            {userProfile?.displayName || userProfile?.username || user.email.split('@')[0]}
          </p>
          <p class="text-sm text-gray-400 mt-1">{user.email}</p>
        </div>

        {#if registrationError}
          <p class="text-red-400 text-sm">{registrationError}</p>
        {/if}

        {#if registrationSuccess}
          <p class="text-green-400 text-sm">{registrationSuccess}</p>
        {/if}

        <div class="flex space-x-4">
          <button
            type="button"
            class="flex-1 px-6 py-3 text-white border border-gray-800 rounded-xl hover:border-gray-700 transition-colors duration-200"
            on:click={() => selectedSession = null}
            disabled={isRegistering}
          >
            Abbrechen
          </button>
          <button
            on:click={handleRegistration}
            class="flex-1 px-6 py-3 bg-green-400 text-black rounded-xl hover:bg-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRegistering}
          >
            {isRegistering ? 'Wird angemeldet...' : 'Jetzt anmelden'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Login Prompt Modal -->
{#if showLoginPrompt}
  <div 
    class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
    transition:fade={{ duration: 200 }}
    on:click|self={() => showLoginPrompt = false}
  >
    <div 
      class="w-full max-w-md bg-black border border-gray-800 rounded-3xl p-8"
      transition:slide={{ duration: 200, easing: quintOut }}
    >
      <h3 class="text-2xl text-white mb-4">Anmeldung erforderlich</h3>
      <p class="text-gray-300 mb-6">
        Um dich für diese Session anzumelden, musst du dich zuerst einloggen oder registrieren.
      </p>
      
      <div class="flex space-x-4">
        <button
          type="button"
          class="flex-1 px-6 py-3 text-white border border-gray-800 rounded-xl hover:border-gray-700 transition-colors duration-200"
          on:click={() => showLoginPrompt = false}
        >
          Abbrechen
        </button>
        <a
          href="/auth?next={encodeURIComponent(window.location.pathname + window.location.search)}"
          class="flex-1 px-6 py-3 bg-green-400 text-black rounded-xl hover:bg-green-500 transition-colors duration-200 text-center"
        >
          Jetzt anmelden
        </a>
      </div>
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