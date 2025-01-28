import type { SchemaTypeDefinition, Rule } from 'sanity'

const heroSection: SchemaTypeDefinition = {
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string'
    },
    {
      name: 'subtitle',
      title: 'Untertitel',
      type: 'text',
      rows: 2
    },
    {
      name: 'backgroundImages',
      title: 'Hintergrundbilder',
      type: 'array',
      of: [{ type: 'optimizedImage' }],
      validation: (rule: Rule) => rule.min(1).max(3)
    },
    {
      name: 'transitionInterval',
      title: 'Übergangsintervall (in Sekunden)',
      type: 'number',
      initialValue: 7.5,
      validation: (rule: Rule) => rule.min(3).max(15)
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    },
    prepare({ title, subtitle }) {
      return {
        title: 'Hero Section',
        subtitle: title || 'Keine Überschrift'
      }
    }
  }
}

export default heroSection
