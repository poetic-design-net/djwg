import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'merchPage',
  title: 'Merch Page',
  type: 'document',
  preview: {
    select: {
      title: 'hero.title',
      subtitle: 'hero.eyebrow'
    }
  },
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {
          name: 'eyebrow',
          title: 'Eyebrow Text',
          type: 'string',
          description: 'Der kleine Text über dem Titel (z.B. "Merchandise")',
          initialValue: 'Merchandise'
        },
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
          initialValue: 'Unser Merch Shop'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
          initialValue: 'Entdecke unsere exklusive DJ Workshop Kollektion'
        },
        {
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'section',
      title: 'Products Section',
      type: 'object',
      fields: [
        {
          name: 'eyebrow',
          title: 'Eyebrow Text',
          type: 'string',
          description: 'Der kleine Text über dem Titel (z.B. "Merchandise")',
          initialValue: 'Merchandise'
        },
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
          initialValue: 'Unser Merch Shop'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
          validation: (Rule) => Rule.required(),
          initialValue: 'Entdecke unsere exklusive DJ Workshop Kollektion'
        },
      ],
    }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'merchProduct' }]
        }
      ],
    }),
  ],
})