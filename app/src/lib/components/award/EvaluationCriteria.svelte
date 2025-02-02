<script lang="ts">
  import { onMount } from 'svelte';
  import PreselectionCriterion from './PreselectionCriterion.svelte';
  import LiveBattleCriterion from './LiveBattleCriterion.svelte';

  // Type definitions
  interface PreselectionCriteria {
    title: string;
    mixSetTitle: string;
    mixSetDescription: string;
    mixSetPercentage: number;
    onlinePresenceTitle: string;
    onlinePresenceDescription: string;
    onlinePresencePercentage: number;
  }

  interface TotalProgressBar {
    title: string;
  }

  interface Criterion {
    title: string;
    description: string;
    icon: string;
  }

  interface VisibleEntry {
    index: number;
    visibility: number;
  }

  // Props with default values
  export let evaluationCriteriaTitle = 'Beurteilungskriterien';
  export let evaluationCriteriaSubtitle = 'Dein Weg zum DJ Award 2024';
  export let liveBattleTitle = 'Live-Battle';
  export let preselectionCriteria: PreselectionCriteria | undefined = undefined;
  export let totalProgressBar: TotalProgressBar | undefined = undefined;
  export let evaluationCriteria: Criterion[] = [];
  

  // State variables
  let activeCriterion = 0;
  let criteriaElements: HTMLElement[] = [];
  let container: HTMLDivElement;
  let observer: IntersectionObserver | null = null;

  // Calculate total progress with nullish coalescing
  $: totalProgress = preselectionCriteria
    ? (preselectionCriteria.mixSetPercentage + preselectionCriteria.onlinePresencePercentage) 
    : 100; // Immer 100% anzeigen, wenn preselectionCriteria nicht vorhanden ist

  function findMostVisibleEntry(entries: IntersectionObserverEntry[]): VisibleEntry | null {
    let result: VisibleEntry | null = null;
    const windowHeight = window.innerHeight;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const rect = entry.boundingClientRect;
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceToCenter = Math.abs(elementCenter - viewportCenter);
        const visibility = 1 - Math.min(distanceToCenter / (windowHeight / 2), 1);
        const index = criteriaElements.findIndex((el) => el === entry.target);

        if (index !== -1) {
          if (!result || visibility > result.visibility) {
            result = { index, visibility };
          }
        }
      }
    });

    return result;
  }

  function updateActiveCriterion(entries: IntersectionObserverEntry[]) {
    const mostVisible = findMostVisibleEntry(entries);
    if (mostVisible && mostVisible.visibility > 0.5) {
      activeCriterion = mostVisible.index;
    }
  }

  onMount(() => {
    try {
      observer = new IntersectionObserver(updateActiveCriterion, {
        root: null,
        rootMargin: '-35% 0px -35% 0px',
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      });

      criteriaElements.forEach((el) => observer?.observe(el));
    } catch (error) {
      console.error('Error initializing IntersectionObserver:', error);
    }

    return () => observer?.disconnect();
  });
</script>

<section id="criteria" class="bg-black">
  <div class="container mx-auto px-4 py-16">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-4xl lg:text-5xl font-medium text-center mb-4 text-gray-200">
        {evaluationCriteriaTitle}
      </h2>
      <p class="text-xl text-center text-gray-400 mb-12">{evaluationCriteriaSubtitle}</p>

      {#if preselectionCriteria}
        <div class="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 mb-12 border border-white/[0.05]">
          <h3 class="text-2xl font-medium mb-8 text-gray-200">{preselectionCriteria.title}</h3>
          <div class="space-y-8">
            <PreselectionCriterion
              title={preselectionCriteria.mixSetTitle ?? ''}
              description={preselectionCriteria.mixSetDescription ?? ''}
              percentage={preselectionCriteria.mixSetPercentage ?? 0}
            />
            <PreselectionCriterion
              title={preselectionCriteria.onlinePresenceTitle ?? ''}
              description={preselectionCriteria.onlinePresenceDescription ?? ''}
              percentage={preselectionCriteria.onlinePresencePercentage ?? 0}
            />
          </div>
        </div>
      {/if}

      {#if totalProgressBar}
        <div class="my-12 bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.05]">
          <h3 class="text-2xl font-medium mb-4 text-gray-200">{totalProgressBar.title}</h3>
          <div class="relative h-3 bg-white/[0.02] rounded-full overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full bg-gradient-to-r from-green-700 to-green-400 transition-all duration-1000 ease-out"
              style="width: {totalProgress}%"
            >
              <div class="absolute inset-0 bg-green-400/20 animate-pulse"></div>
            </div>
          </div>
          <p class="text-right mt-2 text-xl font-medium text-green-400">{totalProgress.toFixed(1)}%</p>
        </div>
      {/if}

      <div class="relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.05]">
        <h3 class="text-2xl font-medium mb-8 text-gray-200">{liveBattleTitle}</h3>

        <div class="relative min-h-[80vh]" bind:this={container}>
          <div class="scroll-container" style="padding-bottom: 25vh;">
            {#each evaluationCriteria as criterion, i}
              <div bind:this={criteriaElements[i]}>
                <LiveBattleCriterion
                  title={criterion.title ?? ''}
                  description={criterion.description ?? ''}
                  icon={criterion.icon ?? ''}
                  isActive={i === activeCriterion}
                  index={i}
                  isLast={i === evaluationCriteria.length - 1}
                />
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .scroll-container {
    position: relative;
    z-index: 1;
  }

  :global(.criteria-item) {
    z-index: var(--criteria-z-index, 1);
  }

  :global(.criteria-item.is-sticky) {
    --criteria-z-index: 2;
  }
</style>