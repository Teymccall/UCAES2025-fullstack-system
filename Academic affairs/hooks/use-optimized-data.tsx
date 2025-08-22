"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePerformance } from '@/components/performance-context'

interface UseOptimizedDataOptions {
  cacheKey: string
  cacheExpiry?: number
  enabled?: boolean
  staleWhileRevalidate?: boolean
}

export function useOptimizedData<T>(
  fetcher: () => Promise<T>,
  options: UseOptimizedDataOptions
) {
  const { 
    cacheKey, 
    cacheExpiry = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    staleWhileRevalidate = true 
  } = options
  
  const performance = usePerformance()
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async (useCache = true) => {
    if (!enabled) return

    // Check cache first
    if (useCache) {
      const cachedData = performance.get<T>(cacheKey)
      if (cachedData) {
        setData(cachedData)
        if (!staleWhileRevalidate) return
      }
    }

    // Set loading if no cached data
    if (!data || !useCache) {
      setIsLoading(true)
      performance.setLoading(cacheKey, true)
    }

    try {
      performance.startTimer(cacheKey)
      const result = await fetcher()
      
      setData(result)
      setError(null)
      
      // Cache the result
      performance.set(cacheKey, result, cacheExpiry)
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error(`Data fetch error for ${cacheKey}:`, error)
    } finally {
      setIsLoading(false)
      performance.setLoading(cacheKey, false)
      performance.endTimer(cacheKey)
    }
  }, [enabled, cacheKey, cacheExpiry, staleWhileRevalidate, performance, fetcher, data])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refresh function
  const refresh = useCallback(() => {
    return fetchData(false)
  }, [fetchData])

  // Clear cache
  const clearCache = useCallback(() => {
    performance.clear(cacheKey)
  }, [performance, cacheKey])

  return {
    data,
    error,
    isLoading: isLoading || performance.isLoading(cacheKey),
    refresh,
    clearCache
  }
}


