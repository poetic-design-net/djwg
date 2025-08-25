import React, { useState, useEffect } from 'react'
import { set, unset } from 'sanity'

// Predefined shape templates
const SHAPE_PRESETS = {
  triangle: {
    name: 'Dreieck',
    icon: '▲',
    generate: (width: number, height: number) => [
      { x: width / 2, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ]
  },
  diamond: {
    name: 'Diamant',
    icon: '◆',
    generate: (width: number, height: number) => [
      { x: width / 2, y: 0 },
      { x: width, y: height / 2 },
      { x: width / 2, y: height },
      { x: 0, y: height / 2 }
    ]
  },
  pentagon: {
    name: 'Fünfeck',
    icon: '⬟',
    generate: (width: number, height: number) => [
      { x: width / 2, y: 0 },
      { x: width, y: height * 0.38 },
      { x: width * 0.81, y: height },
      { x: width * 0.19, y: height },
      { x: 0, y: height * 0.38 }
    ]
  },
  hexagon: {
    name: 'Sechseck',
    icon: '⬢',
    generate: (width: number, height: number) => [
      { x: width * 0.25, y: 0 },
      { x: width * 0.75, y: 0 },
      { x: width, y: height / 2 },
      { x: width * 0.75, y: height },
      { x: width * 0.25, y: height },
      { x: 0, y: height / 2 }
    ]
  },
  octagon: {
    name: 'Achteck',
    icon: '🛑',
    generate: (width: number, height: number) => [
      { x: width * 0.3, y: 0 },
      { x: width * 0.7, y: 0 },
      { x: width, y: height * 0.3 },
      { x: width, y: height * 0.7 },
      { x: width * 0.7, y: height },
      { x: width * 0.3, y: height },
      { x: 0, y: height * 0.7 },
      { x: 0, y: height * 0.3 }
    ]
  },
  lShape: {
    name: 'L-Form',
    icon: 'L',
    generate: (width: number, height: number) => [
      { x: 0, y: 0 },
      { x: width * 0.5, y: 0 },
      { x: width * 0.5, y: height * 0.6 },
      { x: width, y: height * 0.6 },
      { x: width, y: height },
      { x: 0, y: height }
    ]
  },
  tShape: {
    name: 'T-Form',
    icon: 'T',
    generate: (width: number, height: number) => [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height * 0.4 },
      { x: width * 0.65, y: height * 0.4 },
      { x: width * 0.65, y: height },
      { x: width * 0.35, y: height },
      { x: width * 0.35, y: height * 0.4 },
      { x: 0, y: height * 0.4 }
    ]
  },
  plus: {
    name: 'Plus',
    icon: '+',
    generate: (width: number, height: number) => [
      { x: width * 0.33, y: 0 },
      { x: width * 0.67, y: 0 },
      { x: width * 0.67, y: height * 0.33 },
      { x: width, y: height * 0.33 },
      { x: width, y: height * 0.67 },
      { x: width * 0.67, y: height * 0.67 },
      { x: width * 0.67, y: height },
      { x: width * 0.33, y: height },
      { x: width * 0.33, y: height * 0.67 },
      { x: 0, y: height * 0.67 },
      { x: 0, y: height * 0.33 },
      { x: width * 0.33, y: height * 0.33 }
    ]
  },
  star: {
    name: 'Stern',
    icon: '⭐',
    generate: (width: number, height: number) => {
      const cx = width / 2
      const cy = height / 2
      const outerRadius = Math.min(width, height) / 2
      const innerRadius = outerRadius * 0.4
      const points = []
      
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        points.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius
        })
      }
      return points
    }
  }
}

