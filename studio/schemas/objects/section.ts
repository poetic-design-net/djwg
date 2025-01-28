import type { SchemaTypeDefinition, Rule } from 'sanity'

const section: SchemaTypeDefinition = {
  name: 'section',
  title: 'Section',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Section Type',
      type: 'string',
      options: {
        list: [
          { title: 'Hero Section', value: 'hero' },
          { title: 'Hero Section mit Features (Intro)', value: 'intro' },
          { title: 'Split Content Section mit CTA (About Us)', value: 'aboutUs' },
          { title: 'FAQ Section', value: 'faq' },
          { title: 'Artists Section', value: 'artists' },
          { title: 'Events', value: 'events' },
          { title: 'Founder', value: 'founder' },
          { title: 'Logos', value: 'logos' },
          { title: 'Newsletter', value: 'newsletter' },
          { title: 'Pricing', value: 'pricing' },
          { title: 'Team', value: 'team' },
          { title: 'Testimonials', value: 'testimonials' },
          { title: 'Welcome', value: 'welcome' }
        ]
      }
    },
    {
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Unique identifier for section linking (used in URLs)',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'heroSection',
      title: 'Hero Section Content',
      type: 'heroSection',
      hidden: ({ parent }) => parent?.type !== 'hero'
    },
    {
      name: 'introSection',
      title: 'Intro Section Content',
      type: 'introSection',
      hidden: ({ parent }) => parent?.type !== 'intro'
    },
    {
      name: 'aboutUsSection',
      title: 'About Us Section Content',
      type: 'aboutUsSection',
      hidden: ({ parent }) => parent?.type !== 'aboutUs'
    },
    {
      name: 'faqSection',
      title: 'FAQ Section Content',
      type: 'faqSection',
      hidden: ({ parent }) => parent?.type !== 'faq'
    },
    {
      name: 'logosSection',
      title: 'Logos Section Content',
      type: 'logosSection',
      hidden: ({ parent }) => parent?.type !== 'logos'
    },
    {
      name: 'teamSectionConfig',
      title: 'Team Section Content',
      type: 'teamSectionConfig',
      hidden: ({ parent }) => parent?.type !== 'team'
    },
    {
      name: 'artistsSection',
      title: 'Artists Section Content',
      type: 'artistsSection',
      hidden: ({ parent }) => parent?.type !== 'artists'
    }
  ]
}

export default section
