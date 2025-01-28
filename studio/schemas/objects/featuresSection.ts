import type { SchemaTypeDefinition, Rule } from 'sanity'

const featuresSection: SchemaTypeDefinition = {
  name: 'featuresSection',
  title: 'Features Section',
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
      type: 'text'
    },
    {
      name: 'features',
      title: 'Features',
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
              },
              validation: (rule: Rule) => rule.required()
            },
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
              validation: (rule: Rule) => rule.required()
            }
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description'
            }
          }
        }
      ],
      validation: (rule: Rule) => rule.required().min(1)
    },
    {
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid (3 Spalten)', value: 'grid' },
          { title: 'Liste (2 Spalten)', value: 'list' }
        ]
      },
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'backgroundColor',
      title: 'Hintergrundfarbe',
      type: 'string',
      options: {
        list: [
          { title: 'Schwarz', value: 'black' },
          { title: 'Dunkelgrau', value: 'darkGray' }
        ]
      }
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: 'Features Section',
        subtitle: title?.[0]?.children?.[0]?.text || 'Keine Überschrift'
      }
    }
  }
}

export default featuresSection