export function PolygonEditor(props: any) {
  const { elementProps, onChange, value = {}, schemaType } = props
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  const [canvasPoints, setCanvasPoints] = useState<Array<{x: number, y: number}>>([])
  
  // Get stand size from parent document
  const parentDocument = props.document
  const standWidth = parentDocument?.size?.width || 100
  const standHeight = parentDocument?.size?.height || 100
  
  useEffect(() => {
    if (value?.points) {
      setCanvasPoints(value.points)
    }
  }, [value?.points])

  const handlePresetClick = (presetKey: string) => {
    const preset = SHAPE_PRESETS[presetKey as keyof typeof SHAPE_PRESETS]
    if (preset) {
      const points = preset.generate(standWidth, standHeight)
      onChange(set(points, ['points']))
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showVisualEditor) return
    
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * standWidth
    const y = ((e.clientY - rect.top) / rect.height) * standHeight
    
    const newPoints = [...canvasPoints, { x, y }]
    setCanvasPoints(newPoints)
    onChange(set(newPoints, ['points']))
  }

  const clearPoints = () => {
    setCanvasPoints([])
    onChange(unset(['points']))
  }

  const removeLastPoint = () => {
    const newPoints = canvasPoints.slice(0, -1)
    setCanvasPoints(newPoints)
    if (newPoints.length > 0) {
      onChange(set(newPoints, ['points']))
    } else {
      onChange(unset(['points']))
    }
  }

  const normalizeAbsolutePoints = () => {
    // Auto-normalize if user entered absolute coordinates
    if (value?.points && value.points.length > 0) {
      const normalized = value.points.map((p: any) => ({
        x: Math.min(Math.max(0, p.x % standWidth), standWidth),
        y: Math.min(Math.max(0, p.y % standHeight), standHeight)
      }))
      onChange(set(normalized, ['points']))
    }
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          Polygon-Punkte definieren (Stand: {standWidth}x{standHeight})
        </h3>

        {/* Quick Presets */}
        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>Quick-Vorlagen:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Object.entries(SHAPE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key)}
                style={{
                  padding: '8px',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  backgroundColor: '#f0f9ff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              >
                <div style={{ fontSize: '20px' }}>{preset.icon}</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Editor */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                Visueller Editor {showVisualEditor ? '(Aktiv - Klicken zum Zeichnen)' : ''}
              </span>
              <button
                onClick={() => setShowVisualEditor(!showVisualEditor)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid',
                  borderColor: showVisualEditor ? '#10b981' : '#6b7280',
                  borderRadius: '4px',
                  backgroundColor: showVisualEditor ? '#d1fae5' : '#f9fafb',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {showVisualEditor ? 'Editor ausschalten' : 'Editor einschalten'}
              </button>
            </div>

            <div style={{ position: 'relative', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <svg
                width="100%"
                height="200"
                viewBox={`0 0 ${standWidth} ${standHeight}`}
                style={{ 
                  cursor: showVisualEditor ? 'crosshair' : 'default',
                  border: '1px solid #ddd'
                }}
                onClick={handleCanvasClick}
              >
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Polygon */}
                {canvasPoints.length > 2 && (
                  <polygon
                    points={canvasPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                )}
                
                {/* Points */}
                {canvasPoints.map((point, idx) => (
                  <g key={idx}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={point.x}
                      y={point.y - 8}
                      fontSize="10"
                      fill="#3b82f6"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearPoints}
                disabled={canvasPoints.length === 0}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  backgroundColor: '#fee2e2',
                  cursor: canvasPoints.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: canvasPoints.length === 0 ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                Alle löschen
              </button>
              <button
                onClick={removeLastPoint}
                disabled={canvasPoints.length === 0}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  backgroundColor: '#f3f4f6',
                  cursor: canvasPoints.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: canvasPoints.length === 0 ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                Letzten Punkt entfernen
              </button>
              <button
                onClick={normalizeAbsolutePoints}
                disabled={!value?.points || value.points.length === 0}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  backgroundColor: '#dbeafe',
                  cursor: !value?.points || value.points.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: !value?.points || value.points.length === 0 ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                Punkte normalisieren
              </button>
            </div>
          </div>
        </div>

        {/* Current Points Display */}
        {value?.points && value.points.length > 0 && (
          <div style={{ border: '1px solid #3b82f6', borderRadius: '4px', padding: '8px', backgroundColor: '#eff6ff' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Aktuelle Punkte:</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {value.points.map((p: any, i: number) => 
                `P${i+1}: (${Math.round(p.x)}, ${Math.round(p.y)})`
              ).join(' | ')}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
            Tipp: Nutze die Quick-Vorlagen oder aktiviere den visuellen Editor zum Zeichnen. 
            Punkte sind relativ zur Stand-Größe (0,0 = oben links).
          </p>
        </div>
      </div>
    </div>
  )
}