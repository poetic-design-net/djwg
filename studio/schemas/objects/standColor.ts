import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'standColor',
  title: 'Stand Farbe',
  type: 'object',
  fields: [
    defineField({
      name: 'useCustom',
      title: 'Eigene Farbe verwenden',
      type: 'boolean',
      initialValue: false,
      description: 'Aktivieren um eine eigene Farbe statt der Status-Farbe zu verwenden',
    }),
    defineField({
      name: 'hex',
      title: 'Farbe',
      type: 'string',
      hidden: ({ parent }) => !parent?.useCustom,
      description: 'Hex-Farbcode (z.B. #ff6900)',
      validation: (Rule) => Rule.custom((value, context: any) => {
        const parent = context?.parent as any
        if (!parent?.useCustom) return true
        if (!value) return 'Bitte wählen Sie eine Farbe'
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return 'Bitte geben Sie einen gültigen Hex-Code ein (z.B. #ff6900)'
        }
        return true
      }),
    }),
    defineField({
      name: 'opacity',
      title: 'Transparenz',
      type: 'number',
      hidden: ({ parent }) => !parent?.useCustom,
      validation: (Rule) => Rule.min(0).max(1),
      initialValue: 0.7,
      description: 'Transparenz von 0 (transparent) bis 1 (undurchsichtig)',
    }),
  ],
  preview: {
    select: {
      useCustom: 'useCustom',
      hex: 'hex',
    },
    prepare({ useCustom, hex }) {
      return {
        title: useCustom && hex ? `Farbe: ${hex}` : 'Status-Farbe verwenden',
        subtitle: useCustom ? 'Eigene Farbe aktiv' : 'Standard Status-Farben'
      }
    },
  },
})