import { defineType } from 'sanity'

export default defineType({
  name: 'partnerPage',
  title: 'Partner Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'benefits',
      title: 'Partner Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'exhibitorInfo',
      title: 'Exhibitor Information',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },
    {
      name: 'marketingInfo',
      title: 'Marketing Information',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },
    {
      name: 'whyPartnerSection',
      title: 'Warum Partner werden?',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Titel',
          type: 'string',
          validation: (Rule) => Rule.required(),
          initialValue: 'Warum Partner werden?'
        },
        {
          name: 'description',
          title: 'Beschreibung',
          type: 'text',
          validation: (Rule) => Rule.required(),
          initialValue: 'Als Partner des DJ Workshops profitierst du von unserem starken Netzwerk und direktem Zugang zur DJ-Community.'
        }
      ]
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }
  ],
})