import type { SchemaTypeDefinition, Rule } from 'sanity'

const merchSection: SchemaTypeDefinition = {
  name: 'merchSection',
  title: 'Merch Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'products',
      title: 'Produkte',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'merchProduct' }]
        }
      ],
      validation: (rule: Rule) => rule.required().min(1)
    }
  ]
}

export default merchSection