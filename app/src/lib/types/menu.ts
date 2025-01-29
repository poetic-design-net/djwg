import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImage } from '$lib/sanity/image'
import type { NavigationItem, LinkType } from '$lib/sanity/queries/navigation'

export type MenuKey = string

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
  | 'merch'

export type IntroSectionItem = {
  icon: 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller'
  title: string
  description: string
}

export type IntroSection = {
  title: PortableTextBlock[] | string
  description: PortableTextBlock[]
  image?: SanityImage
  items?: IntroSectionItem[] | null
  cta?: {
    text: string
    link: string
  }
  secondaryCta?: {
    text: string
    link: string
  }
}

export type AboutUsSection = {
  tagline: string
  title: string
  paragraphs: string[]
  cta: {
    text: string
    link: string
  }
  mainImage?: SanityImage
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
  image: SanityImage
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
  image: SanityImage
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
  backgroundImages?: SanityImage[]
  transitionInterval?: number
}

export type ArtistsSection = {
  eyebrow?: string
  title: string
  description?: string
  displayType: 'grid' | 'slider'
  selectedArtists: Array<{
    _id: string
    name: string
    image: SanityImage
    [key: string]: any
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

export type PricingSection = {
  title: string
  description: string
  showEventSelector?: boolean
  selectedTickets: Array<{
    _type: 'reference'
    _ref: string
  }>
}

export type MerchProduct = {
  _id: string
  title: string
  description: string
  features: string[]
  price: number
  currency: string
  image?: SanityImage
  shopUrl: string
}

export type MerchSection = {
  title: string
  description: string
  products: Array<MerchProduct>
}

export type Section = {
  _type: string
  id?: string
  type?: ComponentSectionType
  title?: string
  content?: any[] // Portable Text Block Content
  introSection?: IntroSection
  aboutUsSection?: AboutUsSection
  faqSection?: FAQSection
  logosSection?: LogosSection
  teamSectionConfig?: TeamSectionConfig
  heroSection?: HeroSection
  artistsSection?: ArtistsSection
  testimonialsSection?: TestimonialsSection
  pricingSection?: PricingSection
  merchSection?: MerchSection
}

export type Page = {
  _type: 'page'
  title: string
  slug: string
  description?: string
  enableSectionNav: boolean
  sections: Section[]
  seo?: any
}

export type PageReference = {
  _ref: string
  _type: 'reference'
} | {
  _id: string
  _type: 'page'
  slug: string
}

export interface MenuItem extends NavigationItem {
  directLink?: string
}

export type MenuItems = MenuItem[]
