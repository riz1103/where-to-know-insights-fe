import axios from 'axios'
import { ref } from 'vue'
import type { Review, ReviewsResponse, AnalyticsResponse, ReviewsQueryParams } from '@/types/api'

// Use relative path - Vite proxy will handle routing to backend
const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function useReviews() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<ReviewsResponse | null>(null)

  const fetchReviews = async (params: ReviewsQueryParams) => {
    loading.value = true
    error.value = null
    
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', params.page.toString())
      queryParams.append('pageSize', params.pageSize.toString())
      
      if (params.country) queryParams.append('country', params.country)
      if (params.travelerType) queryParams.append('travelerType', params.travelerType)
      if (params.source) queryParams.append('source', params.source)
      if (params.sentiment) queryParams.append('sentiment', params.sentiment)
      if (params.minScore) queryParams.append('minScore', params.minScore.toString())
      if (params.maxScore) queryParams.append('maxScore', params.maxScore.toString())
      if (params.q) queryParams.append('q', params.q)
      if (params.sort) queryParams.append('sort', params.sort)

      const response = await api.get<ReviewsResponse>(`/v1/reviews?${queryParams.toString()}`)
      data.value = response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          error.value = 'Cannot connect to API. Make sure the backend is running.'
        } else {
          error.value = err.response?.data?.message || err.message || 'Failed to fetch reviews'
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to fetch reviews'
      }
      console.error('Error fetching reviews:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    fetchReviews,
  }
}

export function useReview() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<Review | null>(null)

  const fetchReview = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get<Review>(`/v1/reviews/${id}`)
      data.value = response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          error.value = 'Cannot connect to API. Make sure the backend is running.'
        } else {
          error.value = err.response?.data?.message || err.message || 'Failed to fetch review'
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to fetch review'
      }
      console.error('Error fetching review:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    fetchReview,
  }
}

export function useAnalytics() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<AnalyticsResponse | null>(null)

  const fetchAnalytics = async (groupBy: string, lastDays: number = 30) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get<AnalyticsResponse>(
        `/v1/analytics/summary?groupBy=${groupBy}&lastDays=${lastDays}`
      )
      data.value = response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          error.value = 'Cannot connect to API. Make sure the backend is running.'
        } else {
          error.value = err.response?.data?.message || err.message || 'Failed to fetch analytics'
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to fetch analytics'
      }
      console.error('Error fetching analytics:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    fetchAnalytics,
  }
}
