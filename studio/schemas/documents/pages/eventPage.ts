import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'eventPage',
  title: 'Event Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Seitentitel',
      type: 'string',
      description: 'Titel für die Event-Übersichtsseite'
    }),
    defineField({
      name: 'seo',
      title: 'SEO Einstellungen',
      type: 'object',
      description: 'SEO Einstellungen speziell für die Event-Übersichtsseite (/events)',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Titel',
          type: 'string',
          description: 'Titel für Suchmaschinen (max. 60 Zeichen)',
          validation: Rule => Rule.max(60)
        },
        {
          name: 'metaDescription',
          title: 'Meta Beschreibung',
          type: 'text',
          description: 'Beschreibung für Suchmaschinen (max. 160 Zeichen)',
          validation: Rule => Rule.max(160)
        },
        {
          name: 'ogImage',
          title: 'Social Media Vorschaubild',
          type: 'image',
          description: 'Wird in Social Media Shares angezeigt (Ideal: 1200x630px)'
        }
      ]
    })
  ]
})
