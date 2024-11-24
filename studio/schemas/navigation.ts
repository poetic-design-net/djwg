import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  initialValue: {
    menuKey: 'workshops' // Default value, will be overridden
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
        // Lock the menuKey based on the document ID
        if (document?._id) {
          return document._id.includes('navigation-workshops') ||
                 document._id.includes('navigation-join') ||
                 document._id.includes('navigation-about');
        }
        return false;
      },
      initialValue: ({ document }) => {
        // Set menuKey based on document ID
        if (document?._id) {
          if (document._id.includes('navigation-workshops')) return 'workshops';
          if (document._id.includes('navigation-join')) return 'join';
          if (document._id.includes('navigation-about')) return 'about';
        }
        return 'workshops'; // Default value
      }
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().error('Title is required')
    }),
    defineField({
      name: 'featured',
      title: 'Featured Content',
      type: 'object',
      validation: Rule => Rule.required().error('Featured content is required'),
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: Rule => Rule.required().error('Featured title is required')
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
          validation: Rule => Rule.required().error('Featured description is required')
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          validation: Rule => Rule.required().error('Featured image is required'),
          options: {
            hotspot: true
          }
        },
        {
          name: 'link',
          title: 'Link',
          type: 'string',
          validation: Rule => Rule.required().error('Featured link is required')
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
          },
          validation: Rule => Rule.required().error('Link type is required')
        }
      ]
    }),
    defineField({
      name: 'columns',
      title: 'Menu Columns',
      type: 'array',
      validation: Rule => Rule.required().min(1).error('At least one menu column is required'),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Column Title',
              type: 'string',
              validation: Rule => Rule.required().error('Column title is required')
            },
            {
              name: 'items',
              title: 'Menu Items',
              type: 'array',
              validation: Rule => Rule.required().min(1).error('At least one menu item is required'),
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: Rule => Rule.required().error('Menu item label is required')
                    },
                    {
                      name: 'link',
                      title: 'Link',
                      type: 'string',
                      validation: Rule => Rule.required().error('Menu item link is required')
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
                      },
                      validation: Rule => Rule.required().error('Link type is required')
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
      validation: Rule => Rule.required().min(1).error('At least one quick link is required'),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: Rule => Rule.required().error('Quick link label is required')
            },
            {
              name: 'link',
              title: 'Link',
              type: 'string',
              validation: Rule => Rule.required().error('Quick link URL is required')
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
              },
              validation: Rule => Rule.required().error('Link type is required')
            }
          ]
        }
      ]
    })
  ]
})
