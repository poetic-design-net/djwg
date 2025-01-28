import type { SchemaTypeDefinition, Rule } from 'sanity'

const aboutUsSection: SchemaTypeDefinition = {
  name: 'aboutUsSection',
  title: 'About Us Section',
  type: 'object',
  fields: [
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'paragraphs',
      title: 'Absätze',
      type: 'array',
      of: [{ type: 'text' }],
      validation: (rule: Rule) => rule.required().min(1)
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
          validation: (rule: Rule) => rule.required()
        },
        {
          name: 'link',
          title: 'Button Link',
          type: 'string',
          validation: (rule: Rule) => rule.required()
        }
      ]
    },
    {
      name: 'mainImage',
      title: 'Hauptbild',
      type: 'optimizedImage'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tagline'
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'About Us Section',
        subtitle: subtitle || 'Keine Tagline'
      }
    }
  }
}

export default aboutUsSection
