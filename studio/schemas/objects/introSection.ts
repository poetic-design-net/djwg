import type { SchemaTypeDefinition, Rule } from 'sanity'

const introSection: SchemaTypeDefinition = {
  name: 'introSection',
  title: 'Intro Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'image',
      title: 'Bild',
      type: 'optimizedImage'
    },
    {
      name: 'items',
      title: 'Feature Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Mixer', value: 'mixer' },
                  { title: 'Kopfhörer', value: 'headphones' },
                  { title: 'Vinyl', value: 'vinyl' },
                  { title: 'Laptop', value: 'laptop' },
                  { title: 'Mikrofon', value: 'microphone' },
                  { title: 'Controller', value: 'controller' }
                ]
              }
            },
            {
              name: 'title',
              title: 'Titel',
              type: 'string'
            },
            {
              name: 'description',
              title: 'Beschreibung',
              type: 'text'
            }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: 'Intro Section',
        subtitle: title?.[0]?.children?.[0]?.text || 'Keine Überschrift'
      }
    }
  }
}

export default introSection