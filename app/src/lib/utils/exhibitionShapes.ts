/**
 * Utility functions for generating and working with exhibition stand shapes
 */

export type ShapeType = 'rectangle' | 'lShape' | 'uShape' | 'polygon'

export interface Point {
  x: number
  y: number
}

export interface ShapeDefinition {
  type: ShapeType
  points?: Point[]
}

/**
 * Generate points for predefined shape types based on bounding box
 */
export function generateShapePoints(
  type: ShapeType,
  width: number,
  height: number,
  x: number = 0,
  y: number = 0
): Point[] {
  switch (type) {
    case 'rectangle':
      return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ]

    case 'lShape':
      // L-Shape: takes bottom-left corner
      const lWidth = width * 0.6
      const lHeight = height * 0.6
      return [
        { x, y },
        { x: x + lWidth, y },
        { x: x + lWidth, y: y + lHeight },
        { x: x + width, y: y + lHeight },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ]

    case 'uShape':
      // U-Shape: open at the top
      const uWidth = width * 0.3
      const uDepth = height * 0.7
      return [
        { x, y },
        { x: x + uWidth, y },
        { x: x + uWidth, y: y + uDepth },
        { x: x + width - uWidth, y: y + uDepth },
        { x: x + width - uWidth, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ]

    case 'polygon':
      // Default to chamfered rectangle (abgeschrägtes Rechteck) if no custom points provided
      const chamfer = Math.min(width, height) * 0.2 // 20% chamfer
      return [
        { x: x + chamfer, y: y },                    // Top left chamfer
        { x: x + width - chamfer, y: y },            // Top right chamfer
        { x: x + width, y: y + chamfer },            // Right top chamfer
        { x: x + width, y: y + height - chamfer },   // Right bottom chamfer
        { x: x + width - chamfer, y: y + height },   // Bottom right chamfer
        { x: x + chamfer, y: y + height },           // Bottom left chamfer
        { x: x, y: y + height - chamfer },           // Left bottom chamfer
        { x: x, y: y + chamfer },                    // Left top chamfer
      ]

    default:
      return []
  }
}

/**
 * Convert points array to flat array for Konva Line
 */
export function pointsToFlatArray(points: Point[]): number[] {
  return points.flatMap(p => [p.x, p.y])
}

/**
 * Calculate center point of a polygon
 */
export function getPolygonCenter(points: Point[]): Point {
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  return {
    x: sumX / points.length,
    y: sumY / points.length,
  }
}

/**
 * Calculate bounding box of a polygon
 */
export function getPolygonBounds(points: Point[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  const { x, y } = point
  const n = polygon.length

  let p1 = polygon[0]
  for (let i = 1; i <= n; i++) {
    const p2 = polygon[i % n]
    if (y > Math.min(p1.y, p2.y)) {
      if (y <= Math.max(p1.y, p2.y)) {
        if (x <= Math.max(p1.x, p2.x)) {
          const xIntersection =
            ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x
          if (p1.x === p2.x || x <= xIntersection) {
            inside = !inside
          }
        }
      }
    }
    p1 = p2
  }

  return inside
}

/**
 * Predefined shape templates for quick selection
 */
export const SHAPE_TEMPLATES = {
  rectangle: {
    name: 'Rechteck',
    type: 'rectangle' as ShapeType,
    aspectRatio: 1,
  },
  square: {
    name: 'Quadrat',
    type: 'rectangle' as ShapeType,
    aspectRatio: 1,
  },
  lShapeLeft: {
    name: 'L-Form (Links)',
    type: 'lShape' as ShapeType,
    aspectRatio: 1,
  },
  lShapeRight: {
    name: 'L-Form (Rechts)',
    type: 'lShape' as ShapeType,
    aspectRatio: 1,
    mirror: true,
  },
  uShape: {
    name: 'U-Form',
    type: 'uShape' as ShapeType,
    aspectRatio: 1.5,
  },
  corner: {
    name: 'Eckstand',
    type: 'polygon' as ShapeType,
    aspectRatio: 1,
    customPoints: [
      { x: 0, y: 0 },
      { x: 0.7, y: 0 },
      { x: 1, y: 0.3 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
  },
  hexagon: {
    name: 'Sechseck',
    type: 'polygon' as ShapeType,
    aspectRatio: 1,
    customPoints: [
      { x: 0.25, y: 0 },
      { x: 0.75, y: 0 },
      { x: 1, y: 0.5 },
      { x: 0.75, y: 1 },
      { x: 0.25, y: 1 },
      { x: 0, y: 0.5 },
    ],
  },
}

/**
 * Scale custom points to actual dimensions
 */
export function scaleCustomPoints(
  points: Point[],
  width: number,
  height: number,
  x: number = 0,
  y: number = 0
): Point[] {
  return points.map(p => ({
    x: x + p.x * width,
    y: y + p.y * height,
  }))
}