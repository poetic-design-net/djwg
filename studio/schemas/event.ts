import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  groups: [
    {
      name: 'details',
      title: 'Event Details',
      default: true
    },
    {
      name: 'artists',
      title: 'Artists'
    },
    {
      name: 'schedule',
      title: 'Schedule'
    },
    {
      name: 'features',
      title: 'Features'
    },
    {
      name: 'location',
      title: 'Location'
    },
    {
      name: 'media',
      title: 'Media'
    },
    {
      name: 'seo',
      title: 'SEO'
    },
    {
      name: 'tickets',
      title: 'Tickets'
    }
  ],
  fields: [
    // Event Details Tab
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'details'
    }),
    defineField({
      name: 'tag',
      title: 'Event Tag',
      type: 'string',
      description: 'e.g., "Berlin Event", "Main Event"',
      validation: Rule => Rule.required(),
      initialValue: 'Berlin Event',
      group: 'details'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      group: 'details'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'details'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required(),
      group: 'details'
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'details'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      group: 'details'
    }),

    // Schedule Tab
    defineField({
      name: 'schedule',
      title: 'Schedule',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'timeSlot' }]
      }],
      group: 'schedule'
    }),

    // Features Tab
    defineField({
      name: 'hasOpenStage',
      title: 'Enable Open Stage',
      description: 'Aktiviere diese Option, um Open Stage für dieses Event zu ermöglichen',
      type: 'boolean',
      initialValue: false,
      group: 'features'
    }),
    defineField({
      name: 'isOpenStageSecret',
      title: 'Open Stage is Secret',
      description: 'Aktiviere diese Option, um die Open Stage temporär zu verbergen',
      type: 'boolean',
      initialValue: false,
      group: 'features'
    }),
    defineField({
      name: 'enableSectionNav',
      title: 'Enable Section Navigation',
      description: 'Aktiviere die Seiten-Navigation mit Punkten am rechten Rand',
      type: 'boolean',
      initialValue: true,
      group: 'features'
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'Füge Features für dieses Event hinzu',
      type: 'array',
      of: [{
        type: 'string'
      }],
      options: {
        layout: 'tags'
      },
      group: 'features'
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
      validation: Rule => Rule.required(),
      group: 'features'
    }),

    // Location Tab
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'location'
    }),
    defineField({
      name: 'locationUrl',
      title: 'Location URL',
      type: 'url',
      description: 'Link to location (e.g. Google Maps)',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https']
      }),
      group: 'location'
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
      ],
      group: 'location'
    }),
    defineField({
      name: 'isLocationSecret',
      title: 'Location is Secret',
      type: 'boolean',
      initialValue: false,
      group: 'location'
    }),

    // Media Tab
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
      group: 'media'
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image' }],
      group: 'media'
    }),

    // SEO Tab
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo'
    }),

    // Additional Settings
    defineField({
      name: 'isArtistsSecret',
      title: 'Artists are Secret',
      type: 'boolean',
      initialValue: true,
      group: 'artists'
    }),
    defineField({
      name: 'artists',
      title: 'Artists',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'artist' }]
      }],
      group: 'artists'
    }),
    defineField({
      name: 'tickets',
      title: 'Tickets',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'ticket' }]
      }],
      group: 'tickets',
      description: 'Tickets available for this event'
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
