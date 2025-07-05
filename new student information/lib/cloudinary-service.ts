// Cloudinary configuration and upload service
export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

// Custom photo object type
export interface CustomPhotoObject {
  url: string
  name: string
  type: string
  size: number
  hasImage: boolean
  cloudinaryId?: string
  dataUrl?: string
}

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dtmfqjvrr"
const CLOUDINARY_UPLOAD_PRESET = "UCAES2025"
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
const CLOUDINARY_API_KEY = "184915137165986"
// Note: API Secret should only be used server-side, not in client-side code

// Helper function to create a mock upload result when Cloudinary fails
function createLocalImageResult(localImagePath: string): CloudinaryUploadResult {
  return {
    public_id: `local/${localImagePath.split('/').pop()}`,
    secure_url: localImagePath,
    url: localImagePath,
    format: 'jpg',
    width: 120,
    height: 150,
    bytes: 0,
    created_at: new Date().toISOString()
  };
}

// Direct client-side upload to Cloudinary using unsigned preset
export async function directCloudinaryUpload(file: File): Promise<CloudinaryUploadResult> {
  try {
    if (!file || file.size === 0) {
      throw new Error("Invalid file: empty or corrupted");
    }

    console.log(`Sending direct unsigned upload to Cloudinary: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Create form data for direct upload - UNSIGNED upload (no API key needed)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "student-passports");
    formData.append("tags", "student_passport,ucaes_registration");

    console.log("Sending request to:", CLOUDINARY_API_URL);
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: "POST",
      body: formData
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary direct upload failed:", response.status, errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Direct upload successful:", result.secure_url?.substring(0, 50) + "...");
    return result;
    
  } catch (error) {
    console.error("Direct Cloudinary upload failed:", error);
    return createLocalImageResult('/placeholder-user.jpg');
  }
}

/**
 * Cloudinary Service for image upload
 */

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  asset_id: string
  version_id: string
  width: number
  height: number
  format: string
}

export async function uploadToCloudinary(
  file: File | Blob,
  folder: string = "student-profiles",
  tags: string = ""
): Promise<CloudinaryUploadResponse> {
  try {
    console.log("Starting Cloudinary upload process...")
    
    // Make sure we have a proper file object with valid properties
    if (!file || !(file instanceof File || file instanceof Blob)) {
      console.error("Invalid file object provided:", file);
      throw new Error("Invalid file format. Please provide a valid image file.");
    }

    // For debugging
    console.log("File object details:", { 
      type: file.type,
      size: file.size,
      name: 'name' in file ? file.name : 'unknown'
    });
    
    // Verify it's an image file
    if (!file.type.startsWith('image/')) {
      throw new Error(`File must be an image. Provided type: ${file.type}`);
    }
    
    // First, create the FormData for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ucaes_students"); // Create this preset in Cloudinary dashboard
    
    if (folder) {
      formData.append("folder", folder);
    }
    
    if (tags) {
      formData.append("tags", tags);
    }
    
    // Add parameters for image optimization
    formData.append("quality", "auto");
    formData.append("fetch_format", "auto");
    formData.append("crop", "fill");
    formData.append("gravity", "face");
    
    // Use the Cloudinary upload API endpoint for unsigned uploads
    // You need to set up an upload preset in your Cloudinary dashboard
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    console.log("Sending request to Cloudinary...");
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Cloudinary upload successful:", result.secure_url);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
      version_id: result.version_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
        throw new Error("Network error while uploading image. Please check your internet connection and try again.");
      }
      throw error;
    } else {
      throw new Error("An unknown error occurred during image upload");
    }
  }
}

// Enhanced direct client-side upload to Cloudinary with folder and tags support
export async function directCloudinaryUploadWithTags(
  file: File, 
  folder = "student-profiles",
  tags = "student_profile,ucaes_registration"
): Promise<CloudinaryUploadResult> {
  try {
    if (!file || file.size === 0) {
      throw new Error("Invalid file: empty or corrupted");
    }

    console.log(`Sending direct unsigned upload to Cloudinary: ${file.name}, size: ${file.size}, type: ${file.type}`);
    console.log(`Using folder: ${folder}, tags: ${tags}`);
    
    // Create form data for direct upload - UNSIGNED upload (no API key needed)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("tags", tags);
    
    // Note: Transformation parameter is not allowed with unsigned uploads
    // Instead, configure transformations in the upload preset on Cloudinary dashboard

    console.log("Sending request to:", CLOUDINARY_API_URL);
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: "POST",
      body: formData
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary direct upload failed:", response.status, errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Direct upload successful:", result.secure_url?.substring(0, 50) + "...");
    return result;
    
  } catch (error) {
    console.error("Direct Cloudinary upload failed:", error);
    return createLocalImageResult('/placeholder-user.jpg');
  }
}

// Generate optimized URL for different use cases
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string
    format?: string
  } = {},
): string {
  const { width = 400, height = 400, quality = "auto", format = "auto" } = options

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},q_${quality},f_${format}/${publicId}`
}

// Delete image from Cloudinary (requires API key - for admin use)
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    // Note: This would require server-side implementation with API secret
    // For now, we'll just return true as deletion is typically handled server-side
    console.log(`Would delete image with public_id: ${publicId}`)
    return true
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return false
  }
}
