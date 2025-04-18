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

            },
            {
              name: 'title',
              title: 'Titel',
              type: 'string',

            },
            {
              name: 'description',
              title: 'Beschreibung',
              type: 'text',
       
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