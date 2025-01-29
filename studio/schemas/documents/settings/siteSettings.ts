import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {
      name: 'general',
      title: 'Allgemeine Einstellungen',
    },
    {
      name: 'seo',
      title: 'SEO & Metadaten',
    },
    {
      name: 'social',
      title: 'Social Media',
    },
    {
      name: 'contact',
      title: 'Kontakt',
    }
  ],
  fields: [
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
    // SEO Fields
    defineField({
      name: 'seo',
      title: 'Standard SEO Einstellungen',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Titel',
          type: 'string',
        },
        {
          name: 'metaDescription',
          title: 'Meta Beschreibung',
          type: 'text',
        },
        {
          name: 'ogImage',
          title: 'Standard OG Image',
          type: 'image'
        }
      ]
    }),
    // Social Media Fields
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'array',
      group: 'social',
      of: [{ type: 'socialMediaLink' }]
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
