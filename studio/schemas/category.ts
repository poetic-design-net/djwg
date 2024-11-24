import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'category',
  title: 'Kategorien',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text'
    }),
    defineField({
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
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon'
    },
    prepare({ title, icon }: any) {
      return {
        title,
        subtitle: `Icon: ${icon}`
      }
    }
  }
}); 