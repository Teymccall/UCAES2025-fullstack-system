"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot,
  Query
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Cache interface
interface CacheEntry<T> {
  data: T[]
  timestamp: number
  expiresAt: number
}

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 30 * 60 * 1000,   // 30 minutes
  SHORT_TTL: 1 * 60 * 1000,   // 1 minute
}

// Global cache store
const cache = new Map<string, CacheEntry<any>>()

// Hook for optimized Firebase data fetching
export function useOptimizedFirebase<T = DocumentData>(
  collectionName: string,
  options: {
    queryConstraints?: Array<any>
    pageSize?: number
    cacheKey?: string
    cacheTTL?: number
    enablePagination?: boolean
    enableCache?: boolean
  } = {}
) {
  const {
    queryConstraints = [],
    pageSize = 10,
    cacheKey,
    cacheTTL = CACHE_CONFIG.DEFAULT_TTL,
    enablePagination = true,
    enableCache = true
  } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Generate cache key
  const finalCacheKey = useMemo(() => {
    if (cacheKey) return cacheKey
    return `${collectionName}-${JSON.stringify(queryConstraints)}`
  }, [collectionName, queryConstraints, cacheKey])

  // Check if cache is valid
  const isCacheValid = useCallback((entry: CacheEntry<T>) => {
    return Date.now() < entry.expiresAt
  }, [])

  // Get data from cache
  const getFromCache = useCallback((key: string): T[] | null => {
    if (!enableCache) return null
    
    const entry = cache.get(key)
    if (entry && isCacheValid(entry)) {
      return entry.data
    }
    
    // Remove expired cache entry
    if (entry) {
      cache.delete(key)
    }
    
    return null
  }, [enableCache, isCacheValid])

  // Set data in cache
  const setCache = useCallback((key: string, data: T[]) => {
    if (!enableCache) return
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTTL
    })
  }, [enableCache, cacheTTL])

  // Fetch data from Firebase
  const fetchData = useCallback(async (
    isInitialLoad: boolean = true,
    lastDocument?: QueryDocumentSnapshot
  ) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      // Check cache for initial load
      if (isInitialLoad && enableCache) {
        const cachedData = getFromCache(finalCacheKey)
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return
        }
      }

      // Build query
      let q: Query = collection(db, collectionName)
      
      // Apply query constraints
      queryConstraints.forEach(constraint => {
        if (constraint.type === 'where') {
          q = query(q, where(constraint.field, constraint.operator, constraint.value))
        } else if (constraint.type === 'orderBy') {
          q = query(q, orderBy(constraint.field, constraint.direction || 'asc'))
        } else if (constraint.type === 'limit') {
          q = query(q, limit(constraint.value))
        }
      })

      // Apply pagination
      if (enablePagination) {
        q = query(q, limit(pageSize))
        if (lastDocument) {
          q = query(q, startAfter(lastDocument))
        }
      }

      // Execute query
      const snapshot = await getDocs(q)
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]

      // Update state
      if (isInitialLoad) {
        setData(newData)
        setCache(finalCacheKey, newData)
      } else {
        setData(prev => [...prev, ...newData])
      }

      // Update pagination state
      if (enablePagination) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
        setHasMore(snapshot.docs.length === pageSize)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error fetching ${collectionName}:`, err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [
    collectionName,
    queryConstraints,
    pageSize,
    enablePagination,
    enableCache,
    finalCacheKey,
    getFromCache,
    setCache
  ])

  // Load more data (for pagination)
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && lastDoc) {
      fetchData(false, lastDoc)
    }
  }, [hasMore, isLoadingMore, lastDoc, fetchData])

  // Refresh data
  const refresh = useCallback(() => {
    // Clear cache for this collection
    if (enableCache) {
      cache.delete(finalCacheKey)
    }
    
    // Reset pagination state
    setLastDoc(null)
    setHasMore(true)
    
    // Fetch fresh data
    fetchData(true)
  }, [enableCache, finalCacheKey, fetchData])

  // Initial load
  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refresh,
    // Utility functions
    isEmpty: data.length === 0 && !loading,
    isError: !!error,
    // Cache utilities
    clearCache: () => cache.delete(finalCacheKey),
    getCacheInfo: () => {
      const entry = cache.get(finalCacheKey)
      return entry ? {
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isValid: isCacheValid(entry)
      } : null
    }
  }
}

// Hook for single document fetching with cache
export function useOptimizedDocument<T = DocumentData>(
  collectionName: string,
  documentId: string,
  options: {
    cacheTTL?: number
    enableCache?: boolean
  } = {}
) {
  const {
    cacheTTL = CACHE_CONFIG.DEFAULT_TTL,
    enableCache = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `${collectionName}-${documentId}`

  // Check cache
  const getFromCache = useCallback(() => {
    if (!enableCache) return null
    
    const entry = cache.get(cacheKey)
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data
    }
    
    if (entry) {
      cache.delete(cacheKey)
    }
    
    return null
  }, [enableCache, cacheKey])

  // Set cache
  const setCache = useCallback((data: T) => {
    if (!enableCache) return
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTTL
    })
  }, [enableCache, cacheKey, cacheTTL])

  // Fetch document
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache
      const cachedData = getFromCache()
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // Fetch from Firebase
      const { doc, getDoc } = await import('firebase/firestore')
      const docRef = doc(db, collectionName, documentId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const documentData = {
          id: docSnap.id,
          ...docSnap.data()
        } as T
        
        setData(documentData)
        setCache(documentData)
      } else {
        setData(null)
        setError('Document not found')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error fetching document ${documentId}:`, err)
    } finally {
      setLoading(false)
    }
  }, [collectionName, documentId, getFromCache, setCache])

  useEffect(() => {
    fetchDocument()
  }, [fetchDocument])

  return {
    data,
    loading,
    error,
    refresh: fetchDocument,
    clearCache: () => cache.delete(cacheKey)
  }
}

