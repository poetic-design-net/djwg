<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import { fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import CountdownTimer from './CountdownTimer.svelte';

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
    _id?: string; // Item ID for registration
    time: string;
    title: string;
    description?: string;
    instructor?: Artist; // Deprecated - for backward compatibility
    instructors?: Artist[]; // New: multiple artists
    instructorDisplayMode?: 'all' | 'b2b' | 'vs' | 'comma' | 'ampersand' | 'main';
    icon?: string;
    // Registration fields from Sanity
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
    // Runtime fields
    isWorkshop?: boolean; // Used for styling only
    maxParticipants?: number; // Alias for maxRegistrations
    currentParticipants?: number; // Calculated from registrations
    isRegistered?: boolean; // Current user registration status
    registrationOpen?: boolean; // Whether registration is currently open
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
  export let enableAnimations: boolean = true; // Can be controlled from parent
  export let user: { id: string; email: string } | null = null;
  export let userProfile: any = null;
  export let eventId: string = '';
  export let eventScheduleId: string = '';

  const dispatch = createEventDispatcher();

  // Required badge ID for registration (Sanity _id of Workshop/Partner badge)
  const REQUIRED_BADGE_ID = '3eade88a-8d15-4dc6-b0b8-df334105a1b2';

  // Check if user has the required badge - check both awardedBadges and badges arrays
  $: hasRequiredBadge = (() => {
    // Check both possible arrays where badges might be stored
    const badges = userProfile?.awardedBadges || userProfile?.badges || [];

    if (!badges || badges.length === 0) {
      return false;
    }

    const hasBadge = badges.some((badge: any) => {
      // Check both possible badge structures
      const badgeId = badge._id || badge._ref || badge.id || badge;
      return badgeId === REQUIRED_BADGE_ID;
    });

    return hasBadge;
  })();

  // Stage filtering
  let selectedStages: Set<string> = new Set();
  let showStageFilter = false;
  let scrollContainer: HTMLDivElement;
  let canScrollLeft = false;
  let canScrollRight = false;
  let hoveredEvent: { event: ExtendedScheduleItem; position: DOMRect; dayIndex: number; stageIndex: number; itemIndex: number } | null = null;
  let isInteractingWithHoverCard = false;

  // Registration state
  let userRegistrations: Map<string, any> = new Map();
  let registrationCounts: Map<string, number> = new Map();
  let registrationCountsObject: Record<string, number> = {};
  let isLoadingRegistrations = false;
  let selectedSession: { item: ExtendedScheduleItem; dayIndex: number; stageIndex: number; itemIndex: number } | null = null;
  let showLoginPrompt = false;
  let isRegistering = false;
  let registrationError: string | null = null;
  let registrationSuccess: string | null = null;
  let countdownCompleted: Set<string> = new Set();

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
          if (!reg.status || reg.status === 'confirmed') {
            const key = `${reg.dayIndex}-${reg.stageIndex}-${reg.itemIndex}`;
            const current = newCounts.get(key) || 0;
            newCounts.set(key, current + 1);
          }
        });

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

  // Get registration count for a session
  function getRegistrationCount(dayIndex: number, stageIndex: number, itemIndex: number): number {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    return registrationCountsObject[key] || 0;
  }

  // Check if registration is open for a session
  function isRegistrationOpen(item: ExtendedScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number): boolean {
    if (!item.registrationStartTime) {
      return true;
    }

    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;

    if (countdownCompleted.has(key)) {
      return true;
    }

    const now = new Date().getTime();
    const startTime = new Date(item.registrationStartTime).getTime();

    if (now >= startTime) {
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
    countdownCompleted = new Set(countdownCompleted);

    const item = filteredSchedule[dayIndex]?.stages?.[stageIndex]?.schedule?.[itemIndex];
    if (item) {
      toasts.success(`Die Registrierung für "${item.title}" ist jetzt geöffnet!`);
    }
  }

  // Enhanced schedule item with registration data
  function enhanceScheduleItem(item: ExtendedScheduleItem, stageName?: string): ExtendedScheduleItem {
    // Only enhance items that have explicit allowRegistration from the data
    if (item.allowRegistration) {
      return {
        ...item,
        isWorkshop: true, // Mark as workshop for styling purposes
        registrationOpen: item.registrationOpen !== undefined ? item.registrationOpen : true,
        maxParticipants: item.maxRegistrations || item.maxParticipants,
        currentParticipants: item.currentParticipants,
        isRegistered: item.isRegistered || false
      };
    }
    return item;
  }

  // Helper function to get all artists from an item
  function getAllArtists(item: ExtendedScheduleItem): Artist[] {
    const artists: Artist[] = [];

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

    // Start rotation interval (change every 5 seconds for smoother experience with images)
    const interval = setInterval(() => {
      const currentIndex = artistIndexMap.get(key) || 0;
      const nextIndex = (currentIndex + 1) % artistCount;
      artistIndexMap.set(key, nextIndex);
      // Force reactivity with assignment
      artistIndexMap = new Map(artistIndexMap);
    }, 5000);

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
  
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleEventHover(event: ExtendedScheduleItem, element: HTMLElement, dayIndex: number, stageIndex: number, itemIndex: number) {
    // Clear any existing timeouts
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (leaveTimeout) clearTimeout(leaveTimeout);

    // Only show hover card after a short delay to prevent flicker
    hoverTimeout = setTimeout(() => {
      const rect = element.getBoundingClientRect();
      hoveredEvent = { event, position: rect, dayIndex, stageIndex, itemIndex };
    }, 300); // 300ms delay to show
  }

  function handleEventLeave() {
    // Clear hover timeout if leaving before hover card appears
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    // Add delay before hiding to allow mouse to move to hover card
    if (leaveTimeout) clearTimeout(leaveTimeout);
    leaveTimeout = setTimeout(() => {
      if (!isInteractingWithHoverCard) {
        hoveredEvent = null;
      }
    }, 150); // 150ms grace period
  }

  // Handle workshop registration
  function handleWorkshopClick(event: ExtendedScheduleItem, e: MouseEvent, dayIndex: number, stageIndex: number, itemIndex: number) {
    e.stopPropagation();

    if (!user) {
      showLoginPrompt = true;
    } else if (!hasRequiredBadge) {
      toasts.error('Du benötigst den "Event-Teilnehmer" Badge um dich anzumelden. Bitte schließe zuerst dein Profil ab.');
    } else if (!isRegistrationOpen(event, dayIndex, stageIndex, itemIndex)) {
      toasts.error('Die Registrierung ist noch nicht geöffnet.');
    } else {
      selectedSession = { item: event, dayIndex, stageIndex, itemIndex };
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

      // Optimistic UI update
      const currentCount = registrationCounts.get(key) || 0;
      registrationCounts = new Map(registrationCounts.set(key, currentCount + 1));

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
          maxRegistrations: item.maxRegistrations || item.maxParticipants,
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

      if (result.updatedCount !== undefined && result.sessionKey) {
        registrationCounts.set(result.sessionKey, result.updatedCount);
        registrationCounts = new Map(registrationCounts);
        registrationCountsObject = {
          ...registrationCountsObject,
          [result.sessionKey]: result.updatedCount
        };
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      await loadRegistrationCounts();

      selectedSession = null;
      registrationSuccess = null;

    } catch (e: any) {
      registrationError = e.message || 'Ein Fehler ist aufgetreten.';
      console.error('Registration error:', e);
      await loadRegistrationCounts();
    } finally {
      isRegistering = false;
    }
  }

  // Cancel registration
  async function cancelRegistration(dayIndex: number, stageIndex: number, itemIndex: number) {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    const registration = userRegistrations.get(key);

    if (!registration) return;

    const day = filteredSchedule[dayIndex];
    const stage = day?.stages?.[stageIndex];
    const item = stage?.schedule?.[itemIndex];
    const sessionTitle = item?.title || 'Session';

    try {
      // Optimistic UI update
      const currentCount = registrationCounts.get(key) || 0;
      if (currentCount > 0) {
        registrationCounts = new Map(registrationCounts.set(key, currentCount - 1));
        registrationCountsObject = {
          ...registrationCountsObject,
          [key]: currentCount - 1
        };
      }

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

      if (result.updatedCount !== undefined && result.sessionKey) {
        registrationCounts.set(result.sessionKey, result.updatedCount);
        registrationCounts = new Map(registrationCounts);
        registrationCountsObject = {
          ...registrationCountsObject,
          [result.sessionKey]: result.updatedCount
        };
      }

      toasts.success(`Erfolgreich von "${sessionTitle}" abgemeldet!`);

      await loadRegistrationCounts();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toasts.error('Fehler beim Abmelden. Bitte versuche es erneut.');
      await loadUserRegistrations();
      await loadRegistrationCounts();
    }
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

    // Load registrations
    if (eventId) {
      loadRegistrationCounts();
      if (user) {
        loadUserRegistrations();
      }
    }

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

  // Reload registration data when eventId or user changes
  $: if (eventId) {
    if (user) {
      loadUserRegistrations();
    }
    loadRegistrationCounts();
  }

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

    // Clear hover timeouts
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (leaveTimeout) clearTimeout(leaveTimeout);
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
                    {#each stage.schedule as rawEvent, itemIndex}
                      {@const event = enhanceScheduleItem(rawEvent, stage.name)}
                      {@const styles = getEventStyles(event, timeSlots)}
                      {@const artists = getAllArtists(event)}
                      {@const currentArtist = getCurrentArtist(event, dayIndex, stageIndex, itemIndex)}
                      {@const isRegistered = isUserRegistered(dayIndex, stageIndex, itemIndex)}
                      {@const regCount = getRegistrationCount(dayIndex, stageIndex, itemIndex)}
                      <div
                        class="event-card group {currentArtist?.image ? 'has-image' : ''} {enableAnimations && currentArtist?.image ? 'animated' : ''} {event.isWorkshop || event.allowRegistration ? 'has-workshop' : ''} {isRegistered ? 'registered' : ''}"
                        style="top: {styles.top}; height: {styles.height}; --delay: {(stageIndex * 3 + itemIndex * 1.5)}s;"
                        on:mouseenter={(e) => handleEventHover(event, e.currentTarget, dayIndex, stageIndex, itemIndex)}
                        on:mouseleave={handleEventLeave}
                        role="button"
                        tabindex="0"
                      >
                        <!-- Artist Avatar Background Layer -->
                        {#if currentArtist?.image}
                          {#key currentArtist.image}
                            <div class="event-card-bg-wrapper">
                              <img
                                src={currentArtist.image}
                                alt=""
                                class="event-card-bg-image"
                                loading="lazy"
                                decoding="async"
                              />
                              <!-- Multiple gradient overlays for depth -->
                              <div class="event-card-gradient-1"></div>
                              <div class="event-card-gradient-2"></div>
                              <div class="event-card-gradient-3"></div>
                            </div>
                          {/key}
                        {/if}

                        <!-- Content Layer -->
                        <div class="event-card-content">
                          <div class="flex items-center justify-between gap-2">
                            <p class="event-title flex-1">{event.title}</p>
                            {#if event.allowRegistration}
                              <div class="workshop-indicator">
                                {#if !isRegistrationOpen(event, dayIndex, stageIndex, itemIndex) && event.registrationStartTime}
                                  <span class="countdown-badge" title="Registrierung öffnet bald">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                  </span>
                                {:else if isRegistered}
                                  <button
                                    class="registered-badge group/reg"
                                    on:click={(e) => {
                                      e.stopPropagation();
                                      cancelRegistration(dayIndex, stageIndex, itemIndex);
                                    }}
                                    title="Klicken zum Abmelden"
                                  >
                                    <span class="group-hover/reg:hidden">
                                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                      </svg>
                                    </span>
                                    <span class="hidden group-hover/reg:block">
                                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                      </svg>
                                    </span>
                                  </button>
                                {:else if event.maxRegistrations && regCount >= event.maxRegistrations}
                                  <span class="full-badge">VOLL</span>
                                {:else}
                                  <button
                                    class="register-btn"
                                    on:click={(e) => handleWorkshopClick(event, e, dayIndex, stageIndex, itemIndex)}
                                    title="Jetzt anmelden"
                                  >
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                  </button>
                                {/if}
                              </div>
                            {/if}
                          </div>
                        {#if artists.length > 0}
                          <div class="flex items-center gap-1 mt-1">
                            <span
                              class="flex items-center gap-1 artist-name"
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
                                class="social-link"
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
                                class="social-link"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                            {/if}
                          </div>
                        {/if}
                        </div>

                        {#if event.allowRegistration && event.maxRegistrations}
                          <div class="workshop-capacity">
                            <div class="capacity-bar">
                              <div
                                class="capacity-fill {regCount >= event.maxRegistrations ? 'full' : ''}"
                                style="width: {Math.min(100, (regCount / event.maxRegistrations) * 100)}%"
                              />
                            </div>
                            <span class="capacity-text">
                              {regCount}/{event.maxRegistrations}
                            </span>
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
    {@const hoverIsRegistered = isUserRegistered(hoveredEvent.dayIndex, hoveredEvent.stageIndex, hoveredEvent.itemIndex)}
    {@const hoverRegCount = getRegistrationCount(hoveredEvent.dayIndex, hoveredEvent.stageIndex, hoveredEvent.itemIndex)}
    {@const cardWidth = 380}
    {@const spaceOnRight = window.innerWidth - (hoveredEvent.position.left + hoveredEvent.position.width)}
    {@const showOnRight = spaceOnRight > cardWidth + 20}
    {@const leftPosition = showOnRight
      ? hoveredEvent.position.left + hoveredEvent.position.width + 15
      : Math.max(10, hoveredEvent.position.left - cardWidth - 15)}
    {@const topPosition = Math.min(
      hoveredEvent.position.top,
      window.innerHeight - 400
    )}
    <div
      class="fixed z-50 hover-overlay-container"
      style="
        left: {leftPosition}px;
        top: {topPosition}px;
        width: {cardWidth}px;
        height: auto;
        pointer-events: none;
      "
      on:mouseenter={() => {
        if (leaveTimeout) {
          clearTimeout(leaveTimeout);
          leaveTimeout = null;
        }
        isInteractingWithHoverCard = true;
      }}
      on:mouseleave={() => {
        isInteractingWithHoverCard = false;
        if (leaveTimeout) clearTimeout(leaveTimeout);
        leaveTimeout = setTimeout(() => {
          hoveredEvent = null;
        }, 150);
      }}
    >
      <div class="hover-overlay-card {hoveredEvent.event.allowRegistration ? 'interactive' : ''}">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-white font-bold text-base">{hoveredEvent.event.title}</h3>
          <span class="text-[#33cc99] text-xs font-medium">{hoveredEvent.event.time}</span>
        </div>
        
        {#if hoveredEvent.event.description}
          <p class="text-gray-300 text-sm mb-2">{hoveredEvent.event.description}</p>
        {/if}

        {#if hoveredEvent.event.allowRegistration}
          <div class="pt-2 border-t border-gray-700">
            <!-- Registration Status -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#33cc99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                {#if hoveredEvent.event.maxRegistrations}
                  <span class="text-xs text-gray-400">
                    {hoverRegCount}/{hoveredEvent.event.maxRegistrations} Teilnehmer
                  </span>
                {:else if hoveredEvent.event.isOpenTable}
                  <span class="text-xs text-gray-400">Open Table</span>
                {:else}
                  <span class="text-xs text-gray-400">Workshop</span>
                {/if}
              </div>
            </div>

            <!-- Registration Buttons -->
            <div class="flex justify-center">
              {#if !isRegistrationOpen(hoveredEvent.event, hoveredEvent.dayIndex, hoveredEvent.stageIndex, hoveredEvent.itemIndex) && hoveredEvent.event.registrationStartTime}
                <div class="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 text-xs font-medium">
                  <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Öffnet bald
                </div>
              {:else if !user}
                <button
                  on:click={() => showLoginPrompt = true}
                  class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-full transition-colors"
                >
                  Anmelden zum Registrieren
                </button>
              {:else if !hasRequiredBadge}
                <div class="px-3 py-1.5 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400 text-xs font-medium">
                  🔒 Badge erforderlich
                </div>
              {:else if hoverIsRegistered}
                <button
                  on:click={(e) => {
                    e.stopPropagation();
                    cancelRegistration(hoveredEvent.dayIndex, hoveredEvent.stageIndex, hoveredEvent.itemIndex);
                    hoveredEvent = null;
                  }}
                  class="px-3 py-1.5 bg-green-500 hover:bg-red-500 text-black text-xs font-medium rounded-full transition-all group/cancel"
                >
                  <span class="group-hover/cancel:hidden">✓ Angemeldet</span>
                  <span class="hidden group-hover/cancel:inline">Abmelden</span>
                </button>
              {:else if hoveredEvent.event.maxRegistrations && hoverRegCount >= hoveredEvent.event.maxRegistrations}
                <div class="px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-medium">
                  Ausgebucht
                </div>
              {:else}
                <button
                  on:click={(e) => {
                    e.stopPropagation();
                    selectedSession = {
                      item: hoveredEvent.event,
                      dayIndex: hoveredEvent.dayIndex,
                      stageIndex: hoveredEvent.stageIndex,
                      itemIndex: hoveredEvent.itemIndex
                    };
                    hoveredEvent = null;
                  }}
                  class="px-3 py-1.5 bg-green-400 hover:bg-green-500 text-black text-xs font-medium rounded-full transition-colors"
                >
                  {hoveredEvent.event.isOpenTable ? 'Platz reservieren' : 'Jetzt anmelden'}
                </button>
              {/if}
            </div>
          </div>
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    font-size: 0.875rem;
    cursor: pointer;
    isolation: isolate;
  }

  /* Animation variables for cascading effect */
  .event-card.animated {
    /* No breathing effect - cards stay static */
  }

  /* Background image layer */
  .event-card-bg-wrapper {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: 0.5rem;
  }

  .event-card-bg-image {
    position: absolute;
    inset: -20%;
    width: 140%;
    height: 140%;
    object-fit: cover;
    object-position: center top; /* Always show the top/face area */
    opacity: 0.3;
    filter: blur(0.5px) saturate(1.2);
    transform: scale(1);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeIn 0.8s ease-out;
  }

  .event-card.animated .event-card-bg-image {
    animation:
      fadeIn 0.8s ease-out,
      imageReveal 12s ease-in-out infinite;
    animation-delay: 0s, calc(var(--delay));
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(1.1);
    }
    to {
      opacity: 0.3;
      transform: scale(1);
    }
  }

  @keyframes imageReveal {
    0%, 100% {
      opacity: 0.3;
      filter: blur(0.5px) saturate(1.2);
      transform: scale(1);
    }
    15% {
      opacity: 0.85;
      filter: blur(0px) saturate(1.5) brightness(1.1);
      transform: scale(1.05);
    }
    20% {
      opacity: 0.9;
      filter: blur(0px) saturate(1.6) brightness(1.15);
      transform: scale(1.08);
    }
    25% {
      opacity: 0.4;
      filter: blur(0.3px) saturate(1.3);
      transform: scale(1.02);
    }
    75% {
      opacity: 0.3;
      filter: blur(0.5px) saturate(1.2);
      transform: scale(1);
    }
  }

  /* Multiple gradient overlays for sophisticated depth */
  .event-card-gradient-1 {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.6) 100%);
    mix-blend-mode: multiply;
  }

  .event-card.animated .event-card-gradient-1 {
    animation: gradientFade 12s ease-in-out infinite;
    animation-delay: calc(var(--delay));
  }

  .event-card-gradient-2 {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.5) 70%,
      rgba(0, 0, 0, 0.8) 100%);
  }

  .event-card.animated .event-card-gradient-2 {
    animation: gradientFade 12s ease-in-out infinite;
    animation-delay: calc(var(--delay));
  }

  .event-card-gradient-3 {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top right,
      rgba(51, 204, 153, 0.1) 0%,
      transparent 60%);
    mix-blend-mode: screen;
  }

  @keyframes gradientFade {
    0%, 100% {
      opacity: 1;
    }
    15%, 20% {
      opacity: 0.1;
    }
    25% {
      opacity: 0.8;
    }
    75% {
      opacity: 1;
    }
  }

  /* Content layer */
  .event-card-content {
    position: relative;
    z-index: 1;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .event-card.animated .event-card-content {
    animation: contentPulse 12s ease-in-out infinite;
    animation-delay: calc(var(--delay));
  }

  @keyframes contentPulse {
    0%, 100% {
      opacity: 1;
      transform: translateY(0);
    }
    15% {
      opacity: 0.3;
      transform: translateY(2px);
    }
    20% {
      opacity: 0.2;
      transform: translateY(3px);
    }
    25% {
      opacity: 0.9;
      transform: translateY(0);
    }
    75% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Enhanced text styles for better contrast */
  .event-title {
    color: white;
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8),
                 0 0 20px rgba(0, 0, 0, 0.5);
    margin-bottom: 0.25rem;
  }

  .artist-name {
    color: #33cc99;
    font-size: 0.75rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  }

  .social-link {
    color: #33cc99;
    transition: all 0.2s;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
  }

  .social-link:hover {
    color: rgba(51, 204, 153, 0.9);
    transform: scale(1.1);
  }

  /* Hover effects - pause animation on hover for better interaction */
  .event-card:hover {
    animation-play-state: paused;
  }

  .event-card:hover .event-card-bg-image {
    opacity: 0.6;
    transform: scale(1.05);
    filter: blur(0px) saturate(1.4) brightness(1.1);
    animation-play-state: paused;
  }

  .event-card:hover .event-card-content {
    animation-play-state: paused;
    opacity: 1;
  }

  .event-card:hover .event-card-gradient-1,
  .event-card:hover .event-card-gradient-2 {
    animation-play-state: paused;
    opacity: 0.5;
  }

  .event-card.has-image {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(51, 204, 153, 0.2);
    will-change: transform;
  }

  .event-card.has-image:hover {
    border-color: rgba(51, 204, 153, 0.4);
    box-shadow: 0 4px 20px rgba(51, 204, 153, 0.15),
                inset 0 0 20px rgba(51, 204, 153, 0.05);
  }
  
  .event-title {
    font-size: 0.875rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .event-card:not(.has-image):hover {
    border-color: rgba(51, 204, 153, 0.5);
    background: rgba(0, 0, 0, 0.7);
  }
  
  /* Hover Overlay Container */
  .hover-overlay-container {
    pointer-events: none !important;
    transition: opacity 0.2s ease-in-out;
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
    animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 320px;
    max-width: 400px;
    pointer-events: auto;
  }

  @keyframes fadeInUp {
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

    /* Optimize background images on mobile for performance */
    .event-card-bg-image {
      filter: blur(1px) saturate(1.1); /* Slightly more blur on mobile */
      opacity: 0.25; /* Slightly more transparent */
      /* Simpler animation on mobile */
      animation: fadeIn 0.8s ease-out, mobileImageReveal 15s ease-in-out infinite;
      animation-delay: 0s, var(--delay);
    }

    @keyframes mobileImageReveal {
      0%, 100% {
        opacity: 0.25;
        filter: blur(1px) saturate(1.1);
      }
      20% {
        opacity: 0.5;
        filter: blur(0.5px) saturate(1.3);
      }
    }

    .event-card:hover .event-card-bg-image {
      opacity: 0.3; /* Less dramatic hover effect on mobile */
      filter: blur(0.5px) saturate(1.2);
    }

    /* Simplify gradients on mobile */
    .event-card-gradient-3 {
      display: none; /* Remove the third gradient layer on mobile */
    }

    /* Reduce animation complexity on mobile */
    .event-card.has-image {
      animation: none; /* Disable card breathing on mobile */
    }

    .event-card-content {
      animation: none; /* Disable content pulse on mobile */
    }

    .event-card-gradient-1,
    .event-card-gradient-2 {
      animation: none; /* Disable gradient animations on mobile */
    }
  }
  
  /* Smooth scrolling for all browsers */
  .schedule-wrapper {
    scroll-behavior: smooth;
  }

  /* Workshop Registration Styles */
  .workshop-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .register-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(51, 204, 153, 0.2);
    border: 1px solid rgba(51, 204, 153, 0.5);
    border-radius: 4px;
    color: #33cc99;
    transition: all 0.2s;
    cursor: pointer;
  }

  .register-btn:hover {
    background: rgba(51, 204, 153, 0.3);
    border-color: #33cc99;
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(51, 204, 153, 0.3);
  }

  .registered-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(51, 204, 153, 0.3);
    border: 1px solid #33cc99;
    border-radius: 4px;
    color: #33cc99;
    cursor: pointer;
    transition: all 0.2s;
  }

  .registered-badge:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
    transform: scale(1.1);
  }

  .full-badge {
    padding: 0.125rem 0.375rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 4px;
    color: #ef4444;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* Workshop Capacity Bar */
  .workshop-capacity {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .capacity-bar {
    flex: 1;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .capacity-fill {
    height: 100%;
    background: linear-gradient(90deg, #33cc99, #22aa77);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .capacity-fill.full {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }

  .countdown-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.5);
    border-radius: 4px;
    color: #fbbf24;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .capacity-text {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
  }

  /* Adjust event card for workshop styles */
  .event-card.has-workshop {
    border-color: rgba(51, 204, 153, 0.3);
  }

  .event-card.has-workshop.registered {
    background: rgba(51, 204, 153, 0.05);
    border-color: rgba(51, 204, 153, 0.4);
  }

  /* Mobile optimizations for workshop features */
  @media (max-width: 768px) {
    .register-btn,
    .registered-badge {
      width: 24px;
      height: 24px;
    }

    .workshop-capacity {
      margin-top: 0.375rem;
    }
  }
</style>
