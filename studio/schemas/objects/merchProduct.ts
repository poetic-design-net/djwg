import type { SchemaTypeDefinition, Rule } from 'sanity'

const merchProduct: SchemaTypeDefinition = {
  name: 'merchProduct',
  title: 'Merch Produkt',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text'
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'images',
      title: 'Produktbilder',
      type: 'array',
      of: [{ type: 'optimizedImage' }],
      validation: (Rule: Rule) => Rule.min(1).error('Mindestens ein Bild ist erforderlich')
    },
    {
      name: 'shopUrl',
      title: 'Shop URL',
      type: 'url',
      description: 'Allgemeine Shop-URL für Produkte ohne Varianten'
    },
    {
      name: 'variants',
      title: 'Produktvarianten',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'z.B. "S", "M", "L", "XL"'
          },
          {
            name: 'price',
            title: 'Preis',
            type: 'number'
          },
          {
            name: 'currency',
            title: 'Währung',
            type: 'string',
            initialValue: 'EUR',
            options: {
              list: [
                { title: 'EUR', value: 'EUR' },
                { title: 'USD', value: 'USD' }
              ]
            }
          },
          {
            name: 'shopUrl',
            title: 'Shop URL',
            type: 'url',
            description: 'Spezifische URL für diese Variante'
          }
        ]
      }]
    }
  ]
}

export default merchProduct