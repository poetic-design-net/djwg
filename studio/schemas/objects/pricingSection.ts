import type { SchemaTypeDefinition } from 'sanity'

const pricingSection: SchemaTypeDefinition = {
  name: 'pricingSection',
  title: 'Pricing Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Überschrift',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 2
    },
    {
      name: 'showEventSelector',
      title: 'Event-Auswahl anzeigen',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'selectedTickets',
      title: 'Ausgewählte Tickets',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'ticket' }]
        }
      ]
    }
  ]
}

export default pricingSection