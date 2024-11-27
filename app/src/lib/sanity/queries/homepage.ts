import groq from 'groq'
import type { PortableTextBlock } from '@portabletext/types'
import type { Image } from '@sanity/types'

interface SanityImage extends Image {
  alt?: string;
}

export interface HomePage {
  hero: {
    title: string
    subtitle: string
    backgroundImage: SanityImage
  }
  aboutSection: {
    tagline: string
    title: string
    paragraphs: string[]
    mainImage: SanityImage
    cta: {
      text: string
      link: string
    }
  }
  intro: {
    title: PortableTextBlock[]
    description: string
    image: SanityImage
  }
  workshopsSection: {
    title: string
    description: string
  }
  pricingSection: {
    title: string
    description: string
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
}

export const homePageQuery = groq`*[_type == "homePage"][0]{
  hero {
    title,
    subtitle,
    backgroundImage {
      asset->,
      alt,
      hotspot,
      crop
    }
  },
  aboutSection {
    tagline,
    title,
    paragraphs,
    mainImage {
      asset->,
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
      asset->,
      alt,
      hotspot,
      crop
    }
  },
  workshopsSection {
    title,
    description
  },
  pricingSection {
    title,
    description
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
