// Photo utility functions for handling student passport pictures
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "./firebase"

export interface PhotoData {
  url: string | null
  source: string
  field: string
  isValid: boolean
  error?: string
}

/**
 * Resolves student passport picture URL from multiple possible sources
 * This handles the issue where photos might be stored in different field names
 */
export async function resolveStudentPhoto(studentId: string, studentData: any): Promise<PhotoData> {
  try {
    console.log('🔍 Resolving photo for student:', studentId)
    
    // Check all possible photo fields in student data
    const photoFields = [
      'profilePictureUrl',
      'passportPhotoUrl', 
      'photoUrl',
      'imageUrl',
      'passport_photo',
      'photo',
      'image',
      'passportPhoto'
    ]
    
    // First, check if any photo field has a valid URL
    for (const field of photoFields) {
      const photoUrl = studentData[field]
      if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
        const isValid = await validatePhotoUrl(photoUrl)
        if (isValid) {
          console.log(`✅ Found valid photo in field: ${field}`)
          return {
            url: photoUrl,
            source: 'student_data',
            field: field,
            isValid: true
          }
        }
      }
    }
    
    // If no valid photo found in student data, check additional collections
    console.log('🔍 No valid photo in student data, checking additional sources...')
    
    // Check students collection
    try {
      const studentsCollection = collection(db, 'students')
      const studentQuery = query(studentsCollection, where('email', '==', studentData.email), limit(1))
      const studentSnapshot = await getDocs(studentQuery)
      
      if (!studentSnapshot.empty) {
        const additionalData = studentSnapshot.docs[0].data()
        console.log('📸 Found additional student data, checking for photos...')
        
        for (const field of photoFields) {
          const photoUrl = additionalData[field]
          if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
            const isValid = await validatePhotoUrl(photoUrl)
            if (isValid) {
              console.log(`✅ Found valid photo in students collection: ${field}`)
              return {
                url: photoUrl,
                source: 'students_collection',
                field: field,
                isValid: true
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error checking students collection:', error)
    }
    
    // Check applications collection
    try {
      const applicationsCollection = collection(db, 'applications')
      const appQuery = query(applicationsCollection, where('contactInfo.email', '==', studentData.email), limit(1))
      const appSnapshot = await getDocs(appQuery)
      
      if (!appSnapshot.empty) {
        const appData = appSnapshot.docs[0].data()
        console.log('📸 Found application data, checking for photos...')
        
        // Check nested photo fields in application data
        const nestedPhotoFields = [
          'personalInfo.passportPhoto.url',
          'documents.photo.url',
          'applicationData.personalInfo.passportPhoto.url'
        ]
        
        for (const nestedField of nestedPhotoFields) {
          const photoUrl = getNestedValue(appData, nestedField)
          if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
            const isValid = await validatePhotoUrl(photoUrl)
            if (isValid) {
              console.log(`✅ Found valid photo in applications collection: ${nestedField}`)
              return {
                url: photoUrl,
                source: 'applications_collection',
                field: nestedField,
                isValid: true
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error checking applications collection:', error)
    }
    
    // No valid photo found
    console.log('❌ No valid photo found in any source')
    return {
      url: null,
      source: 'none',
      field: 'none',
      isValid: false,
      error: 'No valid photo found'
    }
    
  } catch (error) {
    console.error('❌ Error resolving student photo:', error)
    return {
      url: null,
      source: 'error',
      field: 'error',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Validates if a photo URL is accessible and valid
 */
async function validatePhotoUrl(url: string): Promise<boolean> {
  try {
    // Skip validation for blob URLs (local files)
    if (url.startsWith('blob:')) {
      return true
    }
    
    // Skip validation for data URLs
    if (url.startsWith('data:')) {
      return true
    }
    
    // For external URLs, check if they're accessible
    if (url.startsWith('http')) {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      })
      return true // If we can make the request, assume it's valid
    }
    
    return false
  } catch (error) {
    console.warn('⚠️ Photo URL validation failed:', url, error)
    return false
  }
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

/**
 * Creates a fallback photo component with student initials
 */
export function createFallbackPhoto(studentData: any): string {
  const surname = studentData.surname || studentData.lastName || ''
  const otherNames = studentData.otherNames || studentData.firstName || studentData.otherName || ''
  
  const initials = `${surname.charAt(0)}${otherNames.charAt(0)}`.toUpperCase()
  
  // Create a simple SVG placeholder with initials
  const svg = `
    <svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="250" fill="#f3f4f6"/>
      <circle cx="100" cy="80" r="40" fill="#9ca3af"/>
      <text x="100" y="90" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${initials}</text>
      <rect x="60" y="140" width="80" height="80" rx="40" fill="#9ca3af"/>
      <text x="100" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">Student</text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Handles photo display with fallback and error handling
 */
export function handlePhotoDisplay(photoData: PhotoData, studentData: any): {
  src: string
  alt: string
  hasError: boolean
  errorMessage?: string
} {
  if (photoData.isValid && photoData.url) {
    return {
      src: photoData.url,
      alt: `Photo of ${studentData.surname || 'Student'} ${studentData.otherNames || ''}`,
      hasError: false
    }
  }
  
  // Return fallback photo
  return {
    src: createFallbackPhoto(studentData),
    alt: `Placeholder for ${studentData.surname || 'Student'} ${studentData.otherNames || ''}`,
    hasError: true,
    errorMessage: photoData.error || 'Photo not available'
  }
}











