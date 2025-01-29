import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {
      name: 'hero',
      title: 'Hero & Intro',
      default: true
    },
    {
      name: 'main',
      title: 'Main Content'
    },
    {
      name: 'team',
      title: 'Team & Artists'
    },
    {
      name: 'testimonials',
      title: 'Testimonials & Logos'
    },
    {
      name: 'additional',
      title: 'Additional Sections'
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
      group: 'hero',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow Text',
          type: 'string',
          description: 'Kleiner Text über der Hauptüberschrift',
          initialValue: 'von DJs für DJs'
        }),
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          description: 'Die Hauptüberschrift der Hero-Sektion'
        }),
        defineField({
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
          description: 'Der Untertitel unter den Buttons'
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
        }),
        defineField({
          name: 'primaryButton',
          title: 'Primärer Button',
          type: 'object',
          description: 'Hauptbutton in der Hero-Sektion',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string'
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'secondaryButton',
          title: 'Sekundärer Button',
          type: 'object',
          description: 'Zusätzlicher Button in der Hero-Sektion',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string'
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string'
            })
          ]
        })
      ],
    }),
    defineField({
      name: 'aboutSection',
      title: 'About Us Section',
      type: 'aboutUsSection',
      group: 'main',
    }),
    defineField({
      name: 'intro',
      title: 'Intro Section',
      type: 'object',
      group: 'hero',
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
          type: 'array',
          of: [{type: 'block'}],
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
        }),
        defineField({
          name: 'cta',
          title: 'Primärer Button',
          type: 'object',
          description: 'Hauptbutton für die Intro-Sektion',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string'
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'secondaryCta',
          title: 'Sekundärer Button',
          type: 'object',
          description: 'Zusätzlicher Button für die Intro-Sektion',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string'
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string'
            })
          ]
        })
      ],
    }),
    defineField({
      name: 'workshopsSection',
      title: 'Workshops Section',
      type: 'object',
      group: 'additional',
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
      group: 'additional',
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
      name: 'artistsSection',
      title: 'Artists Section',
      type: 'artistsSection',
      group: 'team',
      validation: rule => rule.required(),
      description: 'Konfigurieren Sie die Artists-Sektion mit Grid oder Slider Ansicht',
      initialValue: {
        displayType: 'slider',
        isLineupRevealed: true
      }
    }),
    defineField({
      name: 'testimonialsSection',
      title: 'Testimonials Section',
      type: 'testimonialsSection',
      group: 'testimonials',
    }),
    defineField({
      name: 'logosSection',
      title: 'Logos Section',
      type: 'logosSection',
      group: 'testimonials',
    }),
    defineField({
      name: 'faqSection',
      title: 'FAQ Section',
      type: 'faqSection',
      group: 'additional',
    }),
    defineField({
      name: 'newsletterSection',
      title: 'Newsletter Section',
      type: 'object',
      group: 'additional',
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
