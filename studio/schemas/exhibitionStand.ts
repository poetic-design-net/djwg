import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'exhibitionStand',
  title: 'Messestand',
  type: 'document',
  fields: [
    defineField({
      name: 'standNumber',
      title: 'Standnummer',
      type: 'string',
      description: 'z.B. A1-B04',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hall',
      title: 'Halle',
      type: 'reference',
      to: [{ type: 'exhibitionHall' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'exhibitor',
      title: 'Aussteller',
      type: 'reference',
      to: [{ type: 'exhibitor' }],
      description: 'Leer lassen für verfügbare Stände',
    }),
    defineField({
      name: 'shape',
      title: 'Form',
      type: 'standShape',
    }),
    defineField({
      name: 'position',
      title: 'Position',
      type: 'object',
      fields: [
        defineField({
          name: 'x',
          title: 'X-Position',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'y',
          title: 'Y-Position',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Größe',
      type: 'object',
      fields: [
        defineField({
          name: 'width',
          title: 'Breite',
          type: 'number',
          validation: (Rule) => Rule.required().positive(),
        }),
        defineField({
          name: 'height',
          title: 'Höhe',
          type: 'number',
          validation: (Rule) => Rule.required().positive(),
        }),
      ],
      validation: (Rule) => Rule.required(),
      description: 'Bounding Box für die Form',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Verfügbar', value: 'available' },
          { title: 'Gebucht', value: 'booked' },
          { title: 'Reserviert', value: 'reserved' },
          { title: 'Gesperrt', value: 'blocked' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'available',
    }),
    defineField({
      name: 'standType',
      title: 'Standtyp',
      type: 'string',
      options: {
        list: [
          { title: 'Klein (< 20m²)', value: 'small' },
          { title: 'Mittel (20-50m²)', value: 'medium' },
          { title: 'Groß (> 50m²)', value: 'large' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customColor',
      title: 'Farbe & Stil',
      type: 'standColor',
    }),
    defineField({
      name: 'price',
      title: 'Preis (€)',
      type: 'number',
      description: 'Preis pro Messetag',
    }),
    defineField({
      name: 'features',
      title: 'Ausstattung',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'TV/Monitor', value: 'tv' },
          { title: 'PA-System', value: 'pa' },
          { title: 'Mikrofon', value: 'microphone' },
          { title: 'Mixer', value: 'mixer' },
          { title: 'DJ Booth', value: 'djbooth' },
          { title: 'HDMI-Anschluss', value: 'hdmi' },
          { title: 'Stromanschluss', value: 'power' },
          { title: 'Internet/WLAN', value: 'internet' },
        ],
      },
    }),
    defineField({
      name: 'notes',
      title: 'Notizen',
      type: 'text',
      rows: 2,
      description: 'Interne Notizen (nicht öffentlich)',
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
      title: 'standNumber',
      hall: 'hall.name',
      exhibitor: 'exhibitor.company',
      status: 'status',
      secret: 'isSecret',
    },
    prepare({ title, hall, exhibitor, status, secret }) {
      const statusEmoji: Record<string, string> = {
        available: '🟢',
        booked: '🔴',
        reserved: '🟡',
        blocked: '⚫',
      }
      return {
        title: `${title}${secret ? ' 🔒' : ''}`,
        subtitle: `${hall} - ${exhibitor || 'Verfügbar'} ${statusEmoji[status] || ''}`,
      }
    },
  },
})