// Cloudinary configuration for ACADEMIC AFFAIRS SYSTEM
// Note: We don't import cloudinary in browser environment to avoid process errors
const ACADEMIC_CLOUDINARY_CLOUD_NAME = 'dxkkv9nbn';
const ACADEMIC_CLOUDINARY_API_KEY = '281612645352281';
const ACADEMIC_CLOUDINARY_API_SECRET = 'wa0BPGAqDXUR9KOVxiu2G5oEhWk';

export interface AcademicUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface AcademicDocumentUpload {
  file: File;
  documentType: 'assignment' | 'project' | 'academic-record' | 'course-material' | 'research-paper';
  userId: string;
  courseId?: string;
  semester?: string;
}

export class AcademicCloudinaryService {
  // Cloudinary configuration for ACADEMIC AFFAIRS
  private static readonly CLOUDINARY_CLOUD_NAME = ACADEMIC_CLOUDINARY_CLOUD_NAME;
  private static readonly CLOUDINARY_UPLOAD_PRESET = 'ucaes_academic_affairs';
  private static readonly CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${ACADEMIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

  /**
   * Upload an academic document to Cloudinary (Academic Affairs System)
   */
  static async uploadAcademicDocument(
    file: File,
    documentType: string,
    userId: string,
    courseId?: string,
    semester?: string
  ): Promise<AcademicUploadResult> {
    try {
      console.log('🚀 ACADEMIC AFFAIRS: Starting Cloudinary upload');
      console.log('📋 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        userId: userId,
        documentType: documentType,
        courseId: courseId,
        semester: semester
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
      
      // Create folder structure based on available information
      let folderPath = `ucaes/academic-affairs/${userId}/${documentType}`;
      if (courseId) {
        folderPath += `/${courseId}`;
      }
      if (semester) {
        folderPath += `/${semester}`;
      }
      
      formData.append('folder', folderPath);
      formData.append('public_id', `${userId}_${documentType}_${Date.now()}`);
      formData.append('tags', 'academic-affairs,ucaes,academic-document');

      console.log('📦 FormData created with parameters:');
      console.log('   - upload_preset:', this.CLOUDINARY_UPLOAD_PRESET);
      console.log('   - folder:', folderPath);
      console.log('   - tags: academic-affairs,ucaes,academic-document');

      // Upload to Cloudinary
      const response = await fetch(this.CLOUDINARY_API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response received:');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ACADEMIC AFFAIRS: Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ ACADEMIC AFFAIRS: Upload successful!');
      console.log('   Secure URL:', result.secure_url);
      console.log('   Public ID:', result.public_id);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('💥 ACADEMIC AFFAIRS: Cloudinary upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple academic documents
   */
  static async uploadMultipleAcademicDocuments(
    documents: Record<string, File>,
    userId: string,
    courseId?: string,
    semester?: string
  ): Promise<Record<string, AcademicUploadResult>> {
    const results: Record<string, AcademicUploadResult> = {};
    
    console.log('📚 ACADEMIC AFFAIRS: Uploading multiple documents for user:', userId);
    
    const uploadPromises = Object.entries(documents).map(async ([documentType, file]) => {
      console.log(`📄 Uploading ${documentType}...`);
      const result = await this.uploadAcademicDocument(file, documentType, userId, courseId, semester);
      results[documentType] = result;
      return result;
    });

    await Promise.all(uploadPromises);
    
    console.log('✅ ACADEMIC AFFAIRS: Multiple documents upload completed');
    return results;
  }

  /**
   * Delete an academic document from Cloudinary
   */
  static async deleteAcademicDocument(publicId: string): Promise<AcademicUploadResult> {
    try {
      console.log('🗑️ ACADEMIC AFFAIRS: Deleting document:', publicId);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${ACADEMIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: ACADEMIC_CLOUDINARY_API_KEY,
            signature: this.generateSignature(publicId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      console.log('✅ ACADEMIC AFFAIRS: Document deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 ACADEMIC AFFAIRS: Cloudinary delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Generate signature for secure operations
   */
  private static generateSignature(publicId: string): string {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = `public_id=${publicId}&timestamp=${timestamp}`;
    
    // In a real implementation, you'd use a server-side function to generate the signature
    // For now, we'll return a placeholder
    return 'signature_placeholder';
  }

  /**
   * Validate academic file before upload
   */
  static validateAcademicFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB for academic documents
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, and TXT files are allowed' };
    }

    return { valid: true };
  }

  /**
   * Get optimized image URL for different use cases
   */
  static getOptimizedAcademicImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    } = {}
  ): string {
    const { width = 400, height = 400, quality = "auto", format = "auto" } = options;

    return `https://res.cloudinary.com/${ACADEMIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
  }

  /**
   * Get documents by course and semester
   */
  static async getDocumentsByCourse(
    userId: string,
    courseId: string,
    semester: string
  ): Promise<AcademicUploadResult[]> {
    // This would typically involve querying Cloudinary's API
    // For now, return empty array
    console.log(`📁 ACADEMIC AFFAIRS: Getting documents for user ${userId}, course ${courseId}, semester ${semester}`);
    return [];
  }
}

export default AcademicCloudinaryService; 