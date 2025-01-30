import type { SchemaTypeDefinition, Rule } from 'sanity'

const faqSection: SchemaTypeDefinition = {
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'text'
      
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text'
    },
    {
      name: 'selectedFaqs',
      title: 'Ausgewählte FAQs',
      description: 'Wählen Sie die FAQs aus, die in dieser Section angezeigt werden sollen',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'faq' }]
        }
      ]
    },
    {
      name: 'showCategories',
      title: 'Kategorien anzeigen',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: 'FAQ Section',
        subtitle: title?.[0]?.children?.[0]?.text || 'Keine Überschrift'
      }
    }
  }
}

export default faqSection
