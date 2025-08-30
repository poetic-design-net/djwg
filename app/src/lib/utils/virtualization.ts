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

  // Show details based on zoom level
  // At very low zoom (< 0.35), hide labels to avoid clutter
  if (scale < 0.35) return false
  
  // At normal to high zoom (>= 0.35), show labels based on stand size
  const area = stand.size.width * stand.size.height
  const scaledArea = area * scale * scale

  // Check if text would be readable
  // Need minimum width for text to be legible
  const minWidthForText = 40 / scale
  if (stand.size.width < minWidthForText) return false

  // Lower threshold for better label visibility
  // Small stands need at least 1200 pixels, larger stands always show
  return scaledArea > 1200 || area > 8000
}

export function getOptimizedFontSize(
  baseSize: number,
  scale: number,
  min = 8,
  max = 24
): number {
  // Improved scaling formula that maintains better readability
  // At scale 1.0, use baseSize
  // At scale 0.5, increase font size slightly
  // At scale 2.0, decrease font size slightly
  let scaledSize: number
  
  if (scale < 1) {
    // When zoomed out, increase font size to maintain readability
    scaledSize = baseSize / (scale * 0.8) // Less aggressive scaling
  } else {
    // When zoomed in, decrease font size proportionally
    scaledSize = baseSize / Math.pow(scale, 0.6) // Smoother scaling for zoom in
  }
  
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