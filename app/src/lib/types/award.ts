import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImage } from './image';
import type { TransformedArtist } from '$lib/sanity/queries/artists';

export type IconName = 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';

export interface Award {
  hero: {
    heading: string;
    subheading?: string;
    eyebrow?: string;
    backgroundImages: SanityImage[];
    primaryButton?: {
      text: string;
      link: string;
    };
    secondaryButton?: {
      text: string;
      link: string;
    };
  };
  introText?: PortableTextBlock[];
  evaluationCriteriaTitle: string;
  evaluationCriteriaSubtitle: string;
  liveBattleTitle: string;
  preselectionCriteria: {
    title: string;
    mixSetTitle: string;
    mixSetDescription: string;
    mixSetPercentage: number;
    onlinePresenceTitle: string;
    onlinePresenceDescription: string;
    onlinePresencePercentage: number;
  };
  totalProgressBar: {
    title: string;
  };
  evaluationCriteria: {
    title: string;
    description: string;
    icon: IconName;
  }[];
  artistsSection: {
    title: string;
    subtitle: string;
    isLineupRevealed: boolean;
    artists: TransformedArtist[];
  };
}