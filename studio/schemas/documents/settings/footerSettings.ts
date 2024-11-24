import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'footerSettings',
  title: 'Footer Einstellungen',
  type: 'document',
  fields: [
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'eventsNavigation',
      title: 'Events Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'infoNavigation',
      title: 'Info Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Plattform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'TikTok', value: 'tiktok' }
                ]
              },
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: Rule => Rule.required()
            })
          ]
        }
      ],
      validation: Rule => Rule.required()
    })
  ]
})
