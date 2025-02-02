export default {
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
    {
      name: 'evaluationCriteriaTitle',
      title: 'Beurteilungskriterien Titel',
      type: 'string',
      initialValue: 'Beurteilungskriterien'
    },
    {
      name: 'evaluationCriteriaSubtitle',
      title: 'Beurteilungskriterien Untertitel',
      type: 'string',
      initialValue: 'Dein Weg zum DJ Award 2024'
    },
    {
      name: 'liveBattleTitle',
      title: 'Live-Battle Titel',
      type: 'string',
      initialValue: 'Live-Battle'
    },
    {
      name: 'hero',
      title: 'Hero Bereich',
      type: 'object',
      fields: [
        {
          name: 'heading',
          title: 'Hauptüberschrift',
          type: 'string',
          validation: (Rule: any) => Rule.required()
        },
        {
          name: 'subheading',
          title: 'Unterüberschrift',
          type: 'string'
        },
        {
          name: 'eyebrow',
          title: 'Eyebrow Text',
          type: 'string',
          description: 'Der kleine Text über der Hauptüberschrift'
        },
        {
          name: 'backgroundImages',
          title: 'Hintergrundbilder',
          type: 'array',
          of: [{ type: 'image' }],
          options: {
            layout: 'grid'
          }
        },
        {
          name: 'primaryButton',
          title: 'Hauptbutton',
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Button Text',
              type: 'string'
            },
            {
              name: 'link',
              title: 'Button Link',
              type: 'string'
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
              title: 'Button Text',
              type: 'string'
            },
            {
              name: 'link',
              title: 'Button Link',
              type: 'string'
            }
          ]
        }
      ]
    },
    {
      name: 'introText',
      title: 'Einführungstext',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Der Text zwischen Hero und Kriterien'
    },
    {
      name: 'preselectionCriteria',
      title: 'Vorentscheid Kriterien',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Überschrift',
          type: 'string',
          initialValue: 'Vorentscheid'
        },
        {
          name: 'mixSetTitle',
          title: 'Mix-Set Titel',
          type: 'string',
          initialValue: 'Mix-Set'
        },
        {
          name: 'mixSetDescription',
          title: 'Mix-Set Beschreibung',
          type: 'string',
          initialValue: '15-30 Minuten Mix deiner besten Tracks'
        },
        {
          name: 'mixSetPercentage',
          title: 'Mix-Set Prozent',
          type: 'number',
          initialValue: 50
        },
        {
          name: 'onlinePresenceTitle',
          title: 'Online-Präsenz Titel',
          type: 'string',
          initialValue: 'Online-Präsenz'
        },
        {
          name: 'onlinePresenceDescription',
          title: 'Online-Präsenz Beschreibung',
          type: 'string',
          initialValue: 'Deine digitale Visitenkarte & Vorstellungsvideo'
        },
        {
          name: 'onlinePresencePercentage',
          title: 'Online-Darstellung Prozent',
          type: 'number',
          initialValue: 50
        }
      ]
    },
    {
      name: 'totalProgressBar',
      title: 'Gesamtfortschrittsbalken',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Überschrift',
          type: 'string',
          initialValue: 'DJ Award Gewinner:'
        }
      ]
    },
    {
      name: 'evaluationCriteria',
      title: 'Bewertungskriterien',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'description',
              title: 'Beschreibung',
              type: 'text'
            },
            {
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
            }
          ]
        }
      ]
    },
    {
      name: 'artistsSection',
      title: 'Künstler Sektion',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Überschrift',
          type: 'string',
          initialValue: 'DJ Line-Up'
        },
        {
          name: 'subtitle',
          title: 'Untertitel',
          type: 'string',
          initialValue: 'Unsere Artists'
        },
        {
          name: 'isLineupRevealed',
          title: 'Line-up anzeigen',
          type: 'boolean',
          description: 'Aktivieren Sie diese Option, um das Line-up anzuzeigen',
          initialValue: true
        },
        {
          name: 'artists',
          title: 'Nominierte DJs',
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{ type: 'artist' }]
            }
          ]
        }
      ]
    }
  ]
}