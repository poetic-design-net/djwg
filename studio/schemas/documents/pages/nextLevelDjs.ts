import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'nextLevelDjs',
  title: 'NextLevel DJs',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Hintergrundbild',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'showComingSoon',
      title: 'Coming Soon aktivieren',
      type: 'boolean',
      description: 'Wenn aktiviert, wird die Coming Soon Seite angezeigt',
      initialValue: true,
    }),
    defineField({
      name: 'comingSoon',
      title: 'Coming Soon Einstellungen',
      type: 'object',
      hidden: ({ parent }) => !parent?.showComingSoon,
      fields: [
        {
          name: 'backgroundImage',
          title: 'Hintergrundbild',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'title',
          title: 'Titel',
          type: 'string',
          initialValue: 'NextLevel DJs',
        },
        {
          name: 'subtitle',
          title: 'Untertitel',
          type: 'string',
          initialValue: 'Bereit für die nächste Generation von DJs? Wir auch!',
        },
        {
          name: 'description',
          title: 'Beschreibung',
          type: 'text',
          rows: 3,
          initialValue: 'Bald präsentieren wir dir eine einzigartige Plattform, die das DJ-Game auf ein völlig neues Level hebt.',
        },
        {
          name: 'footerText',
          title: 'Footer Text',
          type: 'string',
          initialValue: 'Bleib dran – es wird legendär! 🎧',
        },
        {
          name: 'comingSoonText',
          title: 'Coming Soon Text',
          type: 'string',
          initialValue: 'Coming Soon',
        }
      ]
    }),
    defineField({
      name: 'requiredBadges',
      title: 'Required Badges',
      description: 'Badges die ein User benötigt um diese Seite zu sehen',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'badge' }]
      }]
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'backgroundImage'
    }
  }
})