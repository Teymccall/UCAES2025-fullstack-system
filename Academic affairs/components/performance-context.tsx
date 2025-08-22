"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface PerformanceContextType {
  // Cache management
  get: <T>(key: string) => T | null
  set: <T>(key: string, data: T, expiry?: number) => void
  clear: (key?: string) => void
  
  // Loading state management
  setLoading: (key: string, loading: boolean) => void
  isLoading: (key: string) => boolean
  
  // Performance monitoring
  startTimer: (key: string) => void
  endTimer: (key: string) => number
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

// Default cache expiry: 5 minutes
const DEFAULT_CACHE_EXPIRY = 5 * 60 * 1000

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map())
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map())
  const [timers, setTimers] = useState<Map<string, number>>(new Map())

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.get(key)
    if (!entry) return null
    
    // Check if expired
    if (Date.now() > entry.timestamp + entry.expiry) {
      cache.delete(key)
      return null
    }
    
    return entry.data as T
  }, [cache])

  const set = useCallback(<T,>(key: string, data: T, expiry = DEFAULT_CACHE_EXPIRY) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        expiry
      })
      return newCache
    })
  }, [])

  const clear = useCallback((key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
    } else {
      setCache(new Map())
    }
  }, [])

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      if (loading) {
        newStates.set(key, true)
      } else {
        newStates.delete(key)
      }
      return newStates
    })
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates.get(key) || false
  }, [loadingStates])

  const startTimer = useCallback((key: string) => {
    setTimers(prev => {
      const newTimers = new Map(prev)
      newTimers.set(key, Date.now())
      return newTimers
    })
  }, [])

  const endTimer = useCallback((key: string) => {
    const startTime = timers.get(key)
    if (!startTime) return 0
    
    const duration = Date.now() - startTime
    setTimers(prev => {
      const newTimers = new Map(prev)
      newTimers.delete(key)
      return newTimers
    })
    
    console.log(`⚡ Performance: ${key} took ${duration}ms`)
    return duration
  }, [timers])

  return (
    <PerformanceContext.Provider value={{
      get,
      set,
      clear,
      setLoading,
      isLoading,
      startTimer,
      endTimer
    }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}


