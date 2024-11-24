export default {
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'enableSectionNav',
      title: 'Enable Section Navigation',
      type: 'boolean',
      description: 'Enable the section navigation dots on this page',
      initialValue: false,
    },
    {
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'id',
              title: 'Section ID',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'label',
              title: 'Section Label',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            }
          ]
        }
      ],
      hidden: ({ document }: any) => !document?.enableSectionNav,
    },
    {
      name: 'content',
      type: 'array',
      title: 'Page Content',
      description: 'Add page content blocks',
      of: [{ type: 'block' }],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug',
    },
    prepare({ title, slug }: any) {
      return {
        title,
        subtitle: slug?.current ? `/${slug.current}` : 'No slug',
      }
    },
  },
}
