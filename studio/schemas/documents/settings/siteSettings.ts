import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {
      name: 'seo',
      title: 'SEO & Metadaten',
    },
    {
      name: 'general',
      title: 'Allgemeine Einstellungen',
    },
    {
      name: 'social',
      title: 'Social Media',
    },
    {
      name: 'contact',
      title: 'Kontakt',
    },
  ],
  fields: [
    // SEO Fields
    defineField({
      name: 'seo',
      title: 'Standard SEO Einstellungen',
      type: 'object',
      group: 'seo',
      description: 'Diese Einstellungen werden für die Startseite verwendet und als Fallback für andere Seiten',
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
          title: 'Standard OG Image',
          type: 'image',
          description: 'Wird verwendet, wenn kein spezifisches OG Image angegeben ist (Ideal: 1200x630px)'
        }
      ]
    }),
    // General Fields
    defineField({
      name: 'title',
      title: 'Seitentitel',
      type: 'string',
      group: 'general'
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      group: 'general'
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'general'
    }),
    // Social Media Fields
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      group: 'social',
      fields: [
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'soundcloud', title: 'SoundCloud URL', type: 'url' },
        { name: 'facebook', title: 'Facebook URL', type: 'url' }
      ]
    }),
    // Contact Fields
    defineField({
      name: 'contact',
      title: 'Kontakt',
      type: 'object',
      group: 'contact',
      fields: [
        { name: 'email', title: 'E-Mail', type: 'string' },
        { name: 'phone', title: 'Telefon', type: 'string' },
        { name: 'address', title: 'Adresse', type: 'text' }
      ]
    })
  ]
})
