import React from 'react'
import { Card, Stack, Text, Grid } from '@sanity/ui'
import { set, unset } from 'sanity'

const SHAPE_TEMPLATES = [
  { 
    value: 'rectangle', 
    title: 'Rechteck',
    preview: 'M 0 0 L 100 0 L 100 60 L 0 60 Z'
  },
  { 
    value: 'lShape', 
    title: 'L-Form',
    preview: 'M 0 0 L 60 0 L 60 40 L 100 40 L 100 60 L 0 60 Z'
  },
  { 
    value: 'uShape', 
    title: 'U-Form',
    preview: 'M 0 0 L 30 0 L 30 40 L 70 40 L 70 0 L 100 0 L 100 60 L 0 60 Z'
  },
  { 
    value: 'polygon', 
    title: 'Polygon (Benutzerdefiniert)',
    preview: 'M 25 0 L 75 0 L 100 30 L 75 60 L 25 60 L 0 30 Z'
  },
]

export function ShapeSelector(props: any) {
  const { elementProps, onChange, value = {} } = props
  
  const handleShapeSelect = (shapeType: string) => {
    onChange([
      set(shapeType, ['type']),
      // Clear custom points when switching shapes
      shapeType !== 'polygon' ? unset(['points']) : undefined
    ].filter(Boolean))
  }

  return (
    <Card padding={3}>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Wählen Sie eine Standform
        </Text>
        
        <Grid columns={2} gap={2}>
          {SHAPE_TEMPLATES.map((shape) => (
            <Card
              key={shape.value}
              padding={2}
              radius={2}
              tone={value.type === shape.value ? 'primary' : 'default'}
              style={{ 
                cursor: 'pointer',
                border: value.type === shape.value ? '2px solid var(--card-accent-fg-color)' : '1px solid var(--card-border-color)'
              }}
              onClick={() => handleShapeSelect(shape.value)}
            >
              <Stack space={2} align="center">
                <svg 
                  width="100" 
                  height="60" 
                  viewBox="0 0 100 60"
                  style={{ width: '100%', height: 'auto' }}
                >
                  <path 
                    d={shape.preview} 
                    fill={value.type === shape.value ? 'var(--card-accent-fg-color)' : '#e5e7eb'}
                    stroke={value.type === shape.value ? 'var(--card-accent-fg-color)' : '#9ca3af'}
                    strokeWidth="1"
                  />
                </svg>
                <Text size={1} align="center">
                  {shape.title}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>

        {value.type === 'polygon' && (
          <Card padding={2} radius={2} tone="caution">
            <Text size={1}>
              Für benutzerdefinierte Polygon-Formen können Sie die Punkte unten definieren.
            </Text>
          </Card>
        )}
      </Stack>
    </Card>
  )
}