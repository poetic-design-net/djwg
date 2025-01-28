import type { SchemaTypeDefinition, Rule } from 'sanity'

const testimonialsSection: SchemaTypeDefinition = {
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'subtitle',
      title: 'Untertitel',
      type: 'string'
    },
    {
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'testimonial' }]
        }
      ],
      validation: (rule: Rule) => rule.required().min(1)
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: 'Testimonials Section',
        subtitle: title
      }
    }
  }
}

export default testimonialsSection
