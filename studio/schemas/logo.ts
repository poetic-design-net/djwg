import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'logo',
  title: 'Partner Logo',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Partner Name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Logo Image',
      type: 'optimizedImage'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
