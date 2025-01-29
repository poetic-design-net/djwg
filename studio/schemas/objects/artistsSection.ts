import type { SchemaTypeDefinition } from 'sanity'

const artistsSection: SchemaTypeDefinition = {
  name: 'artistsSection',
  title: 'Artists Section',
  type: 'object',
  fields: [
    {
      name: 'eyebrow',
      title: 'Eyebrow Text',
      type: 'string',
      description: 'Der Text, der über dem Haupttitel erscheint',
      initialValue: 'Unsere Artists'
    },
    {
      name: 'title',
      title: 'Titel',
      type: 'string'
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
      }
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
