export interface ExhibitionHall {
  _id: string
  name: string
  hallId: string
  dimensions: {
    width: number
    height: number
  }
  floorPlan?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  isSecret?: boolean
  order?: number
}

export interface Exhibitor {
  _id: string
  company: string
  slug: {
    current: string
  }
  logo?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  category: 'technics' | 'medicine' | 'industry' | 'it' | 'service' | 'craft' | 'other'
  description?: string
  contact?: {
    email?: string
    phone?: string
    website?: string
    contactPerson?: string
  }
  isPremium?: boolean
  products?: string[]
  isSecret?: boolean
}

export interface ExhibitionStand {
  _id: string
  standNumber: string
  hall: ExhibitionHall
  exhibitor?: Exhibitor
  shape?: {
    type: 'rectangle' | 'lShape' | 'uShape' | 'polygon'
    points?: Array<{ x: number; y: number }>
  }
  customColor?: {
    useCustom?: boolean
    hex?: string
    opacity?: number
  }
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  status: 'available' | 'booked' | 'reserved' | 'blocked'
  standType: 'small' | 'medium' | 'large'
  price?: number
  features?: string[]
  notes?: string
  isSecret?: boolean
}

export interface StandFilter {
  categories?: string[]
  status?: string[]
  standType?: string[]
  searchQuery?: string
  showSecret?: boolean
}

export const CATEGORY_LABELS: Record<string, string> = {
  technics: 'Technik',
  medicine: 'Medizin',
  industry: 'Industrie',
  it: 'IT',
  service: 'Dienstleistung',
  craft: 'Handwerk',
  other: 'Sonstiges',
}

export const STATUS_COLORS = {
  available: '#10b981', // green
  booked: '#ef4444', // red
  reserved: '#f59e0b', // yellow
  blocked: '#6b7280', // gray
}

export const STAND_TYPE_LABELS: Record<string, string> = {
  small: 'Klein (< 20m²)',
  medium: 'Mittel (20-50m²)',
  large: 'Groß (> 50m²)',
}