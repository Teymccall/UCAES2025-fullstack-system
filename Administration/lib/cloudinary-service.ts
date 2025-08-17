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

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dffrgzgzu"
const CLOUDINARY_UPLOAD_PRESET = "ucaescollage"
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

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

// Upload image to Cloudinary
export async function uploadToCloudinary(
  file: File,
  folder = "student-profiles"
): Promise<CloudinaryUploadResult> {
  try {
    console.log(`Starting Cloudinary upload for file: ${file.name}, size: ${file.size} bytes`);

    // Verify the file is valid
    if (!file || file.size === 0) {
      throw new Error("Invalid file: empty or corrupted");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    // Important: DO NOT include API key or signature in client-side code!
    // For unsigned uploads, we only need the upload_preset
    
    // Add folder only if specified
    if (folder) {
      formData.append("folder", folder);
    }

    // Add tags for better organization
    formData.append("tags", "student_profile,ucaes_admin");

    console.log(`Uploading to Cloudinary with cloud name: ${CLOUDINARY_CLOUD_NAME}, preset: ${CLOUDINARY_UPLOAD_PRESET}`);

    // Log full request details for debugging
    console.log(`Sending unsigned upload to: ${CLOUDINARY_API_URL}`);
    console.log(`Using upload_preset: ${CLOUDINARY_UPLOAD_PRESET}`);
    console.log(`File name: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    // Try uploading with timeout to prevent long-hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(CLOUDINARY_API_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary upload failed:", response.status, errorText);
        throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
      }

      const result: CloudinaryUploadResult = await response.json();
      console.log("Cloudinary upload successful:", {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
      });

      return result;
    } catch (fetchError) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Fetch error during upload:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // Return a local image path instead of throwing an error
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