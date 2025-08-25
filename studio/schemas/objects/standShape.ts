import { defineType, defineField } from 'sanity'

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
      name: 'width',
      title: 'Breite',
      type: 'number',
      hidden: ({ parent }) => parent?.type === 'polygon',
      validation: (Rule) => Rule.min(10).max(500),
      initialValue: 100,
      description: 'Breite des Stands in Pixeln',
    }),
    defineField({
      name: 'height',
      title: 'Höhe',
      type: 'number',
      hidden: ({ parent }) => parent?.type === 'polygon',
      validation: (Rule) => Rule.min(10).max(500),
      initialValue: 100,
      description: 'Höhe des Stands in Pixeln',
    }),
    defineField({
      name: 'points',
      title: 'Polygon-Punkte',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Punkt',
          fields: [
            { 
              name: 'x', 
              type: 'number', 
              title: 'X-Koordinate',
              validation: (Rule) => Rule.required().min(0).max(1000),
            },
            { 
              name: 'y', 
              type: 'number', 
              title: 'Y-Koordinate',
              validation: (Rule) => Rule.required().min(0).max(1000),
            },
          ],
          preview: {
            select: {
              x: 'x',
              y: 'y',
            },
            prepare({ x, y }) {
              return {
                title: `Punkt: (${x || 0}, ${y || 0})`,
              }
            },
          },
        },
      ],
      hidden: ({ parent }) => parent?.type !== 'polygon',
      description: 'Gib die Punkte als X,Y Koordinaten ein. Das Polygon wird automatisch geschlossen. Mindestens 3 Punkte erforderlich.',
      validation: (Rule) => Rule.custom((points, context) => {
        const parent = context?.parent as any
        if (parent?.type === 'polygon') {
          if (!points || points.length < 3) {
            return 'Ein Polygon muss mindestens 3 Punkte haben'
          }
        }
        return true
      }),
    }),
  ],
  initialValue: {
    type: 'rectangle',
    width: 100,
    height: 100,
  },
})