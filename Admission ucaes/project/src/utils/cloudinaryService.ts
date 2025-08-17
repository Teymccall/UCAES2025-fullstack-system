// Cloudinary configuration for ADMISSIONS SYSTEM
// Note: We don't import cloudinary in browser environment to avoid process errors
const CLOUDINARY_CLOUD_NAME = 'dyvabxsvh';
const CLOUDINARY_API_KEY = '976451452252245';
const CLOUDINARY_API_SECRET = 'K_ul_YNOfbBvkOprTguVfgpA-Qk';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface DocumentUpload {
  file: File;
  documentType: 'idDocument' | 'certificate' | 'transcript' | 'passportPhoto';
  userId: string;
}

export class CloudinaryService {
  // Cloudinary configuration for ADMISSIONS
  private static readonly CLOUD_NAME = CLOUDINARY_CLOUD_NAME;
  private static readonly API_KEY = CLOUDINARY_API_KEY;
  private static readonly API_SECRET = CLOUDINARY_API_SECRET;
  private static readonly UPLOAD_PRESET = 'ucaes_admissions';
  private static readonly API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  /**
   * Upload a document to Cloudinary (Admissions System)
   */
  static async uploadDocument(
    file: File,
    documentType: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      console.log('🚀 ADMISSIONS: Starting Cloudinary upload');
      console.log('📋 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        userId: userId,
        documentType: documentType
      });

      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.valid) {
        console.error('❌ ADMISSIONS: File validation failed:', validation.error);
        return {
          success: false,
          error: validation.error || 'File validation failed'
        };
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.UPLOAD_PRESET);
      formData.append('folder', `ucaes/admissions/${userId}/${documentType}`);
      formData.append('public_id', `${userId}_${documentType}_${Date.now()}`);
      formData.append('tags', 'admissions,ucaes,document');

      console.log('📦 FormData created with parameters:');
      console.log('   - upload_preset:', this.UPLOAD_PRESET);
      console.log('   - folder: ucaes/admissions/', userId, '/', documentType);
      console.log('   - tags: admissions,ucaes,document');

      // Upload to Cloudinary
      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response received:');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ADMISSIONS: Upload failed:', errorText);
        
        // Try to parse error response
        let errorMessage = `Upload failed: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // If parsing fails, use the raw error text
          errorMessage = errorText || errorMessage;
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const result = await response.json();
      console.log('✅ ADMISSIONS: Upload successful!');
      console.log('   Secure URL:', result.secure_url);
      console.log('   Public ID:', result.public_id);
      console.log('   Full result:', result);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('💥 ADMISSIONS: Cloudinary upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple documents
   */
  static async uploadMultipleDocuments(
    documents: Record<string, File>,
    userId: string
  ): Promise<Record<string, UploadResult>> {
    const results: Record<string, UploadResult> = {};
    
    for (const [documentType, file] of Object.entries(documents)) {
      console.log(`📤 ADMISSIONS: Uploading ${documentType}...`);
      results[documentType] = await this.uploadDocument(file, documentType, userId);
    }
    
    return results;
  }

  /**
   * Delete a document from Cloudinary
   */
  static async deleteDocument(publicId: string): Promise<UploadResult> {
    try {
      console.log('🗑️ ADMISSIONS: Deleting document from Cloudinary:', publicId);
      
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = this.generateSignature(publicId);
      
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('api_key', this.API_KEY);
      formData.append('timestamp', timestamp.toString());
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/destroy`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      
      console.log('✅ ADMISSIONS: Document deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ ADMISSIONS: Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Generate signature for Cloudinary API calls
   */
  private static generateSignature(publicId: string): string {
    // This is a placeholder - in a real implementation, you'd generate a proper signature
    // For now, we'll use a simple hash
    return btoa(publicId + this.API_SECRET).slice(0, 20);
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    console.log('🔍 ADMISSIONS: Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ ADMISSIONS: Invalid file type:', file.type);
      return {
        valid: false,
        error: 'File type not supported. Please upload JPG, PNG, or PDF files only.'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('❌ ADMISSIONS: File too large:', file.size, 'bytes');
      return {
        valid: false,
        error: 'File size too large. Please upload files smaller than 5MB.'
      };
    }

    // Check if file is not empty
    if (file.size === 0) {
      console.error('❌ ADMISSIONS: File is empty');
      return {
        valid: false,
        error: 'File appears to be empty. Please select a valid file.'
      };
    }

    console.log('✅ ADMISSIONS: File validation passed');
    return { valid: true };
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    } = {}
  ): string {
    const baseUrl = `https://res.cloudinary.com/${this.CLOUD_NAME}/image/upload`;
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    
    return `${baseUrl}/${transformString}${publicId}`;
  }

  /**
   * Test Cloudinary connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 ADMISSIONS: Testing Cloudinary connection...');
      
      // Create a simple test file
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const result = await this.uploadDocument(testFile, 'test', 'test-user');
      
      if (result.success) {
        console.log('✅ ADMISSIONS: Cloudinary connection test successful');
        return { success: true };
      } else {
        console.error('❌ ADMISSIONS: Cloudinary connection test failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ ADMISSIONS: Cloudinary connection test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }
}

export default CloudinaryService; 