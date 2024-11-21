import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'knowledgeBaseItem',
  title: 'Knowledge Base Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          { title: 'Mixer', value: 'mixer' },
          { title: 'Headphones', value: 'headphones' },
          { title: 'Vinyl', value: 'vinyl' },
          { title: 'Laptop', value: 'laptop' },
          { title: 'Microphone', value: 'microphone' },
          { title: 'Controller', value: 'controller' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Equipment', value: 'equipment' },
          { title: 'Mixing', value: 'mixing' },
          { title: 'Software', value: 'software' },
          { title: 'Performance', value: 'performance' },
          { title: 'Business', value: 'business' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: ({ document }) => !document?.featured,
      validation: Rule => Rule.integer()
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category'
    }
  }
});
