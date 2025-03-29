import { defineType } from 'sanity'

export default defineType({
  name: 'benefit',
  title: 'Benefit',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title'
    }
  }
})