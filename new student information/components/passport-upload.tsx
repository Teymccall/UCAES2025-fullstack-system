import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { toast } from "@/components/ui/use-toast";
import PassportPhoto from "./passport-photo";
import { directCloudinaryUpload } from "@/lib/cloudinary-service";

interface PassportUploadProps {
  onPhotoUpdate: (photoData: {
    file: File | null;
    previewUrl: string | null;
    name: string;
    type: string;
    size: number;
    hasImage: boolean;
    // Direct Cloudinary upload results
    url?: string;
    cloudinaryId?: string;
  }) => void;
  initialPhoto?: string | null;
}

export default function PassportUpload({ onPhotoUpdate, initialPhoto = null }: PassportUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhoto);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type (more restrictive for better compatibility)
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      return { isValid: false, error: "Please upload a JPG or PNG image only" };
    }

    // Check file size (reduced to 2MB for better upload reliability)
    if (file.size > 2 * 1024 * 1024) {
      return { isValid: false, error: "Photo must be less than 2MB for reliable upload" };
    }

    // Check minimum file size (avoid corrupted files)
    if (file.size < 1024) {
      return { isValid: false, error: "File is too small - please select a valid photo" };
    }

    // Check file name
    if (file.name.length > 100) {
      return { isValid: false, error: "File name too long - please rename your file" };
    }

    return { isValid: true };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      // Create a local preview URL
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setCurrentFile(file);
      

      
      // Immediately upload to Cloudinary with retry mechanism
      setIsUploading(true);
      
      let result = null;
      let lastError = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🚀 Photo upload attempt ${attempt}/${maxRetries}`);
          result = await directCloudinaryUpload(file);
          
          // Verify that we have a real URL and not a placeholder
          if (!result.secure_url || result.secure_url.includes('placeholder') || result.secure_url.startsWith('/')) {
            throw new Error('Invalid upload result received from Cloudinary');
          }
          
          console.log(`✅ Photo upload successful on attempt ${attempt}`);
          break; // Success, exit retry loop
          
        } catch (uploadError) {
          lastError = uploadError;
          console.log(`❌ Upload attempt ${attempt} failed:`, uploadError.message);
          
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      if (!result) {
        throw new Error(`Photo upload failed after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}`);
      }

      // Notify parent component with Cloudinary info (do not keep raw file)
      console.log("📤 Calling onPhotoUpdate with successful upload data:", {
        url: result.secure_url,
        cloudinaryId: result.public_id,
        fileName: file.name
      });
      
      onPhotoUpdate({
        file: null,
        previewUrl: localPreview,
        name: file.name,
        type: file.type,
        size: file.size,
        hasImage: true,
        url: result.secure_url,
        cloudinaryId: result.public_id,
      });
      
      console.log("✅ onPhotoUpdate callback completed successfully");

      toast({
        title: "Photo uploaded successfully",
        description: "Your passport photo has been uploaded and saved securely.",
        variant: "default",
      });
      
    } catch (error) {
      console.error("❌ Photo upload error:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Keep the preview but indicate upload failed
      // Don't clear preview - user can see what they selected and retry
      
      // Notify parent that upload failed but keep the file for potential retry
      console.log("📢 Notifying parent of upload failure");
      onPhotoUpdate({
        file: currentFile, // Keep the file for potential retry
        previewUrl: previewUrl,
        name: currentFile?.name || "",
        type: currentFile?.type || "",
        size: currentFile?.size || 0,
        hasImage: false, // Mark as failed upload
        uploadFailed: true, // Add flag to indicate failure
      });
      
      // Show detailed error message
      const errorMessage = (error as any)?.message || 'Could not upload photo. Please try a different image.';
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
      setIsUploading(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {

        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);



  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Passport Photograph</h3>
      

      
      <PassportPhoto
        photoUrl={previewUrl}
        onChangePhoto={handleFileSelect}
        isUploading={isValidating || isUploading}
        isSuccess={!!previewUrl}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png"
        className="hidden"
      />
      
      <div className="text-sm text-gray-600">
        <p>Please upload a passport-sized photograph with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Plain background</li>
          <li>Clear face visibility (front-facing)</li>
          <li>Recent photo (within 6 months)</li>
          <li>Preferably 3.5 x 4.5 cm dimension</li>
          <li>Maximum size: 5MB</li>
          <li>Allowed formats: JPG, JPEG, PNG</li>
        </ul>
      </div>

      {/* Upload Status Information */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center text-sm text-blue-800">
          <span className="mr-2">ℹ️</span>
          <div>
            <p className="font-medium">Photo Upload Information:</p>
            <p className="text-xs mt-1">
              Your photo is uploaded securely and will be associated with your registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 