import type { SchemaTypeDefinition, Rule } from 'sanity'

const heroSection: SchemaTypeDefinition = {
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    {
      name: 'eyebrow',
      title: 'Eyebrow Text',
      type: 'string',
      description: 'Text über dem Titel (z.B. "von DJs für DJs")',
      initialValue: 'von DJs für DJs'
    },
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
      of: [{ type: 'optimizedImage' }]
    },
    {
      name: 'transitionInterval',
      title: 'Übergangsintervall (in Sekunden)',
      type: 'number',
      initialValue: 5
    },
    {
      name: 'primaryButton',
      title: 'Primärer Button',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Text',
          type: 'string',
        },
        {
          name: 'link',
          title: 'Link',
          type: 'string',
        }
      ]
    },
    {
      name: 'secondaryButton',
      title: 'Sekundärer Button',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Text',
          type: 'string',
        },
        {
          name: 'link',
          title: 'Link',
          type: 'string',
        }
      ]
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
