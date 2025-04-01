import {defineType, defineArrayMember} from 'sanity'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'}
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
          {
            name: 'textColor',
            type: 'textColor',
            options: {
              colorList: [
                { label: 'Rot', value: '#FF1E1E' },
                { label: 'Grün', value: '#B2E600' },
                { label: 'Grau', value: '#6D6D6D' },
                { label: 'Blau-Grau', value: '#606C7A' },
                { label: 'Türkis', value: '#33cc99' },
                { label: 'Custom...', value: 'custom' },
              ]
            }
          },
          {
            name: 'highlightColor',
            type: 'highlightColor',
            options: {
              colorList: [
                { label: 'Rot', value: '#FF1E1E' },
                { label: 'Grün', value: '#B2E600' },
                { label: 'Grau', value: '#6D6D6D' },
                { label: 'Blau-Grau', value: '#606C7A' },
                { label: 'Türkis', value: '#33cc99' },
                { label: 'Custom...', value: 'custom' },
              ]
            }
          }
        ],
      },
    }),
  ],
})
