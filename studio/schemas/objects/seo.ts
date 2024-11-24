import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Titel',
      type: 'string',
      description: 'Titel für Suchmaschinen (max. 60 Zeichen)',
      validation: Rule => Rule.max(60)
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Beschreibung',
      type: 'text',
      description: 'Beschreibung für Suchmaschinen (max. 160 Zeichen)',
      validation: Rule => Rule.max(160)
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Media Vorschaubild',
      type: 'image',
      description: 'Wird in Social Media Shares angezeigt (Ideal: 1200x630px)'
    })
  ]
}) 