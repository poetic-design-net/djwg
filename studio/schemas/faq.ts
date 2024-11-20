import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'faq',
  title: 'FAQs',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Workshop', value: 'workshop' },
          { title: 'Equipment', value: 'equipment' },
          { title: 'Booking', value: 'booking' },
          { title: 'General', value: 'general' }
        ]
      },
      initialValue: 'general'
    })
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'category'
    }
  }
});
