import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Seiten',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Inhalt',
    },
    {
      name: 'seo',
      title: 'SEO',
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'content'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      group: 'content'
    }),
    defineField({
      name: 'content',
      title: 'Inhalt',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content'
    }),
    defineField({
      name: 'seo',
      title: 'SEO Einstellungen',
      type: 'seo',
      group: 'seo'
    })
  ]
}) 