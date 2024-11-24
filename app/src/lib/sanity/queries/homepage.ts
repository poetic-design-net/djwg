import groq from 'groq'
import type { PortableTextBlock } from '@portabletext/types'

export interface HomePage {
  hero: {
    title: string
    subtitle: string
    backgroundImage: {
      asset: {
        _ref: string
        _type: string
      }
      _type: string
    }
  }
  aboutSection: {
    tagline: string
    title: string
    paragraphs: string[]
    mainImage: {
      asset: {
        _ref: string
        _type: string
      }
      alt: string
    }
    cta: {
      text: string
      link: string
    }
  }
  intro: {
    title: PortableTextBlock[]
    description: string
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
}

export const homePageQuery = groq`*[_type == "homePage"][0]{
  hero {
    title,
    subtitle,
    backgroundImage {
      _type,
      asset->{
        _ref,
        _type
      }
    }
  },
  aboutSection {
    tagline,
    title,
    paragraphs,
    mainImage {
      asset->,
      alt
    },
    cta {
      text,
      link
    }
  },
  intro {
    title,
    description
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
  }
}`
