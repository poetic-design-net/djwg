import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'externalLinks',
  title: 'Externe Links',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Überschrift',
      type: 'string',
      description: 'z.B. "Weitere Hotels in der Umgebung"',
      initialValue: 'Weitere Hotels in der Umgebung'
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'description',
              title: 'Beschreibung',
              type: 'text',
              rows: 2
            })
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description'
            }
          }
        }
      ]
    })
  ]
});