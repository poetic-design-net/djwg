import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export default defineType({
  name: 'ticket',
  title: 'Ticket',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'phase',
      title: 'Phase',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'Liste der Features (optional mit zusätzlichen Infos)',
      type: 'array',
      of: [{
        type: 'object',
        title: 'Feature',
        name: 'feature',
        fields: [
          {
            name: 'text',
            title: 'Feature Text',
            type: 'string',
            validation: (Rule) => Rule.required()
          },
          {
            name: 'info',
            title: 'Zusätzliche Info',
            description: 'Optionale zusätzliche Information zum Feature',
            type: 'string'
          }
        ],
        preview: {
          select: {
            title: 'text',
            subtitle: 'info'
          },
          prepare({ title, subtitle }) {
            return {
              title,
              subtitle: subtitle ? `Info: ${subtitle}` : 'Keine zusätzliche Info'
            }
          }
        }
      }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Completed', value: 'completed' },
          { title: 'Current', value: 'current' },
          { title: 'Coming Soon', value: 'coming-soon' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number'
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'EUR',
      options: {
        list: [
          { title: 'EUR', value: 'EUR' },
          { title: 'USD', value: 'USD' },
        ],
      },
    }),
    defineField({
      name: 'url',
      title: 'Button URL',
      type: 'url',
      description: 'Link für den Ticket-Button (z.B. Buchungsseite)',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'Text für den CTA-Button',
      initialValue: 'Jetzt buchen'
    }),
    defineField({
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      eventTitle: 'event.title',
      price: 'price',
      currency: 'currency'
    },
    prepare(selection) {
      const { title, eventTitle, price, currency } = selection
      return {
        title,
        subtitle: `${eventTitle || 'Kein Event'} - ${price ? `${price} ${currency}` : 'Kein Preis'}`
      }
    },
  },
})
