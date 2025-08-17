"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

interface PassportPhotoProps {
  photoUrl?: string | null
  onChangePhoto: () => void
  isUploading?: boolean
  isSuccess?: boolean
}

export default function PassportPhoto({ 
  photoUrl = null, 
  onChangePhoto, 
  isUploading = false,
  isSuccess = false
}: PassportPhotoProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [imgError, setImgError] = useState<boolean>(false)
  const [imgLoading, setImgLoading] = useState<boolean>(false)
  

  
  // Reset states when photoUrl changes
  useEffect(() => {
    if (photoUrl) {
      setImgSrc(photoUrl)
      setImgError(false)
      setImgLoading(true)
    } else {
      setImgSrc(null)
      setImgError(false)
      setImgLoading(false)
    }
  }, [photoUrl])

  const handleImageLoad = () => {
    setImgLoading(false)
    setImgError(false)
  }

  const handleImageError = () => {
    setImgError(true)
    setImgLoading(false)
    
    // Don't try to set placeholder for blob URLs that failed - just show error state
    if (photoUrl?.startsWith('blob:')) {
      return
    }
    
    // Only try placeholder for non-blob URLs
    setImgSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjgiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDQ4QzE2IDQwLjI2ODkgMjMuMjY4OSAzMyAzMiAzM0M0MC43MzExIDMzIDQ4IDQwLjI2ODkgNDggNDhIMTZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=')
  }

  // Determine what to display
  const hasImage = imgSrc && !imgError
  const isCurrentlyLoading = imgLoading || isUploading



  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Photo Display - Enhanced Passport Photo Style */}
      <div className="relative">
        {/* Standard passport photo dimensions with border */}
        <div className="w-32 h-40 bg-white border-2 border-gray-300 rounded-sm overflow-hidden shadow-sm">
          {hasImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden bg-blue-50 relative">
              <img
                src={imgSrc}
                alt="Passport photo"
                className="w-full h-full object-cover object-center"
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin={imgSrc?.startsWith('blob:') || imgSrc?.startsWith('http') ? "anonymous" : undefined}
                style={{ 
                  opacity: isCurrentlyLoading ? 0.5 : 1,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
              {/* Loading overlay */}
              {isCurrentlyLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-100">
              <span className="h-16 w-16 text-gray-400 text-4xl">👤</span>
              <p className="text-xs text-gray-500 mt-1 text-center">No passport photo</p>
              <p className="text-xs text-gray-400 mt-1 text-center">Upload 3.5×4.5cm</p>
            </div>
          )}
        </div>
        
        {/* "Passport Photo" label */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 border border-gray-200 rounded text-xs text-gray-600 shadow-sm">
          Passport Photo
        </div>
      </div>

      {/* Button */}
      <Button
        onClick={onChangePhoto}
        variant="outline"
        size="sm"
        type="button"
        className="flex items-center gap-2 mt-4"
        disabled={isUploading}
      >
        <span className="h-4 w-4 text-xs">📤</span>
        {hasImage ? 'Change Photo' : 'Add Photo'}
      </Button>

      {/* Success message */}
      {isSuccess && !isUploading && (
        <div className="text-green-600 flex items-center gap-1 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Upload successful
        </div>
      )}

      {/* Error message */}
      {imgError && (
        <div className="text-red-600 flex items-center gap-1 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Photo failed to load
        </div>
      )}

      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2">
        Debug: {hasImage ? 'Image' : isCurrentlyLoading ? 'Loading' : 'Placeholder'} | 
        URL: {photoUrl ? 'Yes' : 'No'} | 
        Src: {imgSrc ? 'Yes' : 'No'}
      </div>
    </div>
  )
} 