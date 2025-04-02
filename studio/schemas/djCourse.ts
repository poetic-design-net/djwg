import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'djCourse',
  title: 'DJ Kurs',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Inhalt',
      default: true,
    },
    {
      name: 'media',
      title: 'Medien',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      group: 'content',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Titelbild',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'chapters',
      title: 'Kapitel',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'chapter',
          title: 'Kapitel',
          fields: [
            defineField({
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'lessons',
              title: 'Lektionen',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'lesson',
                  title: 'Lektion',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Titel',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'description',
                      title: 'Beschreibung',
                      type: 'text',
                      rows: 3,
                    }),
                    defineField({
                      name: 'videoUrl',
                      title: 'Video URL',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'duration',
                      title: 'Dauer',
                      type: 'string',
                      description: 'z.B. "45 min" oder "1:30:00"',
                    }),
                    defineField({
                      name: 'resources',
                      title: 'Zusätzliche Materialien',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'resource',
                          fields: [
                            defineField({
                              name: 'title',
                              title: 'Titel',
                              type: 'string',
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: 'fileUrl',
                              title: 'Datei URL',
                              type: 'string',
                              validation: (Rule) => Rule.required(),
                            }),
                          ],
                        },
                      ],
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      description: 'description',
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              lessonCount: 'lessons.length',
            },
            prepare(selection) {
              const { title, lessonCount = 0 } = selection;
              return {
                title,
                subtitle: `${lessonCount} Lektion${lessonCount === 1 ? '' : 'en'}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
      media: 'coverImage',
    },
  },
});