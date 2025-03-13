import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'videoCategory',
  title: 'Video Kategorie',
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
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text'
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sortierreihenfolge',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {
        hotspot: true
      }
    })
  ],
  orderings: [
    {
      title: 'Sortierreihenfolge',
      name: 'sortOrderAsc',
      by: [
        {field: 'sortOrder', direction: 'asc'}
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'icon'
    }
  }
})