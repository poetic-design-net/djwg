import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true
    },
    {
      name: 'settings',
      title: 'Settings'
    }
  ],
  fields: [
    // Settings Fields
    defineField({
      name: 'enableSectionNav',
      title: 'Enable Section Navigation',
      description: 'Aktiviere die Seiten-Navigation mit Punkten am rechten Rand',
      type: 'boolean',
      initialValue: true,
      group: 'settings'
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'settings'
    }),
    // Content Fields
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
        }),
        defineField({
          name: 'backgroundImages',
          title: 'Background Images',
          description: 'Füge mehrere Bilder hinzu, die automatisch durchgewechselt werden. Mindestens ein Bild ist erforderlich.',
          type: 'array',
          of: [
            defineField({
              type: 'image',
              name: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative Text',
                  description: 'Beschreibung des Bildes für Screenreader und SEO.',
                  validation: rule => rule.required()
                })
              ]
            })
          ],
          validation: rule => rule.required().min(1)
        }),
        defineField({
          name: 'transitionInterval',
          title: 'Bildwechsel-Interval',
          description: 'Zeit in Sekunden zwischen den Bildwechseln',
          type: 'number',
          initialValue: 7.5,
          validation: rule => rule.required().min(1).max(20)
        })
      ],
    }),
    defineField({
      name: 'aboutSection',
      title: 'About Us Section',
      type: 'aboutUsSection',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      title: 'Intro Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'array',
          of: [{type: 'block'}],
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          description: 'The image shown in the intro section',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Important for SEO and accessibility.'
            })
          ]
        })
      ],
    }),
    defineField({
      name: 'workshopsSection',
      title: 'Workshops Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'pricingSection',
      title: 'Pricing Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'newsletterSection',
      title: 'Newsletter Section',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
        }),
      ],
    })
  ],
  preview: {
    select: {
      title: 'hero.title',
    },
    prepare({ title }: { title: string }) {
      return {
        title: 'Homepage',
        subtitle: title,
      }
    },
  },
})
