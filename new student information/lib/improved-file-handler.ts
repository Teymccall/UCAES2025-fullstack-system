// Improved file handling for profile pictures in New Student Information system
// This module provides reliable file storage and retrieval for photo uploads

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64 data URL
  timestamp: number;
}

export interface PhotoObject {
  file?: File | null;
  url?: string;
  previewUrl?: string;
  name: string;
  type: string;
  size: number;
  hasImage: boolean;
  isFileObject?: boolean;
}

/**
 * Convert a File object to base64 for localStorage storage
 */
export function fileToBase64(file: File): Promise<FileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
        timestamp: Date.now()
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 data back to File object
 */
export async function base64ToFile(fileData: FileData): Promise<File> {
  try {
    // Use fetch to convert data URL to blob (works in browser)
    const response = await fetch(fileData.data);
    const blob = await response.blob();
    
    return new File([blob], fileData.name, {
      type: fileData.type,
      lastModified: fileData.timestamp
    });
  } catch (error) {
    throw new Error(`Failed to convert base64 to file: ${error.message}`);
  }
}

/**
 * Save file data to localStorage
 */
export async function saveFileToStorage(file: File, key = 'registrationFileData'): Promise<void> {
  try {
    const fileData = await fileToBase64(file);
    localStorage.setItem(key, JSON.stringify(fileData));
    console.log('✅ File saved to localStorage:', {
      name: fileData.name,
      size: fileData.size,
      type: fileData.type
    });
  } catch (error) {
    console.error('❌ Failed to save file to localStorage:', error);
    throw error;
  }
}

/**
 * Load file from localStorage and convert back to File object
 */
export async function loadFileFromStorage(key = 'registrationFileData'): Promise<File | null> {
  try {
    const fileDataStr = localStorage.getItem(key);
    if (!fileDataStr) {
      console.log('ℹ️ No file data found in localStorage');
      return null;
    }

    const fileData: FileData = JSON.parse(fileDataStr);
    console.log('📄 Found file data in localStorage:', {
      name: fileData.name,
      size: fileData.size,
      type: fileData.type
    });

    const file = await base64ToFile(fileData);
    console.log('✅ File reconstructed from localStorage:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    return file;
  } catch (error) {
    console.error('❌ Failed to load file from localStorage:', error);
    return null;
  }
}

/**
 * Create a preview URL from a PhotoObject
 */
export async function getPreviewUrl(photoObject: PhotoObject): Promise<string | null> {
  // If we have a direct File object, create blob URL
  if (photoObject.file instanceof File) {
    return URL.createObjectURL(photoObject.file);
  }

  // If we have a preview URL that's not a blob (i.e., a regular URL), use it
  if (photoObject.previewUrl && !photoObject.previewUrl.startsWith('blob:')) {
    return photoObject.previewUrl;
  }

  // If we have a direct URL, use it
  if (photoObject.url && !photoObject.url.startsWith('blob:')) {
    return photoObject.url;
  }

  // Try to reconstruct from localStorage
  if (photoObject.hasImage || photoObject.isFileObject) {
    try {
      const file = await loadFileFromStorage();
      if (file) {
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('❌ Failed to reconstruct preview URL:', error);
    }
  }

  return null;
}

/**
 * Validate that a file is a valid image
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  return { isValid: true };
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export function cleanupBlobUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}




























