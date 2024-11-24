<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';

  export let sections: { id: string; label: string }[] = [];
  export let enabled: boolean = true;
  export let pageTitle: string = '';

  let currentSection = '';
  let showToast = false;
  let toastTimeout: NodeJS.Timeout;
  let isAtTop = true;
  let lastSectionChange = 0;
  let showNav = true;
  const SECTION_CHANGE_DELAY = 500;

  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleSectionChange = debounce((newSection: string) => {
    const now = Date.now();
    if (now - lastSectionChange < SECTION_CHANGE_DELAY) {
      return;
    }
    
    if (currentSection !== newSection) {
      currentSection = newSection;
      lastSectionChange = now;
      clearTimeout(toastTimeout);
      showToast = true;
      toastTimeout = setTimeout(() => {
        showToast = false;
      }, 2000);
    }
  }, 100);

  const checkScrollPosition = debounce(() => {
    isAtTop = window.scrollY === 0;
  }, 100);

  onMount(() => {
    if (!enabled) return;

    if (sections.length > 0) {
      currentSection = sections[0].id;
    }

    window.addEventListener('scroll', checkScrollPosition);

    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleSections = entries.filter(entry => entry.isIntersecting);

      if (visibleSections.length > 0) {
        const firstSectionEntry = entries.find(entry => entry.target.id === sections[0]?.id);
        if (firstSectionEntry && firstSectionEntry.intersectionRatio > 0.2 && window.scrollY < 300) {
          handleSectionChange(sections[0].id);
          return;
        }

        const significantlyVisible = visibleSections.filter(entry => entry.intersectionRatio > 0.5);
        if (significantlyVisible.length > 0) {
          const mostVisible = significantlyVisible.reduce((prev, current) => 
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          );
          handleSectionChange(mostVisible.target.id);
        }
      } else if (window.scrollY === 0) {
        handleSectionChange(sections[0]?.id);
      }
    }, {
      threshold: [0.2, 0.5, 0.8],
      rootMargin: '-10% 0px -10% 0px'
    });

    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          showNav = false;
        } else {
          setTimeout(() => {
            showNav = true;
          }, 100);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '150px 0px 0px 0px'
    });

    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) sectionObserver.observe(element);
    });

    const footer = document.querySelector('footer');
    if (footer) footerObserver.observe(footer);

    return () => {
      sectionObserver.disconnect();
      footerObserver.disconnect();
      clearTimeout(toastTimeout);
      window.removeEventListener('scroll', checkScrollPosition);
    };
  });

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  $: currentSectionLabel = sections.find(s => s.id === currentSection)?.label || '';
  $: displayTitle = pageTitle || $page.url.pathname.split('/').pop()?.replace(/-/g, ' ') || '';
  $: isTicketsSection = (section: { id: string; label: string }) => section.id === 'tickets';
</script>

{#if enabled}
  <!-- Toast Notification -->
  {#if showToast}
    <div
      transition:fade={{ duration: 300 }}
      class="fixed left-1/2 top-4 transform -translate-x-1/2 z-[300] px-6 py-3 rounded-full bg-black/40 backdrop-blur-sm border border-green-500/20"
    >
      <div class="text-gray-300 text-xs mb-1 font-medium text-center">
        <span>
        {#if displayTitle}
          {displayTitle} - 
        {/if}
        </span>
        <span class="block text-green-500 text-sm">
          {currentSectionLabel}
        </span>
      </div>
    </div>
  {/if}

  <!-- Section Navigation -->
  {#if showNav}
    <div
      transition:fade={{ duration: 300 }}
      class="fixed right-4 top-1/2 transform -translate-y-1/2 z-[300] hidden lg:block"
    >
      <div class="group flex flex-col items-end gap-4 p-4 rounded-2xl hover:bg-black/20 backdrop-blur-sm transition-all duration-300">
        {#each sections as section, index}
          <button
            class="flex items-center gap-2 w-full justify-end"
            on:click={() => scrollToSection(section.id)}
          >
            <span 
              class={`
                text-xs transition-all duration-200 mr-2 px-3 py-1 rounded-full
                ${isTicketsSection(section)
                  ? 'text-green-500 border border-green-500/20 hover:bg-green-500/10 opacity-100'
                  : currentSection === section.id
                    ? 'text-white border border-white/20 bg-white/10 opacity-100'
                    : 'text-white/60 group-hover:opacity-100 opacity-0 hover:text-white/80'
                }
              `}
            >
              {section.label}
            </span>
            <div 
              class={`w-2 h-2 rounded-full transition-all duration-300 ${
                isTicketsSection(section)
                  ? 'bg-green-500'
                  : currentSection === section.id 
                    ? 'bg-white scale-125' 
                    : 'bg-white/10 group-hover:bg-white/60'
              } ${index === 0 && isAtTop ? 'animate-pulse-slow' : ''}`}
            />
          </button>
        {/each}
      </div>
    </div>
  {/if}
{/if}

<style>
  @keyframes pulse-slow {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.7;
    }
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
