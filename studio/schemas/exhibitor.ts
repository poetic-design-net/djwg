import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'exhibitor',
  title: 'Aussteller',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Firmenname',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'company',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: [
          { title: 'Technik', value: 'technics' },
          { title: 'Medizin', value: 'medicine' },
          { title: 'Industrie', value: 'industry' },
          { title: 'IT', value: 'it' },
          { title: 'Dienstleistung', value: 'service' },
          { title: 'Handwerk', value: 'craft' },
          { title: 'Sonstiges', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contact',
      title: 'Kontakt',
      type: 'object',
      fields: [
        defineField({
          name: 'email',
          title: 'E-Mail',
          type: 'string',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'phone',
          title: 'Telefon',
          type: 'string',
        }),
        defineField({
          name: 'website',
          title: 'Website',
          type: 'url',
        }),
        defineField({
          name: 'contactPerson',
          title: 'Ansprechpartner',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'isPremium',
      title: 'Premium Aussteller',
      type: 'boolean',
      description: 'Premium-Stände werden hervorgehoben',
      initialValue: false,
    }),
    defineField({
      name: 'products',
      title: 'Produkte/Dienstleistungen',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'isSecret',
      title: 'Geheim',
      type: 'boolean',
      description: 'Nur für Admins sichtbar',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'company',
      category: 'category',
      media: 'logo',
      premium: 'isPremium',
      secret: 'isSecret',
    },
    prepare({ title, category, media, premium, secret }) {
      return {
        title: `${title}${premium ? ' ⭐' : ''}${secret ? ' 🔒' : ''}`,
        subtitle: category,
        media,
      }
    },
  },
})