import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'content',
      type: 'array',
      title: 'Content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'enableSectionNav',
      title: 'Enable Section Navigation',
      type: 'boolean',
      description: 'Enable the section navigation dots on this page',
      initialValue: false,
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'componentSection',
          title: 'Component Section',
          fields: [
            defineField({
              name: 'type',
              title: 'Section Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Hero Section', value: 'hero' },
                  { title: 'Intro Section mit Features (Intro)', value: 'intro' },
                  { title: 'Split Content Section mit CTA (About Us)', value: 'aboutUs' },
                  { title: 'Artists Section', value: 'artists' },
                  { title: 'Events', value: 'events' },
                  { title: 'FAQ', value: 'faq' },
                  { title: 'Founder', value: 'founder' },
                  { title: 'Logos', value: 'logos' },
                  { title: 'Newsletter', value: 'newsletter' },
                  { title: 'Pricing', value: 'pricing' },
                  { title: 'Team', value: 'team' },
                  { title: 'Testimonials', value: 'testimonials' },
                  { title: 'Merch Shop', value: 'merch' }
                ]
              }
            }),
            defineField({
              name: 'id',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for section linking (used in URLs)',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'introSection',
              title: 'Intro Section Settings',
              type: 'introSection',
              hidden: ({ parent }) => parent?.type !== 'intro' && parent?.type !== 'welcome'
            }),
            defineField({
              name: 'aboutUsSection',
              title: 'About Us Section Settings',
              type: 'aboutUsSection',
              hidden: ({ parent }) => parent?.type !== 'aboutUs'
            }),
            defineField({
              name: 'faqSection',
              title: 'FAQ Section Settings',
              type: 'faqSection',
              hidden: ({ parent }) => parent?.type !== 'faq'
            }),
            defineField({
              name: 'heroSection',
              title: 'Hero Section Settings',
              type: 'heroSection',
              hidden: ({ parent }) => parent?.type !== 'hero'
            }),
            defineField({
              name: 'logosSection',
              title: 'Logos Section Settings',
              type: 'logosSection',
              hidden: ({ parent }) => parent?.type !== 'logos'
            }),
            defineField({
              name: 'artistsSection',
              title: 'Artists Section Settings',
              type: 'artistsSection',
              hidden: ({ parent }) => parent?.type !== 'artists'
            }),
            defineField({
              name: 'testimonialsSection',
              title: 'Testimonials Section Settings',
              type: 'testimonialsSection',
              hidden: ({ parent }) => parent?.type !== 'testimonials'
            }),
            defineField({
              name: 'pricingSection',
              title: 'Pricing Section Settings',
              type: 'pricingSection',
              hidden: ({ parent }) => parent?.type !== 'pricing'
            }),
            defineField({
              name: 'merchSection',
              title: 'Merch Section Settings',
              type: 'merchSection',
              hidden: ({ parent }) => parent?.type !== 'merch'
            })
          ]
        },
        {
          type: 'object',
          name: 'contentSection',
          title: 'Content Section',
          fields: [
            defineField({
              name: 'id',
              title: 'Section ID',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            }),
            defineField({
              name: 'content',
              type: 'array',
              title: 'Content',
              of: [{ type: 'block' }],
            })
          ]
        }
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo'
    })
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug',
    },
    prepare({ title, slug }: any) {
      return {
        title,
        subtitle: slug?.current ? `/${slug.current}` : 'No slug',
      }
    },
  },
})
