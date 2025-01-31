export default {
  name: 'headerSettings',
  title: 'Header Settings',
  type: 'document',
  preview: {
    select: {
      title: 'title'
    },
    prepare() {
      return {
        title: 'Header Settings'
      }
    }
  },
  fields: [
    {
      name: 'logo',
      title: 'Header Logo',
      type: 'image',
      description: 'Das Logo für den Header-Bereich (SVG oder PNG)',
      options: {
        accept: 'image/svg+xml,image/png',
        hotspot: true
      }
    },
    {
      name: 'mobileLogo',
      title: 'Mobile Logo',
      type: 'image',
      description: 'Optional: Ein alternatives Logo für mobile Geräte',
      options: {
        accept: 'image/svg+xml,image/png',
        hotspot: true
      }
    }
  ]
}