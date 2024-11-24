import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Seiten',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string'
    }),
    defineField({
      name: 'slug',
      title: 'Route',
      type: 'slug',
      options: {
        source: 'title'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo'
    })
  ]
}) 