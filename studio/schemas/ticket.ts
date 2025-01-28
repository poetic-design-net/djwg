import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'ticket',
  title: 'Ticket',
  type: 'document',
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
      type: 'array',
      of: [{ type: 'string' }],
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
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
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
      description: 'Link for the ticket button (e.g. booking page)',
    }),
    defineField({
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title,
        subtitle: `${subtitle} EUR`,
      }
    },
  },
})
