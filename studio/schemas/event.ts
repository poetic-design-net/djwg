import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fieldsets: [
    {
      name: 'features',
      title: 'Event Features',
      options: { collapsible: true, collapsed: false }
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'tag',
      title: 'Event Tag',
      type: 'string',
      description: 'e.g., "Berlin Event", "Main Event"',
      validation: Rule => Rule.required(),
      initialValue: 'Berlin Event'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'locationUrl',
      title: 'Location URL',
      type: 'url',
      description: 'Link to location (e.g. Google Maps)',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https']
      })
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'schedule',
      title: 'Schedule',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'time',
            title: 'Time',
            type: 'string'
          },
          {
            name: 'title',
            title: 'Title',
            type: 'string'
          },
          {
            name: 'description',
            title: 'Description',
            type: 'text'
          },
          {
            name: 'instructor',
            title: 'Instructor',
            type: 'string'
          }
        ]
      }]
    }),
    defineField({
      name: 'hasOpenStage',
      title: 'Enable Open Stage',
      description: 'Aktiviere diese Option, um Open Stage für dieses Event zu ermöglichen',
      type: 'boolean',
      fieldset: 'features',
      initialValue: false
    }),
    defineField({
      name: 'isOpenStageSecret',
      title: 'Open Stage is Secret',
      description: 'Aktiviere diese Option, um die Open Stage temporär zu verbergen',
      type: 'boolean',
      fieldset: 'features',
      initialValue: false
    }),
    defineField({
      name: 'enableSectionNav',
      title: 'Enable Section Navigation',
      description: 'Aktiviere die Seiten-Navigation mit Punkten am rechten Rand',
      type: 'boolean',
      fieldset: 'features',
      initialValue: true
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'Füge Features für dieses Event hinzu',
      type: 'array',
      of: [{
        type: 'string'
      }],
      fieldset: 'features',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string'
          },
          {
            name: 'description',
            title: 'Description',
            type: 'text'
          },
          {
            name: 'icon',
            title: 'Icon Path',
            type: 'string',
            description: 'Only the path data (d="...") from the SVG'
          }
        ]
      }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image' }]
    }),
    defineField({
      name: 'locationDetails',
      title: 'Location Details',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text'
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          }
        }
      ]
    }),
    defineField({
      name: 'isLocationSecret',
      title: 'Location is Secret',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'isArtistsSecret',
      title: 'Artists are Secret',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      fieldset: 'seo'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tag',
      media: 'image'
    }
  }
});
