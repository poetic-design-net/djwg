export default {
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true
    },
    {
      name: 'settings',
      title: 'Settings'
    }
  ],
  fields: [
    // Settings Fields
    {
      name: 'enableSectionNav',
      title: 'Enable Section Navigation',
      description: 'Aktiviere die Seiten-Navigation mit Punkten am rechten Rand',
      type: 'boolean',
      initialValue: true,
      group: 'settings'
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'settings'
    },
    // Content Fields
    {
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      group: 'content',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
        },
        {
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'aboutSection',
      title: 'About Us Section',
      type: 'aboutUsSection',
      group: 'content',
    },
    {
      name: 'intro',
      title: 'Intro Section',
      type: 'object',
      group: 'content',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'array',
          of: [{type: 'block'}],
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          description: 'The image shown in the intro section',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Important for SEO and accessibility.'
            }
          ]
        }
      ],
    },
    {
      name: 'workshopsSection',
      title: 'Workshops Section',
      type: 'object',
      group: 'content',
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
    {
      name: 'pricingSection',
      title: 'Pricing Section',
      type: 'object',
      group: 'content',
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
    {
      name: 'newsletterSection',
      title: 'Newsletter Section',
      type: 'object',
      group: 'content',
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
    }
  ],
  preview: {
    select: {
      title: 'hero.title',
    },
    prepare({ title }: { title: string }) {
      return {
        title: 'Homepage',
        subtitle: title,
      }
    },
  },
}
