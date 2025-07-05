import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PassportPhoto from "./passport-photo";

interface PassportUploadProps {
  onPhotoUpdate: (photoData: { 
    file: File | null;
    previewUrl: string | null;
    name: string;
    type: string;
    size: number;
    hasImage: boolean;
  }) => void;
  initialPhoto?: string | null;
}

export default function PassportUpload({ onPhotoUpdate, initialPhoto = null }: PassportUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhoto);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Validate file
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
      toast({
        title: "File too large",
        description: "Photo must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a local preview URL
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setCurrentFile(file);
      
      // Notify parent component with file and preview URL
      onPhotoUpdate({
        file: file,
        previewUrl: localPreview,
        name: file.name,
        type: file.type,
        size: file.size,
        hasImage: true
      });
      
      toast({
        title: "Photo selected",
        description: "Your photo will be uploaded when you submit the form",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error handling file:", error);
      toast({
        title: "Error processing photo",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
        isUploading={false}
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
    </div>
  );
} 