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
      name: 'image',
      title: 'Produktbild',
      type: 'optimizedImage'
    },
    {
      name: 'shopUrl',
      title: 'Shop URL',
      type: 'url'
    }
  ]
}

export default merchProduct