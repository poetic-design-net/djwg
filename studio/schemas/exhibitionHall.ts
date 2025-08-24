import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'exhibitionHall',
  title: 'Messehalle',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hallId',
      title: 'Hallen-ID',
      type: 'string',
      description: 'z.B. A1, B2, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dimensions',
      title: 'Abmessungen',
      type: 'object',
      fields: [
        defineField({
          name: 'width',
          title: 'Breite (in Pixel)',
          type: 'number',
          validation: (Rule) => Rule.required().positive(),
        }),
        defineField({
          name: 'height',
          title: 'Höhe (in Pixel)',
          type: 'number',
          validation: (Rule) => Rule.required().positive(),
        }),
      ],
    }),
    defineField({
      name: 'floorPlan',
      title: 'Hallenplan',
      type: 'image',
      description: 'Hintergrundbild für die Halle (optional)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isSecret',
      title: 'Geheim',
      type: 'boolean',
      description: 'Nur für Admins sichtbar',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Sortierreihenfolge der Hallen',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'hallId',
      secret: 'isSecret',
    },
    prepare({ title, subtitle, secret }) {
      return {
        title: `${title}${secret ? ' 🔒' : ''}`,
        subtitle: `Halle ${subtitle}`,
      }
    },
  },
})