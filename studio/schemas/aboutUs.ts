import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'aboutUs',
  title: 'About Us',
  type: 'document',
  fields: [
    defineField({
      name: 'history',
      title: 'Geschichte',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string', // Einfacher String
          initialValue: 'Unsere Geschichte', // Optionaler Standardwert
        },
        {
          name: 'content',
          title: 'Content',
          type: 'array', // Block-basiertes Textfeld
          of: [{ type: 'block' }],
          validation: Rule => Rule.required(), // Validation: Pflichtfeld
        }
      ]
    }),
    defineField({
      name: 'philosophy',
      title: 'Philosophie',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: 'Unsere Philosophie'
        },
        {
          name: 'items',
          title: 'Philosophy Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                  validation: Rule => Rule.required()
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  validation: Rule => Rule.required()
                }
              ],
              preview: {
                select: {
                  title: 'title'
                }
              }
            }
          ],
          validation: Rule => Rule.required().min(1)
        }
      ]
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'About Us Content'
      };
    }
  }
});
