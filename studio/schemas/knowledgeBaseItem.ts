import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'knowledgeBaseItem',
  title: 'Knowledge Base',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Auf der Startseite anzeigen'
    }),
    defineField({
      name: 'order',
      title: 'Reihenfolge',
      type: 'number',
      hidden: ({ document }: any) => !document?.featured
    }),
    defineField({
      name: 'content',
      title: 'Inhalt',
      type: 'array',
      of: [{ type: 'block' }]
    })
  ],
  orderings: [
    {
      title: 'Kategorie, A-Z',
      name: 'categoryAsc',
      by: [
        { field: 'category.title', direction: 'asc' },
        { field: 'title', direction: 'asc' }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title'
    },
    prepare({ title, category }: any) {
      return {
        title,
        subtitle: category
      }
    }
  }
});
