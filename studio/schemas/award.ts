import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'award',
  title: 'DJ Award',
  type: 'document',
  preview: {
    select: {
      title: 'hero.heading',
      subtitle: 'hero.eyebrow'
    }
  },
  fields: [
    defineField({
      name: 'ticket',
      title: 'Ausgewähltes Ticket',
      type: 'reference',
      to: [{ type: 'ticket' }],
      description: 'Wählen Sie das Ticket aus, das für diesen Award verwendet werden soll'
    }),
    defineField({
      name: 'evaluationCriteriaTitle',
      title: 'Beurteilungskriterien Titel',
      type: 'string',
      initialValue: 'Beurteilungskriterien'
    }),
    defineField({
      name: 'evaluationCriteriaSubtitle',
      title: 'Beurteilungskriterien Untertitel',
      type: 'string',
      initialValue: 'Dein Weg zum DJ Award 2024'
    }),
    defineField({
      name: 'liveBattleTitle',
      title: 'Live-Battle Titel',
      type: 'string',
      initialValue: 'Live-Battle'
    }),
    defineField({
      name: 'hero',
      title: 'Hero Bereich',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Hauptüberschrift',
          type: 'string',
          validation: rule => rule.required()
        }),
        defineField({
          name: 'subheading',
          title: 'Unterüberschrift',
          type: 'string'
        }),
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow Text',
          type: 'string',
          description: 'Der kleine Text über der Hauptüberschrift'
        }),
        defineField({
          name: 'backgroundImages',
          title: 'Hintergrundbilder',
          type: 'array',
          of: [
            {
              type: 'image',
              options: {
                hotspot: true
              },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternativer Text',
                  description: 'Wichtig für SEO und Barrierefreiheit'
                }
              ]
            }
          ],
          options: {
            layout: 'grid'
          }
        }),
        defineField({
          name: 'primaryButton',
          title: 'Hauptbutton',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Button Text',
              type: 'string'
            }),
            defineField({
              name: 'link',
              title: 'Button Link',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'secondaryButton',
          title: 'Sekundärer Button',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Button Text',
              type: 'string'
            }),
            defineField({
              name: 'link',
              title: 'Button Link',
              type: 'string'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'introText',
      title: 'Einführungstext',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Der Text zwischen Hero und Kriterien'
    }),
    defineField({
      name: 'preselectionCriteria',
      title: 'Vorentscheid Kriterien',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Überschrift',
          type: 'string',
          initialValue: 'Vorentscheid'
        }),
        defineField({
          name: 'mixSetTitle',
          title: 'Mix-Set Titel',
          type: 'string',
          initialValue: 'Mix-Set'
        }),
        defineField({
          name: 'mixSetDescription',
          title: 'Mix-Set Beschreibung',
          type: 'string',
          initialValue: '15-30 Minuten Mix deiner besten Tracks'
        }),
        defineField({
          name: 'mixSetPercentage',
          title: 'Mix-Set Prozent',
          type: 'number',
          initialValue: 50
        }),
        defineField({
          name: 'onlinePresenceTitle',
          title: 'Online-Präsenz Titel',
          type: 'string',
          initialValue: 'Online-Präsenz'
        }),
        defineField({
          name: 'onlinePresenceDescription',
          title: 'Online-Präsenz Beschreibung',
          type: 'string',
          initialValue: 'Deine digitale Visitenkarte & Vorstellungsvideo'
        }),
        defineField({
          name: 'onlinePresencePercentage',
          title: 'Online-Darstellung Prozent',
          type: 'number',
          initialValue: 50
        })
      ]
    }),
    defineField({
      name: 'totalProgressBar',
      title: 'Gesamtfortschrittsbalken',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Überschrift',
          type: 'string',
          initialValue: 'DJ Award Gewinner:'
        })
      ]
    }),
    defineField({
      name: 'evaluationCriteria',
      title: 'Bewertungskriterien',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'criterion',
          fields: [
            defineField({
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: rule => rule.required()
            }),
            defineField({
              name: 'description',
              title: 'Beschreibung',
              type: 'text'
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Mixer', value: 'mixer' },
                  { title: 'Kopfhörer', value: 'headphones' },
                  { title: 'Vinyl', value: 'vinyl' },
                  { title: 'Laptop', value: 'laptop' },
                  { title: 'Mikrofon', value: 'microphone' },
                  { title: 'Controller', value: 'controller' }
                ]
              }
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'artistsSection',
      title: 'Jury Sektion',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Überschrift',
          type: 'string',
          initialValue: 'DJ Line-Up'
        }),
        defineField({
          name: 'subtitle',
          title: 'Untertitel',
          type: 'string',
          initialValue: 'Unsere Artists'
        }),
        defineField({
          name: 'isLineupRevealed',
          title: 'Jury anzeigen',
          type: 'boolean',
          description: 'Aktivieren Sie diese Option, um das Jury anzuzeigen',
          initialValue: true
        }),
        defineField({
          name: 'artists',
          title: 'Jury',
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{ type: 'artist' }]
            }
          ]
        })
      ]
    })
  ]
})