export interface Review {
  id: string
  hotelName: string
  country: string
  travelerType: 'Business' | 'Couple' | 'Family' | 'Solo' | 'Friends'
  source: 'Booking' | 'Google' | 'Tripadvisor' | 'Agoda' | 'Expedia'
  score: number
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  createdAt: string
  title?: string
  content?: string
  topics?: string[]
}

export interface ReviewsResponse {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  items: Review[]
}

export interface AnalyticsPoint {
  key: string
  count: number
  avgScore: number
}

export interface AnalyticsResponse {
  groupBy: string
  total: number
  points: AnalyticsPoint[]
}

export interface ReviewsQueryParams {
  page: number
  pageSize: number
  country?: string
  travelerType?: string
  source?: string
  sentiment?: string
  minScore?: number
  maxScore?: number
  q?: string
  sort?: string
}
