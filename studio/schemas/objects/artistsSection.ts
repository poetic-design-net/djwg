import type { SchemaTypeDefinition, Rule } from 'sanity'

const artistsSection: SchemaTypeDefinition = {
  name: 'artistsSection',
  title: 'Artists Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 2
    },
    {
      name: 'displayType',
      title: 'Anzeige-Typ',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'Slider', value: 'slider' }
        ]
      },
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'selectedArtists',
      title: 'Ausgewählte Artists',
      description: 'Wählen Sie die Artists aus, die in dieser Section angezeigt werden sollen',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'artist' }]
        }
      ],
      validation: (rule: Rule) => rule.required().min(1),
      options: {
        sortable: true,
        layout: 'grid'
      }
    },
    {
      name: 'isLineupRevealed',
      title: 'Line-up anzeigen',
      type: 'boolean',
      initialValue: true,
      description: 'Wenn deaktiviert, wird ein "Coming Soon" Overlay angezeigt'
    }
  ],
  preview: {
    select: {
      title: 'title',
      artists: 'selectedArtists'
    },
    prepare({ title, artists = [] }) {
      return {
        title: title || 'Artists Section',
        subtitle: `${artists.length} artists selected`
      }
    }
  }
}

export default artistsSection
