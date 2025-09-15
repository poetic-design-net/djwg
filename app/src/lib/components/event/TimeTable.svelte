<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { toasts } from '$lib/stores/toast';
  import CountdownTimer from './CountdownTimer.svelte';

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

  // Check if registration is open for a session
  function isRegistrationOpen(item: ScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number): boolean {
    // If no start time specified, registration is always open
    if (!item.registrationStartTime) {
      return true;
    }

    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;

    // Check if countdown has completed for this session
    if (countdownCompleted.has(key)) {
      return true;
    }

    // Check if current time is past registration start time
    const now = new Date().getTime();
    const startTime = new Date(item.registrationStartTime).getTime();

    if (now >= startTime) {
      // Mark as completed and trigger reactivity
      countdownCompleted.add(key);
      countdownCompleted = new Set(countdownCompleted);
      return true;
    }

    return false;
  }

  // Handle countdown completion
  function handleCountdownComplete(dayIndex: number, stageIndex: number, itemIndex: number) {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    countdownCompleted.add(key);
    countdownCompleted = new Set(countdownCompleted); // Trigger reactivity

    // Show a toast notification
    const item = schedule[dayIndex]?.stages?.[stageIndex]?.schedule?.[itemIndex];
    if (item) {
      toasts.success(`Die Registrierung für "${item.title}" ist jetzt geöffnet!`);
    }
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
          maxRegistrations: item.maxRegistrations,
          isOpenTable: item.isOpenTable,
          openTableSettings: item.openTableSettings
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

  // Helper function to get all artists (handling both old and new format)
  function getAllArtists(item: ScheduleItem): Artist[] {
    const artists: Artist[] = [];

    // Add new instructors array if exists
    if (item.instructors && item.instructors.length > 0) {
      artists.push(...item.instructors);
    }
    // Fall back to old instructor field if no instructors array
    else if (item.instructor) {
      artists.push(item.instructor);
    }

    return artists;
  }

  // Helper function to format artist names based on display mode
  function formatArtistNames(item: ScheduleItem): string {
    const artists = getAllArtists(item);

    if (artists.length === 0) return '';
    if (artists.length === 1) return artists[0].name;

    const displayMode = item.instructorDisplayMode || 'all';
    const names = artists.map(a => a.name);

    switch (displayMode) {
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

  // Helper function to get the main artist image
  function getMainArtistImage(item: ScheduleItem): string | undefined {
    const artists = getAllArtists(item);
    return artists[0]?.image;
  }

  // Get current artist for rotation
  function getCurrentArtist(item: ScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number): Artist | undefined {
    const artists = getAllArtists(item);
    if (artists.length === 0) return undefined;
    if (artists.length === 1) return artists[0];

    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    const currentIndex = artistIndexMap.get(key) || 0;
    const selectedArtist = artists[currentIndex];

    // Debug logging
    console.log(`getCurrentArtist for ${key}: index ${currentIndex}/${artists.length}, artist: ${selectedArtist?.name}`);

    return selectedArtist;
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
      // Force reactivity with assignment
      artistIndexMap = new Map(artistIndexMap);
    }

    // Add console log for debugging
    console.log(`Starting artist rotation for ${key} with ${artistCount} artists`);

    // Start rotation interval (change every 4 seconds for slower, smoother effect)
    const interval = setInterval(() => {
      const currentIndex = artistIndexMap.get(key) || 0;
      const nextIndex = (currentIndex + 1) % artistCount;
      artistIndexMap.set(key, nextIndex);
      // Force reactivity with assignment
      artistIndexMap = new Map(artistIndexMap);

      console.log(`Rotated artist for ${key}: ${currentIndex} -> ${nextIndex}`);
    }, 4000);

    artistIntervals.set(key, interval as unknown as number);
    console.log(`Set interval ${interval} for ${key}`);
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

    // Start artist rotation for all items with multiple artists
    if (selectedStage?.schedule) {
      selectedStage.schedule.forEach((item, i) => {
        const artists = getAllArtists(item);
        if (artists.length > 1) {
          startArtistRotation(selectedDayIndex, selectedStageIndex, i, artists.length);
        }
      });
    }

    return () => {
      timelineObserver?.disconnect();
      // Clear all artist rotation intervals
      artistIntervals.forEach(interval => clearInterval(interval as unknown as ReturnType<typeof setInterval>));
      artistIntervals.clear();
    };
  });

  interface Artist {
    _id?: string;
    name: string;
    role?: string;
    image?: string;
  }

  interface ScheduleItem {
    time: string;
    title: string;
    description?: string;
    instructor?: Artist; // Deprecated - for backward compatibility
    instructors?: Artist[]; // New: multiple artists
    instructorDisplayMode?: 'all' | 'b2b' | 'vs' | 'comma' | 'ampersand' | 'main';
    icon?: string;
    allowRegistration?: boolean;
    registrationStartTime?: string;
    maxRegistrations?: number;
    registrationRequired?: boolean;
    isOpenTable?: boolean;
    openTableSettings?: {
      autoAcceptRegistrations?: boolean;
      showRemainingSlots?: boolean;
      waitlistEnabled?: boolean;
      description?: string;
    };
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
  export let scheduleView: string = 'timeline';
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  // Required badge ID for registration
  const REQUIRED_BADGE_ID = '319b8937-cc53-4b1c-a2ef-b9f97aa81f51';
  
  // Check if user has the required badge - check both awardedBadges and badges arrays
  $: hasRequiredBadge = (userProfile?.awardedBadges || userProfile?.badges || []).some((badge: any) =>
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

  // Track which sessions have countdown completed
  let countdownCompleted: Set<string> = new Set();

  // Track current artist index for each session with multiple artists
  let artistIndexMap: Map<string, number> = new Map();
  let artistIntervals: Map<string, number> = new Map();

  // Hover preview state management
  let hoveredArtist: Artist | null = null;
  let hoverPosition = { x: 0, y: 0 };
  let hoverElement: HTMLElement | null = null;
  let hoverVisible = false;
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleArtistHover(event: MouseEvent, artist: Artist) {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    // Calculate position for preview
    const previewWidth = window.innerWidth < 768 ? 240 : 288;
    const previewHeight = window.innerWidth < 768 ? 176 : 208;

    let x = rect.left + (rect.width / 2) - (previewWidth / 2);
    let y = rect.top - previewHeight - 12;

    // Adjust horizontal position to stay on screen
    if (x < 10) x = 10;
    if (x + previewWidth > window.innerWidth - 10) {
      x = window.innerWidth - previewWidth - 10;
    }

    // If not enough space above, show below
    if (y < 10) {
      y = rect.bottom + 12;
    }

    hoverPosition = { x, y };
    hoveredArtist = artist;
    hoverElement = element;

    // Clear any existing timeout
    if (hoverTimeout) clearTimeout(hoverTimeout);

    // Small delay then show with animation
    hoverTimeout = setTimeout(() => {
      hoverVisible = true;
    }, 50);
  }

  function handleArtistLeave() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverVisible = false;

    // Keep the artist data briefly for fade out animation
    setTimeout(() => {
      hoveredArtist = null;
      hoverElement = null;
    }, 300);
  }

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

  // Restart artist rotation when stage changes
  $: if (selectedStage?.schedule && typeof window !== 'undefined') {
    // Clear existing intervals only for the previous stage
    const currentStageKey = `${selectedDayIndex}-${selectedStageIndex}`;
    const keysToRemove: string[] = [];

    artistIntervals.forEach((interval, key) => {
      if (!key.startsWith(currentStageKey)) {
        clearInterval(interval as unknown as ReturnType<typeof setInterval>);
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      artistIntervals.delete(key);
      artistIndexMap.delete(key);
    });

    // Start new intervals for items with multiple artists in current stage
    selectedStage.schedule.forEach((item, i) => {
      const artists = getAllArtists(item);
      if (artists.length > 1) {
        const key = `${selectedDayIndex}-${selectedStageIndex}-${i}`;
        // Only start rotation if not already running
        if (!artistIntervals.has(key)) {
          startArtistRotation(selectedDayIndex, selectedStageIndex, i, artists.length);
        }
      }
    });
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
      <div class="mb-12 text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Tagesablauf</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter mb-8">Timeline</h2>
        
        <!-- View Switcher -->
        <div class="relative inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1 border border-gray-800">
            <button
              class="group px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 {scheduleView === 'timeline' ? 'bg-green-400 text-black shadow-lg shadow-green-400/20' : 'text-gray-400 hover:text-white'}"
              disabled
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Timeline
            </button>
            <button
              class="group px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 text-gray-400 hover:text-green-400 hover:bg-white/5"
              on:click={() => dispatch('switchView')}
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

      <!-- Day Tabs -->
      {#if schedule.length > 1}
        <div class="flex flex-wrap justify-center mb-8 gap-4">
          {#each schedule as day, i}
            <a
              href={getTabUrl(i)}
              class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 {selectedDayIndex === i ? 'bg-emerald-500 text-black scale-105' : 'text-white hover:text-emerald-400 hover:scale-105 border border-gray-700 hover:border-emerald-400'}"
              on:click|preventDefault={() => selectDay(i)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
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
                class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {selectedStageIndex === i ? 'bg-teal-500 text-black scale-105' : 'text-gray-300 hover:text-teal-400 hover:scale-105 border border-gray-700 hover:border-teal-400'}"
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

        <div class="relative overflow-visible" bind:this={timelineContainer}>
          <!-- Timeline Line -->
          <div class="absolute left-12 md:left-1/2 top-0 w-px h-full bg-gray-800 transform -translate-x-1/2"></div>

          <!-- Schedule Items -->
          {#if selectedStage.schedule?.length > 0}
            <div class="relative space-y-8 overflow-visible">
              {#each selectedStage.schedule as item, i (item)}
                {@const allArtists = getAllArtists(item)}
                {@const sessionKey = `${selectedDayIndex}-${selectedStageIndex}-${i}`}
                {@const artistIndex = artistIndexMap.get(sessionKey) || 0}
                {@const currentArtist = getCurrentArtist(item, selectedDayIndex, selectedStageIndex, i)}
                <div
                  class="relative flex flex-col md:flex-row items-start md:items-center group"
                  in:fade={{ duration: 300, delay: i * 50 }}
                >
                  <!-- Left Side (Time) -->
                  <div class="flex-1 w-full md:w-5/12 order-2 md:order-none mb-4 md:mb-0 pl-20 md:pl-0 {i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:hidden'}">
                    <span class="text-xl text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">{item.time}</span>
                  </div>

                  <!-- Center (Icon or Image) -->
                  <div
                    bind:this={timelineItems[i]}
                    class="timeline-dot absolute left-6 md:left-1/2 top-0 md:top-1/2 transform md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-black border-4 border-gray-800 rounded-full flex items-center justify-center group-hover:border-green-500 transition-all duration-500 ease-out z-10 overflow-hidden {allArtists.length > 1 ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-black' : ''}"
                  >
                    {#key `${sessionKey}-${artistIndex}`}
                      {#if currentArtist?.image}
                        <img
                          src={currentArtist.image}
                          alt={currentArtist.name}
                          class="w-full h-full object-cover"
                          in:fade={{ duration: 500 }}
                        />
                        {#if allArtists.length > 1}
                          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                            {allArtists.length}
                          </div>
                        {/if}
                      {:else if item.icon}
                      <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={item.icon}></path>
                      </svg>
                    {:else}
                      <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                    {/if}
                    {/key}
                  </div>

                  <!-- Right Side (Time for odd items) -->
                  <div class="hidden md:block flex-1 w-full md:w-5/12 order-2 mb-4 md:mb-0 pl-20 md:pl-0 {i % 2 === 1 ? 'md:text-left md:pl-10' : 'md:hidden'}">
                    <span class="text-xl text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">{item.time}</span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 w-full md:w-5/12 order-3 pl-20 md:pl-0 {i % 2 === 0 ? 'md:pl-10' : 'md:pr-10 md:order-first'}" style="overflow: visible !important;">
                    <div class="event-card p-4 md:p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-500 hover:scale-[1.02] transform hover:bg-black/60 hover:shadow-2xl hover:shadow-green-500/10" style="overflow: visible !important;">
                      <h3 class="mb-2 text-lg md:text-xl text-white font-medium group-hover:text-green-400 transition-colors duration-300">{item.title}</h3>
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
                      {#if getAllArtists(item).length > 0}
                        {@const artists = getAllArtists(item)}
                        <div class="mt-3" style="overflow: visible !important;">
                          <!-- Artist badges display for all -->
                          <div class="flex flex-wrap gap-2" style="overflow: visible !important; position: relative; z-index: 20;">
                            {#each artists as artist, artistIdx}
                              <div
                                class="relative inline-block"
                                on:mouseenter={(e) => handleArtistHover(e, artist)}
                                on:mouseleave={handleArtistLeave}
                                role="button"
                                tabindex="0"
                              >
                                <div class="inline-flex items-center gap-1 px-3 py-1.5 bg-black/60 border border-gray-700 rounded-full hover:border-green-400 transition-colors cursor-pointer">
                                  {#if artist.image}
                                    <img
                                      src={artist.image}
                                      alt={artist.name}
                                      class="w-5 h-5 rounded-full object-cover"
                                    />
                                  {/if}
                                  <span class="text-sm font-medium text-green-400">{artist.name}</span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        </div>
                      {/if}
                      
                      {#if item.isOpenTable}
                        <!-- Open Table Badge -->
                        <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
                          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span class="text-sm font-medium text-emerald-400">Open Table</span>
                        </div>
                        {#if item.openTableSettings?.description}
                          <p class="mt-2 text-sm text-gray-400 italic">{item.openTableSettings.description}</p>
                        {/if}
                      {/if}

                      {#if item.allowRegistration}
                        <div class="mt-4 flex flex-col gap-3">
                          {#if item.maxRegistrations}
                            {#key `${selectedDayIndex}-${selectedStageIndex}-${i}-${registrationCountsObject[`${selectedDayIndex}-${selectedStageIndex}-${i}`] || 0}`}
                            <div class="text-sm text-gray-400">
                              <span class="inline-flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                {#if item.isOpenTable && item.openTableSettings?.showRemainingSlots !== false}
                                  {@const regCount = getRegistrationCount(selectedDayIndex, selectedStageIndex, i)}
                                  {@const remaining = item.maxRegistrations - regCount}
                                  {#if remaining > 0}
                                    {remaining} {remaining === 1 ? 'Platz' : 'Plätze'} frei
                                  {:else if item.openTableSettings?.waitlistEnabled}
                                    Warteliste verfügbar
                                  {:else}
                                    Ausgebucht
                                  {/if}
                                {:else}
                                  {getRegistrationCount(selectedDayIndex, selectedStageIndex, i)}/{item.maxRegistrations} Plätze
                                {/if}
                              </span>
                            </div>
                            {/key}
                          {/if}

                          <!-- Countdown Timer or Registration Button -->
                          {#key `${selectedDayIndex}-${selectedStageIndex}-${i}-countdown-${countdownCompleted.size}`}
                          {#if !isRegistrationOpen(item, selectedDayIndex, selectedStageIndex, i) && item.registrationStartTime}
                            <div class="bg-black/20 border border-gray-800 rounded-xl p-3">
                              <CountdownTimer
                                targetDate={item.registrationStartTime}
                                onComplete={() => handleCountdownComplete(selectedDayIndex, selectedStageIndex, i)}
                                label={item.isOpenTable ? "Open Table öffnet in" : "Registrierung öffnet in"}
                                completedLabel={item.isOpenTable ? "Open Table ist jetzt verfügbar!" : "Registrierung ist jetzt möglich!"}
                                compact={true}
                              />
                            </div>
                          {:else}
                            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                                } else if (!isRegistrationOpen(item, selectedDayIndex, selectedStageIndex, i)) {
                                  toasts.error('Die Registrierung ist noch nicht geöffnet.');
                                } else {
                                  selectedSession = { item, dayIndex: selectedDayIndex, stageIndex: selectedStageIndex, itemIndex: i };
                                }
                              }}
                              class="px-4 py-2 {!user || !hasRequiredBadge ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-400 hover:bg-green-500'} text-black text-sm font-medium rounded-full transition-colors duration-200 {countdownCompleted.has(`${selectedDayIndex}-${selectedStageIndex}-${i}`) ? 'animate-pulse' : ''}"
                              title={!hasRequiredBadge ? 'Badge erforderlich' : 'Jetzt anmelden'}
                            >
                              {!hasRequiredBadge ? '🔒 Badge erforderlich' : item.isOpenTable ? 'Platz reservieren' : 'Jetzt anmelden'}
                            </button>
                          {/if}
                          {/key}
                            </div>
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
      <h3 class="text-2xl text-white mb-2">{selectedSession.item.isOpenTable ? 'Open Table Reservierung' : 'Anmeldung bestätigen'}</h3>
      <p class="text-gray-400 mb-6">{selectedSession.item.title} - {selectedSession.item.time}</p>
      {#if selectedSession.item.isOpenTable && selectedSession.item.openTableSettings?.description}
        <p class="text-emerald-400 text-sm mb-4 italic">{selectedSession.item.openTableSettings.description}</p>
      {/if}
      
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

<!-- Global Hover Preview - Rendered outside all stacking contexts -->
{#if hoveredArtist && hoveredArtist.image}
  <div
    class="fixed pointer-events-none w-60 md:w-72 transition-all duration-300 ease-out"
    style="left: {hoverPosition.x}px; top: {hoverPosition.y}px; z-index: 999999; opacity: {hoverVisible ? 1 : 0}; transform: scale({hoverVisible ? 1 : 0.9}) translateY({hoverVisible ? 0 : -8}px);"
  >
    <div class="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-xl p-1.5 shadow-2xl shadow-black/80">
      <!-- Gradient border effect -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-green-500/20 rounded-xl opacity-100 transition-opacity duration-500"></div>

      <!-- Image container -->
      <div class="relative overflow-hidden rounded-lg">
        <img
          src={hoveredArtist.image}
          alt={hoveredArtist.name}
          class="w-full h-44 md:h-52 object-cover"
        />

        <!-- Subtle gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>

    <!-- Arrow pointing down (when preview is above badge) -->
    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700/50"></div>
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
  
  /* Enhanced card hover effects */
  .event-card {
    position: relative;
    overflow: visible;
  }

  .event-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent, rgba(51, 204, 153, 0.05));
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    border-radius: inherit;
  }

  .event-card:hover::before {
    opacity: 1;
  }
  
  /* Better image loading */
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  /* Prevent content overflow on mobile */
  @media (max-width: 768px) {
    .break-words {
      word-break: break-word;
    }
  }

  /* Timeline circle z-index */
  .timeline-dot {
    z-index: 10;
  }

  /* Smooth transitions for hover states */
  @media (prefers-reduced-motion: reduce) {
    .transition-all {
      transition-duration: 0.01ms !important;
    }
  }

  /* Smooth artist rotation animation */
  .timeline-dot img {
    transition: opacity 0.5s ease-in-out;
  }

  /* Additional overflow visible enforcement */
  :global(.overflow-visible) {
    overflow: visible !important;
  }
</style>