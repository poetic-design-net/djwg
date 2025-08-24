import { writable, derived } from 'svelte/store'
import type { ExhibitionHall, ExhibitionStand, Exhibitor, StandFilter } from '$lib/types/exhibition'

// Main data stores
export const halls = writable<ExhibitionHall[]>([])
export const stands = writable<ExhibitionStand[]>([])
export const exhibitors = writable<Exhibitor[]>([])

// UI state stores
export const selectedHall = writable<ExhibitionHall | null>(null)
export const selectedStand = writable<ExhibitionStand | null>(null)
export const hoveredStand = writable<ExhibitionStand | null>(null)
export const filters = writable<StandFilter>({
  categories: [],
  status: [],
  standType: [],
  searchQuery: '',
  showSecret: false,
})

// Canvas state stores
export const canvasScale = writable(1)
export const canvasPosition = writable({ x: 0, y: 0 })

// Derived stores
export const filteredStands = derived(
  [stands, filters, selectedHall],
  ([$stands, $filters, $selectedHall]) => {
    let filtered = $stands

    // Filter by selected hall
    if ($selectedHall) {
      filtered = filtered.filter(stand => stand.hall._id === $selectedHall._id)
    }

    // Filter by secret visibility
    if (!$filters.showSecret) {
      filtered = filtered.filter(stand => !stand.isSecret && !stand.hall?.isSecret && !stand.exhibitor?.isSecret)
    }

    // Filter by categories
    if ($filters.categories && $filters.categories.length > 0) {
      filtered = filtered.filter(stand => 
        stand.exhibitor && $filters.categories?.includes(stand.exhibitor.category)
      )
    }

    // Filter by status
    if ($filters.status && $filters.status.length > 0) {
      filtered = filtered.filter(stand => $filters.status?.includes(stand.status))
    }

    // Filter by stand type
    if ($filters.standType && $filters.standType.length > 0) {
      filtered = filtered.filter(stand => $filters.standType?.includes(stand.standType))
    }

    // Filter by search query (handled by Fuse.js in component)
    // This is just for non-fuzzy filtering as backup
    if ($filters.searchQuery && $filters.searchQuery.trim()) {
      const query = $filters.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(stand => {
        const companyMatch = stand.exhibitor?.company?.toLowerCase().includes(query)
        const standNumberMatch = stand.standNumber?.toLowerCase().includes(query)
        const categoryMatch = stand.exhibitor?.category?.toLowerCase().includes(query)
        const productsMatch = stand.exhibitor?.products?.some(p => 
          p.toLowerCase().includes(query)
        )
        
        return companyMatch || standNumberMatch || categoryMatch || productsMatch
      })
    }

    return filtered
  }
)

export const visibleHalls = derived(
  [halls, filters],
  ([$halls, $filters]) => {
    if ($filters.showSecret) {
      return $halls
    }
    return $halls.filter(hall => !hall.isSecret)
  }
)

// Helper functions
export function resetCanvasView() {
  canvasScale.set(1)
  canvasPosition.set({ x: 0, y: 0 })
}

export function zoomToStand(stand: ExhibitionStand, scale = 2) {
  if (!stand) return
  
  // Calculate center position
  const centerX = stand.position.x + stand.size.width / 2
  const centerY = stand.position.y + stand.size.height / 2
  
  // Set scale and position to center the stand
  canvasScale.set(scale)
  canvasPosition.set({
    x: -centerX * scale + window.innerWidth / 2,
    y: -centerY * scale + window.innerHeight / 2,
  })
  
  // Select the stand
  selectedStand.set(stand)
}