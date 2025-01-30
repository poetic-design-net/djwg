import { defineType } from 'sanity'

export default defineType({
  name: 'artistPage',
  title: 'Artist Page',
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
      title: 'Artist Benefits',
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
      name: 'experienceLevels',
      title: 'Experience Levels',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'formSettings',
      title: 'Form Settings',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Form Title',
          type: 'string',
        },
        {
          name: 'successMessage',
          title: 'Success Message',
          type: 'string',
        },
      ],
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
  ],
})