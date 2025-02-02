import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImage } from './image';
import type { TransformedArtist } from '$lib/sanity/queries/artists';
import type { Ticket } from './ticket';

export type IconName = 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';

export interface Award {
  readonly hero: {
    readonly heading: string;
    readonly subheading?: string;
    readonly eyebrow?: string;
    readonly backgroundImages: readonly SanityImage[];
    readonly primaryButton?: Record<string, string>;
    readonly secondaryButton?: Record<string, string>;
  };
  readonly introText?: readonly PortableTextBlock[];
  readonly evaluationCriteriaTitle: string;
  readonly evaluationCriteriaSubtitle: string;
  readonly liveBattleTitle: string;
  readonly preselectionCriteria: {
    readonly title: string;
    readonly mixSetTitle: string;
    readonly mixSetDescription: string;
    readonly mixSetPercentage: number;
    readonly onlinePresenceTitle: string;
    readonly onlinePresenceDescription: string;
    readonly onlinePresencePercentage: number;
  };
  readonly totalProgressBar: {
    readonly title: string;
  };
  readonly evaluationCriteria: readonly {
    readonly title: string;
    readonly description: string;
    readonly icon: IconName;
  }[];
  readonly artistsSection: {
    readonly title: string;
    readonly subtitle: string;
    readonly isLineupRevealed: boolean;
    readonly artists: readonly TransformedArtist[];
  };
  readonly ticket?: Ticket;
}