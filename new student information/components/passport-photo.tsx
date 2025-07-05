"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Upload, User } from "lucide-react"

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
  
  // Reset error state when photoUrl changes
  useEffect(() => {
    if (photoUrl) {
      setImgSrc(photoUrl)
      setImgError(false)
    } else {
      setImgSrc(null)
    }
  }, [photoUrl])

  const handleImageError = () => {
    console.error('Image failed to load:', photoUrl)
    setImgError(true)
    // Try with placeholder
    setImgSrc('/placeholder-user.jpg')
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Photo Display - Enhanced Passport Photo Style */}
      <div className="relative">
        {/* Standard passport photo dimensions with border */}
        <div className="w-32 h-40 bg-white border-2 border-gray-300 rounded-sm overflow-hidden shadow-sm">
          {isUploading ? (
            <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-100">
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : imgSrc && !imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden bg-blue-50">
              <img
                src={imgSrc}
                alt="Passport photo"
                className="w-full h-full object-cover object-center"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-100">
              <User className="h-16 w-16 text-gray-400" />
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
        <Upload className="h-4 w-4" />
        {imgSrc && !imgError ? 'Change Photo' : 'Add Photo'}
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
    </div>
  )
} 