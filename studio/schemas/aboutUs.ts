import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'aboutUs',
  title: 'About Us',
  type: 'document',
  fields: [
    defineField({
      name: 'coverImage',
      title: 'Cover Bild',
      type: 'image',
      description: 'Das Titelbild für die About Us Seite',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette'],
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Beschreibender Text für Screenreader und SEO'
        }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'history',
      title: 'Geschichte',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string', // Einfacher String
         
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
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo'
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
