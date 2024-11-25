import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'themeSettings',
  title: 'Tailwind',
  type: 'document',
  groups: [
    { name: 'colors', title: 'Colors', default: true },
    { name: 'screens', title: 'Screen Breakpoints' },
    { name: 'fonts', title: 'Font Families' }
  ],
  fields: [
    defineField({
      name: 'colors',
      title: 'Colors',
      type: 'object',
      group: 'colors',
      fields: [
        {
          name: 'red',
          title: 'Red Colors',
          type: 'object',
          fields: [
            { name: 'shade50', title: '50', type: 'string', initialValue: '#FFF1F1' },
            { name: 'shade100', title: '100', type: 'string', initialValue: '#FFDFDF' },
            { name: 'shade200', title: '200', type: 'string', initialValue: '#FFC5C5' },
            { name: 'shade300', title: '300', type: 'string', initialValue: '#FF9D9D' },
            { name: 'shade400', title: '400', type: 'string', initialValue: '#FF6464' },
            { name: 'shade500', title: '500', type: 'string', initialValue: '#FF1E1E' },
            { name: 'shade600', title: '600', type: 'string', initialValue: '#ED1515' },
            { name: 'shade700', title: '700', type: 'string', initialValue: '#C80D0D' },
            { name: 'shade800', title: '800', type: 'string', initialValue: '#A50F0F' },
            { name: 'shade900', title: '900', type: 'string', initialValue: '#881414' },
          ],
        },
        {
          name: 'green',
          title: 'Green Colors',
          type: 'object',
          fields: [
            { name: 'shade50', title: '50', type: 'string', initialValue: '#FDFFE4' },
            { name: 'shade100', title: '100', type: 'string', initialValue: '#F9FFC4' },
            { name: 'shade200', title: '200', type: 'string', initialValue: '#F1FF90' },
            { name: 'shade300', title: '300', type: 'string', initialValue: '#E2FF50' },
            { name: 'shade400', title: '400', type: 'string', initialValue: '#CCFF00' },
            { name: 'shade500', title: '500', type: 'string', initialValue: '#B2E600' },
            { name: 'shade600', title: '600', type: 'string', initialValue: '#8AB800' },
            { name: 'shade700', title: '700', type: 'string', initialValue: '#688B00' },
            { name: 'shade800', title: '800', type: 'string', initialValue: '#526D07' },
            { name: 'shade900', title: '900', type: 'string', initialValue: '#455C0B' },
          ],
        },
        {
          name: 'gray',
          title: 'Gray Colors',
          type: 'object',
          fields: [
            { name: 'shade50', title: '50', type: 'string', initialValue: '#F6F6F6' },
            { name: 'shade100', title: '100', type: 'string', initialValue: '#E7E7E7' },
            { name: 'shade200', title: '200', type: 'string', initialValue: '#D1D1D1' },
            { name: 'shade300', title: '300', type: 'string', initialValue: '#B0B0B0' },
            { name: 'shade400', title: '400', type: 'string', initialValue: '#888888' },
            { name: 'shade500', title: '500', type: 'string', initialValue: '#6D6D6D' },
            { name: 'shade600', title: '600', type: 'string', initialValue: '#5D5D5D' },
            { name: 'shade700', title: '700', type: 'string', initialValue: '#4C4C4C' },
            { name: 'shade800', title: '800', type: 'string', initialValue: '#454545' },
            { name: 'shade900', title: '900', type: 'string', initialValue: '#3D3D3D' },
          ],
        },
        {
          name: 'blueGray',
          title: 'Blue Gray Colors',
          type: 'object',
          fields: [
            { name: 'shade50', title: '50', type: 'string', initialValue: '#F4F6F7' },
            { name: 'shade100', title: '100', type: 'string', initialValue: '#E4E7E9' },
            { name: 'shade200', title: '200', type: 'string', initialValue: '#CBD1D6' },
            { name: 'shade300', title: '300', type: 'string', initialValue: '#A7B0B9' },
            { name: 'shade400', title: '400', type: 'string', initialValue: '#7B8795' },
            { name: 'shade500', title: '500', type: 'string', initialValue: '#606C7A' },
            { name: 'shade600', title: '600', type: 'string', initialValue: '#535B67' },
            { name: 'shade700', title: '700', type: 'string', initialValue: '#474E57' },
            { name: 'shade800', title: '800', type: 'string', initialValue: '#3F434B' },
            { name: 'shade900', title: '900', type: 'string', initialValue: '#383C41' },
          ],
        },
        {
          name: 'tourquis',
          title: 'Tourquis Colors',
          type: 'object',
          fields: [
            { name: 'shade500', title: '500', type: 'string', initialValue: '#33cc99' },
          ],
        },
        {
          name: 'custom',
          title: 'Custom Colors',
          type: 'object',
          fields: [
            { name: 'body', title: 'Body Background', type: 'string', initialValue: '#0E0F11' },
            { name: 'bodyText', title: 'Body Text', type: 'string', initialValue: '#fff' },
          ],
        },
      ],
    }),
    defineField({
      name: 'screens',
      title: 'Screen Breakpoints',
      type: 'object',
      group: 'screens',
      fields: [
        { name: 'sm', title: 'Small', type: 'string', initialValue: '640px' },
        { name: 'md', title: 'Medium', type: 'string', initialValue: '768px' },
        { name: 'lg', title: 'Large', type: 'string', initialValue: '1024px' },
        { name: 'xl', title: 'Extra Large', type: 'string', initialValue: '1280px' },
        { name: 'xxl', title: '2X Large', type: 'string', initialValue: '1536px' },
      ],
    }),
    defineField({
      name: 'fontFamily',
      title: 'Font Families',
      type: 'object',
      group: 'fonts',
      fields: [
        {
          name: 'body',
          title: 'Body Font',
          type: 'array',
          of: [{ type: 'string' }],
          initialValue: [
            'Clash Grotesk',
            'ui-sans-serif',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif'
          ]
        },
        {
          name: 'heading',
          title: 'Heading Font',
          type: 'array',
          of: [{ type: 'string' }],
          initialValue: [
            'Clash Grotesk',
            'ui-sans-serif',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif'
          ]
        }
      ]
    })
  ],
})