// Hook for real-time data with optimization
export function useOptimizedRealtime<T = DocumentData>(
  collectionName: string,
  options: {
    queryConstraints?: Array<any>
    enableCache?: boolean
  } = {}
) {
  const {
    queryConstraints = [],
    enableCache = true
  } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      // Build query
      let q: Query = collection(db, collectionName)
      
      queryConstraints.forEach(constraint => {
        if (constraint.type === 'where') {
          q = query(q, where(constraint.field, constraint.operator, constraint.value))
        } else if (constraint.type === 'orderBy') {
          q = query(q, orderBy(constraint.field, constraint.direction || 'asc'))
        }
      })

      // Set up real-time listener
      const { onSnapshot } = require('firebase/firestore')
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
          const newData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[]

          setData(newData)
          setLoading(false)

          // Update cache if enabled
          if (enableCache) {
            const cacheKey = `${collectionName}-${JSON.stringify(queryConstraints)}`
            cache.set(cacheKey, {
              data: newData,
              timestamp: Date.now(),
              expiresAt: Date.now() + CACHE_CONFIG.SHORT_TTL
            })
          }
        },
        (err: Error) => {
          setError(err.message)
          setLoading(false)
          console.error(`Error in real-time listener for ${collectionName}:`, err)
        }
      )

      return () => unsubscribe()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      console.error(`Error setting up real-time listener for ${collectionName}:`, err)
    }
  }, [collectionName, queryConstraints, enableCache])

  return {
    data,
    loading,
    error,
    isEmpty: data.length === 0 && !loading,
    isError: !!error
  }
}

// Utility functions for query building
export const queryHelpers = {
  where: (field: string, operator: any, value: any) => ({
    type: 'where',
    field,
    operator,
    value
  }),
  
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
    type: 'orderBy',
    field,
    direction
  }),
  
  limit: (value: number) => ({
    type: 'limit',
    value
  })
}

// Cache management utilities
export const cacheUtils = {
  clearAll: () => cache.clear(),
  
  clearCollection: (collectionName: string) => {
    const keysToDelete = Array.from(cache.keys()).filter(key => 
      key.startsWith(collectionName)
    )
    keysToDelete.forEach(key => cache.delete(key))
  },
  
  getCacheSize: () => cache.size,
  
  getCacheStats: () => {
    const entries = Array.from(cache.entries())
    const now = Date.now()
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([_, entry]) => now < entry.expiresAt).length,
      expiredEntries: entries.filter(([_, entry]) => now >= entry.expiresAt).length,
      totalSize: entries.reduce((sum, [_, entry]) => 
        sum + JSON.stringify(entry.data).length, 0
      )
    }
  }
}