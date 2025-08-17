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

// Cloudinary configuration - aligned with Academic Affairs working setup
// Academic Affairs Cloud Name: dxkkv9nbn
// Academic Affairs Upload Preset: studentspassport
const CLOUDINARY_CLOUD_NAME = "dxkkv9nbn"
const CLOUDINARY_UPLOAD_PRESET = "studentspassport"
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
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
    console.log('🚀 STARTING CLOUDINARY UPLOAD PROCESS');
    console.log('📋 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    if (!file || file.size === 0) {
      throw new Error("Invalid file: empty or corrupted");
    }

    console.log(`📤 Sending direct unsigned upload to Cloudinary`);
    console.log(`   File: ${file.name}, size: ${file.size}, type: ${file.type}`);
    console.log(`   Using upload preset: ${CLOUDINARY_UPLOAD_PRESET}`);
    console.log(`   Cloud name: ${CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API URL: ${CLOUDINARY_API_URL}`);
    
    // Create form data for direct upload - UNSIGNED upload (no API key needed)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    console.log('📦 FormData contents:');
    console.log('   - file:', file.name, `(${file.size} bytes, ${file.type})`);
    console.log('   - upload_preset:', CLOUDINARY_UPLOAD_PRESET);
    
    console.log('🌐 Sending request to Cloudinary...');
    console.log('   URL:', CLOUDINARY_API_URL);
    console.log('   Method: POST');
    console.log('   Content-Type: multipart/form-data');
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: "POST",
      body: formData
    });

    console.log('📡 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ CLOUDINARY UPLOAD FAILED:');
      console.error('   Status:', response.status);
      console.error('   Error:', errorText);
      
      // Try to parse error JSON for better debugging
      try {
        const errorJson = JSON.parse(errorText);
        console.error('   Parsed error:', errorJson);
      } catch (e) {
        console.error('   Raw error text:', errorText);
      }
      
      // If the error is about upload preset, provide a helpful message and throw error
      if (errorText.includes("Upload preset must be specified")) {
        console.error('⚠️ Upload preset issue detected. This means the Cloudinary account needs to be configured.');
        console.error('💡 Solution: Create an upload preset in your Cloudinary dashboard or use a different account.');
        console.error('🔧 Technical Note: The preset exists but may not be properly configured for unsigned uploads.');
        
        throw new Error('Image upload failed: Cloudinary upload preset configuration error. Please contact system administrator.');
      }
      
      throw new Error(`Image upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ CLOUDINARY UPLOAD SUCCESSFUL:');
    console.log('   Secure URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
    console.log('   Format:', result.format);
    console.log('   Size:', result.bytes, 'bytes');
    console.log('   Width:', result.width);
    console.log('   Height:', result.height);
    console.log('   Created at:', result.created_at);
    
    return result;
    
  } catch (error) {
    console.error('💥 CLOUDINARY UPLOAD ERROR:');
    console.error('   Error type:', (error as any).constructor.name);
    console.error('   Error message:', (error as any).message);
    console.error('   Error stack:', (error as any).stack);
    
    // Re-throw the error instead of using fallback to ensure user gets proper feedback
    throw new Error(`Image upload failed: ${(error as any).message || 'Unknown error occurred'}`);
  }
}

/**
 * Cloudinary Service for image upload
 */

export async function uploadToCloudinary(
  file: File | Blob,
  folder: string = "student-profiles",
  tags: string = ""
): Promise<CloudinaryUploadResult> {
  try {
    console.log("🚀 uploadToCloudinary function called")
    console.log("📋 Function parameters:")
    console.log("   - file type:", typeof file)
    console.log("   - file instanceof File:", file instanceof File)
    console.log("   - file instanceof Blob:", file instanceof Blob)
    console.log("   - folder:", folder)
    console.log("   - tags:", tags)
    
    // Make sure we have a proper file object with valid properties
    if (!file || !(file instanceof File || file instanceof Blob)) {
      console.error("❌ Invalid file object provided:", file);
      throw new Error("Invalid file format. Please provide a valid image file.");
    }

    // For debugging
    console.log("📄 File object details:", { 
      type: (file as any).type,
      size: (file as any).size,
      name: 'name' in (file as any) ? (file as any).name : 'unknown'
    });
    
    // Verify it's an image file
    if (!((file as any).type || '').startsWith('image/')) {
      console.error("❌ File is not an image:", (file as any).type);
      throw new Error(`File must be an image. Provided type: ${(file as any).type}`);
    }
    
    console.log("✅ File validation passed")
    
    // First, try server-side signed upload via our API route
    const serverForm = new FormData();
    serverForm.append("file", file as any);
    if (folder) serverForm.append("folder", folder);
    if (tags) serverForm.append("tags", tags);

    try {
      const apiResponse = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: serverForm,
      });
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log("✅ Server-signed Cloudinary upload successful!");
        return {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          created_at: result.created_at,
        } as CloudinaryUploadResult;
      } else {
        const errText = await apiResponse.text();
        console.warn("⚠️ Server upload failed, falling back to unsigned upload:", errText);
      }
    } catch (serverErr) {
      console.warn("⚠️ Server upload error, falling back to unsigned upload:", (serverErr as any)?.message);
    }

    // Fallback: direct unsigned upload to Cloudinary (requires unsigned preset)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);
    if (tags) formData.append("tags", tags);
    
    console.log("📦 FormData created with parameters:")
    console.log("   - upload_preset:", CLOUDINARY_UPLOAD_PRESET)
    
    // Use the Cloudinary upload API endpoint for unsigned uploads
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    console.log("🌐 Sending request to Cloudinary...");
    console.log("   URL:", cloudinaryUrl);
    console.log("   Method: POST");
    console.log("   Content-Type: multipart/form-data");
    
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });
    
    console.log("📡 Response received:");
    console.log("   Status:", response.status);
    console.log("   Status Text:", response.statusText);
    console.log("   OK:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Cloudinary upload failed:");
      console.error("   Status:", response.status);
      console.error("   Error text:", errorText);
      
      // Try to parse error JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error("   Parsed error:", errorJson);
      } catch (e) {
        console.error("   Raw error text:", errorText);
      }
      
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("✅ Cloudinary upload successful!");
    console.log("   Secure URL:", result.secure_url);
    console.log("   Public ID:", result.public_id);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      url: result.secure_url, // Add url field for compatibility
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error("💥 uploadToCloudinary function error:");
    console.error("   Error type:", (error as any).constructor.name);
    console.error("   Error message:", (error as any).message);
    console.error("   Error stack:", (error as any).stack);
    
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
    console.log(`Using Admissions preset: ${CLOUDINARY_UPLOAD_PRESET}`);
    
    // Create form data for direct upload - UNSIGNED upload (no API key needed)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    // Do not append folder/tags here to respect Admissions preset rules

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
    throw new Error(`Image upload failed: ${(error as any).message || 'Unknown error occurred'}`);
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
