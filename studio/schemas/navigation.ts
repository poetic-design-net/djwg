import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  initialValue: {
    menuKey: 'workshops', // Default value, will be overridden
    type: 'megamenu' // Default to megamenu
  },
  fields: [
    defineField({
      name: 'menuKey',
      title: 'Menu Key',
      type: 'string',
      validation: Rule => Rule.required().error('Menu Key is required'),
      options: {
        list: [
          { title: 'Workshops', value: 'workshops' },
          { title: 'Join', value: 'join' },
          { title: 'About', value: 'about' }
        ]
      },
      readOnly: ({ document }) => {
        if (document?._id) {
          return document._id.includes('navigation-workshops') ||
                 document._id.includes('navigation-join') ||
                 document._id.includes('navigation-about');
        }
        return false;
      },
      initialValue: ({ document }) => {
        if (document?._id) {
          if (document._id.includes('navigation-workshops')) return 'workshops';
          if (document._id.includes('navigation-join')) return 'join';
          if (document._id.includes('navigation-about')) return 'about';
        }
        return 'workshops';
      }
    }),
    defineField({
      name: 'type',
      title: 'Navigation Type',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: 'Mega Menu', value: 'megamenu' },
          { title: 'Direct Link', value: 'direct' }
        ]
      }
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    // Page Reference für direkte Links
    defineField({
      name: 'pageLink',
      title: 'Link to Page',
      description: 'Select a page to link to',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.type !== 'direct'
    }),
    // Section ID für direkte Links
    defineField({
      name: 'sectionId',
      title: 'Section ID',
      type: 'string',
      description: 'Optional: ID der Section die angesteuert werden soll',
      hidden: ({ parent }) => parent?.type !== 'direct'
    }),
    // Legacy directLink field - wird durch pageLink ersetzt
    defineField({
      name: 'directLink',
      title: 'Direct Link',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'direct',
      description: 'DEPRECATED: Bitte nutzen Sie stattdessen die Page Reference'
    }),
    // Mega Menu Felder
    defineField({
      name: 'featured',
      title: 'Featured Content',
      type: 'object',
      hidden: ({ parent }) => parent?.type !== 'megamenu',
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
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true
          }
        },
        {
          name: 'link',
          title: 'Link',
          type: 'string'
        },
        {
          name: 'linkType',
          title: 'Link Type',
          type: 'string',
          options: {
            list: [
              { title: 'Anchor Link', value: 'anchor' },
              { title: 'Page Link', value: 'page' }
            ]
          }
        }
      ]
    }),
    defineField({
      name: 'columns',
      title: 'Menu Columns',
      type: 'array',
      hidden: ({ parent }) => parent?.type !== 'megamenu',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Column Title',
              type: 'string'
            },
            {
              name: 'items',
              title: 'Menu Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      title: 'Label',
                      type: 'string'
                    },
                    {
                      name: 'link',
                      title: 'Link',
                      type: 'string'
                    },
                    {
                      name: 'linkType',
                      title: 'Link Type',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Anchor Link', value: 'anchor' },
                          { title: 'Page Link', value: 'page' }
                        ]
                      }
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
      name: 'quickLinks',
      title: 'Quick Links',
      type: 'array',
      hidden: ({ parent }) => parent?.type !== 'megamenu',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string'
            },
            {
              name: 'link',
              title: 'Link',
              type: 'string'
            },
            {
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Anchor Link', value: 'anchor' },
                  { title: 'Page Link', value: 'page' }
                ]
              }
            }
          ]
        }
      ]
    })
  ]
})
