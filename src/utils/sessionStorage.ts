/**
 * Session storage utilities for persisting filter state across navigation
 * (but not across page refreshes)
 */

const STORAGE_KEYS = {
  REVIEWS_FILTERS: 'reviews_filters',
  REVIEWS_PAGINATION: 'reviews_pagination',
  REVIEWS_VIEW: 'reviews_view',
  DASHBOARD_PERIOD: 'dashboard_period',
} as const

export interface ReviewsFilters {
  country: string
  travelerType: string
  source: string
  sentiment: string
  minScore: number | undefined
  maxScore: number | undefined
  q: string
}

export interface ReviewsPagination {
  page: number
  pageSize: number
  sort: string
  viewMode: 'table' | 'cards'
}

// Reviews Filters
export const saveReviewsFilters = (filters: ReviewsFilters) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.REVIEWS_FILTERS, JSON.stringify(filters))
  } catch (error) {
    console.warn('Failed to save reviews filters to session storage:', error)
  }
}

export const loadReviewsFilters = (): ReviewsFilters | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.REVIEWS_FILTERS)
    if (!stored) return null
    return JSON.parse(stored) as ReviewsFilters
  } catch (error) {
    console.warn('Failed to load reviews filters from session storage:', error)
    return null
  }
}

export const clearReviewsFilters = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.REVIEWS_FILTERS)
  } catch (error) {
    console.warn('Failed to clear reviews filters from session storage:', error)
  }
}

// Reviews Pagination
export const saveReviewsPagination = (pagination: ReviewsPagination) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.REVIEWS_PAGINATION, JSON.stringify(pagination))
  } catch (error) {
    console.warn('Failed to save reviews pagination to session storage:', error)
  }
}

export const loadReviewsPagination = (): ReviewsPagination | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.REVIEWS_PAGINATION)
    if (!stored) return null
    return JSON.parse(stored) as ReviewsPagination
  } catch (error) {
    console.warn('Failed to load reviews pagination from session storage:', error)
    return null
  }
}

// Dashboard Period
export const saveDashboardPeriod = (days: number) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.DASHBOARD_PERIOD, String(days))
  } catch (error) {
    console.warn('Failed to save dashboard period to session storage:', error)
  }
}

export const loadDashboardPeriod = (): number | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.DASHBOARD_PERIOD)
    if (!stored) return null
    const num = Number(stored)
    return isNaN(num) ? null : num
  } catch (error) {
    console.warn('Failed to load dashboard period from session storage:', error)
    return null
  }
}
