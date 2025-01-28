import type { SchemaTypeDefinition, Rule } from 'sanity'

const teamSectionConfig: SchemaTypeDefinition = {
  name: 'teamSectionConfig',
  title: 'Team Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text'
    },
    {
      name: 'selectedMembers',
      title: 'Ausgewählte Team-Mitglieder',
      description: 'Wählen Sie die Team-Mitglieder aus, die in dieser Section angezeigt werden sollen',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'teamMember' }]
        }
      ],
      validation: (rule: Rule) => rule.required().min(1)
    },
    {
      name: 'showLoadMoreButton',
      title: '"Mehr laden" Button anzeigen',
      description: 'Wenn aktiviert, werden zunächst nur 6 Mitglieder angezeigt mit der Option, mehr zu laden',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      selectedMembers: 'selectedMembers'
    },
    prepare({ title, selectedMembers = [] }) {
      return {
        title: 'Team Section',
        subtitle: `${selectedMembers.length} Mitglieder ausgewählt`
      }
    }
  }
}

export default teamSectionConfig
