import { defineType } from 'sanity';

export default defineType({
  name: 'aboutUsSection',
  title: 'About Us Section',
  type: 'object',
  fields: [
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Der grüne Text über dem Titel',
      initialValue: 'Über DJ Workshop Germany'
    },
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      description: 'Die Hauptüberschrift',
      initialValue: 'Deine DJ-Karriere beginnt hier'
    },
    {
      name: 'paragraphs',
      title: 'Textabsätze',
      type: 'array',
      of: [{ type: 'text' }],
      description: 'Die Haupttextabsätze',
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'mainImage',
      title: 'Hauptbild',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string'
        }
      ]
    },
    {
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Button Text',
          type: 'string',
          initialValue: 'Mehr über uns'
        },
        {
          name: 'link',
          title: 'Button Link',
          type: 'string',
          initialValue: '/uber-uns'
        }
      ]
    }
  ]
});
