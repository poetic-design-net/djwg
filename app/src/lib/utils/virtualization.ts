import type { ExhibitionStand } from '$lib/types/exhibition'

export interface ViewportBounds {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

export function getVisibleStands(
  stands: ExhibitionStand[],
  viewport: ViewportBounds,
  buffer = 100
): ExhibitionStand[] {
  // Calculate the actual viewport in canvas coordinates
  const viewportInCanvas = {
    left: -viewport.x / viewport.scale - buffer,
    right: (-viewport.x + viewport.width) / viewport.scale + buffer,
    top: -viewport.y / viewport.scale - buffer,
    bottom: (-viewport.y + viewport.height) / viewport.scale + buffer,
  }

  // Filter stands that are within the viewport
  return stands.filter(stand => {
    const standRight = stand.position.x + stand.size.width
    const standBottom = stand.position.y + stand.size.height

    return (
      stand.position.x < viewportInCanvas.right &&
      standRight > viewportInCanvas.left &&
      stand.position.y < viewportInCanvas.bottom &&
      standBottom > viewportInCanvas.top
    )
  })
}

export function shouldRenderDetails(
  stand: ExhibitionStand,
  scale: number,
  isHovered: boolean,
  isSelected: boolean
): boolean {
  // Always show details for hovered or selected stands
  if (isHovered || isSelected) return true

  // Show details based on zoom level and stand size
  const area = stand.size.width * stand.size.height
  const scaledArea = area * scale * scale

  // Only show labels if the stand is large enough on screen
  return scaledArea > 5000 // Adjust threshold as needed
}

export function getOptimizedFontSize(
  baseSize: number,
  scale: number,
  min = 8,
  max = 24
): number {
  const scaledSize = baseSize / Math.sqrt(scale)
  return Math.max(min, Math.min(max, scaledSize))
}

export function shouldRenderFloorPlan(scale: number): boolean {
  // Only render floor plan image at reasonable zoom levels
  return scale > 0.3 && scale < 3
}

// Batch updates for better performance
export class BatchUpdateManager {
  private updates: Map<string, () => void> = new Map()
  private rafId: number | null = null

  add(key: string, update: () => void) {
    this.updates.set(key, update)
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flush()
      })
    }
  }

  flush() {
    this.updates.forEach(update => update())
    this.updates.clear()
    this.rafId = null
  }

  clear() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.updates.clear()
  }
}