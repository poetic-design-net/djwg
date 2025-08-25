import { defineType, defineField } from 'sanity'
import { PolygonEditor } from '../../components/PolygonEditor'

export default defineType({
  name: 'standShape',
  title: 'Stand Form',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Formtyp',
      type: 'string',
      options: {
        list: [
          { title: 'Rechteck', value: 'rectangle' },
          { title: 'L-Form', value: 'lShape' },
          { title: 'U-Form', value: 'uShape' },
          { title: 'Polygon', value: 'polygon' },
        ],
      },
      initialValue: 'rectangle',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'points',
      title: 'Polygon-Punkte',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'x', type: 'number', title: 'X' },
            { name: 'y', type: 'number', title: 'Y' },
          ],
          preview: {
            select: {
              x: 'x',
              y: 'y',
            },
            prepare({ x, y }) {
              return {
                title: `Punkt: (${x}, ${y})`,
              }
            },
          },
        },
      ],
      components: {
        input: PolygonEditor,
      },
      hidden: ({ parent }) => parent?.type !== 'polygon',
      description: 'Nutze die Vorlagen oder zeichne deine eigene Form',
    }),
  ],
  initialValue: {
    type: 'rectangle',
  },
})