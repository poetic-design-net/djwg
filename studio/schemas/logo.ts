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
      name: 'url',
      title: 'Website URL',
      type: 'url',
      description: 'Die Website-URL des Partners'
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
