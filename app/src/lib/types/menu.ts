import type { PortableTextBlock } from '@portabletext/types'
import type { Image } from '@sanity/types'

export type MenuKey = 'workshops' | 'join' | 'about'

export type NavigationType = 'megamenu' | 'direct'

export type ComponentSectionType = 
  | 'aboutUs'
  | 'artists'
  | 'events'
  | 'faq'
  | 'founder'
  | 'hero'
  | 'intro'
  | 'logos'
  | 'newsletter'
  | 'pricing'
  | 'team'
  | 'testimonials'
  | 'welcome'

export type IntroSectionItem = {
  icon: 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller'
  title: string
  description: string
}

export type IntroSection = {
  title: PortableTextBlock[] | string
  description: string
  image?: {
    asset: Image
    alt?: string
  }
  items?: IntroSectionItem[] | null
}

export type AboutUsSection = {
  tagline: string
  title: string
  paragraphs: string[]
  cta: {
    text: string
    link: string
  }
  mainImage?: {
    asset: Image
    alt?: string
  }
}

export type FAQItem = {
  _id: string
  question: string
  answer: string
  category?: string
  order?: number
}

export type FAQSection = {
  title: PortableTextBlock[]
  description?: string
  selectedFaqs: FAQItem[]
  showCategories?: boolean
}

export type Logo = {
  _id: string
  name: string
  image: {
    asset: Image
    alt: string
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
  order: number
}

export type LogosSection = {
  title: PortableTextBlock[]
  description: string
  selectedLogos: Logo[]
  showButton: boolean
}

export type TeamMember = {
  _id: string
  name: string
  role: string
  image: {
    asset: Image
    alt?: string
  }
  socials?: {
    instagram?: string
    soundcloud?: string
  }
}

export type TeamSectionConfig = {
  title: PortableTextBlock[]
  description?: string
  selectedMembers: TeamMember[]
  showLoadMoreButton: boolean
}

export type HeroSection = {
  title: string
  subtitle: string
  backgroundImages?: {
    asset: Image
    alt?: string
  }[]
  transitionInterval?: number
}

export type ArtistsSection = {
  title: string
  description?: string
  displayType: 'grid' | 'slider'
  selectedArtists: Array<{
    _ref: string
    _type: 'reference'
  }>
  isLineupRevealed: boolean
}

export type TestimonialsSection = {
  title: string
  subtitle?: string
  testimonials: Array<{
    _ref: string
    _type: 'reference'
  }>
}

export type ComponentSection = {
  _type: 'componentSection'
  type: ComponentSectionType
  id: string
  introSection?: IntroSection
  aboutUsSection?: AboutUsSection
  faqSection?: FAQSection
  logosSection?: LogosSection
  teamSectionConfig?: TeamSectionConfig
  heroSection?: HeroSection,
  artistsSection?: ArtistsSection,
  testimonialsSection?: TestimonialsSection
}

export type ContentSection = {
  _type: 'contentSection'
  id: string
  title: string
  content: any[] // Portable Text Block Content
}

export type Page = {
  _type: 'page'
  title: string
  slug: { current: string }
  description?: string
  enableSectionNav: boolean
  sections: (ComponentSection | ContentSection)[]
  seo?: any
}

export type PageReference = {
  _ref: string
  _type: 'reference'
} | {
  _id: string
  _type: 'page'
  slug: { current: string }
}

export type MenuItem = {
  type: NavigationType
  title: string
  pageLink?: PageReference
  sectionId?: string
  directLink?: string
  featured?: {
    title: string
    description: string
    image: any
    link: string
    linkType: 'anchor' | 'page'
  }
  columns?: Array<{
    title: string
    items: Array<{
      label: string
      link: string
      linkType: 'anchor' | 'page'
    }>
  }>
  quickLinks?: Array<{
    label: string
    link: string
    linkType: 'anchor' | 'page'
  }>
}

export type MenuItems = {
  [key in MenuKey]?: MenuItem
}
