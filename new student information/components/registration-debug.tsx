"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FormData } from "@/app/register/page"

interface RegistrationDebugProps {
  formData: FormData
}

export default function RegistrationDebug({ formData }: RegistrationDebugProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getProfilePictureInfo = () => {
    if (!formData.profilePicture) {
      return { type: "null", details: "No profile picture" }
    }

    if (formData.profilePicture instanceof File) {
      return {
        type: "File",
        details: {
          name: formData.profilePicture.name,
          size: formData.profilePicture.size,
          type: formData.profilePicture.type,
          lastModified: new Date(formData.profilePicture.lastModified).toISOString()
        }
      }
    }

    if (typeof formData.profilePicture === 'object' && 'url' in formData.profilePicture) {
      const photoObj = formData.profilePicture as any
      return {
        type: "CustomPhotoObject",
        details: {
          url: photoObj.url,
          name: photoObj.name,
          type: photoObj.type,
          size: photoObj.size,
          hasImage: photoObj.hasImage,
          cloudinaryId: photoObj.cloudinaryId,
          // Check if file property exists and what type it is
          hasFile: 'file' in photoObj,
          fileType: photoObj.file ? typeof photoObj.file : 'null',
          fileInstance: photoObj.file instanceof File,
          fileIsEmpty: photoObj.file && Object.keys(photoObj.file).length === 0,
          isFileObject: photoObj.isFileObject
        }
      }
    }

    return { type: "unknown", details: formData.profilePicture }
  }

  const profilePictureInfo = getProfilePictureInfo()

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-orange-800 flex items-center">
              <span className="mr-2">🐛</span>
              Debug Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? "Hide" : "Show"} Debug
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4 text-xs">
              {/* Profile Picture Debug */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-orange-800 mb-2">📸 Profile Picture Debug</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Type:</span> {profilePictureInfo.type}
                  </div>
                  <div>
                    <span className="font-medium">Profile Picture URL:</span> {formData.profilePictureUrl || "Not set"}
                  </div>
                  <div>
                    <span className="font-medium">Profile Picture Public ID:</span> {formData.profilePicturePublicId || "Not set"}
                  </div>
                  <div>
                    <span className="font-medium">Details:</span>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(profilePictureInfo.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Form Data Summary */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-orange-800 mb-2">📋 Form Data Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Name:</span> {formData.surname} {formData.otherNames}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {formData.email}
                  </div>
                  <div>
                    <span className="font-medium">Programme:</span> {formData.programme}
                  </div>
                  <div>
                    <span className="font-medium">Entry Level:</span> {formData.entryLevel}
                  </div>
                </div>
              </div>

              {/* Local Storage Debug */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-orange-800 mb-2">💾 Local Storage Debug</h4>
                <div className="space-y-1">
                  {typeof window !== 'undefined' && (
                    <>
                      <div>
                        <span className="font-medium">Registration Data:</span> {localStorage.getItem("registrationData") ? "✅ Exists" : "❌ Not found"}
                      </div>
                      <div>
                        <span className="font-medium">Form In Progress:</span> {localStorage.getItem("registrationFormInProgress") ? "✅ Exists" : "❌ Not found"}
                      </div>
                      <div>
                        <span className="font-medium">Active Tab:</span> {localStorage.getItem("registrationActiveTab") || "Not set"}
                      </div>
                      <div>
                        <span className="font-medium">Submitted ID:</span> {localStorage.getItem("submittedRegistrationId") || "Not set"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Raw Form Data */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-orange-800 mb-2">🔍 Raw Form Data</h4>
                <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
