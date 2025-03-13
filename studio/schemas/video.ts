import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
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
      type: 'text'
    }),
    defineField({
      name: 'videoFile',
      title: 'Video Datei',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'requiredBadges',
      title: 'Benötigte Badges',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'badge' }]
        }
      ],
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sortierreihenfolge',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'reference',
      to: [{ type: 'videoCategory' }],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      category: 'category.title'
    },
    prepare({ title, media, category }) {
      return {
        title: title,
        subtitle: category ? `Kategorie: ${category}` : 'Keine Kategorie',
        media: media
      }
    }
  }
})