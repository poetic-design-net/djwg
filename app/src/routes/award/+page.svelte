<script lang="ts">
  import type { PageData } from './$types';
  import type { Award } from '$lib/types/award';
  import type { SanityImageSource } from '$lib/sanity/image';
  import HeroStart from '$lib/components/hero/start.svelte';
  import ArtistsSlider from '$lib/components/ArtistsSlider.svelte';
  import EvaluationCriteria from '$lib/components/award/EvaluationCriteria.svelte';
  import PortableTextContent from '$lib/components/PortableTextContent.svelte';

  export let data: PageData;

  $: ({ award } = data);
  $: console.log('Award data in component:', award);
  $: heroBackgroundImages = award?.hero?.backgroundImages as SanityImageSource[] || [];
</script>

{#if award !== null}
  {#if award?.hero}
    <HeroStart
      title={award.hero.heading}
      subtitle={award.hero.subheading}
      eyebrow={award.hero.eyebrow}
      backgroundImages={heroBackgroundImages}
      primaryButton={award.hero.primaryButton}
      secondaryButton={award.hero.secondaryButton}
    />
  {/if}

  {#if award.introText}
    <div class="bg-black">
      <div class="container mx-auto px-4 py-24">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl lg:text-5xl font-medium text-center mb-12 text-gray-200">Deine Chance, die Bühne zu erobern</h2>
          <div class="prose prose-lg mx-auto prose-headings:font-medium prose-headings:text-gray-200 prose-p:text-gray-400">
            <PortableTextContent value={award.introText} />
          </div>
          <div class="mt-12 flex justify-center gap-6">
            <a 
              href="#" 
              class="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-600 rounded-full transition-colors duration-200"
            >
              Jetzt anmelden
            </a>
            <a 
              href="#criteria" 
              class="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              Kriterien ansehen
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if award.preselectionCriteria && award.evaluationCriteria}
    <div class="bg-black">
      <EvaluationCriteria
        evaluationCriteriaTitle={award.evaluationCriteriaTitle}
        evaluationCriteriaSubtitle={award.evaluationCriteriaSubtitle}
        liveBattleTitle={award.liveBattleTitle}
        preselectionCriteria={award.preselectionCriteria}
        totalProgressBar={award.totalProgressBar}
        evaluationCriteria={award.evaluationCriteria}
      />
    </div>
  {/if}

  {#if award.artistsSection?.artists && award.artistsSection.artists.length > 0}
    <div class="bg-black py-24">
      <ArtistsSlider 
        artists={award.artistsSection.artists}
        isLineupRevealed={award.artistsSection.isLineupRevealed}
        title={award.artistsSection.title}
        subtitle={award.artistsSection.subtitle}
      />
    </div>
  {/if}
{/if}