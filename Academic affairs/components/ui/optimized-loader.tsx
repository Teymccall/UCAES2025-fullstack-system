"use client"

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface OptimizedLoaderProps {
  message?: string
  showProgress?: boolean
  minDisplayTime?: number
  className?: string
}

export function OptimizedLoader({ 
  message = "Loading...", 
  showProgress = false,
  minDisplayTime = 500,
  className = ""
}: OptimizedLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [canHide, setCanHide] = useState(false)

  useEffect(() => {
    // Ensure minimum display time to prevent flashing
    const timer = setTimeout(() => setCanHide(true), minDisplayTime)
    return () => clearTimeout(timer)
  }, [minDisplayTime])

  useEffect(() => {
    if (!showProgress) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 100)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        {showProgress && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 animate-pulse">{message}</p>
    </div>
  )
}

export function PageLoader({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <OptimizedLoader 
          message={message}
          showProgress={true}
          className="py-8"
        />
      </div>
    </div>
  )
}

export function SectionLoader({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <OptimizedLoader message={message} />
    </div>
  )
}


