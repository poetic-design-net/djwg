import groq from 'groq'
import type { PortableTextBlock } from '@portabletext/types'
import type { Image } from '@sanity/types'

import type { IntroSectionItem, Logo as MenuLogo } from '$lib/types/menu';
import type { Artist } from './artists';
import type { SanityImage } from './index';

export interface HomePage {
  hero: {
    title: string
    subtitle: string
    eyebrow: string
    backgroundImages: {
      asset: {
        _type: 'reference'
        _ref: string
      } & Image
      alt?: string
      hotspot?: {
        x: number
        y: number
        height: number
        width: number
      }
      crop?: {
        top: number
        bottom: number
        left: number
        right: number
      }
    }[]
    transitionInterval: number
    primaryButton?: {
      text: string
      link: string
    }
    secondaryButton?: {
      text: string
      link: string
    }
  }
  aboutSection: {
    tagline: string
    title: string
    paragraphs: string[]
    mainImage: {
      asset: {
        _type: 'reference'
        _ref: string
      } & Image
      alt?: string
      hotspot?: {
        x: number
        y: number
        height: number
        width: number
      }
      crop?: {
        top: number
        bottom: number
        left: number
        right: number
      }
    }
    cta: {
      text: string
      link: string
    }
  }
  intro: {
    title: PortableTextBlock[]
    description: PortableTextBlock[]
    image: {
      asset: {
        _type: 'reference'
        _ref: string
      } & Image
      alt?: string
      hotspot?: {
        x: number
        y: number
        height: number
        width: number
      }
      crop?: {
        top: number
        bottom: number
        left: number
        right: number
      }
    }
    cta?: {
      text: string
      link: string
    }
    secondaryCta?: {
      text: string
      link: string
    }
  }
  workshopsSection: {
    title: string
    description: string
  }
  pricingSection: {
    title: string
    description: string
    selectedEvent?: {
      _id: string
      title: string
      date: string
    }
    showEventSelector?: boolean
    tickets: {
      _id: string
      phase: string
      title: string
      description: string
      features: string[]
      status: 'completed' | 'current' | 'coming-soon'
      price: number
      currency: string
      url?: string
    }[]
  }
  newsletterSection: {
    title: string
    description: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: string
  }
  enableSectionNav?: boolean
  artistsSection?: {
    title: string
    description: string
    displayType: 'grid' | 'slider'
    selectedArtists: Artist[]
    isLineupRevealed: boolean
  }
}

export const homePageQuery = groq`*[_type == "homePage"][0]{
  _id,
  artistsSection {
    title,
    description,
    displayType,
    selectedArtists[]->{
      _id,
      name,
      role,
      image {
        "asset": {
          "_type": "reference",
          "_ref": asset->._id,
          ...asset->
        },
        hotspot
      },
      description,
      socials {
        instagram,
        soundcloud
      },
      isRevealed,
      order
    },
    isLineupRevealed
  },
  hero {
    title,
    subtitle,
    eyebrow,
    backgroundImages[] {
      "asset": {
        "_type": "reference",
        "_ref": asset->._id,
        ...asset->
      },
      alt,
      hotspot,
      crop
    },
    transitionInterval,
    primaryButton {
      text,
      link
    },
    secondaryButton {
      text,
      link
    }
  },
  aboutSection {
    tagline,
    title,
    paragraphs,
    mainImage {
      "asset": {
        "_type": "reference",
        "_ref": asset->._id,
        ...asset->
      },
      alt,
      hotspot,
      crop
    },
    cta {
      text,
      link
    }
  },
  intro {
    title,
    description,
    image {
      "asset": {
        "_type": "reference",
        "_ref": asset->._id,
        ...asset->
      },
      alt,
      hotspot,
      crop
    },
    cta {
      text,
      link
    },
    secondaryCta {
      text,
      link
    }
  },
  workshopsSection {
    title,
    description
  },
  pricingSection {
    title,
    description,
    selectedEvent->{
      _id,
      title,
      date
    },
    showEventSelector,
    tickets[]-> {
      _id,
      phase,
      title,
      description,
      features,
      status,
      price,
      currency,
      url
    }
  },
  newsletterSection {
    title,
    description
  },
  seo {
    metaTitle,
    metaDescription,
    ogImage
  },
  enableSectionNav
}`
