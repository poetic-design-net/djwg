import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'ticketsSection',
  title: 'Tickets Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'selectedEvent',
      title: 'Selected Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'Das standardmäßig ausgewählte Event',
    }),
    defineField({
      name: 'showEventSelector',
      title: 'Event-Auswahl anzeigen',
      type: 'boolean',
      description: 'Aktivieren Sie diese Option, um zwischen verschiedenen Events wechseln zu können',
      initialValue: false,
    }),
    defineField({
      name: 'tickets',
      title: 'Tickets',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'ticket' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title: title || 'Tickets Section',
      }
    },
  },
})
