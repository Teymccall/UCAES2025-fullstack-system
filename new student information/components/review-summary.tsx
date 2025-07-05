"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import type { FormData } from "@/app/register/page"

interface ReviewSummaryProps {
  formData: FormData
}

interface SimplePassportDisplayProps {
  url: string;
  initials: string;
}

export default function ReviewSummary({ formData }: ReviewSummaryProps) {
  // Get profile picture URL if available
  const getProfilePictureSrc = () => {
    if (!formData.profilePicture) return '/placeholder-user.jpg';
    
    if (typeof formData.profilePicture === 'object' && 'url' in formData.profilePicture) {
      return formData.profilePicture.url;
    }
    
    if (formData.profilePicture instanceof File) {
      return URL.createObjectURL(formData.profilePicture);
    }
    
    return '/placeholder-user.jpg';
  };
  
  const profilePictureSrc = getProfilePictureSrc();
  const hasProfilePicture = profilePictureSrc !== '/placeholder-user.jpg';
  
  // Get initials for avatar fallback
  const initials = `${formData.surname?.charAt(0) || ''}${formData.otherNames?.charAt(0) || ''}` || 'ST';

  // Simple passport photo display component
  const SimplePassportDisplay = ({ url, initials }: SimplePassportDisplayProps) => (
    <div className="w-full h-full relative">
      {url && url !== "/placeholder-user.jpg" ? (
        <>
          <img 
            src={url} 
            alt="Passport photo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement | null;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          <div 
            className="fallback absolute inset-0 flex flex-col items-center justify-center bg-gray-100" 
            style={{ display: 'none' }}
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