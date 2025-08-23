import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animated?: boolean
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = true, 
  animated = true 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200',
        rounded && 'rounded',
        animated && 'animate-pulse',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

// Pre-built skeleton components for common UI patterns
export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ columns = 3 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3 p-4 border rounded-lg">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <SkeletonTable />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <SkeletonList />
        </div>
      </div>
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Content */}
      <SkeletonDashboard />
    </div>
  )
}

// Loading states for specific components
export function LoadingState({ 
  type = 'page',
  message = 'Loading...',
  showMessage = true 
}: {
  type?: 'page' | 'card' | 'table' | 'list' | 'grid' | 'form'
  message?: string
  showMessage?: boolean
}) {
  const skeletons = {
    page: SkeletonPage,
    card: SkeletonCard,
    table: SkeletonTable,
    list: SkeletonList,
    grid: SkeletonGrid,
    form: SkeletonForm
  }
  
  const SkeletonComponent = skeletons[type]
  
  return (
    <div className="space-y-4">
      {showMessage && (
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>{message}</p>
        </div>
      )}
      <SkeletonComponent />
    </div>
  )
}

// Optimized loading wrapper
export function withSkeleton<T extends object>(
  Component: React.ComponentType<T>,
  skeletonType: keyof typeof skeletons = 'page'
) {
  return function SkeletonWrapper(props: T & { loading?: boolean }) {
    const { loading, ...componentProps } = props
    
    if (loading) {
      return <LoadingState type={skeletonType} />
    }
    
    return <Component {...componentProps as T} />
  }
}