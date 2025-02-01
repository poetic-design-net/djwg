import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'djCourse',
  title: 'DJ Kurse',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Kurstitel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Kursbeschreibung',
      type: 'text'
    }),
    defineField({
      name: 'chapters',
      title: 'Kapitel',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Kapiteltitel',
              type: 'string'
            },
            {
              name: 'lessons',
              title: 'Lektionen',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'title',
                      title: 'Lektionstitel',
                      type: 'string'
                    },
                    {
                      name: 'description',
                      title: 'Beschreibung',
                      type: 'text'
                    },
                    {
                      name: 'videoUrl',
                      title: 'Video URL',
                      type: 'url'
                    },
                    {
                      name: 'duration',
                      title: 'Dauer',
                      type: 'string'
                    },
                    {
                      name: 'chapters',
                      title: 'Videokapitel',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            {
                              name: 'title',
                              title: 'Titel',
                              type: 'string'
                            },
                            {
                              name: 'timestamp',
                              title: 'Zeitstempel (in Sekunden)',
                              type: 'number'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: 'resources',
                      title: 'Zusätzliche Materialien',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            {
                              name: 'title',
                              title: 'Titel',
                              type: 'string'
                            },
                            {
                              name: 'file',
                              title: 'Datei',
                              type: 'file'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'level',
      title: 'Schwierigkeitsgrad',
      type: 'string',
      options: {
        list: [
          { title: 'Anfänger', value: 'beginner' },
          { title: 'Fortgeschritten', value: 'intermediate' },
          { title: 'Profi', value: 'advanced' }
        ]
      }
    }),
    defineField({
      name: 'prerequisites',
      title: 'Voraussetzungen',
      type: 'array',
      of: [{ type: 'string' }]
    })
  ]
})