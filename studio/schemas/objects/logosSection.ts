import type { SchemaTypeDefinition, Rule } from 'sanity'

const logosSection: SchemaTypeDefinition = {
  name: 'logosSection',
  title: 'Logos Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text'
    },
    {
      name: 'selectedLogos',
      title: 'Ausgewählte Logos',
      description: 'Wählen Sie die Logos aus, die in dieser Section angezeigt werden sollen',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'logo' }]
        }
      ]
    },
    {
      name: 'showButton',
      title: 'Button anzeigen',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      selectedLogos: 'selectedLogos'
    },
    prepare({ title, selectedLogos = [] }) {
      return {
        title: 'Logos Section',
        subtitle: `${selectedLogos.length} Logos ausgewählt`
      }
    }
  }
}

export default logosSection
