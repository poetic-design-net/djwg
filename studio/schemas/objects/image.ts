import type { SchemaTypeDefinition, Rule } from 'sanity'

const imageType: SchemaTypeDefinition = {
  name: 'optimizedImage',
  title: 'Bild',
  type: 'image',
  description: 'Empfohlene Bildgröße: 1200x800 Pixel. Maximale Dateigröße: 2MB',
  options: {
    hotspot: true,
    metadata: ['blurhash', 'lqip', 'palette'],
    storeOriginalFilename: false,
    accept: 'image/jpeg,image/png,image/webp',
  },
  validation: (rule: Rule) => rule.custom((value: any) => {
    if (!value?.asset?._ref) {
      return true // Optional field
    }
    // Prüfe Dateiendung
    const extension = value.asset._ref.split('-')[3]
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp']
    if (!validExtensions.includes(extension)) {
      return 'Nur JPG, PNG und WebP Dateien sind erlaubt'
    }
    return true
  }),
  fields: [
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Beschreibender Text für Screenreader und SEO'
    }
  ]
}

export default imageType
