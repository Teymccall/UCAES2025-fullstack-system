"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import type { FormData } from "@/app/register/page"
import { useState, useEffect } from "react"

interface ReviewSummaryProps {
  formData: FormData
}

interface SimplePassportDisplayProps {
  url: string;
  initials: string;
}

export default function ReviewSummary({ formData }: ReviewSummaryProps) {
  const [profilePictureSrc, setProfilePictureSrc] = useState<string>('');
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);

  // Debug: Log the entire formData to see what we're working with
  console.log("🔍 ReviewSummary: Full formData received:", {
    formData,
    profilePicture: formData.profilePicture,
    profilePictureUrl: formData.profilePictureUrl,
    profilePictureType: typeof formData.profilePicture,
    hasProfilePicture: !!formData.profilePicture,
    profilePictureKeys: formData.profilePicture && typeof formData.profilePicture === 'object' ? Object.keys(formData.profilePicture) : 'N/A'
  });

  // Debug: Check localStorage for file data
  const fileDataStr = localStorage.getItem("registrationFileData");
  if (fileDataStr) {
    try {
      const fileData = JSON.parse(fileDataStr);
      console.log("📄 localStorage registrationFileData:", {
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        hasData: !!fileData.data,
        dataLength: fileData.data ? fileData.data.length : 0
      });
    } catch (error) {
      console.error("❌ Error parsing registrationFileData:", error);
    }
  } else {
    console.log("❌ No registrationFileData found in localStorage");
  }

  // Enhanced profile picture URL retrieval
  const getProfilePictureSrc = async () => {
    console.log("🔍 ReviewSummary: Getting profile picture source", {
      hasProfilePictureUrl: !!formData.profilePictureUrl,
      profilePictureUrl: formData.profilePictureUrl,
      hasProfilePicture: !!formData.profilePicture,
      profilePictureType: typeof formData.profilePicture,
      isFile: formData.profilePicture instanceof File,
      hasUrl: formData.profilePicture && typeof formData.profilePicture === 'object' && 'url' in formData.profilePicture,
      url: formData.profilePicture && typeof formData.profilePicture === 'object' ? (formData.profilePicture as any).url : 'N/A',
      hasPreviewUrl: formData.profilePicture && typeof formData.profilePicture === 'object' && 'previewUrl' in formData.profilePicture,
      previewUrl: formData.profilePicture && typeof formData.profilePicture === 'object' ? (formData.profilePicture as any).previewUrl : 'N/A'
    });

    // First, check if we have a profilePictureUrl (from Firebase after submission)
    if (formData.profilePictureUrl) {
      console.log("📸 Using profilePictureUrl from Firebase:", formData.profilePictureUrl);
      return formData.profilePictureUrl;
    }
    
    // Check if we have a File object (for preview during form filling)
    if (formData.profilePicture instanceof File) {
      try {
        const blobUrl = URL.createObjectURL(formData.profilePicture);
        console.log("📸 Created blob URL from File:", blobUrl);
        return blobUrl;
      } catch (error) {
        console.error("❌ Error creating blob URL from File:", error);
        // Fall through to placeholder
      }
    }
    
    // Try to reconstruct blob URL from stored file data
    // Check if we have a profilePicture object that might have file data
    if (formData.profilePicture && typeof formData.profilePicture === 'object') {
      const photoObj = formData.profilePicture as any;
      console.log("🔍 Checking profilePicture object for file reconstruction:", {
        hasIsFileObject: 'isFileObject' in photoObj,
        isFileObject: photoObj.isFileObject,
        hasImage: photoObj.hasImage,
        hasName: !!photoObj.name,
        hasType: !!photoObj.type,
        hasSize: !!photoObj.size
      });
      
      // Try to reconstruct if it has image data or if it's marked as a file object
      if (photoObj.hasImage || photoObj.isFileObject || (photoObj.name && photoObj.type && photoObj.size)) {
        console.log("📄 Attempting to reconstruct blob URL from stored file data");
        try {
          // Get the stored file data from localStorage
          const fileDataStr = localStorage.getItem("registrationFileData");
          if (fileDataStr) {
            const fileData = JSON.parse(fileDataStr);
            console.log("📄 Found stored file data:", {
              name: fileData.name,
              type: fileData.type,
              size: fileData.size,
              hasData: !!fileData.data,
              dataLength: fileData.data ? fileData.data.length : 0
            });
            
            // Convert base64 back to blob and create URL
            if (fileData.data) {
              const response = await fetch(fileData.data);
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              console.log("📸 Successfully reconstructed blob URL:", blobUrl);
              return blobUrl;
            }
          } else {
            console.log("❌ No registrationFileData found in localStorage");
          }
        } catch (error) {
          console.error("❌ Error reconstructing blob URL from file data:", error);
        }
      } else {
        console.log("❌ ProfilePicture object doesn't have required file data");
      }
    }
    
    // Check if we have a profilePicture object with previewUrl (from localStorage)
    // BUT don't use blob URLs from localStorage as they become invalid
    if (formData.profilePicture && typeof formData.profilePicture === 'object' && 'previewUrl' in formData.profilePicture) {
      const photoObj = formData.profilePicture as any;
      if (photoObj.previewUrl && 
          photoObj.previewUrl !== '/placeholder-user.jpg' && 
          !photoObj.previewUrl.startsWith('blob:')) {
        console.log("📸 Using profilePicture.previewUrl (non-blob):", photoObj.previewUrl);
        return photoObj.previewUrl;
      }
    }
    
    // Then check if we have a profilePicture object with URL
    if (formData.profilePicture && typeof formData.profilePicture === 'object' && 'url' in formData.profilePicture) {
      const photoObj = formData.profilePicture as any;
      if (photoObj.url && 
          photoObj.url !== '/placeholder-user.jpg' && 
          !photoObj.url.startsWith('blob:')) {
        console.log("📸 Using profilePicture.url (non-blob):", photoObj.url);
        return photoObj.url;
      }
    }
    
    // Fallback to placeholder
    console.log("📸 Using placeholder image");
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNDAgMTYwQzQwIDE0MCA2MCAxMjAgMTAwIDEyMEMxNDAgMTIwIDE2MCAxNDAgMTYwIDE2MEg0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
  };

  // Load profile picture on component mount
  useEffect(() => {
    const loadProfilePicture = async () => {
      setIsLoadingPhoto(true);
      try {
        const src = await getProfilePictureSrc();
        setProfilePictureSrc(src);
        console.log("✅ Profile picture loaded:", src);
      } catch (error) {
        console.error("❌ Error loading profile picture:", error);
        setProfilePictureSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNDAgMTYwQzQwIDE0MCA2MCAxMjAgMTAwIDEyMEMxNDAgMTIwIDE2MCAxNDAgMTYwIDE2MEg0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+');
      } finally {
        setIsLoadingPhoto(false);
      }
    };

    loadProfilePicture();
  }, [formData]);

  const hasProfilePicture = !profilePictureSrc.includes('data:image/svg+xml');
  
  // Debug: Log what we're passing to SimplePassportDisplay
  console.log("🔍 ReviewSummary: Passing to SimplePassportDisplay:", {
    profilePictureSrc,
    hasProfilePicture,
    isLoadingPhoto,
    initials: `${formData.surname?.charAt(0) || ''}${formData.otherNames?.charAt(0) || ''}` || 'ST'
  });

  // Get initials for avatar fallback
  const initials = `${formData.surname?.charAt(0) || ''}${formData.otherNames?.charAt(0) || ''}` || 'ST';

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any blob URLs that might have been created
      if (profilePictureSrc && profilePictureSrc.startsWith('blob:')) {
        console.log("🧹 Cleaning up blob URL:", profilePictureSrc);
        URL.revokeObjectURL(profilePictureSrc);
      }
    };
  }, [profilePictureSrc]);

  // Enhanced passport photo display component with better error handling
  const SimplePassportDisplay = ({ url, initials }: SimplePassportDisplayProps) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset states when URL changes
    useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [url]);

    console.log("🖼️ SimplePassportDisplay render:", {
      url,
      initials,
      imageError,
      imageLoaded,
      urlType: typeof url,
      urlLength: url?.length,
      isBlob: url?.startsWith('blob:'),
      isHttp: url?.startsWith('http'),
      isHttps: url?.startsWith('https'),
      isPlaceholder: url?.includes('data:image/svg+xml')
    });

    const handleImageLoad = () => {
      console.log("✅ Passport photo loaded successfully in review:", url);
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = () => {
      console.error('❌ Failed to load passport photo in review:', {
        url,
        urlType: typeof url,
        isBlob: url?.startsWith('blob:'),
        isHttp: url?.startsWith('http'),
        isHttps: url?.startsWith('https'),
        urlLength: url?.length,
        isPlaceholder: url?.includes('data:image/svg+xml')
      });
      setImageError(true);
      setImageLoaded(false);
    };

    // Reset states when URL changes
    useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [url]);

    return (
      <div className="w-full h-full relative">
        {url && !url.includes('data:image/svg+xml') && !imageError ? (
          <>
            <img 
              src={url} 
              alt="Passport photo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0.5,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin={url.startsWith('blob:') || url.startsWith('http') ? "anonymous" : undefined}
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            )}
            <div 
              className="fallback absolute inset-0 flex flex-col items-center justify-center bg-gray-100" 
              style={{ display: imageError ? 'flex' : 'none' }}
            >
              <div className="text-4xl text-gray-500">{initials}</div>
              <p className="text-xs text-red-500 mt-2">Photo error</p>
            </div>
          </>
        ) : (
          <div className="fallback absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <div className="text-4xl text-gray-500">{initials}</div>
            <p className="text-xs text-red-500">No photo</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Information</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please review your information carefully before submitting your registration.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-green-50 p-4 text-center">
                <div className="w-40 h-48 mx-auto mb-4 mt-2 border-2 border-gray-300 bg-white p-1 shadow-md">
                  <SimplePassportDisplay url={profilePictureSrc} initials={initials} />
                </div>
                <h3 className="font-bold text-lg text-green-800">
                  {formData.surname} {formData.otherNames}
                </h3>
                <p className="text-sm text-green-700">{formData.programme}</p>
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">Academic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Programme:</span>
                    <span className="font-medium">{formData.programme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Academic Year:</span>
                    <span className="font-medium">{formData.entryAcademicYear || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entry Year:</span>
                    <span className="font-medium">{formData.yearOfEntry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entry Level:</span>
                    <span className="font-medium">Level {formData.entryLevel}</span>
                  </div>
                  {formData.currentLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Level:</span>
                      <span className="font-medium">Level {formData.currentLevel}</span>
                    </div>
                  )}
                  {formData.scheduleType && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Schedule Type:</span>
                        <span className="font-medium">{formData.scheduleType}</span>
                      </div>
                      {formData.currentPeriod && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current {formData.scheduleType === 'Regular' ? 'Semester' : 'Trimester'}:</span>
                          <span className="font-medium">{formData.currentPeriod}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Academic Structure:</span>
                        <span className="font-medium">
                          {formData.scheduleType === 'Regular' ? '2 Semesters/Year' : '3 Trimesters/Year'}
                        </span>
                      </div>
                    </>
                  )}
                  {formData.hallOfResidence && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hall:</span>
                      <span className="font-medium">{formData.hallOfResidence}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2 bg-green-50">1</Badge>
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium">{formData.surname} {formData.otherNames}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-medium">{formData.gender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formData.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Place of Birth</p>
                      <p className="font-medium">{formData.placeOfBirth}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Nationality</p>
                      <p className="font-medium">{formData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Religion</p>
                      <p className="font-medium">{formData.religion}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Marital Status</p>
                      <p className="font-medium">{formData.maritalStatus}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">National ID</p>
                      <p className="font-medium">{formData.nationalId || 'Not provided'}</p>
                    </div>
                    {formData.studentIndexNumber && (
                      <div>
                        <p className="text-gray-500">Student Index Number</p>
                        <p className="font-medium">{formData.studentIndexNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2 bg-green-50">2</Badge>
                Contact Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Email Address</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mobile Number</p>
                      <p className="font-medium">{formData.mobile}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium">{formData.street}, {formData.city}, {formData.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2 bg-green-50">3</Badge>
                Guardian Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Guardian Name</p>
                      <p className="font-medium">{formData.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Relationship</p>
                      <p className="font-medium">{formData.relationship}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Contact Number</p>
                      <p className="font-medium">{formData.guardianContact}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{formData.guardianEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium">{formData.guardianAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> By submitting this form, you confirm that all the information provided is accurate and complete. Once submitted, you will need to contact the administration for any corrections.
        </p>
        
        {!hasProfilePicture && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Warning:</strong> You have not uploaded a passport photograph. This is required for your student ID card and registration. 
            Please go back to the Personal Information step to upload your passport photo.
          </div>
        )}
      </div>
    </div>
  )
} 